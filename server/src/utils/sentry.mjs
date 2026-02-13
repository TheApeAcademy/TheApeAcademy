import * as Sentry from '@sentry/node';
import { config } from '../config/index.mjs';
import { logger } from './logger.mjs';

let sentryInitialized = false;

/**
 * Initialize Sentry for error tracking
 * Only initializes if SENTRY_DSN is configured
 */
export function initializeSentry(app) {
  if (!config.SENTRY_DSN) {
    logger.warn('Sentry DSN not configured - error tracking disabled');
    sentryInitialized = false;
    return false;
  }

  try {
    Sentry.init({
      dsn: config.SENTRY_DSN,
      environment: config.NODE_ENV,
      tracesSampleRate: config.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({
          request: true,
          serverName: true,
          transaction: true,
        }),
      ],
      beforeSend(event, hint) {
        // Filter out certain errors in development
        if (config.NODE_ENV === 'development') {
          // Don't send 4xx errors in development
          if (event.exception) {
            const error = hint.originalException;
            if (error?.statusCode >= 400 && error?.statusCode < 500) {
              return null;
            }
          }
        }
        return event;
      },
    });

    // Add Sentry middleware to Express
    // IMPORTANT: Must be called early in middleware chain, BEFORE other middleware
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());

    logger.info('Sentry initialized successfully', {
      environment: config.NODE_ENV,
      sampleRate: config.NODE_ENV === 'production' ? '10%' : '100%',
    });

    sentryInitialized = true;
    return true;
  } catch (error) {
    logger.error('Failed to initialize Sentry', {
      error: error.message,
    });
    sentryInitialized = false;
    return false;
  }
}

/**
 * Sentry error handler middleware
 * Should be placed AFTER all other middleware and route handlers
 * Only returns the handler if Sentry was properly initialized
 */
export function sentryErrorHandler() {
  if (!sentryInitialized) {
    // Return a no-op middleware if Sentry wasn't initialized
    return (err, req, res, next) => {
      next(err);
    };
  }
  return Sentry.Handlers.errorHandler();
}

/**
 * Capture exception in Sentry with context
 */
export function captureException(error, context = {}) {
  if (!config.SENTRY_DSN) return;

  try {
    Sentry.captureException(error, {
      tags: {
        environment: config.NODE_ENV,
      },
      extra: context,
    });
  } catch (err) {
    logger.error('Failed to capture exception in Sentry', {
      error: err.message,
    });
  }
}

/**
 * Capture message in Sentry
 */
export function captureMessage(message, level = 'info', context = {}) {
  if (!config.SENTRY_DSN) return;

  try {
    Sentry.captureMessage(message, level);
  } catch (err) {
    logger.error('Failed to capture message in Sentry', {
      error: err.message,
    });
  }
}

/**
 * Set user context in Sentry
 * Call this when user logs in
 */
export function setSentryUser(userId, email, username = '') {
  if (!config.SENTRY_DSN) return;

  try {
    Sentry.setUser({
      id: userId,
      email,
      username,
    });
  } catch (err) {
    logger.error('Failed to set user context in Sentry', {
      error: err.message,
    });
  }
}

/**
 * Clear user context in Sentry
 * Call this on logout
 */
export function clearSentryUser() {
  if (!config.SENTRY_DSN) return;

  try {
    Sentry.setUser(null);
  } catch (err) {
    logger.error('Failed to clear user context in Sentry', {
      error: err.message,
    });
  }
}

export default {
  initializeSentry,
  sentryErrorHandler,
  captureException,
  captureMessage,
  setSentryUser,
  clearSentryUser,
};
