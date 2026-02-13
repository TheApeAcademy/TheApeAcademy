import { ApiError } from '../utils/errors.mjs';
import { logger } from '../utils/logger.mjs';

/**
 * Central error handling middleware
 * Must be registered LAST in Express middleware chain
 */
export function errorHandler(err, req, res, next) {
  // Prepare error metadata for logging
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const logMeta = {
    statusCode,
    method: req.method,
    path: req.path,
    userId: req.userId || 'anonymous',
    ip: req.ip,
  };

  // Log with Winston
  if (statusCode >= 500) {
    logger.error(message, { ...logMeta, stack: err.stack });
  } else {
    logger.warn(message, logMeta);
  }

  const details = process.env.NODE_ENV === 'development' ? err.details : undefined;

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      ...(details && { details }),
    },
  });
}

/**
 * 404 handler middleware (for unmatched routes)
 */
export function notFoundHandler(req, res, next) {
  const err = new ApiError(`Route not found: ${req.path}`, 404);
  next(err);
}
