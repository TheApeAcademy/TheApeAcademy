# 🔧 Critical Fixes Implementation Guide

## Overview
This document provides step-by-step instructions to fix the 12 critical production gaps.

---

## Fix #1: Implement Missing `completePayment()` Method

### Problem
Route references `PaymentController.completePayment()` but method doesn't exist.

### Solution

Edit [server/src/controllers/payment.mjs](server/src/controllers/payment.mjs) and add this method:

```javascript
/**
 * POST /payments/complete
 * Complete a payment and link it to assignment
 */
async completePayment(req, res, next) {
  try {
    const userId = req.userId;
    const { tx_ref, transaction_id } = req.body;

    if (!tx_ref) {
      throw new ValidationError('Transaction reference (tx_ref) is required');
    }

    // Find payment by tx_ref
    const payment = await prisma.payment.findUnique({
      where: { transactionReference: tx_ref },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.userId !== userId) {
      throw new ValidationError('Unauthorized');
    }

    // If already successful, return cached result
    if (payment.paymentStatus === 'successful') {
      return res.status(200).json({
        message: 'Payment already completed',
        payment: {
          id: payment.id,
          status: payment.paymentStatus,
        },
      });
    }

    // Verify with Flutterwave API (critical security step)
    let flutterwaveData;
    try {
      flutterwaveData = await verifyFlutterwaveTransaction(transaction_id);
    } catch (err) {
      // Mark payment as failed if verification fails
      await prisma.payment.update({
        where: { id: payment.id },
        data: { paymentStatus: 'failed' },
      });
      throw new ApiError('Payment verification failed', 402);
    }

    // Validate payment details match
    if (
      flutterwaveData.amount !== payment.amount ||
      flutterwaveData.currency !== payment.currency
    ) {
      throw new ValidationError('Payment amount mismatch');
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentStatus: 'successful',
        flutterwaveTransactionId: transaction_id,
      },
    });

    res.status(200).json({
      message: 'Payment completed successfully',
      payment: {
        id: updatedPayment.id,
        status: updatedPayment.paymentStatus,
        assignmentId: updatedPayment.assignmentId,
      },
    });
  } catch (err) {
    next(err);
  }
},
```

---

## Fix #2: Generate Strong JWT Secret

### Problem
JWT_SECRET is weak/missing in .env

### Solution

```bash
# Generate a strong 32+ character secret
# Option 1: Using OpenSSL (macOS/Linux)
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Output example:
# bW1HcUh3NnhYOWJzN3k4azhqNWa2JjUzVmFzZzlMbW5sOWk=

# Copy the output and add to .env:
JWT_SECRET=bW1HcUh3NnhYOWJzN3k4azhqNWa2JjUzVmFzZzlMbW5sOWk=
```

### For Docker
Update `docker-compose.yml`:

```yaml
api:
  environment:
    JWT_SECRET: ${JWT_SECRET:-bW1HcUh3NnhYOWJzN3k4azhqNWa2JjUzVmFzZzlMbW5sOWk=}
    # ↑ Replace with your generated secret
```

---

## Fix #3: Switch Flutterwave to LIVE Keys

### Problem
Using TEST keys = no real payments processed

### Solution

#### Step 1: Get LIVE Keys
```bash
# 1. Visit https://dashboard.flutterwave.com
# 2. Sign in with your account
# 3. Check "Settings" → API Keys
# 4. Toggle to "LIVE" mode (if verified)
# 5. Copy:
#    - FLWPUBK_LIVE_xxxxxxxxxxxxx
#    - FLWSECK_LIVE_xxxxxxxxxxxxx
#    - FLWENC_xxxxxxxxxxxxx
```

#### Step 2: Update .env
```env
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_LIVE_xxxxxxxxxxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_LIVE_xxxxxxxxxxxxx
FLUTTERWAVE_ENCRYPTION_KEY=FLWENC_xxxxxxxxxxxxx
```

#### Step 3: Restart API
```bash
npm run server:prod
# or
docker-compose restart api
```

---

## Fix #4: Implement Missing Assignment Status Update Endpoint

### Problem
No way to update assignment status from "pending" to "in_progress" or "delivered"

### Solution

Create new file [server/src/controllers/assignmentAdmin.mjs](server/src/controllers/assignmentAdmin.mjs):

