import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env';
import { prisma } from './config/database';
import { authRoutes } from './routes/auth.routes';
import { postRoutes } from './routes/post.routes';
import { commentRoutes } from './routes/comment.routes';
import { tagRoutes } from './routes/tag.routes';
import { uploadRoutes } from './routes/upload.routes';
import { statsRoutes } from './routes/stats.routes';

const app = express();

// Middleware
app.use(cors({
  origin: [
    config.frontendUrl, 
    'https://pelosolhosderha.vercel.app',
    'https://pelosolhosderha.com.br',
    'https://zealous-field-0fe04e90f.7.azurestaticapps.net',
    'https://zealous-field-0fe04e90f-preview.eastus2.7.azurestaticapps.net'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files (uploads) - allow public access (needed for Pinterest, Instagram sharing)
app.use('/uploads', cors(), express.static(path.resolve(config.uploadDir)));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);

// Instagram feed endpoint
app.get('/api/instagram/feed', async (req, res) => {
  const limit = parseInt(req.query['limit'] as string) || 9;
  const token = process.env.INSTAGRAM_TOKEN || '';

  if (!token) {
    res.json({ posts: [], error: 'Token não configurado' });
    return;
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_url,permalink,thumbnail_url,media_type&limit=${limit}&access_token=${token}`
    );

    if (!response.ok) {
      const err = await response.json();
      res.status(response.status).json({ posts: [], error: err.error?.message || 'Erro na API' });
      return;
    }

    const data = await response.json();
    const posts = (data.data || []).map((item: any) => ({
      id: item.id,
      imageUrl: item.media_type === 'VIDEO' ? item.thumbnail_url : item.media_url,
      permalink: item.permalink,
    }));

    res.json({ posts });
  } catch (error) {
    res.status(500).json({ posts: [], error: 'Erro ao buscar feed' });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: config.env, timestamp: new Date().toISOString() });
});

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port} [${config.env}]`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
