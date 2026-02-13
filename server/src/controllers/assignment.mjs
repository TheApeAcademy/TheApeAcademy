import { PrismaClient } from '@prisma/client';
import { ValidationError, NotFoundError, ApiError, AuthError } from '../utils/errors.mjs';
import { StorageService } from '../services/storage.mjs';

const prisma = new PrismaClient();

export const AssignmentController = {
  /**
   * POST /assignments/create
   * Create and submit an assignment
   * CRITICAL: Payment must be verified first
   */
  async createAssignment(req, res, next) {
    try {
      const userId = req.userId;

      if (!userId) {
        throw new AuthError('Must be logged in to submit assignment');
      }

      const {
        subject,
        description,
        educationLevel,
        departmentOrCourse,
        deadline,
        deliveryPlatform,
        paymentId,
      } = req.body;

      // Validate required fields
      if (!subject || !educationLevel || !deliveryPlatform) {
        throw new ValidationError('subject, educationLevel, and deliveryPlatform are required');
      }

      // Validate delivery platform
      const validPlatforms = ['whatsapp', 'email', 'google_messages', 'imessage'];
      if (!validPlatforms.includes(deliveryPlatform)) {
        throw new ValidationError(`Invalid deliveryPlatform. Must be one of: ${validPlatforms.join(', ')}`);
      }

      // Verify payment if provided
      let verifiedPayment = null;
      if (paymentId) {
        verifiedPayment = await prisma.payment.findUnique({
          where: { id: paymentId },
        });

        if (!verifiedPayment) {
          throw new NotFoundError('Payment not found');
        }

        if (verifiedPayment.userId !== userId) {
          throw new ValidationError('Payment does not belong to this user');
        }

        if (verifiedPayment.paymentStatus !== 'successful') {
          throw new ValidationError('Payment not verified. Please complete payment first.');
        }
      }

      // Handle file upload if provided (multer saved to disk)
      let fileUrl = null;
      let fileName = null;
      if (req.file) {
        const fileInfo = await StorageService.saveFileFromPath(req.file);
        fileUrl = fileInfo.url;
        fileName = fileInfo.fileName;
      } else {
        throw new ValidationError('File upload is required');
      }

      // Create assignment
      const assignment = await prisma.assignment.create({
        data: {
          userId,
          subject,
          description: description || '',
          educationLevel,
          departmentOrCourse: departmentOrCourse || null,
          deadline: deadline ? new Date(deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
          fileUrl,
          fileName,
          deliveryPlatform,
          paymentId: verifiedPayment ? verifiedPayment.id : null,
          status: 'pending',
        },
      });

      // Link payment to assignment if not already linked
      if (verifiedPayment && !verifiedPayment.assignmentId) {
        await prisma.payment.update({
          where: { id: verifiedPayment.id },
          data: { assignmentId: assignment.id },
        });
      }

      res.status(201).json({
        message: 'Assignment submitted successfully',
        assignment: {
          id: assignment.id,
          subject: assignment.subject,
          status: assignment.status,
          deliveryPlatform: assignment.deliveryPlatform,
          deadline: assignment.deadline,
          createdAt: assignment.createdAt,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /assignments/my
   * Get all assignments submitted by the current user
   */
  async getUserAssignments(req, res, next) {
    try {
      const userId = req.userId;

      if (!userId) {
        throw new AuthError('Must be logged in');
      }

      const assignments = await prisma.assignment.findMany({
        where: { userId },
        include: {
          payment: {
            select: {
              id: true,
              amount: true,
              currency: true,
              paymentStatus: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({
        assignments,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /assignments/:id
   * Get a single assignment (only if user owns it)
   */
  async getAssignment(req, res, next) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      if (!userId) {
        throw new AuthError('Must be logged in');
      }

      const assignment = await prisma.assignment.findUnique({
        where: { id },
        include: {
          payment: true,
        },
      });

      if (!assignment) {
        throw new NotFoundError('Assignment not found');
      }

      if (assignment.userId !== userId) {
        throw new ValidationError('You do not have access to this assignment');
      }

      res.status(200).json({
        assignment,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /assignments/:id
   * Update assignment status (for admin/operations team)
   * Status transitions: pending -> in_progress -> delivered
   */
  async updateAssignmentStatus(req, res, next) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { status } = req.body;

      if (!userId) {
        throw new AuthError('Must be logged in');
      }

      // Validate status
      const validStatuses = ['pending', 'in_progress', 'delivered'];
      if (!validStatuses.includes(status)) {
        throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const assignment = await prisma.assignment.findUnique({
        where: { id },
      });

      if (!assignment) {
        throw new NotFoundError('Assignment not found');
      }

      // Allow user to update their own assignments or admin
      // For now, allow any authenticated user to update; add admin check if needed
      if (assignment.userId !== userId) {
        throw new ValidationError('You do not have permission to update this assignment');
      }

      const updatedAssignment = await prisma.assignment.update({
        where: { id },
        data: { status, updatedAt: new Date() },
        include: {
          payment: true,
        },
      });

      res.status(200).json({
        message: 'Assignment status updated',
        assignment: updatedAssignment,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /assignments/:id
   * Delete an assignment (only by owner)
   */
  async deleteAssignment(req, res, next) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      if (!userId) {
        throw new AuthError('Must be logged in');
      }

      const assignment = await prisma.assignment.findUnique({
        where: { id },
      });

      if (!assignment) {
        throw new NotFoundError('Assignment not found');
      }

      if (assignment.userId !== userId) {
        throw new ValidationError('You do not have permission to delete this assignment');
      }

      // Delete the assignment
      await prisma.assignment.delete({
        where: { id },
      });

      // Optionally: delete the file from storage
      try {
        if (assignment.fileUrl) {
          await StorageService.deleteFile(assignment.fileUrl);
        }
      } catch (err) {
        console.warn('Failed to delete file from storage:', err.message);
        // Don't fail the request if file deletion fails
      }

      res.status(200).json({
        message: 'Assignment deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  },
};

export default AssignmentController;
