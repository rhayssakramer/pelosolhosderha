import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import { normalizeImageUrlsInHtml, normalizeImageUrl } from '../utils/urlNormalizer.js';

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
      },
    });

    console.log(`[POST CREATE] Post criado com sucesso. ID: ${post.id}`);
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

    // Remove existing tags
    await prisma.postTag.deleteMany({ where: { postId: req.params.id as string } });

    // Remove existing photos if new ones provided
    if (photos) {
      await prisma.photo.deleteMany({ where: { postId: req.params.id as string } });
    }

    const post = await prisma.post.update({
      where: { id: req.params.id as string },
      data: {
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
      },
      include: {
        tags: { include: { tag: true } },
        photos: true,
      },
    });

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
