import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

export const commentRoutes = Router();

// Add comment to post (public)
commentRoutes.post('/:postId', async (req: Request, res: Response) => {
  try {
    const { name, text, avatar } = req.body;

    const post = await prisma.post.findUnique({ where: { id: req.params.postId } });
    if (!post) {
      res.status(404).json({ error: 'Post não encontrado' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        name,
        text,
        avatar,
        postId: req.params.postId,
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar comentário' });
  }
});

// Get comments for a post
commentRoutes.get('/:postId', async (req: Request, res: Response) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: req.params.postId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar comentários' });
  }
});

// Delete comment (admin)
commentRoutes.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.comment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Comentário deletado' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar comentário' });
  }
});
