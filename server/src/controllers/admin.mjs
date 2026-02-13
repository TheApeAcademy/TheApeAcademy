import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.mjs';

const prisma = new PrismaClient();

/**
 * Admin Controller
 * Dashboard and management endpoints for admins
 */
export const AdminController = {
  /**
   * GET /admin/stats
   * Get platform statistics
   */
  async getStats(req, res, next) {
    try {
      const [totalUsers, totalAssignments, completedAssignments, successfulPayments, revenueData] =
        await Promise.all([
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
        totalUsers,
        totalAssignments,
        completedAssignments,
        completionRate: totalAssignments > 0 ? ((completedAssignments / totalAssignments) * 100).toFixed(2) : 0,
        successfulPayments,
        totalRevenue: revenueData._sum.amount || 0,
        avgAssignmentValue: successfulPayments > 0 ? (revenueData._sum.amount / successfulPayments).toFixed(2) : 0,
      });
    } catch (error) {
      logger.error('Error fetching admin stats', { error: error.message });
      next(error);
    }
  },

  /**
   * GET /admin/assignments
   * Get all assignments with pagination and filtering
   */
  async getAssignments(req, res, next) {
    try {
      const { status, limit = '20', offset = '0', sort = 'createdAt' } = req.query;
      const take = parseInt(limit, 10);
      const skip = parseInt(offset, 10);

      const where = status ? { status } : {};

      const [assignments, total] = await Promise.all([
        prisma.assignment.findMany({
          where,
          include: { user: true, payment: true },
          take,
          skip,
          orderBy: { [sort]: 'desc' },
        }),
        prisma.assignment.count({ where }),
      ]);

      res.status(200).json({
        data: assignments.map((a) => ({
          id: a.id,
          subject: a.subject,
          status: a.status,
          userName: a.user.fullName,
          userEmail: a.user.email,
          deliveryPlatform: a.deliveryPlatform,
          paymentStatus: a.payment?.paymentStatus || 'unpaid',
          createdAt: a.createdAt,
          deadline: a.deadline,
        })),
        total,
        limit: take,
        offset: skip,
        hasMore: skip + take < total,
      });
    } catch (error) {
      logger.error('Error fetching assignments', { error: error.message });
      next(error);
    }
  },

  /**
   * PATCH /admin/assignments/:id/status
   * Update assignment status
   */
  async updateAssignmentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ['pending', 'in_progress', 'delivered'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }

      const assignment = await prisma.assignment.update({
        where: { id },
        data: { status },
        include: { user: true },
      });

      logger.info('Assignment status updated', {
        assignmentId: id,
        oldStatus: assignment.status,
        newStatus: status,
        userId: assignment.userId,
      });

      res.status(200).json({
        message: `Assignment status updated to ${status}`,
        assignment,
      });
    } catch (error) {
      logger.error('Error updating assignment status', { error: error.message });
      next(error);
    }
  },

  /**
   * GET /admin/payments
   * Get all payments with filtering
   */
  async getPayments(req, res, next) {
    try {
      const { status, limit = '20', offset = '0' } = req.query;
      const take = parseInt(limit, 10);
      const skip = parseInt(offset, 10);

      const where = status ? { paymentStatus: status } : {};

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          include: { user: true },
          take,
          skip,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.payment.count({ where }),
      ]);

      res.status(200).json({
        data: payments.map((p) => ({
          id: p.id,
          amount: p.amount,
          currency: p.currency,
          paymentStatus: p.paymentStatus,
          userName: p.user.fullName,
          userEmail: p.user.email,
          transactionRef: p.transactionReference,
          flutterwaveId: p.flutterwaveTransactionId,
          createdAt: p.createdAt,
        })),
        total,
        limit: take,
        offset: skip,
        hasMore: skip + take < total,
      });
    } catch (error) {
      logger.error('Error fetching payments', { error: error.message });
      next(error);
    }
  },

  /**
   * GET /admin/users
   * Get all users with filtering
   */
  async getUsers(req, res, next) {
    try {
      const { limit = '20', offset = '0', role } = req.query;
      const take = parseInt(limit, 10);
      const skip = parseInt(offset, 10);

      const where = role ? { role } : {};

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
            educationLevel: true,
            createdAt: true,
          },
          take,
          skip,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      res.status(200).json({
        data: users,
        total,
        limit: take,
        offset: skip,
        hasMore: skip + take < total,
      });
    } catch (error) {
      logger.error('Error fetching users', { error: error.message });
      next(error);
    }
  },

  /**
   * PATCH /admin/users/:id/role
   * Change user role (user → admin or admin → user)
   */
  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({
          error: 'Invalid role. Must be "user" or "admin"',
        });
      }

      // Prevent removing last admin
      if (role === 'user') {
        const adminCount = await prisma.user.count({ where: { role: 'admin' } });
        if (adminCount === 1) {
          return res.status(400).json({
            error: 'Cannot remove the last admin. Assign another admin first.',
          });
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      logger.info('User role updated', {
        userId: id,
        newRole: role,
        updatedBy: req.userId,
      });

      res.status(200).json({
        message: `User role updated to ${role}`,
        user,
      });
    } catch (error) {
      logger.error('Error updating user role', { error: error.message });
      next(error);
    }
  },
};

export default AdminController;
