import { config } from '../src/config/env.js';
import { prisma } from '../src/config/database.js';

async function updateUserName() {
  try {
    console.log('🔄 Procurando usuário com nome "Admin Rha"...');
    
    const user = await prisma.user.findFirst({
      where: { name: 'Admin Rha' }
    });

    if (!user) {
      console.log('❌ Usuário "Admin Rha" não encontrado');
      return;
    }

    console.log(`✅ Usuário encontrado: ${user.id} - ${user.name}`);
    console.log(`📧 Email: ${user.email}`);
    
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name: 'Rha Kramer' }
    });

    console.log(`✅ Nome atualizado com sucesso!`);
    console.log(`   Nome novo: ${updated.name}`);
  } catch (error) {
    console.error('❌ Erro ao atualizar:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserName();
