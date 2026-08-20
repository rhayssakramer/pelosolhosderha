import { Pool } from 'pg';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

try {
  await pool.query('DELETE FROM "_prisma_migrations";');
  console.log('✅ Migrations table cleared successfully');
  await pool.end();
  process.exit(0);
} catch (error) {
  console.error('❌ Error clearing migrations:', error);
  await pool.end();
  process.exit(1);
}
