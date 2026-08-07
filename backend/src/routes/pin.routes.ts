import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { config } from '../config/env.js';

export const pinRoutes = Router();

/**
 * Get the cover image for a post
 * This endpoint redirects to the actual cover image URL
 * GET /api/pin/:postId/cover -> 302 Redirect to cover image
 */
pinRoutes.get('/:postId/cover', async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId as string;
    
    console.log(`[PIN COVER] Getting cover image for post: ${postId}`);
    
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { coverImage: true, published: true }
    });

    if (!post || !post.published || !post.coverImage) {
      console.log(`[PIN COVER] Post not found, not published, or no cover image: ${postId}`);
      res.status(404).send('Image not found');
      return;
    }

    console.log(`[PIN COVER] Redirecting to cover image: ${post.coverImage}`);
    // Use 307 or 308 to preserve method, or 302 for simpler redirect
    res.redirect(307, post.coverImage);
  } catch (error) {
    console.error('[PIN COVER] Error:', error);
    res.status(500).send('Error retrieving image');
  }
});

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
