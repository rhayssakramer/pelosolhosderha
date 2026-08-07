import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { config } from '../config/env.js';

export const pinRoutes = Router();

/**
 * Escape HTML special characters to prevent injection in meta tags
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Share page for Pinterest and other social media crawlers.
 * Returns an HTML page with proper Open Graph meta tags that crawlers can read
 * (since the Angular SPA doesn't render meta tags server-side).
 * Human visitors are redirected to the actual post.
 * GET /api/pin/:postId/share
 */
pinRoutes.get('/:postId/share', async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId as string;

    console.log(`[PIN SHARE] Generating share page for post: ${postId}`);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { title: true, excerpt: true, coverImage: true, published: true }
    });

    if (!post || !post.published) {
      console.log(`[PIN SHARE] Post not found or not published: ${postId}`);
      res.status(404).send('Post não encontrado');
      return;
    }

    // The custom domain is where humans should land
    const siteUrl = config.frontendUrl || 'http://localhost:4200';
    const postUrl = `${siteUrl}/post/${postId}`;
    const imageUrl = post.coverImage || '';
    const title = escapeHtml(post.title || 'Pelos Olhos de Rha');
    const description = escapeHtml(post.excerpt || post.title || '');

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} - Pelos Olhos de Rha</title>

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${postUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">

  <!-- Pinterest -->
  <meta property="pin:url" content="${postUrl}">
  <meta property="pin:media" content="${imageUrl}">
  <meta property="pin:description" content="${description}">

  <meta name="description" content="${description}">

  <!-- Redirect human visitors to the actual post -->
  <meta http-equiv="refresh" content="0; url=${postUrl}">
  <link rel="canonical" href="${postUrl}">
</head>
<body>
  <p>Redirecionando para <a href="${postUrl}">${title}</a>...</p>
  <script>window.location.replace(${JSON.stringify(postUrl)});</script>
</body>
</html>`;

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(html);
  } catch (error) {
    console.error('[PIN SHARE] Error:', error);
    res.status(500).send('Erro ao gerar página de compartilhamento');
  }
});

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
