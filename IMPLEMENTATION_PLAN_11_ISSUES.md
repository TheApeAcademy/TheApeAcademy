# 🚀 Production Implementation Plan - 11 Critical Issues

**Timeline:** 2 weeks (70 hours)  
**Team:** 1-2 developers  
**Status:** Ready to implement

---

## Overview: The 11 Critical Issues (Detailed Solutions)

| # | Issue | Time | Priority | Status |
|---|-------|------|----------|--------|
| 1 | Complete Payment Controller | 4 hrs | 🔴 CRITICAL | Will implement |
| 2 | Rate Limiting | 2 hrs | 🔴 CRITICAL | Will implement |
| 3 | Winston Logging | 3 hrs | 🔴 CRITICAL | Will implement |
| 4 | Joi Input Validation | 3 hrs | 🔴 CRITICAL | Will implement |
| 5 | Email Service (Nodemailer) | 3 hrs | 🟡 HIGH | Will implement |
| 6 | Admin Endpoints & Roles | 4 hrs | 🟡 HIGH | Will implement |
| 7 | HTTPS & Security | 2 hrs | 🔴 CRITICAL | Will implement |
| 8 | Database Backups | 2 hrs | 🔴 CRITICAL | Will implement |
| 9 | Flutterwave Webhooks | 3 hrs | 🟡 HIGH | Will implement |
| 10 | Database Migrations | 2 hrs | 🟡 HIGH | Will implement |
| 11 | Sentry Error Tracking | 2 hrs | 🟡 HIGH | Will implement |
| - | **SUBTOTAL** | **32 hrs** | - | - |
| - | Testing & Polish | 15 hrs | - | - |
| - | Documentation | 8 hrs | - | - |
| - | Deployment & QA | 10 hrs | - | - |
| - | **TOTAL (2 WEEKS)** | **65 hrs** | - | - |

---

## ISSUE #1: Complete Payment Controller & Workflow (4 hours)

### Current Problem
- Missing `completePayment()` method referenced in routes
- Incomplete payment verification flow
- No assignment linking after successful payment

### Solution: Full Payment Lifecycle

#### Step 1: Update Payment Controller

Replace [server/src/controllers/payment.mjs](server/src/controllers/payment.mjs) with this complete implementation:

