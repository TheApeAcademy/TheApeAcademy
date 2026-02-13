import express from 'express';
import { authMiddleware } from '../middleware/auth.mjs';
import adminMiddleware from '../middleware/admin.mjs';
import { AdminController } from '../controllers/admin.mjs';
import { asyncHandler } from '../utils/asyncHandler.mjs';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authMiddleware, adminMiddleware);

/**
 * GET /admin/stats
 * Get platform statistics
 * Admin only
 */
router.get(
  '/stats',
  asyncHandler((req, res, next) => AdminController.getStats(req, res, next))
);

/**
 * GET /admin/assignments
 * Get all assignments with pagination
 * Admin only
 * Query params: status, limit, offset, sort
 */
router.get(
  '/assignments',
  asyncHandler((req, res, next) => AdminController.getAssignments(req, res, next))
);

/**
 * PATCH /admin/assignments/:id/status
 * Update assignment status
 * Admin only
 * Body: { status: "pending" | "in_progress" | "delivered" }
 */
router.patch(
  '/assignments/:id/status',
  asyncHandler((req, res, next) => AdminController.updateAssignmentStatus(req, res, next))
);

/**
 * GET /admin/payments
 * Get all payments with filtering
 * Admin only
 * Query params: status, limit, offset
 */
router.get(
  '/payments',
  asyncHandler((req, res, next) => AdminController.getPayments(req, res, next))
);

/**
 * GET /admin/users
 * Get all users with pagination
 * Admin only
 * Query params: role, limit, offset
 */
router.get(
  '/users',
  asyncHandler((req, res, next) => AdminController.getUsers(req, res, next))
);

/**
 * PATCH /admin/users/:id/role
 * Change user role
 * Admin only
 * Body: { role: "user" | "admin" }
 */
router.patch(
  '/users/:id/role',
  asyncHandler((req, res, next) => AdminController.updateUserRole(req, res, next))
);

export default router;
