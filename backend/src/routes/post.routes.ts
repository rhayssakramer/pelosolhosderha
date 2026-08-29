import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import { normalizeImageUrlsInHtml, normalizeImageUrl } from '../utils/urlNormalizer.js';
import { sendNotificationEmail, getNewPostNotificationEmail } from '../config/email.js';
import { config } from '../config/env.js';

export const postRoutes = Router();

// Get all published posts (public)
postRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10', tag } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { published: true };
    if (tag) {
      where.tags = { some: { tag: { name: tag as string } } };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: {
          tags: { include: { tag: true } },
          photos: { orderBy: { order: 'asc' } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    const formattedPosts = posts.map((post: any) => ({
      ...post,
      content: normalizeImageUrlsInHtml(post.content),
      coverImage: normalizeImageUrl(post.coverImage),
      tags: post.tags.map((pt: any) => pt.tag.name),
      commentCount: post._count.comments,
    }));

    res.json({ posts: formattedPosts, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar posts' });
  }
});

// Get single post (public)
postRoutes.get('/:id', async (req: Request, res: Response) => {
  try {
    const postId = req.params.id as string;
    console.log(`[POST GET] Buscando post com ID: ${postId}`);
    
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        tags: { include: { tag: true } },
        photos: { orderBy: { order: 'asc' } },
        comments: { 
          where: { status: { not: 'removed' } },
          orderBy: { createdAt: 'desc' } 
        },
        author: { select: { name: true } },
      },
    });

    if (!post) {
      console.log(`[POST GET] Post ${postId} não encontrado no banco de dados`);
      res.status(404).json({ error: 'Post não encontrado' });
      return;
    }

    if (!post.published) {
      console.log(`[POST GET] Post ${postId} encontrado mas não publicado`);
      res.status(404).json({ error: 'Post não encontrado' });
      return;
    }

    console.log(`[POST GET] Post ${postId} encontrado e publicado`);
    res.json({
      ...post,
      content: normalizeImageUrlsInHtml(post.content),
      coverImage: normalizeImageUrl(post.coverImage),
      tags: post.tags.map((pt: any) => pt.tag.name),
      commentCount: post.comments.length,
    });
  } catch (error) {
    console.error(`[POST GET] Erro ao buscar post:`, error);
    res.status(500).json({ error: 'Erro ao buscar post' });
  }
});

// Get all posts (admin - includes drafts)
postRoutes.get('/admin/all', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        tags: { include: { tag: true } },
        _count: { select: { comments: true } },
      },
    });

    const formattedPosts = posts.map((post: any) => ({
      ...post,
      content: normalizeImageUrlsInHtml(post.content),
      coverImage: normalizeImageUrl(post.coverImage),
      tags: post.tags.map((pt: any) => pt.tag.name),
      commentCount: post._count.comments,
    }));

    res.json(formattedPosts);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar posts' });
  }
});

// Create post
postRoutes.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id, title, content, excerpt, coverImage, published, tags, photos } = req.body;

    console.log(`[POST CREATE] Criando post${id ? ` com ID fornecido: ${id}` : ' com ID gerado pelo banco'}`);
    console.log(`[POST CREATE] Título: ${title}, Publicado: ${published}`);

    const post = await prisma.post.create({
      data: {
        ...(id && { id }), // Use provided ID from frontend if available
        title,
        content,
        excerpt,
        coverImage,
        published: published || false,
        publishedAt: (published || false) ? new Date() : null,
        authorId: req.userId!,
        tags: {
          create: tags?.map((tagName: string) => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName },
              },
            },
          })) || [],
        },
        photos: {
          create: photos?.map((photo: { url: string; caption?: string }, index: number) => ({
            url: photo.url,
            caption: photo.caption,
            order: index,
          })) || [],
        },
      },
      include: {
        tags: { include: { tag: true } },
        photos: true,
        author: { select: { name: true } },
      },
    });

    console.log(`[POST CREATE] Post criado com sucesso. ID: ${post.id}`);

    // Send newsletter notifications if post is published
    if (published) {
      console.log(`[POST CREATE] Post is published, sending newsletter notifications...`);
      const subscribers = await prisma.newsletter.findMany({ where: { status: 'active' } });
      
      if (subscribers.length > 0) {
        const postUrl = `${config.appUrl}/blog/${post.id}`;
        const emailHtml = getNewPostNotificationEmail(post.title, post.excerpt, postUrl, post.author.name);
        
        // Send emails asynchronously without blocking the response
        subscribers.forEach((subscriber) => {
          sendNotificationEmail(subscriber.email, `✨ Novo post: ${post.title}`, emailHtml)
            .then(() => console.log(`[POST CREATE] Newsletter email sent to ${subscriber.email}`))
            .catch((error) => console.error(`[POST CREATE] Failed to send newsletter email to ${subscriber.email}:`, error));
        });
      }
    }

    res.status(201).json(post);
  } catch (error) {
    console.error(`[POST CREATE] Erro ao criar post:`, error);
    res.status(500).json({ error: 'Erro ao criar post' });
  }
});

// Update post
postRoutes.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, excerpt, coverImage, published, tags, photos } = req.body;

    // Get current post to check if it's being published for the first time
    const currentPost = await prisma.post.findUnique({
      where: { id: req.params.id as string },
      select: { published: true, publishedAt: true, author: { select: { name: true } } },
    });

    // Remove existing tags
    await prisma.postTag.deleteMany({ where: { postId: req.params.id as string } });

    // Remove existing photos if new ones provided
    if (photos) {
      await prisma.photo.deleteMany({ where: { postId: req.params.id as string } });
    }

    // Se publicando pela primeira vez, definir publishedAt
    const updateData: any = {
      title,
      content,
      excerpt,
      coverImage,
      published,
      tags: {
        create: tags?.map((tagName: string) => ({
          tag: {
            connectOrCreate: {
              where: { name: tagName },
              create: { name: tagName },
            },
          },
        })) || [],
      },
      ...(photos && {
        photos: {
          create: (photos as { url: string; caption?: string }[]).map((photo, index: number) => ({
            url: photo.url,
            caption: photo.caption,
            order: index,
          })),
        },
      }),
    };

    // Se está sendo publicado e ainda não tem publishedAt, preencher com data/hora atual
    if (published === true && !currentPost?.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const post = await prisma.post.update({
      where: { id: req.params.id as string },
      data: updateData,
      include: {
        tags: { include: { tag: true } },
        photos: true,
        author: { select: { name: true } },
      },
    });

    // Send newsletter notifications if post was just published
    if (published === true && !currentPost?.published) {
      console.log(`[POST UPDATE] Post is being published for the first time, sending newsletter notifications...`);
      const subscribers = await prisma.newsletter.findMany({ where: { status: 'active' } });
      
      if (subscribers.length > 0) {
        const postUrl = `${config.appUrl}/blog/${post.id}`;
        const emailHtml = getNewPostNotificationEmail(post.title, post.excerpt, postUrl, post.author.name);
        
        // Send emails asynchronously without blocking the response
        subscribers.forEach((subscriber) => {
          sendNotificationEmail(subscriber.email, `✨ Novo post: ${post.title}`, emailHtml)
            .then(() => console.log(`[POST UPDATE] Newsletter email sent to ${subscriber.email}`))
            .catch((error) => console.error(`[POST UPDATE] Failed to send newsletter email to ${subscriber.email}:`, error));
        });
      }
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar post' });
  }
});

// Delete post
postRoutes.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.post.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Post deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar post' });
  }
});