```javascript
import { PrismaClient } from '@prisma/client';
import { ValidationError, NotFoundError, ApiError } from '../utils/errors.mjs';
import { verifyFlutterwaveTransaction, generatePaymentRef } from '../utils/flutterwave.mjs';
import { config } from '../config/index.mjs';
import { logger } from '../utils/logger.mjs';

const prisma = new PrismaClient();

export const PaymentController = {
  /**
   * POST /payments/initiate
   * Create a payment intent for assignment submission
   * Frontend redirects user to Flutterwave checkout
   */
  async initiatePayment(req, res, next) {
    try {
      const userId = req.userId;
      const { assignmentId, amount, currency = 'NGN' } = req.body;

      // Validate input
      if (!amount || amount <= 0) {
        throw new ValidationError('Amount must be greater than 0');
      }

      if (amount > 1000000) {
        throw new ValidationError('Amount exceeds maximum limit');
      }

      // Check if assignment exists (if provided)
      if (assignmentId) {
        const assignment = await prisma.assignment.findUnique({
          where: { id: assignmentId },
        });
        if (!assignment) {
          throw new NotFoundError('Assignment not found');
        }
        if (assignment.userId !== userId) {
          throw new ValidationError('Assignment does not belong to this user');
        }
      }

      // Generate unique transaction reference
      const transactionReference = generatePaymentRef(userId, assignmentId);

      // Create payment record with pending status
      const payment = await prisma.payment.create({
        data: {
          userId,
          assignmentId: assignmentId || null,
          amount: parseFloat(amount),
          currency,
          transactionReference,
          paymentStatus: 'pending',
        },
      });

      logger.info(`Payment initiated: ${payment.id} for user ${userId}`);

      res.status(201).json({
        message: 'Payment intent created',
        payment: {
          id: payment.id,
          transactionReference: payment.transactionReference,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.paymentStatus,
        },
        // Frontend uses this to build Flutterwave checkout URL
        checkoutData: {
          public_key: config.FLUTTERWAVE_PUBLIC_KEY,
          tx_ref: payment.transactionReference,
          amount: payment.amount,
          currency: payment.currency,
          redirect_url: `${config.FRONTEND_URL}/payment/callback?tx_ref=${payment.transactionReference}`,
        },
      });
    } catch (err) {
      logger.error(`Payment initiation error: ${err.message}`);
      next(err);
    }
  },

  /**
   * GET /payments/verify/:tx_ref
   * Verify payment with Flutterwave API
   * Called by frontend after user returns from Flutterwave
   */
  async verifyPayment(req, res, next) {
    try {
      const { tx_ref } = req.params;
      const userId = req.userId;

      if (!tx_ref) {
        throw new ValidationError('Transaction reference is required');
      }

      // Find payment record
      const payment = await prisma.payment.findUnique({
        where: { transactionReference: tx_ref },
      });

      if (!payment) {
        throw new NotFoundError('Payment record not found');
      }

      // Verify user ownership
      if (payment.userId !== userId) {
        throw new ValidationError('Unauthorized - payment does not belong to you');
      }

      // If already verified, return cached result
      if (payment.paymentStatus === 'successful') {
        logger.info(`Payment ${tx_ref} already verified (returning cached)`);
        return res.status(200).json({
          message: 'Payment already verified and successful',
          payment: {
            id: payment.id,
            status: payment.paymentStatus,
            amount: payment.amount,
            assignmentId: payment.assignmentId,
          },
        });
      }

      if (payment.paymentStatus === 'failed') {
        throw new ApiError('Payment previously failed', 402);
      }

      // Verify with Flutterwave API (CRITICAL - server-side verification)
      let flutterwaveData;
      try {
        // If user provided transaction ID from Flutterwave, use it
        // Otherwise, we'll need to look it up
        flutterwaveData = await verifyFlutterwaveTransaction(
          payment.flutterwaveTransactionId || null,
          tx_ref
        );
      } catch (err) {
        logger.error(`Flutterwave verification failed for ${tx_ref}: ${err.message}`);
        // Update payment as failed
        await prisma.payment.update({
          where: { id: payment.id },
          data: { paymentStatus: 'failed' },
        });
        throw new ApiError('Payment verification failed with Flutterwave', 502);
      }

      // Validate payment details match
      if (flutterwaveData.amount !== payment.amount) {
        logger.warn(
          `Amount mismatch for payment ${tx_ref}: expected ${payment.amount}, got ${flutterwaveData.amount}`
        );
        await prisma.payment.update({
          where: { id: payment.id },
          data: { paymentStatus: 'failed' },
        });
        throw new ValidationError('Payment amount does not match');
      }

      // Update payment to successful
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          paymentStatus: 'successful',
          flutterwaveTransactionId: flutterwaveData.id || flutterwaveData.tx_ref,
        },
      });

      logger.info(`Payment verified successfully: ${tx_ref} for user ${userId}`);

      res.status(200).json({
        message: 'Payment verified successfully',
        payment: {
          id: updatedPayment.id,
          status: updatedPayment.paymentStatus,
          amount: updatedPayment.amount,
          assignmentId: updatedPayment.assignmentId,
        },
      });
    } catch (err) {
      logger.error(`Payment verification error: ${err.message}`);
      next(err);
    }
  },

  /**
   * POST /payments/complete
   * Complete payment workflow and link to assignment
   * Called after payment verification is successful
   * Body: { tx_ref, assignmentId (optional) }
   */
  async completePayment(req, res, next) {
    try {
      const userId = req.userId;
      const { tx_ref, assignmentId } = req.body;

      if (!tx_ref) {
        throw new ValidationError('Transaction reference (tx_ref) is required');
      }

      // Find payment
      const payment = await prisma.payment.findUnique({
        where: { transactionReference: tx_ref },
      });

      if (!payment) {
        throw new NotFoundError('Payment not found');
      }

      if (payment.userId !== userId) {
        throw new ValidationError('Unauthorized');
      }

      // Payment must be verified first
      if (payment.paymentStatus !== 'successful') {
        throw new ValidationError(
          `Payment status is ${payment.paymentStatus}. Must be verified first.`
        );
      }

      // If completing with new assignment, link them
      let linkedAssignmentId = payment.assignmentId;
      if (assignmentId && !payment.assignmentId) {
        // Verify assignment exists and belongs to user
        const assignment = await prisma.assignment.findUnique({
          where: { id: assignmentId },
        });

        if (!assignment) {
          throw new NotFoundError('Assignment not found');
        }

        if (assignment.userId !== userId) {
          throw new ValidationError('Assignment does not belong to this user');
        }

        // Update payment with assignment link
        await prisma.payment.update({
          where: { id: payment.id },
          data: { assignmentId },
        });

        linkedAssignmentId = assignmentId;

        logger.info(`Payment ${tx_ref} linked to assignment ${assignmentId}`);
      }

      logger.info(`Payment completed: ${tx_ref} for user ${userId}`);

      res.status(200).json({
        message: 'Payment completed successfully',
        payment: {
          id: payment.id,
          status: payment.paymentStatus,
          amount: payment.amount,
          currency: payment.currency,
          assignmentId: linkedAssignmentId,
          transactionReference: tx_ref,
        },
        nextSteps: linkedAssignmentId
          ? 'Assignment is now linked to paid status. Proceed with submission.'
          : 'Payment completed. You can now submit assignments.',
      });
    } catch (err) {
      logger.error(`Payment completion error: ${err.message}`);
      next(err);
    }
  },

  /**
   * GET /payments/:id
   * Get payment details
   */
  async getPayment(req, res, next) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const payment = await prisma.payment.findUnique({
        where: { id },
        include: { assignments: true },
      });

      if (!payment) {
        throw new NotFoundError('Payment not found');
      }

      if (payment.userId !== userId) {
        throw new ValidationError('Unauthorized');
      }

      res.status(200).json({
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.paymentStatus,
          createdAt: payment.createdAt,
          assignmentId: payment.assignmentId,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /payments/user/:userId
   * List all payments for a user (admin only)
   */
  async getUserPayments(req, res, next) {
    try {
      const userId = req.params.userId;
      const { limit = 20, offset = 0 } = req.query;

      const payments = await prisma.payment.findMany({
        where: { userId },
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'desc' },
        include: { assignments: true },
      });

      const total = await prisma.payment.count({ where: { userId } });

      res.status(200).json({
        data: payments,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    } catch (err) {
      next(err);
    }
  },
};

export default PaymentController;
```

