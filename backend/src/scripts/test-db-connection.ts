/**
 * Script para testar conexão com Neon
 * 
 * Uso: npx ts-node src/scripts/test-db-connection.ts
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

const env = process.env.NODE_ENV || 'production';
const envPath = path.resolve(process.cwd(), `.env.${env}`);

console.log(`📁 Carregando variáveis de: ${envPath}`);
dotenv.config({ path: envPath });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL não está configurada!');
  process.exit(1);
}

console.log('\n🔍 Testando conexão com banco de dados...');
console.log(`🔗 URL: ${connectionString.replace(/:[^@]*@/, ':****@')}`);

async function testConnection() {
  const prisma = new PrismaClient();

  try {
    console.log('\n⏳ Conectando...');
    
    // Testar conexão
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conectado com sucesso!');

    // Contar posts
    console.log('\n⏳ Contando posts...');
    const postCount = await prisma.post.count();
    console.log(`📊 Total de posts: ${postCount}`);

    // Posts com URLs relativas
    console.log('\n⏳ Procurando posts com URLs relativas...');
    const relativeUrlCount = await prisma.post.count({
      where: {
        content: {
          contains: 'src="/uploads/'
        }
      }
    });
    console.log(`📊 Posts com URLs relativas: ${relativeUrlCount}`);

    if (relativeUrlCount > 0) {
      console.log('\n✅ Pronto para migração!');
      console.log('Execute: npm run migrate:urls:prod');
    } else {
      console.log('\n✅ Nenhum post com URLs relativas para migrar!');
    }

  } catch (err: any) {
    console.error('\n❌ Erro ao conectar:');
    console.error(`📌 Mensagem: ${err.message}`);
    
    if (err.message.includes('ENOTFOUND')) {
      console.error('\n💡 Possível causa: Host não encontrado');
      console.error('   Verifique se a URL está correta');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Possível causa: Conexão recusada');
      console.error('   Pode ser firewall ou o servidor não está respondendo');
    } else if (err.message.includes('SSL') || err.message.includes('SSL/TLS')) {
      console.error('\n💡 Possível causa: Problema de SSL');
      console.error('   Tente remover ?channel_binding=require da URL');
    } else if (err.message.includes('certificate')) {
      console.error('\n💡 Possível causa: Problema de certificado SSL');
      console.error('   Pode ser necessário ajustar configuração de SSL');
    }
    
    console.error('\n🔧 Soluções:');
    console.error('1. Verifique a DATABASE_URL no .env.production');
    console.error('2. Tente remover ?channel_binding=require da URL');
    console.error('3. Teste diretamente no console.neon.tech');
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

testConnection();
