import express from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middleware/auth.mjs';
import { AssignmentController } from '../controllers/assignment.mjs';
import { asyncHandler } from '../utils/asyncHandler.mjs';
import { validateSchema, schemas } from '../utils/validation.mjs';
import { config } from '../config/index.mjs';

const router = express.Router();

// Multer setup for file uploads (disk storage to avoid memory OOM)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.FILE_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${timestamp}_${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.FILE_UPLOAD_MAX_SIZE || 52428800,
  },
});

/**
 * POST /assignments/create
 * Submit a new assignment with file upload
 * Protected: requires authentication
 */
router.post('/create', authMiddleware, upload.single('file'), validateSchema(schemas.createAssignment), asyncHandler((req, res, next) =>
  AssignmentController.createAssignment(req, res, next)
));

/**
 * GET /assignments/my
 * Get all assignments submitted by the current user
 * Protected: requires authentication
 */
router.get('/my', authMiddleware, asyncHandler((req, res, next) => AssignmentController.getUserAssignments(req, res, next)));

/**
 * GET /assignments/:id
 * Get a specific assignment by ID (must own it)
 * Protected: requires authentication
 */
router.get('/:id', authMiddleware, asyncHandler((req, res, next) => AssignmentController.getAssignment(req, res, next)));

/**
 * PATCH /assignments/:id
 * Update assignment status (pending -> in_progress -> delivered)
 * Protected: requires authentication
 */
router.patch('/:id', authMiddleware, validateSchema(schemas.updateAssignmentStatus), asyncHandler((req, res, next) => AssignmentController.updateAssignmentStatus(req, res, next)));

/**
 * DELETE /assignments/:id
 * Delete an assignment (only by owner)
 * Protected: requires authentication
 */
router.delete('/:id', authMiddleware, asyncHandler((req, res, next) => AssignmentController.deleteAssignment(req, res, next)));

export default router;
