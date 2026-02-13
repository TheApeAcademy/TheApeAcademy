import express from 'express';
import { authMiddleware } from '../middleware/auth.mjs';
import { PaymentController } from '../controllers/payment.mjs';
import { asyncHandler } from '../utils/asyncHandler.mjs';
import { validateSchema, schemas } from '../utils/validation.mjs';

const router = express.Router();

/**
 * POST /payments/initiate
 * Create a payment intent for assignment submission
 * Protected: requires authentication
 * Body: { amount, currency?, assignmentId? }
 */
router.post('/initiate', 
  authMiddleware, 
  validateSchema(schemas.initiatePayment), 
  asyncHandler((req, res, next) => PaymentController.initiatePayment(req, res, next)));

/**
 * GET /payments/verify/:tx_ref
 * Verify a payment transaction with Flutterwave
 * Protected: requires authentication
 * Params: tx_ref (transaction reference)
 */
router.get('/verify/:tx_ref', 
  authMiddleware, 
  asyncHandler((req, res, next) => PaymentController.verifyPayment(req, res, next)));

/**
 * POST /payments/complete
 * Finalize a payment after returning from Flutterwave
 * Protected: requires authentication
 * Body: { tx_ref, transaction_id }
 */
router.post('/complete', 
  authMiddleware, 
  asyncHandler((req, res, next) => PaymentController.completePayment(req, res, next)));

export default router;
