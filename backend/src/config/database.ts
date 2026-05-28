import { PrismaClient } from '@prisma/client';
import { config } from './env';

let prisma: PrismaClient;

if (config.isDevelopment) {
  // SQLite for development
  prisma = new PrismaClient({
    datasources: { db: { url: config.databaseUrl } },
    log: ['query', 'info', 'warn', 'error'],
  });
} else {
  // PostgreSQL (Neon) for homolog/production
  prisma = new PrismaClient({
    datasources: { db: { url: config.databaseUrl } },
    log: config.isHomolog ? ['warn', 'error'] : ['error'],
  });
}

export { prisma };
