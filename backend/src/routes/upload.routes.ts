import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { isCloudStorageEnabled, uploadToCloud, getLocalFileUrl } from '../config/storage';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import fs from 'fs';

export const uploadRoutes = Router();

// Ensure upload directory exists (used as temp storage for cloud upload, or permanent for local dev)
const uploadDir = path.resolve(config.uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas'));
  },
});

// Upload single image
uploadRoutes.post('/', authMiddleware, upload.single('image'), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'Nenhum arquivo enviado' });
    return;
  }

  try {
    let url: string;

    if (isCloudStorageEnabled()) {
      // Upload to Azure Blob Storage (persistent)
      url = await uploadToCloud(req.file.path, req.file.filename, req.file.mimetype);
    } else {
      // Local development: serve from /uploads
      url = getLocalFileUrl(req.file.filename);
    }

    res.json({ url, filename: req.file.filename });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
});

// Upload multiple images
uploadRoutes.post('/multiple', authMiddleware, upload.array('images', 20), async (req: AuthRequest, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ error: 'Nenhum arquivo enviado' });
    return;
  }

  try {
    const urls = await Promise.all(
      files.map(async (f) => {
        let url: string;
        if (isCloudStorageEnabled()) {
          url = await uploadToCloud(f.path, f.filename, f.mimetype);
        } else {
          url = getLocalFileUrl(f.filename);
        }
        return { url, filename: f.filename };
      })
    );

    res.json(urls);
  } catch (error) {
    console.error('Erro no upload múltiplo:', error);
    res.status(500).json({ error: 'Erro ao fazer upload das imagens' });
  }
});
