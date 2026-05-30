import dotenv from 'dotenv';
import path from 'path';

const env = process.env.NODE_ENV || 'development';

// Only load .env files in development
if (env === 'development') {
  dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

export const config = {
  env,
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
  isProduction: env === 'production',
  isDevelopment: env === 'development',
  isHomolog: env === 'homolog',
};

// Set DB_PROVIDER based on environment
if (config.isDevelopment) {
  process.env.DB_PROVIDER = 'sqlite';
} else {
  process.env.DB_PROVIDER = 'postgresql';
}
