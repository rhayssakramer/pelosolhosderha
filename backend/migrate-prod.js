import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

const env = process.env.NODE_ENV || 'production';

// Load .env.production first
const envFile = path.resolve(process.cwd(), `.env.${env}`);
const envContent = fs.readFileSync(envFile, 'utf-8');
const parsed = dotenv.parse(envContent);

// Set all variables to process.env
Object.keys(parsed).forEach(key => {
  process.env[key] = parsed[key];
});

console.log(`Loaded ${env} environment variables`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 50)}...`);

// Now run Prisma migrate deploy
try {
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: env }
  });
} catch (error) {
  console.error('Migration failed');
  process.exit(1);
}
