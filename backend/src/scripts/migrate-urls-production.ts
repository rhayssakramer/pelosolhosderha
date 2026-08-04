/**
 * Script para migrar URLs de imagens em posts de /uploads/ para absolutas
 * 
 * Uso:
 * npx ts-node src/scripts/migrate-urls-production.ts [ambiente]
 * 
 * Exemplos:
 * - npx ts-node src/scripts/migrate-urls-production.ts development
 * - npx ts-node src/scripts/migrate-urls-production.ts production
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

const env = process.argv[2] || process.env.NODE_ENV || 'development';

// Carregar .env específico do ambiente
const envPath = path.resolve(process.cwd(), `.env.${env}`);
console.log(`📁 Carregando variáveis de: ${envPath}`);
dotenv.config({ path: envPath });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

// Mapear URLs base por ambiente
const urlMap: Record<string, string> = {
  development: 'http://localhost:3000',
  production: 'https://pelosolhosderha-api.bluesea-ecfbf889.brazilsouth.azurecontainerapps.io',
  homolog: process.env.BACKEND_URL || 'https://homolog-api.azurecontainerapps.io',
};

const getBackendUrl = (): string => {
  // Usar BACKEND_URL se configurado
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL;
  }
  
  // Usar URL mapeada por ambiente
  const url = urlMap[env];
  if (!url) {
    throw new Error(`❌ Ambiente desconhecido: ${env}`);
  }
  
  return url;
};

async function migrateUrls() {
  const backendUrl = getBackendUrl();
  
  console.log(`\n🚀 Iniciando migração de URLs`);
  console.log(`📍 Ambiente: ${env}`);
  console.log(`🔗 URL base: ${backendUrl}`);
  console.log(`💾 Database: ${process.env.DATABASE_URL ? '✅ Configurado' : '❌ Não configurado'}`);
  
  if (!process.env.DATABASE_URL) {
    throw new Error('❌ DATABASE_URL não está configurada!');
  }
  
  console.log(`\n🔍 Procurando posts com URLs relativas...`);
  
  // 1. Buscar posts com URLs relativas
  const postsWithRelativeUrls = await prisma.post.findMany({
    where: {
      content: {
        contains: 'src="/uploads/'
      }
    },
    select: {
      id: true,
      title: true,
      content: true
    }
  });
  
  console.log(`📊 Encontrados ${postsWithRelativeUrls.length} posts com URLs relativas`);
  
  if (postsWithRelativeUrls.length === 0) {
    console.log('✅ Nenhum post para migrar!');
    await prisma.$disconnect();
    process.exit(0);
  }
  
  // 2. Mostrar exemplos
  console.log(`\n📝 Exemplos de mudanças:`);
  postsWithRelativeUrls.slice(0, 2).forEach((post) => {
    const antes = post.content.match(/src="\/uploads\/[^"]+"/)?.[0] || 'N/A';
    const depois = antes.replace('src="/uploads/', `src="${backendUrl}/uploads/`);
    console.log(`  Post: ${post.title}`);
    console.log(`    ❌ Antes: ${antes}`);
    console.log(`    ✅ Depois: ${depois}`);
  });
  
  // 3. Executar migração
  console.log(`\n⏳ Executando migração...`);
  
  const result = await prisma.$executeRawUnsafe(`
    UPDATE "Post"
    SET content = REPLACE(
      content,
      'src="/uploads/',
      'src="${backendUrl}/uploads/'
    )
    WHERE content LIKE '%src="/uploads/%'
  `);
  
  console.log(`✅ ${result} posts atualizados!`);
  
  // 4. Verificação
  console.log(`\n🔍 Verificando resultado...`);
  
  const postsAfterMigration = await prisma.post.findMany({
    where: {
      id: {
        in: postsWithRelativeUrls.map(p => p.id)
      }
    },
    select: {
      id: true,
      title: true,
      content: true
    }
  });
  
  let successCount = 0;
  let failCount = 0;
  
  postsAfterMigration.forEach((post) => {
    const hasNewUrls = post.content.includes(`src="${backendUrl}/uploads/`);
    const hasOldUrls = post.content.includes('src="/uploads/');
    
    if (hasNewUrls && !hasOldUrls) {
      successCount++;
    } else {
      failCount++;
      console.log(`  ⚠️ Post ${post.id} (${post.title}): Possível problema`);
    }
  });
  
  console.log(`\n📈 Resultado:`);
  console.log(`  ✅ Sucesso: ${successCount} posts`);
  console.log(`  ❌ Problemas: ${failCount} posts`);
  
  if (failCount === 0) {
    console.log(`\n🎉 Migração completa com sucesso!`);
  } else {
    console.log(`\n⚠️ Verifique ${failCount} posts que podem ter problemas`);
  }
  
  // 5. Estatísticas finais
  console.log(`\n📊 Estatísticas:`);
  
  const totalPosts = await prisma.post.count();
  const postsWithAbsoluteUrls = await prisma.post.count({
    where: {
      content: {
        contains: `src="${backendUrl}/uploads/`
      }
    }
  });
  
  console.log(`  Total de posts: ${totalPosts}`);
  console.log(`  Posts com URLs absolutas: ${postsWithAbsoluteUrls}`);
  console.log(`  Posts ainda com URLs relativas: ${await prisma.post.count({
    where: {
      content: {
        contains: 'src="/uploads/'
      }
    }
  })}`);
  
  await prisma.$disconnect();
  process.exit(0);
}

// Executar com tratamento de erro
migrateUrls().catch((err) => {
  console.error(`\n❌ Erro durante migração:`);
  console.error(err.message);
  console.error(err.code || '');
  prisma.$disconnect();
  process.exit(1);
});