#### Step 2: Update Flutterwave Utility

Update [server/src/utils/flutterwave.mjs](server/src/utils/flutterwave.mjs):

```javascript
import axios from 'axios';
import { config } from '../config/index.mjs';
import { ApiError } from './errors.mjs';
import { logger } from './logger.mjs';

const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

/**
 * Verify a Flutterwave payment transaction
 * Can verify by transaction ID or by reference
 */
export async function verifyFlutterwaveTransaction(transactionId, txRef = null) {
  try {
    let url;

    // Try to verify by transaction ID first (more reliable)
    if (transactionId) {
      url = `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`;
    } else if (txRef) {
      // Fallback: verify by reference
      url = `${FLUTTERWAVE_BASE_URL}/transactions/verify_by_reference?reference=${txRef}`;
    } else {
      throw new ApiError('Transaction ID or reference required', 400);
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${config.FLUTTERWAVE_SECRET_KEY}`,
      },
      timeout: 10000,
    });

    logger.info(`Flutterwave verification successful for ${txRef || transactionId}`);

    // Extract relevant data from response
    const { data, status } = response.data;

    if (status !== 'success') {
      throw new ApiError('Flutterwave verification failed', 502);
    }

    return {
      id: data.id,
      tx_ref: data.tx_ref,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      customer: data.customer,
      timestamp: data.created_at,
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    logger.error(`Flutterwave API error: ${err.message}`);
    throw new ApiError('Failed to verify payment with Flutterwave', 502, {
      originalError: err.message,
    });
  }
}

/**
 * Generate unique transaction reference for idempotency
 */
export function generatePaymentRef(userId, assignmentId = null) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 7);
  const prefix = 'APE';
  const suffix = assignmentId ? assignmentId.substring(0, 8) : 'PROFILE';
  return `${prefix}-${suffix}-${timestamp}-${random}`.substring(0, 100);
}

/**
 * Build Flutterwave checkout payload
 * Used to initialize Flutterwave modal on frontend
 */
export function buildFlutterwaveCheckout(payment, user) {
  return {
    // Required
    tx_ref: payment.transactionReference,
    amount: payment.amount,
    currency: payment.currency || 'NGN',

    // Customer info
    customer: {
      email: user.email,
      phone_number: user.phone || '',
      name: user.fullName,
    },

    // Customization
    customizations: {
      title: 'ApeAcademy - Premium Assignment Service',
      description: 'Submit assignment and get professional solutions',
      logo: `${config.FRONTEND_URL}/logo.png`,
    },

    // URLs
    redirect_url: `${config.FRONTEND_URL}/payment/callback?tx_ref=${payment.transactionReference}`,
    callback: `${config.API_BASE_URL}/api/webhooks/flutterwave`,

    // Options
    meta: {
      userId: payment.userId,
      assignmentId: payment.assignmentId || null,
      environment: process.env.NODE_ENV,
    },
  };
}

export default {
  verifyFlutterwaveTransaction,
  generatePaymentRef,
  buildFlutterwaveCheckout,
};
```

#### Step 3: Update Routes

Update [server/src/routes/payment.mjs](server/src/routes/payment.mjs):

```javascript
import express from 'express';
import { authMiddleware } from '../middleware/auth.mjs';
import { PaymentController } from '../controllers/payment.mjs';
import { asyncHandler } from '../utils/asyncHandler.mjs';

const router = express.Router();

/**
 * POST /payments/initiate
 * Create a payment intent
 */
router.post(
  '/initiate',
  authMiddleware,
  asyncHandler((req, res, next) => PaymentController.initiatePayment(req, res, next))
);

/**
 * GET /payments/verify/:tx_ref
 * Verify payment after user returns from Flutterwave
 */
router.get(
  '/verify/:tx_ref',
  authMiddleware,
  asyncHandler((req, res, next) => PaymentController.verifyPayment(req, res, next))
);

/**
 * POST /payments/complete
 * Complete payment workflow
 */
router.post(
  '/complete',
  authMiddleware,
  asyncHandler((req, res, next) => PaymentController.completePayment(req, res, next))
);

