import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

export const tagRoutes = Router();

// Get all tags (public)
tagRoutes.get('/', async (_req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { order: 'asc' },
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
    const maxOrder = await prisma.tag.aggregate({ _max: { order: true } });
    const order = (maxOrder._max.order ?? -1) + 1;
    const tag = await prisma.tag.create({ data: { name, color, order } });
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar tag' });
  }
});

// Reorder tags (admin)
tagRoutes.put('/reorder', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { orderedIds } = req.body as { orderedIds: string[] };
    if (!orderedIds || !Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({ error: 'orderedIds é obrigatório' });
    }
    // Get existing tags to validate IDs
    const existingTags = await prisma.tag.findMany({ select: { id: true } });
    const existingIds = new Set(existingTags.map(t => t.id));
    const validIds = orderedIds.filter(id => existingIds.has(id));

    for (let i = 0; i < validIds.length; i++) {
      await prisma.tag.update({ where: { id: validIds[i] }, data: { order: i } });
    }
    res.json({ message: 'Ordem atualizada' });
  } catch (error: any) {
    console.error('Erro ao reordenar tags:', error?.message || error);
    res.status(500).json({ error: 'Erro ao reordenar tags', details: error?.message });
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
