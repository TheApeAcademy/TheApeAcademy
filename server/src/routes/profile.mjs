import express from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middleware/auth.mjs';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/index.mjs';
import { StorageService } from '../services/storage.mjs';
import { logger } from '../utils/logger.mjs';

const prisma = new PrismaClient();
const router = express.Router();

// Multer disk storage for avatars
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.FILE_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_.]/g, '_');
    cb(null, `${Date.now()}_${safeName}`);
  },
});

const upload = multer({ storage, limits: { fileSize: config.FILE_UPLOAD_MAX_SIZE } });

/**
 * POST /profile/avatar
 * Upload or update user's profile picture
 */
router.post('/avatar', authMiddleware, upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fileInfo = await StorageService.saveFileFromPath(req.file);

    // Update user's avatarUrl
    const updated = await prisma.user.update({ where: { id: req.userId }, data: { avatarUrl: fileInfo.url } });

    logger.info('User avatar updated', { userId: req.userId, avatarUrl: fileInfo.url });

    res.status(200).json({ message: 'Avatar uploaded', avatarUrl: fileInfo.url, user: { id: updated.id, avatarUrl: updated.avatarUrl } });
  } catch (err) {
    next(err);
  }
});

export default router;