/**
 * GET /payments/:id
 * Get specific payment
 */
router.get(
  '/:id',
  authMiddleware,
  asyncHandler((req, res, next) => PaymentController.getPayment(req, res, next))
);

export default router;
```

---

## ISSUE #2: Rate Limiting (2 hours)

### Solution

Install package:
```bash
npm install express-rate-limit
```

Add to [server/index.mjs](server/index.mjs) after other middleware:

```javascript
import rateLimit from 'express-rate-limit';

// ========================
// RATE LIMITING
// ========================

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes per IP
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise use IP
    return req.userId || req.ip;
  },
});

// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true, // Don't count successful attempts
  skipFailedRequests: false, // Do count failed attempts
});

// Payment limiter
const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 payment initiations per minute
  message: 'Too many payment attempts, please wait before trying again',
});

// Apply limiters
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/payments/initiate', paymentLimiter);
```

---

## ISSUE #3: Winston Logging (3 hours)

### Solution

Install packages:
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

// Create logs directory
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...metadata }) => {
    let log = `${timestamp} [${level.toUpperCase()}] ${message}`;
    if (Object.keys(metadata).length) {
      log += ` ${JSON.stringify(metadata)}`;
    }
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {},
  transports: [
    // Console output (colored)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    }),

    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 14, // Keep 2 weeks of logs
      format: logFormat,
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10485760,
      maxFiles: 14,
      format: logFormat,
    }),
  ],
});

// Export helper functions
export const logRequest = (req) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userId: req.userId || 'anonymous',
  });
};

export const logError = (err, req) => {
  logger.error(`Error: ${err.message}`, {
    method: req?.method,
    path: req?.path,
    status: err.statusCode || 500,
    userId: req?.userId || 'anonymous',
    stack: err.stack,
  });
};

export default logger;
```

Update error handler in [server/src/middleware/errorHandler.mjs](server/src/middleware/errorHandler.mjs):

```javascript
import { logger } from '../utils/logger.mjs';

export class ApiError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Log error
  logger.error(`${err.message}`, {
    statusCode,
    method: req.method,
    path: req.path,
    userId: req.userId,
    stack: isDevelopment ? err.stack : undefined,
  });

  // Send response
  res.status(statusCode).json({
    message: err.message,
    status: statusCode,
    error: isDevelopment ? err.details || {} : {},
    ...(isDevelopment && { stack: err.stack }),
  });
};

export const notFoundHandler = (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.path}`, {
    ip: req.ip,
  });

  res.status(404).json({
    message: 'Route not found',
    status: 404,
    path: req.path,
  });
};

export default { errorHandler, notFoundHandler };
```

---

## ISSUE #4: Joi Input Validation (3 hours)

### Solution

Create [server/src/utils/validation.mjs](server/src/utils/validation.mjs):

```javascript
import Joi from 'joi';
import { ValidationError } from './errors.mjs';

// Define reusable schemas
export const schemas = {
  // Authentication
  signup: Joi.object({
    fullName: Joi.string().required().min(2).max(100).messages({
      'string.empty': 'Full name is required',
      'string.min': 'Full name must be at least 2 characters',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
    }),
    password: Joi.string().required().min(8).regex(/[A-Z]/).regex(/[0-9]/).messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase letters and numbers',
    }),
    region: Joi.string().optional(),
    country: Joi.string().optional(),
    educationLevel: Joi.string()
      .optional()
      .allow('middle school', 'high school', 'university'),
    departmentOrCourse: Joi.string().optional(),
  }).unknown(false), // Reject unknown fields

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).unknown(false),

  // Assignments
  createAssignment: Joi.object({
    subject: Joi.string().required().min(3).max(200),
    description: Joi.string().optional().max(5000),
    educationLevel: Joi.string()
      .required()
      .allow('middle school', 'high school', 'university'),
    departmentOrCourse: Joi.string().optional().max(100),
    deadline: Joi.date().optional().min('now'),
    deliveryPlatform: Joi.string()
      .required()
      .allow('whatsapp', 'email', 'google_messages', 'imessage'),
    paymentId: Joi.string().optional(),
  }).unknown(false),

  // Payments
  initiatePayment: Joi.object({
    assignmentId: Joi.string().optional(),
    amount: Joi.number().positive().required().max(1000000).messages({
      'number.positive': 'Amount must be greater than 0',
      'number.max': 'Amount exceeds maximum limit',
    }),
    currency: Joi.string().optional().length(3).default('NGN'),
  }).unknown(false),

  completePayment: Joi.object({
    tx_ref: Joi.string().required(),
    assignmentId: Joi.string().optional(),
  }).unknown(false),

  // Pagination
  pagination: Joi.object({
    limit: Joi.number().optional().default(20).max(100),
    offset: Joi.number().optional().default(0).min(0),
  }).unknown(true), // Allow other fields

  // Admin
  updateAssignmentStatus: Joi.object({
    status: Joi.string()
      .required()
      .allow('pending', 'in_progress', 'delivered'),
  }).unknown(false),
};

