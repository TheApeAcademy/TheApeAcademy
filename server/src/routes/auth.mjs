import express from 'express';
import { authMiddleware } from '../middleware/auth.mjs';
import { AuthController } from '../controllers/auth.mjs';
import { asyncHandler } from '../utils/asyncHandler.mjs';
import { validateSchema, schemas } from '../utils/validation.mjs';

const router = express.Router();

/**
 * POST /auth/signup
 * Create a new user account
 */
router.post('/signup', validateSchema(schemas.signup), asyncHandler((req, res, next) => AuthController.signup(req, res, next)));

/**
 * POST /auth/login
 * Log in a user and return JWT token
 */
router.post('/login', validateSchema(schemas.login), asyncHandler((req, res, next) => AuthController.login(req, res, next)));

/**
 * GET /auth/me
 * Get current authenticated user
 */
router.get('/me', authMiddleware, asyncHandler((req, res, next) => AuthController.getMe(req, res, next)));

export default router;
