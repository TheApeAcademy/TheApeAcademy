import express from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/index.mjs';
import { logger } from '../utils/logger.mjs';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Verify Flutterwave webhook signature
 * Flutterwave sends a 'verificationHash' header with HMAC-SHA256 signature
 */
function verifyFlutterwaveSignature(req) {
  try {
    const signature = req.headers['verificationhash'] || req.headers['verification-hash'];
    if (!signature) {
      logger.warn('Missing verification hash in webhook header');
      return false;
    }

    // Calculate expected hash with HMAC-SHA256
    const hash = crypto
      .createHmac('sha256', config.FLUTTERWAVE_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    const isValid = hash === signature;
    if (!isValid) {
      logger.warn('Webhook signature mismatch', {
        expected: hash.substring(0, 10) + '...',
        received: signature.substring(0, 10) + '...',
      });
    }
    return isValid;
  } catch (error) {
    logger.error('Error verifying webhook signature', { error: error.message });
    return false;
  }
}

/**
 * POST /webhooks/flutterwave
 * Handle Flutterwave payment webhooks (async payment confirmation)
 * Webhook signature: verificationHash header (HMAC-SHA256)
 * Events handled: charge.completed
 */
router.post('/flutterwave', async (req, res) => {
  try {
    // Verify webhook signature for security
    if (!verifyFlutterwaveSignature(req)) {
      logger.warn('Invalid Flutterwave webhook signature', {
        ip: req.ip,
        body: JSON.stringify(req.body).substring(0, 100),
      });
      return res.status(401).json({
        status: 'error',
        message: 'Invalid webhook signature',
      });
    }

    const { event, data } = req.body;

    logger.info(`Flutterwave webhook received: ${event}`, {
      txRef: data?.tx_ref,
      status: data?.status,
    });

    /**
     * Handle charge.completed event
     * This fires when payment is successful
     */
    if (event === 'charge.completed') {
      const { tx_ref, status, id: flw_id, amount, currency } = data;

      if (!tx_ref) {
        logger.warn('Webhook received but no tx_ref found');
        return res.status(200).json({ status: 'success' });
      }

      try {
        // Find payment by transaction reference
        const payment = await prisma.payment.findUnique({
          where: { transactionReference: tx_ref },
          include: { user: true },
        });

        if (payment) {
          // Determine new status based on webhook event
          const newStatus = status === 'successful' ? 'successful' : 'failed';

          // Update payment status
          const updatedPayment = await prisma.payment.update({
            where: { id: payment.id },
            data: {
              paymentStatus: newStatus,
              flutterwaveTransactionId: flw_id,
              updatedAt: new Date(),
            },
          });

          logger.info(`Payment webhook processed: ${tx_ref} → ${newStatus}`, {
            paymentId: payment.id,
            userId: payment.userId,
            flwId: flw_id,
            amount,
            currency,
          });

          // If payment successful and linked to assignment, update assignment status
          if (newStatus === 'successful' && payment.assignmentId) {
            const updatedAssignment = await prisma.assignment.update({
              where: { id: payment.assignmentId },
              data: {
                status: 'pending', // Ready for review
                updatedAt: new Date(),
              },
            });

            logger.info(`Assignment status updated via webhook`, {
              assignmentId: payment.assignmentId,
              paymentId: payment.id,
              oldStatus: 'pending',
              newStatus: 'pending',
            });
          }

          // Log payment success for transaction history
          if (newStatus === 'successful') {
            logger.info(`Payment completed: user ${payment.userId} paid ${amount} ${currency}`, {
              paymentId: payment.id,
              assignmentId: payment.assignmentId,
              flwId: flw_id,
            });
          }
        } else {
          logger.warn(`Webhook received but payment not found: ${tx_ref}`);
        }
      } catch (error) {
        logger.error(`Error processing charge.completed webhook: ${error.message}`, {
          txRef: tx_ref,
          error: error.message,
        });
        // Still return 200 to acknowledge receipt (Flutterwave will retry if 5xx)
      }
    } else {
      // Log unhandled webhook events for future expansion
      logger.info(`Unhandled webhook event: ${event}`, { data: JSON.stringify(data).substring(0, 200) });
    }

    // Always return 200 to acknowledge receipt to Flutterwave
    // Flutterwave will retry if we return 5xx status
    res.status(200).json({
      status: 'success',
      message: 'Webhook processed',
    });
  } catch (error) {
    logger.error(`Webhook processing error: ${error.message}`, { error: error.stack });
    // Return 200 to prevent Flutterwave retries, but log the error
    res.status(200).json({
      status: 'error',
      message: 'Webhook processing error',
    });
  }
});

export default router;