/**
 * Validate data against schema
 * Throws ValidationError if invalid
 */
export function validate(data, schema) {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true, // Auto-convert types (string to number, etc.)
  });

  if (error) {
    const messages = error.details.map((d) => d.message).join('; ');
    throw new ValidationError(messages);
  }

  return value;
}

/**
 * Middleware factory for validating request bodies
 */
export function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = validate(req.body, schema);
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Middleware factory for validating query params
 */
export function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.query = validate(req.query, schema);
      next();
    } catch (err) {
      next(err);
    }
  };
}

export default { schemas, validate, validateBody, validateQuery };
```

Use in routes:

```javascript
// In server/src/routes/auth.mjs
import { validateBody } from '../utils/validation.mjs';
import { schemas } from '../utils/validation.mjs';

router.post(
  '/signup',
  validateBody(schemas.signup),
  asyncHandler((req, res, next) => AuthController.signup(req, res, next))
);

router.post(
  '/login',
  validateBody(schemas.login),
  asyncHandler((req, res, next) => AuthController.login(req, res, next))
);
```

---

## ISSUE #5: Email Service (Nodemailer) (3 hours)

### Solution

Install package:
```bash
npm install nodemailer
```

Create [server/src/services/email.mjs](server/src/services/email.mjs):

```javascript
import nodemailer from 'nodemailer';
import { config } from '../config/index.mjs';
import { logger } from '../utils/logger.mjs';

// Configure email service
// Supports: Gmail, Sendgrid, Mailgun, custom SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // For Gmail: use App Password, not regular password
  },
});

// Test connection on startup
transporter.verify((error) => {
  if (error) {
    logger.warn('Email service not configured:', error.message);
  } else {
    logger.info('Email service configured and ready');
  }
});

export const EmailService = {
  /**
   * Send verification email after signup
   */
  async sendVerificationEmail(user, verificationToken) {
    const verifyLink = `${config.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `ApeAcademy <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Verify your ApeAcademy account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to ApeAcademy!</h2>
          <p>Hi ${user.fullName},</p>
          <p>Thank you for signing up. Please verify your email to activate your account:</p>
          <a href="${verifyLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
          <p>This link expires in 24 hours.</p>
          <p>If the button doesn't work, copy this link:<br/>${verifyLink}</p>
          <hr/>
          <p style="font-size: 12px; color: #666;">If you didn't create this account, please ignore this email.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${user.email}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send verification email to ${user.email}:`, error.message);
      return false;
    }
  },

  /**
   * Send assignment submission confirmation
   */
  async sendAssignmentSubmittedEmail(user, assignment) {
    const mailOptions = {
      from: `ApeAcademy <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Assignment Received - ApeAcademy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Assignment Submitted Successfully</h2>
          <p>Hi ${user.fullName},</p>
          <p>Your assignment has been received and is being processed.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Subject:</strong> ${assignment.subject}</p>
            <p><strong>Education Level:</strong> ${assignment.educationLevel}</p>
            <p><strong>Deadline:</strong> ${new Date(assignment.deadline).toLocaleDateString()}</p>
            <p><strong>Delivery Method:</strong> ${assignment.deliveryPlatform}</p>
          </div>
          <p>You will receive your completed work via <strong>${assignment.deliveryPlatform}</strong> by the deadline.</p>
          <p><a href="${config.FRONTEND_URL}/dashboard">View your assignments</a></p>
          <hr/>
          <p style="font-size: 12px; color: #666;">Thank you for using ApeAcademy</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      logger.info(`Assignment confirmation email sent to ${user.email}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send assignment email to ${user.email}:`, error);
      return false;
    }
  },

  /**
   * Send payment confirmation
   */
  async sendPaymentConfirmationEmail(user, payment) {
    const mailOptions = {
      from: `ApeAcademy <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Payment Received - ApeAcademy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Payment Confirmed</h2>
          <p>Hi ${user.fullName},</p>
          <p>Your payment has been processed successfully.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Amount:</strong> ${payment.currency} ${payment.amount}</p>
            <p><strong>Reference:</strong> ${payment.transactionReference}</p>
            <p><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span style="color: green;">✓ Verified</span></p>
          </div>
          <p>You can now proceed with your assignment submission.</p>
          <hr/>
          <p style="font-size: 12px; color: #666;">For support, reply to this email</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      logger.info(`Payment confirmation email sent to ${user.email}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send payment email to ${user.email}:`, error);
      return false;
    }
  },

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetLink = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `ApeAcademy <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Reset Your Password - ApeAcademy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>Hi ${user.fullName},</p>
          <p>We received a request to reset your password. Click the link below to proceed:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p>This link expires in 1 hour and can only be used once.</p>
          <hr/>
          <p style="font-size: 12px; color: #666;">If you didn't request this, please ignore this email</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${user.email}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send reset email to ${user.email}:`, error);
      return false;
    }
  },
};

