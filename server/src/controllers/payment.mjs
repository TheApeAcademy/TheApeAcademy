import { PrismaClient } from '@prisma/client';
import { ValidationError, NotFoundError, ApiError } from '../utils/errors.mjs';
import { generatePaymentRef, verifyFlutterwaveTransaction, initializeFlutterwavePayment } from '../utils/flutterwave.mjs';
import { config } from '../config/index.mjs';

const prisma = new PrismaClient();

export const PaymentController = {
  /**
   * POST /payments/initiate
   * Create a payment intent for assignment submission
   * Returns a Flutterwave link for the frontend to redirect to
   */
  async initiatePayment(req, res, next) {
    try {
      const userId = req.userId;
      const { assignmentId, amount, currency = 'NGN' } = req.body;

      if (!amount || amount <= 0) {
        throw new ValidationError('Valid amount is required');
      }

      // Create payment record with pending status
      const transactionReference = generatePaymentRef(userId, assignmentId);

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

      // Attempt to initialize a hosted Flutterwave checkout link
      let paymentLink = null;
      try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        paymentLink = await initializeFlutterwavePayment(payment, user);
      } catch (err) {
        // Initialization may fail if keys not set; return base checkout url as fallback
        console.warn('Flutterwave init failed, falling back to public checkout form', err.message || err);
        paymentLink = `https://checkout.flutterwave.com/pay/${config.FLUTTERWAVE_PUBLIC_KEY}`;
      }

      res.status(201).json({
        message: 'Payment intent created',
        payment: {
          id: payment.id,
          transactionReference: payment.transactionReference,
          amount: payment.amount,
          currency: payment.currency,
        },
        checkoutUrl: paymentLink,
        paymentLink,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /payments/verify/:tx_ref
   * Verify a payment after user returns from Flutterwave
   * Critical: Must verify with Flutterwave API, not trust frontend
   */
  async verifyPayment(req, res, next) {
    try {
      const { tx_ref } = req.params;
      const userId = req.userId;

      if (!tx_ref) {
        throw new ValidationError('Transaction reference is required');
      }

      // Find payment record by tx_ref
      const payment = await prisma.payment.findUnique({
        where: { transactionReference: tx_ref },
      });

      if (!payment) {
        throw new NotFoundError('Payment record not found');
      }

      // Ensure user owns this payment
      if (payment.userId !== userId) {
        throw new ValidationError('Unauthorized');
      }

      // If already verified, return cached result
      if (payment.paymentStatus === 'successful') {
        return res.status(200).json({
          message: 'Payment already verified',
          payment: {
            id: payment.id,
            status: payment.paymentStatus,
            amount: payment.amount,
            currency: payment.currency,
          },
        });
      }

      // Verify with Flutterwave if we have the transaction ID
      if (payment.flutterwaveTransactionId) {
        const flutterwaveData = await verifyFlutterwaveTransaction(payment.flutterwaveTransactionId);

        // Validate payment data
        if (
          flutterwaveData.status !== 'successful' ||
          flutterwaveData.amount !== payment.amount ||
          flutterwaveData.currency !== payment.currency
        ) {
          throw new ApiError('Payment verification failed: data mismatch', 402);
        }

        // Update payment status
        const updatedPayment = await prisma.payment.update({
          where: { id: payment.id },
          data: { paymentStatus: 'successful' },
        });

        return res.status(200).json({
          message: 'Payment verified successfully',
          payment: {
            id: updatedPayment.id,
            status: updatedPayment.paymentStatus,
            amount: updatedPayment.amount,
            currency: updatedPayment.currency,
          },
        });
      }

      // If no Flutterwave transaction ID, payment is still pending
      res.status(202).json({
        message: 'Payment verification pending',
        payment: {
          id: payment.id,
          status: payment.paymentStatus,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /payments/complete
   * Accepts `{ tx_ref, transaction_id }` from frontend after Flutterwave checkout
   * Verifies the transaction with Flutterwave API and updates payment record
   */
  async completePayment(req, res, next) {
    try {
      const userId = req.userId;
      const { tx_ref, transaction_id } = req.body;

      if (!tx_ref || !transaction_id) {
        throw new ValidationError('tx_ref and transaction_id are required');
      }

      // Find payment by tx_ref
      const payment = await prisma.payment.findUnique({ where: { transactionReference: tx_ref } });
      if (!payment) {
        throw new NotFoundError('Payment record not found');
      }

      if (payment.userId !== userId) {
        throw new ValidationError('Unauthorized');
      }

      // Verify transaction with Flutterwave
      const flutterData = await verifyFlutterwaveTransaction(transaction_id);

      // Basic validation: status and amounts must match
      if (flutterData.status !== 'successful' || parseFloat(flutterData.amount) !== parseFloat(payment.amount) || (flutterData.currency || 'NGN') !== payment.currency) {
        throw new ApiError('Payment verification failed: data mismatch', 402);
      }

      // Update payment record with flutterwave transaction id and mark successful
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: { flutterwaveTransactionId: transaction_id, paymentStatus: 'successful' },
      });

      return res.status(200).json({
        message: 'Payment verified and completed',
        payment: {
          id: updatedPayment.id,
          status: updatedPayment.paymentStatus,
          amount: updatedPayment.amount,
          currency: updatedPayment.currency,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};

export default PaymentController;
