import pkg from 'pg';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

const { Client } = pkg;

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

if (!process.env.ADMIN_PASSWORD) {
  console.error('❌ ADMIN_PASSWORD não configurada');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

await client.connect();

// Hash da senha fornecida nas variáveis de ambiente
const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

try {
  const result = await client.query(
    `INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     ON CONFLICT (email) DO NOTHING
     RETURNING id, email;`,
    [randomUUID(), 'admin@pelosolhosderha.com.br', passwordHash, 'Admin Rha', 'admin']
  );

  if (result.rows.length > 0) {
    console.log('✅ Admin criado com sucesso!');
    console.log('Email:', result.rows[0].email);
  } else {
    console.log('✅ Admin já existe!');
  }
} catch (error) {
  console.error('❌ Erro ao criar admin');
  process.exit(1);
} finally {
  await client.end();
}
