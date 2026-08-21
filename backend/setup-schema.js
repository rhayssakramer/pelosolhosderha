import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const env = process.env.NODE_ENV || 'development';
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
