import axios from 'axios';
import { config } from '../config/index.mjs';
import { ApiError } from './errors.mjs';

const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

/**
 * Verify a Flutterwave payment transaction
 * @param {string} transactionId – Flutterwave transaction ID
 * @returns {object} Transaction data
 */
export async function verifyFlutterwaveTransaction(transactionId) {
  try {
    const response = await axios.get(`${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`, {
      headers: {
        Authorization: `Bearer ${config.FLUTTERWAVE_SECRET_KEY}`,
      },
    });

    const { data, status } = response.data;

    if (status !== 'success') {
      throw new ApiError('Flutterwave API error', 502);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.error('Flutterwave verification error:', err.message);
    throw new ApiError('Failed to verify payment', 502, { originalError: err.message });
  }
}

/**
 * Initialize a Flutterwave payment (create payment intent)
 * Generates a unique tx_ref for idempotency
 */
export function generatePaymentRef(userId, assignmentId) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `APE-${userId}-${assignmentId || 'PROFILE'}-${timestamp}-${random}`.substring(0, 100);
}

/**
 * Build Flutterwave payment payload
 */
export function buildFlutterwavePayload(payment, user) {
  return {
    tx_ref: payment.transactionReference,
    amount: payment.amount,
    currency: payment.currency || 'NGN',
    customer: {
      email: user.email,
      name: user.fullName,
    },
    customizations: {
      title: 'ApeAcademy Assignment',
      description: `Payment for assignment submission`,
      logo: 'https://apeacademy.com/logo.png', // Update with real logo
    },
    redirect_url: `${config.FRONTEND_URL}/payment-callback`,
  };
}

/**
 * Initialize a Flutterwave hosted payment and return the checkout link
 */
export async function initializeFlutterwavePayment(payment, user) {
  try {
    const payload = buildFlutterwavePayload(payment, user);
    const response = await axios.post(`${FLUTTERWAVE_BASE_URL}/payments`, payload, {
      headers: {
        Authorization: `Bearer ${config.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.data || response.data.status !== 'success') {
      throw new ApiError('Failed to initialize Flutterwave payment', 502);
    }

    // Flutterwave returns the hosted checkout link in response.data.data.link or data.meta.authorization.redirect
    const data = response.data.data || response.data;
    return data.link || (data.meta && data.meta.authorization && data.meta.authorization.redirect) || null;
  } catch (err) {
    console.error('Flutterwave init error:', err.message || err);
    throw new ApiError('Failed to initialize payment', 502, { originalError: err.message });
  }
}
