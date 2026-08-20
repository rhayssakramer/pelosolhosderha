-- Criar usuário admin com senha bcrypt (admin123)
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@pelosolhosderha.com.br',
  '$2a$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUmGEJqq',
  'Admin Rha',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
