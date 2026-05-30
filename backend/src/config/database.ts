import { PrismaClient } from '@prisma/client';
import { config } from './env';

let prisma: PrismaClient;

const databaseUrl = process.env.DATABASE_URL || config.databaseUrl;
console.log('DB URL present:', !!databaseUrl, 'length:', databaseUrl.length);

if (config.isDevelopment) {
  // SQLite for development
  prisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log: ['query', 'info', 'warn', 'error'],
  });
} else {
  // PostgreSQL (Neon) - direct connection via Prisma engine
  prisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log: config.isHomolog ? ['warn', 'error'] : ['error'],
  });
}

export { prisma };
