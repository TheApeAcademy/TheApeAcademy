import { logger } from '../utils/logger.mjs';

/**
 * Admin Middleware
 * Checks if user has admin role
 * Must be called AFTER authMiddleware
 */
export const adminMiddleware = (req, res, next) => {
  try {
    // Check if user exists (from authMiddleware)
    if (!req.userId) {
      return res.status(401).json({
        error: 'Unauthorized: Missing authentication',
      });
    }

    // Check if user has admin role
    if (req.userRole !== 'admin') {
      logger.warn('Unauthorized admin access attempt', {
        userId: req.userId,
        requestedPath: req.path,
        userRole: req.userRole,
      });

      return res.status(403).json({
        error: 'Forbidden: Admin access required',
      });
    }

    next();
  } catch (error) {
    logger.error('Admin middleware error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default adminMiddleware;
