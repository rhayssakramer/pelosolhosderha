import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { config } from '../config/env.js';

export const googleAuthRoutes = Router();

const client = new OAuth2Client(config.googleClientId);

interface GoogleTokenPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

// Google OAuth login/signup
googleAuthRoutes.post('/google', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: 'Token Google não fornecido' });
      return;
    }

    // Verificar o token do Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload() as GoogleTokenPayload;

    if (!payload) {
      res.status(401).json({ error: 'Token Google inválido' });
      return;
    }

    const { sub: googleId, email, name, picture: avatar } = payload;

    console.log(`🔐 Google Auth - User: ${name} (${email})`);
    console.log(`📸 Avatar from ID Token:`, avatar || 'NOT PROVIDED');

    // Se não tiver avatar no token, tenta recuperar via Google People API
    let finalAvatar = avatar;
    
    if (!finalAvatar) {
      try {
        // Usar o access token se disponível, senão usar o Google People API com ID token
        const peopleResponse = await fetch(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${req.body.accessToken || ''}`,
          {
            headers: {
              'Authorization': `Bearer ${req.body.accessToken || ''}`
            }
          }
        );

        if (peopleResponse.ok) {
          const peopleData = await peopleResponse.json() as { picture?: string };
          if (peopleData.picture) {
            finalAvatar = peopleData.picture;
            console.log(`📸 Avatar retrieved from People API:`, finalAvatar);
          }
        }
      } catch (error) {
        console.log('Could not fetch from People API, will use fallback');
      }
    }

    // Se tiver avatar do Google, fazer proxy através da nossa API para evitar CORS
    if (finalAvatar && finalAvatar.includes('googleusercontent.com')) {
      const encodedUrl = encodeURIComponent(finalAvatar);
      finalAvatar = `${config.apiUrl}/proxy-image?url=${encodedUrl}`;
      console.log(`📸 Using proxied avatar:`, finalAvatar);
    }

    // Fallback: gerar avatar se ainda não tiver
    if (!finalAvatar) {
      finalAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=8c6add&color=fff&bold=true`;
      console.log(`📸 Using fallback avatar:`, finalAvatar);
    }

    console.log(`✅ Final Avatar URL:`, finalAvatar);

    // Verificar se o perfil de usuário já existe
    let userProfile = await prisma.userProfile.findUnique({
      where: { googleId },
    });

    if (!userProfile) {
      // Criar novo perfil de usuário Google
      userProfile = await prisma.userProfile.create({
        data: {
          googleId,
          email,
          name,
          avatar: finalAvatar,
          isGoogle: true,
        },
      });
    } else {
      // Atualizar avatar se tiver mudado
      if (userProfile.avatar !== finalAvatar) {
        userProfile = await prisma.userProfile.update({
          where: { id: userProfile.id },
          data: { avatar: finalAvatar },
        });
      }
    }

    // Gerar JWT token para o comentário
    const jwtToken = jwt.sign(
      {
        userId: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        avatar: userProfile.avatar,
        isGoogle: true,
      },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        avatar: userProfile.avatar,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Falha na autenticação Google' });
  }
});

// Validar token Google (para verificar se ainda é válido)
googleAuthRoutes.post('/google/verify', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: 'Token não fornecido' });
      return;
    }

    // Verificar JWT token gerado localmente
    const decoded = jwt.verify(token, config.jwtSecret) as any;

    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Token inválido ou expirado' });
  }
});

// Refresh token Google
googleAuthRoutes.post('/google/refresh', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: 'Token não fornecido' });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret, { ignoreExpiration: true }) as any;

    // Gerar novo token
    const newToken = jwt.sign(
      {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.avatar,
        isGoogle: decoded.isGoogle,
      },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Falha ao renovar token' });
  }
});
