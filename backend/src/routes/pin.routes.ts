import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { config } from '../config/env.js';

export const pinRoutes = Router();

/**
 * Redirect endpoint for Pinterest pins
 * When Pinterest or users click on a pin image, redirect to the actual post
 * GET /api/pin/:postId/image -> Redirects to /post/:postId
 */
pinRoutes.get('/:postId/image', async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId as string;
    
    console.log(`[PIN REDIRECT] Redirect request for post: ${postId}`);
    
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, published: true, coverImage: true }
    });

    if (!post || !post.published) {
      console.log(`[PIN REDIRECT] Post not found or not published: ${postId}`);
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Redirect to the post
    const siteUrl = config.frontendUrl || 'http://localhost:4200';
    const postUrl = `${siteUrl}/post/${postId}`;
    
    console.log(`[PIN REDIRECT] Redirecting to: ${postUrl}`);
    res.redirect(302, postUrl);
  } catch (error) {
    console.error('[PIN REDIRECT] Error:', error);
    res.status(500).json({ error: 'Error processing redirect' });
  }
});
