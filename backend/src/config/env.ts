import dotenv from 'dotenv';
import path from 'path';

const env = process.env.NODE_ENV || 'development';

// Load .env files based on NODE_ENV
// Order: .env.{NODE_ENV} -> .env (for local overrides)
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  env,
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
  apiUrl: process.env.API_URL || 'http://localhost:3000/api',
  appUrl: process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:4200',
  azureStorageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
  azureStorageContainer: process.env.AZURE_STORAGE_CONTAINER || 'uploads',
  instagramToken: process.env.INSTAGRAM_TOKEN || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  adminEmail: process.env.ADMIN_EMAIL || '',
  emailService: process.env.EMAIL_SERVICE || '',
  emailUser: process.env.EMAIL_USER || '',
  emailPassword: process.env.EMAIL_PASSWORD || '',
  isProduction: env === 'production',
  isDevelopment: env === 'development',
  isHomolog: env === 'homolog',
};

// Note: DB_PROVIDER is no longer set dynamically.
// Prisma schema now uses PostgreSQL as the provider.
// Ensure DATABASE_URL is properly set for your environment:
// - Development: PostgreSQL or SQLite connection string
// - Production: PostgreSQL connection string
