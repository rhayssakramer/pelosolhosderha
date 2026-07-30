import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  console.log('[Auth Middleware] Authorization header:', authHeader ? 'Present' : 'Missing');
  console.log('[Auth Middleware] Token:', token ? 'Present' : 'Missing');

  if (!token) {
    console.log('[Auth Middleware] ❌ Token não fornecido');
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    console.log('[Auth Middleware] ✅ Token válido, userId:', decoded.userId);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log('[Auth Middleware] ❌ Token inválido:', error instanceof Error ? error.message : 'Unknown error');
    res.status(401).json({ error: 'Token inválido' });
  }
}
