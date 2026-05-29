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
  origin: [config.frontendUrl, 'https://pelosolhosderha.vercel.app'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
app.use('/uploads', express.static(path.resolve(config.uploadDir)));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);

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