```javascript
import { PrismaClient } from '@prisma/client';
import { ValidationError, NotFoundError, AuthError } from '../utils/errors.mjs';

const prisma = new PrismaClient();

export const AssignmentAdminController = {
  /**
   * PATCH /assignments/admin/:id/status
   * Update assignment status (admin/operations only)
   * Body: { status: "in_progress" | "delivered" }
   */
  async updateAssignmentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        throw new ValidationError('Status is required');
      }

      const validStatuses = ['pending', 'in_progress', 'delivered'];
      if (!validStatuses.includes(status)) {
        throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
      }

      const assignment = await prisma.assignment.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!assignment) {
        throw new NotFoundError('Assignment not found');
      }

      const updated = await prisma.assignment.update({
        where: { id },
        data: {
          status,
          updatedAt: new Date(),
        },
        include: { user: true, payment: true },
      });

      res.status(200).json({
        message: `Assignment status updated to ${status}`,
        assignment: {
          id: updated.id,
          subject: updated.subject,
          status: updated.status,
          userId: updated.userId,
          userName: updated.user.fullName,
          userEmail: updated.user.email,
          deliveryPlatform: updated.deliveryPlatform,
          updatedAt: updated.updatedAt,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /assignments/admin
   * List all assignments (admin/operations)
   * Query: ?status=pending&limit=20&offset=0
   */
  async listAllAssignments(req, res, next) {
    try {
      const { status, limit = '20', offset = '0' } = req.query;

      const where = status ? { status } : {};
      const take = parseInt(limit);
      const skip = parseInt(offset);

      const [assignments, total] = await Promise.all([
        prisma.assignment.findMany({
          where,
          include: { user: true, payment: true },
          take,
          skip,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.assignment.count({ where }),
      ]);

      res.status(200).json({
        data: assignments.map(a => ({
          id: a.id,
          subject: a.subject,
          status: a.status,
          userName: a.user.fullName,
          userEmail: a.user.email,
          deliveryPlatform: a.deliveryPlatform,
          paymentStatus: a.payment?.paymentStatus || 'unpaid',
          createdAt: a.createdAt,
          deadline: a.deadline,
        })),
        total,
        limit: take,
        offset: skip,
        hasMore: skip + take < total,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default AssignmentAdminController;
```

Create new file [server/src/routes/assignmentAdmin.mjs](server/src/routes/assignmentAdmin.mjs):

```javascript
import express from 'express';
import { authMiddleware } from '../middleware/auth.mjs';
import { AssignmentAdminController } from '../controllers/assignmentAdmin.mjs';
import { asyncHandler } from '../utils/asyncHandler.mjs';

const router = express.Router();

/**
 * Admin-only routes middleware (you'll need to add role checking)
 * TODO: Implement role-based access control
 */
function adminOnly(req, res, next) {
  // For now, check if user exists
  // Later: Check if user.role === 'admin'
  if (!req.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

/**
 * PATCH /assignments/admin/:id/status
 */
router.patch(
  '/:id/status',
  authMiddleware,
  adminOnly,
  asyncHandler((req, res, next) =>
    AssignmentAdminController.updateAssignmentStatus(req, res, next)
  )
);

/**
 * GET /assignments/admin
 */
router.get(
  '/',
  authMiddleware,
  adminOnly,
  asyncHandler((req, res, next) =>
    AssignmentAdminController.listAllAssignments(req, res, next)
  )
);

export default router;
```

Add to [server/index.mjs](server/index.mjs):

```javascript
import assignmentAdminRoutes from './src/routes/assignmentAdmin.mjs';

// Add this line with other routes:
app.use('/api/assignments/admin', assignmentAdminRoutes);
```

---

## Fix #5: Add Rate Limiting Middleware

### Problem
API has no protection against brute force or DDoS attacks

### Solution

Install package:
```bash
npm install express-rate-limit
```

Edit [server/index.mjs](server/index.mjs) and add after security middleware:

```javascript
import rateLimit from 'express-rate-limit';

// ========================
// RATE LIMITING
// ========================

// General rate limiter: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth: 5 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true,
});

// Apply limiters
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
```

---

## Fix #6: Add Winston Logging

### Problem
No structured logging = can't debug production issues

### Solution

Install package:
```bash
npm install winston
```

Create [server/src/utils/logger.mjs](server/src/utils/logger.mjs):

```javascript
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '../../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'apeacademy-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});
```

Update [server/index.mjs](server/index.mjs) to use logger:

