import { Router, Response } from 'express';
import { prisma } from '../config/database.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';

export const statsRoutes = Router();

// Get dashboard stats (admin)
statsRoutes.get('/', authMiddleware, async (_req: AuthRequest, res: Response) => {
  try {
    const [totalPosts, publishedPosts, totalComments, totalTags] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.comment.count(),
      prisma.tag.count(),
    ]);

    // Recent comments
    const recentComments = await prisma.comment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { post: { select: { title: true } } },
    });

    // Posts per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentPosts = await prisma.post.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    });

    res.json({
      totalPosts,
      publishedPosts,
      draftPosts: totalPosts - publishedPosts,
      totalComments,
      totalTags,
      recentComments,
      recentPosts,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});