export default EmailService;
```

Update .env with email config:
```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@apeacademy.com
```

---

## ISSUE #6: Admin Endpoints & Roles (4 hours)

### Step 1: Add Role Field to User Model

Update [prisma/schema.prisma](prisma/schema.prisma):

```prisma
model User {
  id                String   @id @default(cuid())
  fullName          String
  email             String   @unique
  passwordHash      String
  role              String   @default("user")  // "user", "admin", "operator"
  region            String
  country           String
  educationLevel    String
  departmentOrCourse String?
  isEmailVerified   Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  assignments Assignment[]
  payments    Payment[]

  @@index([email])
  @@index([role])
}
```

Run migration:
```bash
npm run db:migrate
# Name it: "add_user_role_and_verification_fields"
```

### Step 2: Create Admin Middleware

Create [server/src/middleware/admin.mjs](server/src/middleware/admin.mjs):

```javascript
import { PrismaClient } from '@prisma/client';
import { AuthError } from '../utils/errors.mjs';
import { logger } from '../utils/logger.mjs';

const prisma = new PrismaClient();

/**
 * Middleware to check if user is admin
 * Must come AFTER authMiddleware
 */
export async function adminMiddleware(req, res, next) {
  try {
    if (!req.userId) {
      throw new AuthError('Authentication required for admin access');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new AuthError('User not found');
    }

    if (user.role !== 'admin' && user.role !== 'operator') {
      logger.warn(`Unauthorized admin access attempt by ${user.email}`);
      throw new AuthError('Admin access required');
    }

    req.userRole = user.role;
    req.userEmail = user.email;
    next();
  } catch (err) {
    next(err);
  }
}

export default adminMiddleware;
```

### Step 3: Create Admin Controllers

Create [server/src/controllers/admin.mjs](server/src/controllers/admin.mjs):

```javascript
import { PrismaClient } from '@prisma/client';
import { ValidationError, NotFoundError, ApiError } from '../utils/errors.mjs';
import { logger } from '../utils/logger.mjs';

const prisma = new PrismaClient();

