import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig, Pool } from '@neondatabase/serverless';
import { config } from './env';

let prisma: PrismaClient;

if (config.isDevelopment) {
  // SQLite for development
  prisma = new PrismaClient({
    datasources: { db: { url: config.databaseUrl } },
    log: ['query', 'info', 'warn', 'error'],
  });
} else {
  // PostgreSQL (Neon) with serverless driver (no native binary needed)
  neonConfig.useSecureWebSocket = true;
  const pool = new Pool({ connectionString: config.databaseUrl });
  const adapter = new PrismaNeon(pool);
  prisma = new PrismaClient({
    adapter,
    log: config.isHomolog ? ['warn', 'error'] : ['error'],
  });
}

export { prisma };
