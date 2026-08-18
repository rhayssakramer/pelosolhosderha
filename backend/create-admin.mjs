import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Verificar se o admin já existe
    let user = await prisma.user.findUnique({
      where: { email: 'admin@pelosolhosderha.com.br' }
    });

    if (user) {
      console.log('✅ Admin já existe:', user.email);
      console.log('ID:', user.id);
      return;
    }

    // Criar novo admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    user = await prisma.user.create({
      data: {
        email: 'admin@pelosolhosderha.com.br',
        password: hashedPassword,
        name: 'Admin Rha',
        role: 'admin'
      }
    });

    console.log('✅ Admin criado com sucesso!');
    console.log('Email:', user.email);
    console.log('Senha: admin123');
    console.log('Acesse: http://localhost:4200/login');
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
