import nodemailer from 'nodemailer';
import { config } from '../config/index.mjs';
import { logger } from '../utils/logger.mjs';

/**
 * Email Service
 * Handles sending emails via Nodemailer
 * Supports multiple providers: Gmail, SendGrid, custom SMTP
 */

let transporter;

/**
 * Initialize email transporter
 * Reads from .env: EMAIL_PROVIDER, EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT
 */
function initializeTransporter() {
  const provider = process.env.EMAIL_PROVIDER || 'gmail';

  try {
    if (provider === 'gmail') {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // Gmail App Password, not regular password
        },
      });
    } else if (provider === 'sendgrid') {
      transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    } else {
      // Custom SMTP
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true for port 465, false for others
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }

    logger.info('Email transporter initialized', { provider });
  } catch (error) {
    logger.error('Failed to initialize email transporter', { error: error.message });
    throw error;
  }
}

/**
 * Email Templates
 */
const templates = {
  verification: (email, verificationLink) => ({
    subject: 'Verify Your ApeAcademy Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; color: white; text-align: center;">
          <h1 style="margin: 0;">🦍 ApeAcademy</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px;">Welcome to Our Platform</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333;">Verify Your Email</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for signing up! To complete your registration and start submitting assignments, please verify your email address.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background: #667eea; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p style="color: #999; font-size: 12px;">
            Or copy this link: <a href="${verificationLink}" style="color: #667eea;">${verificationLink}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      </div>
    `,
  }),

  submission: (assignmentTitle, userName, statusLink) => ({
    subject: `Assignment Received: ${assignmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">✅ Assignment Received</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="color: #333; margin: 0 0 20px 0;">Hi ${userName},</p>
          <p style="color: #666; line-height: 1.6;">
            Your assignment <strong>"${assignmentTitle}"</strong> has been successfully received and is under review.
          </p>
          <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
            <p style="margin: 0; color: #333;"><strong>What's Next?</strong></p>
            <p style="color: #666; margin: 10px 0 0 0;">
              Our team will review your submission and you'll receive an update within 24-48 hours. We'll notify you via email when your assignment is ready.
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${statusLink}" style="background: #667eea; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block; font-weight: bold;">
              Check Status
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  payment: (userName, amount, currency, orderId) => ({
    subject: `Payment Confirmation - ${amount} ${currency}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #17c654 0%, #2db854 100%); padding: 30px; border-radius: 8px 8px 0 0; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">💳 Payment Successful</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="color: #333; margin: 0 0 20px 0;">Hi ${userName},</p>
          <p style="color: #666; line-height: 1.6;">
            Thank you! Your payment has been received and processed successfully.
          </p>
          <div style="background: white; padding: 20px; border-left: 4px solid #17c654; margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; margin: 10px 0;">
              <span style="color: #666;">Amount</span>
              <strong style="color: #333;">${amount} ${currency}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 10px 0;">
              <span style="color: #666;">Order ID</span>
              <strong style="color: #333;">${orderId}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 10px 0;">
              <span style="color: #666;">Date</span>
              <strong style="color: #333;">${new Date().toLocaleDateString()}</strong>
            </div>
          </div>
          <p style="color: #666; line-height: 1.6; margin: 20px 0;">
            Your receipt has been saved to your account. You can view it anytime in your dashboard.
          </p>
        </div>
      </div>
    `,
  }),

  reset: (resetLink, userName) => ({
    subject: 'Reset Your ApeAcademy Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 8px 8px 0 0; color: white; text-align: center;">
          <h1 style="margin: 0;">🔐 Reset Your Password</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="color: #333; margin: 0 0 20px 0;">Hi ${userName},</p>
          <p style="color: #666; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password. This link will expire in 1 hour.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #f5576c; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #656565; font-size: 12px;">
            <strong>Didn't request this?</strong> Your password hasn't been changed. If you didn't make this request, you can safely ignore this email.
          </p>
          <p style="color: #999; font-size: 12px;">
            Or copy this link: <a href="${resetLink}" style="color: #f5576c;">${resetLink}</a>
          </p>
        </div>
      </div>
    `,
  }),
};

/**
 * Send email
 * @param {string} to - Recipient email
 * @param {string} templateName - Name of template (verification, submission, payment, reset)
 * @param {object} data - Data for template
 */
async function sendEmail(to, templateName, data) {
  try {
    // Ensure transporter is initialized
    if (!transporter) {
      initializeTransporter();
    }

    // Get template
    const templateFn = templates[templateName];
    if (!templateFn) {
      throw new Error(`Unknown email template: ${templateName}`);
    }

    // Generate email content
    const { subject, html } = templateFn(...Object.values(data));

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@apeacademy.com',
      to,
      subject,
      html,
    });

    logger.info(`Email sent successfully`, {
      to,
      template: templateName,
      messageId: info.messageId,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Failed to send email', {
      to,
      template: templateName,
      error: error.message,
    });

    // In development, don't throw error; in production, re-throw
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }

    return { success: false, error: error.message };
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email, verificationLink) {
  return sendEmail(email, 'verification', { email, verificationLink });
}

/**
 * Send assignment submission confirmation
 */
export async function sendSubmissionEmail(email, assignmentTitle, userName, statusLink) {
  return sendEmail(email, 'submission', { assignmentTitle, userName, statusLink });
}

/**
 * Send payment confirmation
 */
export async function sendPaymentEmail(email, userName, amount, currency, orderId) {
  return sendEmail(email, 'payment', { userName, amount, currency, orderId });
}

/**
 * Send password reset email
 */
export async function sendResetEmail(email, resetLink, userName) {
  return sendEmail(email, 'reset', { resetLink, userName });
}

// Initialize transporter on module load
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  try {
    initializeTransporter();
  } catch (error) {
    logger.warn('Email service not configured. Sending will be disabled.', {
      provider: process.env.EMAIL_PROVIDER || 'gmail',
    });
  }
}

export const EmailService = {
  sendEmail,
  sendVerificationEmail,
  sendSubmissionEmail,
  sendPaymentEmail,
  sendResetEmail,
};

export default EmailService;
