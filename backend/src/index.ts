import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env.js';
import { prisma } from './config/database.js';
import { authRoutes } from './routes/auth.routes.js';
import { postRoutes } from './routes/post.routes.js';
import { commentRoutes } from './routes/comment.routes.js';
import { tagRoutes } from './routes/tag.routes.js';
import { uploadRoutes } from './routes/upload.routes.js';
import { statsRoutes } from './routes/stats.routes.js';
import { pinRoutes } from './routes/pin.routes.js';

const app = express();

const allowedOrigins = [
  'https://www.pelosolhosderha.com.br',
  'https://pelosolhosderhastore.z20.web.core.windows.net',
  'https://pelosolhosderha-api.bluesea-ecfbf889.brazilsouth.azurecontainerapps.io',
  'http://localhost:4200',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files (uploads) - allow public access (needed for Pinterest, Instagram sharing)
app.use('/uploads', express.static(path.resolve(config.uploadDir)));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/pin', pinRoutes);

// Instagram feed endpoint
app.get('/api/instagram/feed', async (req, res) => {
  const limit = parseInt(req.query['limit'] as string) || 9;
  const token = config.instagramToken;

  if (!token) {
    res.json({ posts: [], error: 'Token não configurado' });
    return;
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_url,permalink,thumbnail_url,media_type&limit=${limit}&access_token=${token}`
    );

    if (!response.ok) {
      const err = await response.json() as { error?: { message?: string } };
      res.status(response.status).json({ posts: [], error: err.error?.message || 'Erro na API' });
      return;
    }

    const data = await response.json() as { data: any[] };
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
