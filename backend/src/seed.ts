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

  const user2 = await prisma.user.upsert({
    where: { email: 'rhakramer@gmail.com' },
    update: {},
    create: {
      email: 'rhakramer@gmail.com',
      password: hashedPassword,
      name: 'Rha Kramer',
      role: 'admin',
    },
  });

  console.log('✅ Seed completed. Admin users:', user.email, user2.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
