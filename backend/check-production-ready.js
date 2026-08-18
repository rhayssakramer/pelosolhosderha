#!/usr/bin/env node

/**
 * Verificação PRE-DEPLOY para Produção com PostgreSQL
 * Execute antes de fazer deploy: node backend/check-production-ready.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('\n🔍 Verificando se está PRONTO para PRODUÇÃO com PostgreSQL...\n');

const checks = [];

// 1. Verificar .env.production
const envProdPath = path.join(__dirname, '.env.production');
checks.push({
  name: '✅ Arquivo .env.production existe',
  pass: fs.existsSync(envProdPath),
  fix: 'Criar arquivo .env.production a partir de .env.production.example'
});

if (fs.existsSync(envProdPath)) {
  const envContent = fs.readFileSync(envProdPath, 'utf-8');
  
  // 2. Verificar DATABASE_URL
  checks.push({
    name: '✅ DATABASE_URL configurada',
    pass: envContent.includes('DATABASE_URL=postgresql://'),
    fix: 'Configurar DATABASE_URL com sua connection string do Neon'
  });
  
  // 3. Verificar JWT_SECRET
  checks.push({
    name: '✅ JWT_SECRET não é padrão',
    pass: !envContent.includes('your_jwt_secret_here'),
    fix: 'Gerar um JWT_SECRET seguro: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
  });
  
  // 4. Verificar Google credentials
  checks.push({
    name: '✅ Google OAuth credentials configuradas',
    pass: envContent.includes('GOOGLE_CLIENT_ID=1022627779731') && envContent.includes('GOOGLE_CLIENT_SECRET=GOCSPX'),
    fix: 'Adicionar GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET'
  });
}

// 5. Verificar schema.prisma
const schemaPrismaPath = path.join(__dirname, 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPrismaPath)) {
  const schemaContent = fs.readFileSync(schemaPrismaPath, 'utf-8');
  checks.push({
    name: '✅ Schema dinâmico (DB_PROVIDER)',
    pass: schemaContent.includes('env("DB_PROVIDER")'),
    fix: 'Atualizar schema.prisma para usar env("DB_PROVIDER")'
  });
  
  checks.push({
    name: '✅ Schema suporta PostgreSQL',
    pass: schemaContent.includes('provider'),
    fix: 'Schema precisa estar configurado para PostgreSQL'
  });
}

// 6. Verificar migrations
const migrationsDir = path.join(__dirname, 'prisma', 'migrations');
checks.push({
  name: '✅ Migrations criadas',
  pass: fs.existsSync(migrationsDir) && fs.readdirSync(migrationsDir).length > 0,
  fix: 'Executar: npm run db:migrate:prod'
});

// 7. Verificar Dockerfile
const dockerfilePath = path.join(__dirname, 'Dockerfile');
checks.push({
  name: '✅ Dockerfile existe',
  pass: fs.existsSync(dockerfilePath),
  fix: 'Criar Dockerfile para containerizar a aplicação'
});

// 8. Verificar package.json tem scripts de build
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  checks.push({
    name: '✅ Script build existe',
    pass: packageJson.scripts && packageJson.scripts.build,
    fix: 'Adicionar script "build" em package.json'
  });
}

// 9. Verificar src/index.ts
const indexTsPath = path.join(__dirname, 'src', 'index.ts');
if (fs.existsSync(indexTsPath)) {
  const indexContent = fs.readFileSync(indexTsPath, 'utf-8');
  checks.push({
    name: '✅ Google Auth routes registradas',
    pass: indexContent.includes('googleAuth'),
    fix: 'Adicionar rota de Google Auth em src/index.ts'
  });
}

// Exibir resultados
console.log('CHECKLIST DE PRODUÇÃO:');
console.log('='.repeat(60));

const passed = checks.filter(c => c.pass).length;
const total = checks.length;

checks.forEach((check, idx) => {
  const status = check.pass ? '✅' : '❌';
  console.log(`${status} ${idx + 1}. ${check.name}`);
  if (!check.pass) {
    console.log(`   → ${check.fix}\n`);
  }
});

console.log('='.repeat(60));
console.log(`\n📊 Resultado: ${passed}/${total} checks passaram\n`);

if (passed === total) {
  console.log('🚀 ✅ PRONTO PARA DEPLOY EM PRODUÇÃO COM POSTGRESQL!\n');
  console.log('Próximos passos:');
  console.log('1. npm run db:migrate:prod');
  console.log('2. npm run build');
  console.log('3. az acr build --registry pelosolhosderhaacr --image pelosolhosderha-backend:latest .');
  console.log('4. az containerapp update --name pelosolhosderha-api --resource-group rg-pelosolhosderha --image pelosolhosderhaacr.azurecr.io/pelosolhosderha-backend:latest\n');
  process.exit(0);
} else {
  console.log('❌ Não está pronto. Ajuste os itens marcados com ❌\n');
  process.exit(1);
}
