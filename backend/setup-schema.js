import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

const env = process.env.NODE_ENV || 'development';

// Load .env files based on NODE_ENV (same order as config/env.ts)
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const sourceSchema = env === 'development' 
  ? 'prisma/schema.dev.prisma.backup' 
  : 'prisma/schema.prod.prisma.backup';

try {
  fs.copyFileSync(sourceSchema, 'prisma/schema.prisma');
  console.log(`Schema setup complete for ${env} environment`);
  
  // Regenerate Prisma Client
  console.log('Regenerating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (error) {
  console.error(`Failed to setup schema: ${error.message}`);
  process.exit(1);
}
