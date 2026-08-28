import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';

export const newsletterRoutes = Router();

// Get all newsletter subscribers (admin only)
newsletterRoutes.get('/', authMiddleware, async (_req: AuthRequest, res: Response) => {
  try {
    const newsletters = await prisma.newsletter.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(newsletters);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar inscritos' });
  }
});

// Get newsletter stats (admin only)
newsletterRoutes.get('/stats', authMiddleware, async (_req: AuthRequest, res: Response) => {
  try {
    const total = await prisma.newsletter.count();
    const active = await prisma.newsletter.count({ where: { status: 'active' } });
    const unsubscribed = await prisma.newsletter.count({ where: { status: 'unsubscribed' } });
    const bounced = await prisma.newsletter.count({ where: { status: 'bounced' } });

    res.json({ total, active, unsubscribed, bounced });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Subscribe to newsletter (public)
newsletterRoutes.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Verificar se já existe
    const existing = await prisma.newsletter.findUnique({ where: { email } });
    if (existing) {
      // Se estava desinscritos, reativar
      if (existing.status === 'unsubscribed') {
        const updated = await prisma.newsletter.update({
          where: { email },
          data: { status: 'active', updatedAt: new Date() }
        });
        return res.status(200).json(updated);
      }
      return res.status(409).json({ error: 'Email já inscrito' });
    }

    // Criar novo inscrito
    const newsletter = await prisma.newsletter.create({
      data: {
        email,
        status: 'active'
      }
    });

    res.status(201).json(newsletter);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao inscrever' });
  }
});

// Update newsletter status (admin only)
newsletterRoutes.patch('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body;

    const validStatuses = ['active', 'unsubscribed', 'bounced'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const newsletter = await prisma.newsletter.update({
      where: { id },
      data: { status, updatedAt: new Date() }
    });

    res.json(newsletter);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar inscrição' });
  }
});

// Delete newsletter subscription (admin or via unsubscribe link)
newsletterRoutes.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    await prisma.newsletter.delete({
      where: { id }
    });

    res.json({ message: 'Inscrição removida' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover inscrição' });
  }
});

// Unsubscribe from newsletter (public, via token in email link)
newsletterRoutes.post('/unsubscribe/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params as { email: string };

    const newsletter = await prisma.newsletter.findUnique({ where: { email } });
    if (!newsletter) {
      return res.status(404).json({ error: 'Email não encontrado' });
    }

    await prisma.newsletter.update({
      where: { email } as { email: string },
      data: { status: 'unsubscribed', updatedAt: new Date() }
    });

    res.json({ message: 'Você foi desinscrito do newsletter' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao desinscrever' });
  }
});