```javascript
import { logger } from './src/utils/logger.mjs';

// Replace console.log with logger.info
// Example in your error handler:
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack, path: req.path });
  // ... existing error handling
});

// After server starts:
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`ApeAcademy API running on port ${PORT}`);
});
```

---

## Fix #7: Add Database Backups

### Problem
No backup strategy = data loss = business failure

### Solution

### Option A: Docker Backup Script

Create [backup.sh](backup.sh):

```bash
#!/bin/bash

# ApeAcademy Database Backup Script
# Run daily with cron

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/apeacademy_$TIMESTAMP.sql"

# Create backups directory
mkdir -p $BACKUP_DIR

# Dump database
docker-compose exec -T postgres pg_dump \
  -U apeacademy \
  -d apeacademy > $BACKUP_FILE

# Gzip the backup
gzip $BACKUP_FILE

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup created: $BACKUP_FILE.gz"
```

Make executable:
```bash
chmod +x backup.sh
```

Add to crontab (runs daily at 2 AM):
```bash
crontab -e
# Add this line:
0 2 * * * /path/to/backup.sh
```

### Option B: Cloud Database (Recommended)

Use managed PostgreSQL from cloud provider:
- **Railway**: Automatic daily backups
- **AWS RDS**: Automatic daily backups with retention
- **Heroku**: Automatic backups included
- **DigitalOcean**: Managed PostgreSQL with backups

---

## Fix #8: Add Input Validation with Joi

### Problem
Manual validation is weak and error-prone

### Solution

Install package (already in dependencies):
```bash
npm list joi  # Should be installed
```

Create [server/src/utils/validation.mjs](server/src/utils/validation.mjs):

```javascript
import Joi from 'joi';
import { ValidationError } from './errors.mjs';

export const schemas = {
  signup: Joi.object({
    fullName: Joi.string().required().messages({
      'any.required': 'Full name is required',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters',
      'any.required': 'Password is required',
    }),
    region: Joi.string(),
    country: Joi.string(),
    educationLevel: Joi.string(),
    departmentOrCourse: Joi.string(),
  }),

  createAssignment: Joi.object({
    subject: Joi.string().required(),
    description: Joi.string(),
    educationLevel: Joi.string().required(),
    departmentOrCourse: Joi.string(),
    deadline: Joi.date(),
    deliveryPlatform: Joi.string()
      .valid('whatsapp', 'email', 'google_messages', 'imessage')
      .required(),
    paymentId: Joi.string(),
  }),

  initiatePayment: Joi.object({
    assignmentId: Joi.string(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).default('NGN'),
  }),
};

export function validate(schema, data) {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map(d => d.message).join(', ');
    throw new ValidationError(messages);
  }

  return value;
}
```

Use in controllers:

```javascript
// In auth.mjs controller
import { schemas, validate } from '../utils/validation.mjs';

async signup(req, res, next) {
  try {
    // Validate input
    const validatedData = validate(schemas.signup, req.body);
    
    // Then proceed with signup
    const result = await AuthService.signup(validatedData);
    res.status(201).json({ message: 'Signup successful', ...result });
  } catch (err) {
    next(err);
  }
}
```

---

## Fix #9: Add Email Verification

### Problem
Users can signup with fake emails

### Solution

Install package:
```bash
npm install nodemailer
```

Create [server/src/services/email.mjs](server/src/services/email.mjs):

```javascript
import nodemailer from 'nodemailer';
import { config } from '../config/index.mjs';

const transporter = nodemailer.createTransport({
  // Use your email service (Gmail, SendGrid, etc.)
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const EmailService = {
  async sendVerificationEmail(email, verificationToken) {
    const verifyLink = `${config.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    await transporter.sendMail({
      from: 'noreply@apeacademy.com',
      to: email,
      subject: 'Verify your ApeAcademy account',
      html: `
        <h2>Welcome to ApeAcademy!</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${verifyLink}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `,
    });
  },

  async sendAssignmentSubmittedEmail(email, assignmentDetails) {
    await transporter.sendMail({
      from: 'noreply@apeacademy.com',
      to: email,
      subject: 'Assignment submitted successfully',
      html: `
        <h2>Assignment Received</h2>
        <p>Your assignment "${assignmentDetails.subject}" has been received.</p>
        <p>We'll deliver it to you via ${assignmentDetails.deliveryPlatform}.</p>
      `,
    });
  },
};
```

Update .env with email config:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## Fix #10: Add Admin Role Support

### Problem
Anyone can access admin endpoints

### Solution

Update Prisma schema [prisma/schema.prisma](prisma/schema.prisma):

```prisma
model User {
  id                String   @id @default(cuid())
  fullName          String
  email             String   @unique
  passwordHash      String
  role              String   @default("user")  // "user" or "admin"
  region            String
  country           String
  educationLevel    String
  departmentOrCourse String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  assignments Assignment[]
  payments    Payment[]

  @@index([email])
}
```

Create admin middleware [server/src/middleware/admin.mjs](server/src/middleware/admin.mjs):

```javascript
import { AuthError } from '../utils/errors.mjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function adminMiddleware(req, res, next) {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new AuthError('Unauthorized');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'admin') {
      throw new AuthError('Admin access required');
    }

    req.userRole = user.role;
    next();
  } catch (err) {
    next(err);
  }
}

