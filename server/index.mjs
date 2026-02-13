import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { config } from './src/config/index.mjs';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.mjs';
import { logger, morgan, morganStream } from './src/utils/logger.mjs';
import { initializeSentry, sentryErrorHandler } from './src/utils/sentry.mjs';

// Import routes
import authRoutes from './src/routes/auth.mjs';
import regionRoutes from './src/routes/region.mjs';
import paymentRoutes from './src/routes/payment.mjs';
import assignmentRoutes from './src/routes/assignment.mjs';
import webhooksRoutes from './src/routes/webhooks.mjs';
import adminRoutes from './src/routes/admin.mjs';
import webhookRoutes from './src/routes/webhooks.mjs';
import profileRoutes from './src/routes/profile.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ========================
// SENTRY ERROR TRACKING
// ========================
initializeSentry(app);

// ========================
// MIDDLEWARE
// ========================

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  })
);

// ========================
// RATE LIMITING
// ========================

// Helper to safely extract client IP (handles IPv4 and IPv6)
const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
};

// General API rate limiter: 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skip: (req) => req.path === '/api/health', // Don't count health checks
  keyGenerator: (req) => getClientIp(req),
});

// Strict rate limiter for authentication: 5 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again after 15 minutes',
  skipSuccessfulRequests: true, // Don't count successful attempts
  skipFailedRequests: false, // Do count failed attempts
  keyGenerator: (req) => getClientIp(req),
});

// Payment rate limiter: 10 attempts per minute
const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many payment attempts, please wait before trying again',
  keyGenerator: (req) => getClientIp(req),
});

// Apply general limiter to all API routes
app.use('/api/', apiLimiter);

// Request logging middleware
// Use Morgan for request logging, piped into Winston
app.use(morgan('combined', { stream: morganStream }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ========================
// API ROUTES
// ========================

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/payments', paymentLimiter, paymentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/profile', profileRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// Dev-only debug endpoint to inspect selected env values
if (config.NODE_ENV !== 'production') {
  app.get('/__debug/env', (req, res) => {
    return res.json({
      DATABASE_URL: config.DATABASE_URL,
      FLUTTERWAVE_SECRET_KEY: config.FLUTTERWAVE_SECRET_KEY ? 'set' : 'not-set',
    });
  });
}

// ========================
// STATIC FILE SERVING
// ========================

// Serve uploaded files
const uploadsDir = config.FILE_UPLOAD_DIR;
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Serve lightweight dev UI (logo + avatar upload page)
const publicPath = path.join(__dirname, 'public');
if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath, { recursive: true });
}
app.use('/dev', express.static(publicPath));

// Serve built frontend (SPA)
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback: serve index.html for HTML requests to non-API routes
  app.use((req, res) => {
    if (req.accepts('html') && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    // For unmatched API routes, fall through to 404 handler
  });
} else {
  // Development mode: frontend not built
  app.get('/', (req, res) => {
    res.json({
      message: 'ApeAcademy API v1.0',
      status: 'running',
      note: 'Frontend not built. Run `npm run build` to build and serve the frontend.',
      availableEndpoints: {
        health: 'GET /api/health',
        auth: {
          signup: 'POST /api/auth/signup',
          login: 'POST /api/auth/login',
          me: 'GET /api/auth/me',
        },
        regions: {
          list: 'GET /api/regions',
          countries: 'GET /api/regions/:region/countries',
        },
        payments: {
          initiate: 'POST /api/payments/initiate',
          verify: 'GET /api/payments/verify/:tx_ref',
        },
        assignments: {
          create: 'POST /api/assignments/create',
          my: 'GET /api/assignments/my',
          get: 'GET /api/assignments/:id',
        },
      },
    });
  });
}

// ========================
// ERROR HANDLING
// ========================

// 404 handler
app.use(notFoundHandler);

// Sentry error handler (must be before other error handlers)
app.use(sentryErrorHandler());

// Central error handler (MUST be last)
app.use(errorHandler);

// ========================
// SERVER STARTUP
// ========================

const PORT = config.PORT;
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║          🦍 ApeAcademy API Server Running                      ║
╠════════════════════════════════════════════════════════════════╣
║  Server: http://localhost:${PORT}                             ║
║  Environment: ${config.NODE_ENV.toUpperCase().padEnd(32, ' ')}║
║  Database: ${(config.DATABASE_URL ? 'Connected' : 'Not configured').padEnd(28, ' ')}║
║  Frontend: ${(fs.existsSync(distPath) ? 'Built' : 'Not built').padEnd(32, ' ')}║
╚════════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
