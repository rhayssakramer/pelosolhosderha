import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

export const tagRoutes = Router();

// Get all tags (public)
tagRoutes.get('/', async (_req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(tags.map((t) => ({ ...t, postCount: t._count.posts })));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tags' });
  }
});

// Create tag (admin)
tagRoutes.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, color } = req.body;
    const tag = await prisma.tag.create({ data: { name, color } });
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar tag' });
  }
});

// Update tag (admin)
tagRoutes.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, color } = req.body;
    const tag = await prisma.tag.update({ where: { id: req.params.id }, data: { name, color } });
    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar tag' });
  }
});

// Delete tag (admin)
tagRoutes.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.tag.delete({ where: { id: req.params.id } });
    res.json({ message: 'Tag deletada' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar tag' });
  }
});
