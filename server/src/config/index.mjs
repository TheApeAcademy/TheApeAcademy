import dotenv from 'dotenv';

// Load .env early
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

export const config = {
  // Server
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5174',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-min-32-chars-required-for-production',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',

  // Flutterwave
  FLUTTERWAVE_PUBLIC_KEY: process.env.FLUTTERWAVE_PUBLIC_KEY || '',
  FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY || '',
  FLUTTERWAVE_ENCRYPTION_KEY: process.env.FLUTTERWAVE_ENCRYPTION_KEY || '',

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  ENABLE_CLOUDINARY: process.env.ENABLE_CLOUDINARY === 'true',

  // File uploads
  FILE_UPLOAD_MAX_SIZE: parseInt(process.env.FILE_UPLOAD_MAX_SIZE || '52428800', 10), // 50MB
  FILE_UPLOAD_DIR: process.env.FILE_UPLOAD_DIR || './server/uploads',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Sentry (Error Tracking)
  SENTRY_DSN: process.env.SENTRY_DSN || '',
};

// Validate critical environment variables
const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
if (process.env.NODE_ENV === 'production') {
  requiredVars.push('FLUTTERWAVE_PUBLIC_KEY', 'FLUTTERWAVE_SECRET_KEY');
}

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    if (process.env.NODE_ENV === 'production') process.exit(1);
  }
}

console.log(`✓ Environment loaded (${config.NODE_ENV})`);
