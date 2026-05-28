import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV || 'development';

// Load environment-specific .env file
dotenv.config({ path: path.resolve(__dirname, `../../.env.${env}`) });

// Fallback to .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

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
