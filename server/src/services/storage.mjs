import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.mjs';
import { ApiError, ValidationError } from '../utils/errors.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Allowed MIME types
const ALLOWED_MIME_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/webp'];

/**
 * Local file storage service (abstracted for future Cloudinary integration)
 */
export const StorageService = {
  /**
   * Save an uploaded file locally
   * @param {object} file – Express multer file object
   * @returns {object} File info {url, path, fileName}
   */
  async saveFile(file) {
    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new ValidationError('Invalid file type. Allowed: PDF, DOCX, JPEG, PNG, WebP');
    }

    // Validate file size
    if (file.size > config.FILE_UPLOAD_MAX_SIZE) {
      throw new ValidationError(`File size exceeds limit of ${config.FILE_UPLOAD_MAX_SIZE / (1024 * 1024)}MB`);
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = config.FILE_UPLOAD_DIR;
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Return file info
    return {
      fileName: file.originalname,
      storageName: fileName,
      url: `/uploads/${fileName}`, // Relative URL served by Express static middleware
      size: file.size,
      mimeType: file.mimetype,
    };
  },

  /**
   * Save an already-saved multer disk file (by path)
   * @param {object} file – multer file object with `path`, `originalname`, `mimetype`, `size`
   */
  async saveFileFromPath(file) {
    const uploadsDir = config.FILE_UPLOAD_DIR;

    if (!file || !file.path) {
      throw new ValidationError('Invalid file object');
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      // remove uploaded file
      try { fs.unlinkSync(file.path); } catch {}
      throw new ValidationError('Invalid file type. Allowed: PDF, DOCX, JPEG, PNG, WebP');
    }

    // Validate file size
    const stats = fs.statSync(file.path);
    const size = stats.size;
    if (size > config.FILE_UPLOAD_MAX_SIZE) {
      try { fs.unlinkSync(file.path); } catch {}
      throw new ValidationError(`File size exceeds limit of ${config.FILE_UPLOAD_MAX_SIZE / (1024 * 1024)}MB`);
    }

    // Return file info
    const storageName = path.basename(file.path);
    return {
      fileName: file.originalname,
      storageName,
      url: `/uploads/${storageName}`,
      size,
      mimeType: file.mimetype,
    };
  },

  /**
   * Delete a file from storage
   */
  async deleteFile(fileName) {
    const filePath = path.join(config.FILE_UPLOAD_DIR, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  },

  /**
   * Placeholder for Cloudinary integration
   * Switch this when ENABLE_CLOUDINARY is true
   */
  async saveFileToCloudinary(file) {
    // TODO: Implement Cloudinary upload when ENABLE_CLOUDINARY=true
    throw new ApiError('Cloudinary not yet configured', 501);
  },
};

export default StorageService;
