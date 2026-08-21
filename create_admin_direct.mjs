import pkg from 'pg';
import { randomUUID } from 'crypto';
import bcryptjs from 'bcryptjs';

const { Client } = pkg;

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

const adminEmail = process.env.ADMIN_EMAIL || 'admin@pelosolhosderha.com.br';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

await client.connect();

const passwordHash = await bcryptjs.hash(adminPassword, 10);

try {
  // Deletar admin anterior se existir
  await client.query(
    `DELETE FROM "User" WHERE email = $1`,
    [adminEmail]
  );

  // Criar novo admin com senha correta
  const result = await client.query(
    `INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING id, email;`,
    [randomUUID(), adminEmail, passwordHash, 'Admin Rha', 'admin']
  );

  if (result.rows.length > 0) {
    console.log('✅ Admin recriado com sucesso!');
    console.log('Email:', result.rows[0].email);
  }
} catch (error) {
  console.error('❌ Erro ao criar admin');
  process.exit(1);
} finally {
  await client.end();
}
