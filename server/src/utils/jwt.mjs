import jwt from 'jsonwebtoken';
import { config } from '../config/index.mjs';

/**
 * Generate JWT access token
 */
export function generateToken(userId, expiresIn = config.JWT_EXPIRY) {
  return jwt.sign({ userId }, config.JWT_SECRET, { expiresIn });
}

/**
 * Verify JWT token and extract userId
 */
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Extract token from Authorization header (Bearer scheme)
 */
export function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}
