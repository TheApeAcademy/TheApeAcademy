import { verifyToken, extractTokenFromHeader } from '../utils/jwt.mjs';
import { AuthError } from '../utils/errors.mjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Authenticate user from JWT token in Authorization header
 * Attaches user ID and role to req.userId and req.userRole if valid
 */
export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return next(new AuthError('No token provided'));
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return next(new AuthError('Invalid or expired token'));
  }

  try {
    // Fetch user to get latest role (important for admin checks)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return next(new AuthError('User not found'));
    }

    req.userId = decoded.userId;
    req.userRole = user.role || 'user'; // Default to 'user' if role not set
    next();
  } catch (error) {
    return next(new AuthError('Authentication error: ' + error.message));
  }
}

/**
 * Optional auth: sets req.userId and req.userRole if token is valid, but doesn't fail if absent
 */
export async function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, role: true },
        });

        if (user) {
          req.userId = decoded.userId;
          req.userRole = user.role || 'user';
        }
      } catch (error) {
        // Silently fail - this is optional auth
      }
    }
  }

  next();
}
