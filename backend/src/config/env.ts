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
  apiUrl: process.env.API_URL || 'http://localhost:3000/api',
  azureStorageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
  azureStorageContainer: process.env.AZURE_STORAGE_CONTAINER || 'uploads',
  instagramToken: process.env.INSTAGRAM_TOKEN || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
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
