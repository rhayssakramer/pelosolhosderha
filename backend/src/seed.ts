import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@pelosolhosderha.com.br' },
    update: {},
    create: {
      email: 'admin@pelosolhosderha.com.br',
      password: hashedPassword,
      name: 'Rha',
      role: 'admin',
    },
  });

  console.log('✅ Seed completed. Admin user:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