export default adminMiddleware;
```

Run migration:
```bash
npm run db:migrate
# Choose "add role field"
```

---

## Fix #11: Add HTTPS Configuration

### Problem
Payments transmitted over HTTP = insecure

### Solution

### For Self-Hosted (VPS):

```javascript
// server/index.mjs
import https from 'https';
import fs from 'fs';

// If using HTTPS
if (config.NODE_ENV === 'production' && fs.existsSync('./certs/key.pem')) {
  const options = {
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem'),
  };
  https.createServer(options, app).listen(PORT, () => {
    logger.info(`HTTPS server running on port ${PORT}`);
  });
} else {
  app.listen(PORT, () => {
    logger.info(`HTTP server running on port ${PORT}`);
  });
}
```

Get certificate using Let's Encrypt:
```bash
# Using Certbot (Linux)
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

### For Cloud Providers:
- **Railway, Heroku, AWS** handle HTTPS automatically
- Just use their domain or add your custom domain (automatic SSL)

---

## Fix #12: Add Database Webhook for Async Payments

### Problem
User closes browser after payment, assignment doesn't get marked as paid

### Solution

Add webhook endpoint [server/src/routes/webhooks.mjs](server/src/routes/webhooks.mjs):

```javascript
import express from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/index.mjs';
import { logger } from '../utils/logger.mjs';

const router = express.Router();
const prisma = new PrismaClient();

function verifyFlutterwaveWebhook(req) {
  const hash = crypto
    .createHmac('sha256', config.FLUTTERWAVE_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  return hash === req.headers['verificationhash'];
}

/**
 * POST /webhooks/flutterwave
 * Webhook endpoint for Flutterwave payment events
 */
router.post('/flutterwave', async (req, res) => {
  try {
    // Verify webhook signature
    if (!verifyFlutterwaveWebhook(req)) {
      logger.warn('Invalid Flutterwave webhook signature');
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const { event, data } = req.body;

    if (event === 'charge.completed') {
      const { tx_ref, status } = data;

      // Update payment in database
      const payment = await prisma.payment.findUnique({
        where: { transactionReference: tx_ref },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            paymentStatus: status === 'successful' ? 'successful' : 'failed',
            flutterwaveTransactionId: data.id,
          },
        });

        logger.info(`Payment ${tx_ref} updated via webhook: ${status}`);
      }
    }

    res.status(200).json({ message: 'Webhook processed' });
  } catch (err) {
    logger.error(`Webhook error: ${err.message}`);
    res.status(500).json({ message: 'Error processing webhook' });
  }
});

export default router;
```

Add to [server/index.mjs](server/index.mjs):

```javascript
import webhookRoutes from './src/routes/webhooks.mjs';

app.use('/api/webhooks', webhookRoutes);
```

Configure webhook in Flutterwave dashboard:
- Go to Settings → Webhooks
- URL: `https://yourdomain.com/api/webhooks/flutterwave`
- Events: `charge.completed`

---

## Summary Checklist

- [ ] Implement `completePayment()` controller method
- [ ] Generate strong JWT_SECRET
- [ ] Switch to Flutterwave LIVE keys
- [ ] Add assignment status update endpoints
- [ ] Add rate limiting
- [ ] Add Winston logging
- [ ] Add database backups
- [ ] Add Joi input validation
- [ ] Add email service
- [ ] Add admin role support
- [ ] Configure HTTPS
- [ ] Add Flutterwave webhook handler

**Time to implement:** 3-4 hours

