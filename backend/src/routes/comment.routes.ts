import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';

export const commentRoutes = Router();

// Add comment to post or reply to comment
commentRoutes.post('/:postId', async (req: Request, res: Response) => {
  try {
    const { name, email, website, text, avatar, parentId } = req.body;
    const postId = req.params.postId as string;

    // Validar campos obrigatórios
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Nome é obrigatório' });
      return;
    }

    if (!email || !email.trim()) {
      res.status(400).json({ error: 'Email é obrigatório' });
      return;
    }
    
    if (!text || !text.trim()) {
      res.status(400).json({ error: 'Texto do comentário é obrigatório' });
      return;
    }

    // Verificar se o post existe
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      res.status(404).json({ error: 'Post não encontrado' });
      return;
    }

    // Se é uma resposta, verificar se o comentário pai existe
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });
      if (!parentComment || parentComment.postId !== postId) {
        res.status(404).json({ error: 'Comentário pai não encontrado' });
        return;
      }
    }

    // Criar comentário
    const comment = await prisma.comment.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        website: website?.trim() || null,
        text: text.trim(),
        avatar,
        postId,
        parentId: parentId || null,
        status: 'approved', // Comentários são aprovados por padrão
        isGoogle: !!avatar, // Se tem avatar, provavelmente é do Google
      },
      include: {
        replies: true,
        user: true,
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Comment creation error:', error);
    res.status(500).json({ error: 'Erro ao criar comentário' });
  }
});

// Get all comments for moderation (admin)
commentRoutes.get('/admin/all', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          select: { id: true, title: true },
        },
        user: true,
        parent: {
          select: { id: true, name: true, text: true },
        },
        replies: true,
      },
    });

    res.json(comments);
  } catch (error) {
    console.error('Get all comments error:', error);
    res.status(500).json({ error: 'Erro ao buscar comentários' });
  }
});

// Get comments for a post (hierárquico, sem limite de níveis)
commentRoutes.get('/:postId', async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId as string;

    // Buscar TODOS os comentários do post (sem limite de parentId)
    const allComments = await prisma.comment.findMany({
      where: {
        postId,
        status: { not: 'removed' }, // Não mostrar comentários removidos
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
      },
    });

    // Organizar hierarquicamente (comentários raiz + todas as replies aninhadas)
    const buildHierarchy = (comments: any[], parentId: string | null = null): any[] => {
      return comments
        .filter((c) => c.parentId === parentId)
        .map((c) => ({
          ...c,
          replies: buildHierarchy(comments, c.id),
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    };

    const hierarchicalComments = buildHierarchy(allComments);

    res.json(hierarchicalComments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Erro ao buscar comentários' });
  }
});

// Update comment status (hide/remove) - admin
commentRoutes.patch('/:id/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body; // approved, hidden, removed
    const commentId = req.params.id as string;

    if (!['approved', 'hidden', 'removed'].includes(status)) {
      res.status(400).json({ error: 'Status inválido' });
      return;
    }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { status },
      include: {
        replies: true,
        user: true,
      },
    });

    res.json(comment);
  } catch (error) {
    console.error('Update comment status error:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do comentário' });
  }
});

// Delete comment (admin)
commentRoutes.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.id as string;

    // Soft delete - marcar como removed
    await prisma.comment.update({
      where: { id: commentId },
      data: { status: 'removed' },
    });

    res.json({ message: 'Comentário removido' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Erro ao deletar comentário' });
  }
});

// Hard delete comment (admin) - permanente
commentRoutes.delete('/:id/hard', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.id as string;

    // Deletar todas as respostas primeiro
    await prisma.comment.deleteMany({
      where: { parentId: commentId },
    });

    // Deletar o comentário
    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.json({ message: 'Comentário deletado permanentemente' });
  } catch (error) {
    console.error('Hard delete comment error:', error);
    res.status(500).json({ error: 'Erro ao deletar comentário' });
  }
});

