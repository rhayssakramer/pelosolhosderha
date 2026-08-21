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

  // Default tags
  const defaultTags = ['Arte', 'Criatividade', 'Pintura', 'Desenho', 'Filme', 'Série', 'Música'];

  for (const tagName of defaultTags) {
    await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName, color: '#6366f1' },
    });
  }

  // Create test posts
  const testPost = await prisma.post.upsert({
    where: { id: 'test-post-1' },
    update: {},
    create: {
      id: 'test-post-1',
      title: 'Bem-vindo ao Pelos Olhos de Rha',
      excerpt: 'Este é um post de teste para desenvolvimento',
      content: '<p>Este é um <strong>post de teste</strong> para você testar a funcionalidade de comentários.</p>',
      published: true,
      authorId: user.id,
    },
  });

  // Create test comment
  await prisma.comment.upsert({
    where: { id: 'test-comment-1' },
    update: {},
    create: {
      id: 'test-comment-1',
      name: 'Visitante Teste',
      email: 'teste@example.com',
      text: 'Este é um comentário de teste',
      status: 'approved',
      postId: testPost.id,
    },
  });

  console.log('✅ Seed completed. Admin users:', user.email, user2.email);
  console.log('✅ Default tags created:', defaultTags.join(', '));
  console.log('✅ Test post created:', testPost.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