export const AdminController = {
  /**
   * GET /admin/assignments
   * List all assignments with filtering
   */
  async listAssignments(req, res, next) {
    try {
      const { status, limit = 20, offset = 0, search } = req.query;

      const where = {};
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { subject: { contains: search, mode: 'insensitive' } },
          { user: { fullName: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const [assignments, total] = await Promise.all([
        prisma.assignment.findMany({
          where,
          include: { user: { select: { id: true, fullName: true, email: true } }, payment: true },
          take: parseInt(limit),
          skip: parseInt(offset),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.assignment.count({ where }),
      ]);

      logger.info(`Admin listed ${assignments.length} assignments (total: ${total})`);

      res.status(200).json({
        data: assignments,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /admin/assignments/:id
   * Update assignment status
   */
  async updateAssignmentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

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
        data: { status, updatedAt: new Date() },
        include: { user: true, payment: true },
      });

      logger.info(`Admin ${req.userEmail} updated assignment ${id} status to ${status}`);

      res.status(200).json({
        message: `Assignment status updated to ${status}`,
        assignment: {
          id: updated.id,
          subject: updated.subject,
          status: updated.status,
          user: { fullName: updated.user.fullName, email: updated.user.email },
          updatedAt: updated.updatedAt,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /admin/payments
   * List all payments
   */
  async listPayments(req, res, next) {
    try {
      const {status, limit = 20, offset = 0 } = req.query;

      const where = {};
      if (status) where.paymentStatus = status;

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          include: { user: { select: { fullName: true, email: true } } },
          take: parseInt(limit),
          skip: parseInt(offset),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.payment.count({ where }),
      ]);

      res.status(200).json({
        data: payments,
        total,
        stats: {
          pending: await prisma.payment.count({ where: { paymentStatus: 'pending' } }),
          successful: await prisma.payment.count({ where: { paymentStatus: 'successful' } }),
          failed: await prisma.payment.count({ where: { paymentStatus: 'failed' } }),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /admin/users
   * List all users
   */
  async listUsers(req, res, next) {
    try {
      const { limit = 20, offset = 0, role } = req.query;

      const where = {};
      if (role) where.role = role;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            region: true,
            country: true,
            createdAt: true,
          },
          take: parseInt(limit),
          skip: parseInt(offset),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      res.status(200).json({
        data: users,
        total,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /admin/users/:id/role
   * Change user role
   */
  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const validRoles = ['user', 'admin', 'operator'];
      if (!validRoles.includes(role)) {
        throw new ValidationError(`Role must be one of: ${validRoles.join(', ')}`);
      }

      const user = await prisma.user.update({
        where: { id },
        data: { role },
        select: { id: true, fullName: true, email: true, role: true },
      });

      logger.info(`Admin ${req.userEmail} changed ${user.email} role to ${role}`);

      res.status(200).json({
        message: 'User role updated',
        user,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /admin/stats
   * Get platform statistics
   */
  async getStats(req, res, next) {
    try {
      const stats = await Promise.all([
        prisma.user.count(),
        prisma.assignment.count(),
        prisma.assignment.count({ where: { status: 'delivered' } }),
        prisma.payment.count({ where: { paymentStatus: 'successful' } }),
        prisma.payment.aggregate({
          where: { paymentStatus: 'successful' },
          _sum: { amount: true },
        }),
      ]);

      res.status(200).json({
        totalUsers: stats[0],
        totalAssignments: stats[1],
        completedAssignments: stats[2],
        successfulPayments: stats[3],
        totalRevenue: stats[4]._sum.amount || 0,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default AdminController;
```

### Step 4: Create Admin Routes

Create [server/src/routes/admin.mjs](server/src/routes/admin.mjs):

```javascript
import express from 'express';
import { authMiddleware } from '../middleware/auth.mjs';
import adminMiddleware from '../middleware/admin.mjs';
import { AdminController } from '../controllers/admin.mjs';
import { asyncHandler } from '../utils/asyncHandler.mjs';
import { validateBody, validateQuery, schemas } from '../utils/validation.mjs';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authMiddleware, adminMiddleware);

/**
 * GET /admin/stats
 */
router.get(
  '/stats',
  asyncHandler((req, res, next) =>
    AdminController.getStats(req, res, next)
  )
);

/**
 * GET /admin/assignments
 */
router.get(
  '/assignments',
  validateQuery(schemas.pagination),
  asyncHandler((req, res, next) =>
    AdminController.listAssignments(req, res, next)
  )
);

/**
 * PATCH /admin/assignments/:id
 */
router.patch(
  '/assignments/:id',
  validateBody(schemas.updateAssignmentStatus),
  asyncHandler((req, res, next) =>
    AdminController.updateAssignmentStatus(req, res, next)
  )
);

/**
 * GET /admin/payments
 */
router.get(
  '/payments',
  validateQuery(schemas.pagination),
  asyncHandler((req, res, next) =>
    AdminController.listPayments(req, res, next)
  )
);

/**
 * GET /admin/users
 */
router.get(
  '/users',
  validateQuery(schemas.pagination),
  asyncHandler((req, res, next) =>
    AdminController.listUsers(req, res, next)
  )
);

/**
 * PATCH /admin/users/:id/role
 */
router.patch(
  '/users/:id/role',
  validateBody(Joi.object({ role: Joi.string().required() })),
  asyncHandler((req, res, next) =>
    AdminController.updateUserRole(req, res, next)
  )
);

export default router;
```

Add admin routes to [server/index.mjs](server/index.mjs):

```javascript
import adminRoutes from './src/routes/admin.mjs';

// Add with other routes
app.use('/api/admin', adminRoutes);
```

---

## ISSUE #7: HTTPS & Security (2 hours)

### For Production (Cloud Providers)

Most providers handle HTTPS automatically:

**Railway:** Auto HTTPS on `*.railway.app` domain or custom domain  
**Heroku:** Auto HTTPS included  
**AWS:** Use CloudFront + Certificate Manager  

### For Self-Hosted Servers

Use **Let's Encrypt** (free):

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Certificate files:
/etc/letsencrypt/live/yourdomain.com/privkey.pem
/etc/letsencrypt/live/yourdomain.com/fullchain.pem
```

Configure Node.js for HTTPS:

```javascript
// server/index.mjs
import https from 'https';
import fs from 'fs';

let server;
if (process.env.NODE_ENV === 'production' && fs.existsSync('/etc/letsencrypt/live/')) {
  const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/fullchain.pem'),
  };
  server = https.createServer(options, app);
} else {
  server = app; // HTTP in development
}

server.listen(PORT, () => {
  logger.info(`Server running on ${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://localhost:${PORT}`);
});
```

Add HSTS header (forces HTTPS):

```javascript
import helmet from 'helmet';

app.use(
  helmet.hsts({
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  })
);
```

---

## ISSUE #8: Database Backups (2 hours)

### Backup Script

Create [backup.sh](backup.sh):

```bash
#!/bin/bash
# ApeAcademy Database Backup Script

BACKUP_DIR="${HOME}/apeacademy-backups"
DB_CONTAINER="apeacademy-db"
DB_NAME="apeacademy"
DB_USER="apeacademy"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/apeacademy_$TIMESTAMP.sql"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Dump database
echo "🔄 Creating database backup..."
docker compose exec -T postgres \
  pg_dump -U "$DB_USER" -d "$DB_NAME" \
  > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

# Get file size
SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

# Log backup
echo "✓ Backup created: $BACKUP_FILE ($SIZE)" >> "$BACKUP_DIR/backups.log"

# Keep only last 30 days of backups
echo "🧹 Cleaning old backups..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete

echo "✓ Backup complete!"
```

Make executable and schedule:

```bash
chmod +x backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add this line:
0 2 * * * /path/to/backup.sh >> /var/log/apeacademy-backup.log 2>&1
```

### Restore from Backup

```bash
# Extract backup
gunzip apeacademy_20260208_020000.sql.gz

# Restore to database
docker compose exec -T postgres \
  psql -U apeacademy -d apeacademy \
  < apeacademy_20260208_020000.sql
```

---

## ISSUE #9: Flutterwave Webhooks (3 hours)

### Create Webhook Route

Create [server/src/routes/webhooks.mjs](server/src/routes/webhooks.mjs):

```javascript
import express from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/index.mjs';
import { logger } from '../utils/logger.mjs';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Verify Flutterwave webhook signature
 */
function verifyFlutterwaveSignature(req) {
  const hash = crypto
    .createHmac('sha256', config.FLUTTERWAVE_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  const signature = req.headers['verif ication-hash'];
  return hash === signature;
}

/**
 * POST /webhooks/flutterwave
 * Handle Flutterwave payment webhooks
 */
router.post('/flutterwave', async (req, res) => {
  try {
    // Verify webhook signature
    if (!verifyFlutterwaveSignature(req)) {
      logger.warn('Invalid Flutterwave webhook signature');
      return res.status(401).json({ status: 'error', message: 'Invalid signature' });
    }

    const { event, data } = req.body;
    logger.info(`Webhook event: ${event}`, { data });

    if (event === 'charge.completed') {
      const { tx_ref, status, id: flw_id, amount, currency } = data;

      // Find payment by transaction reference
      const payment = await prisma.payment.findUnique({
        where: { transactionReference: tx_ref },
      });

      if (payment) {
        // Update payment status
        const newStatus = status === 'successful' ? 'successful' : 'failed';
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            paymentStatus: newStatus,
            flutterwaveTransactionId: flw_id,
            updatedAt: new Date(),
          },
        });

        logger.info(
          `Payment webhook processed: ${tx_ref} → ${newStatus}`,
          {
            paymentId: payment.id,
            userId: payment.userId,
          }
        );

        // If payment successful, update assignment status
        if (newStatus === 'successful' && payment.assignmentId) {
          await prisma.assignment.update({
            where: { id: payment.assignmentId },
            data: { status: 'pending' }, // Ready for processing
          });

          logger.info(`Assignment ${payment.assignmentId} status updated to pending`);
        }
      } else {
        logger.warn(`Payment not found for webhook: ${tx_ref}`);
      }
    }

    // Let Flutterwave know we received it
    res.status(200).json({ status: 'success' });
  } catch (error) {
    logger.error(`Webhook processing error: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
```

Add to [server/index.mjs](server/index.mjs):

```javascript
import webhookRoutes from './src/routes/webhooks.mjs';

app.use('/api/webhooks', webhookRoutes);
```

Configure webhook in Flutterwave:
1. Go to https://dashboard.flutterwave.com → Settings → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/flutterwave`
3. Events: Select `charge.completed`
4. Save

---

## ISSUE #10: Database Migrations Strategy (2 hours)

### Prisma Migrations Setup

Already configured, but add scripts to [package.json](package.json):

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:push": "prisma db push",
    "db:seed": "node server/prisma/seed.mjs",
    "db:studio": "prisma studio"
  }
}
```

### Migration Workflow

```bash
# Development: Create and run migration
npm run db:migrate
# Name it: "add_user_role_field" (descriptive!)

# Production: Deploy existing migrations
npm run db:migrate:prod
```

Migration files auto-generated in `prisma/migrations/`

---

## ISSUE #11: Sentry Error Tracking (2 hours)

### Install and Setup

```bash
npm install @sentry/node
```

Configure in [server/index.mjs](server/index.mjs):

```javascript
import * as Sentry from '@sentry/node';

// Initialize Sentry (after imports, before routes)
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    // Performance monitoring
    tracesSampleRate: 1.0,
    // Release tracking
    release: process.env.APP_VERSION || '1.0.0',
  });

  // Attach to all routes
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.errorHandler());
}
```

Add to .env:
```env
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

Get Sentry URL from: https://sentry.io → Projects → Create Project

---

## Summary: All 11 Issues Implemented

✅ Complete Payment Controller  
✅ Rate Limiting  
✅ Winston Logging  
✅ Joi Validation  
✅ Email Service  
✅ Admin Endpoints  
✅ HTTPS Configuration  
✅ Database Backups  
✅ Flutterwave Webhooks  
✅ Database Migrations  
✅ Sentry Error Tracking  

**All code provided above with full implementation examples.**

---

## Installation Order (Do This Next)

```bash
# Install all missing packages
npm install express-rate-limit winston nodemailer @sentry/node

# Update .env with new variables
cp .env.example .env
# Add: FLUTTERWAVE keys, JWT_SECRET, EMAIL credentials, SENTRY_DSN

# Run database migration
npm run db:migrate

# Start server
npm run server:dev

# Test everything
curl http://localhost:3000/api/health
```

