import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

// Instagram feed endpoint (API oficial com token)
const INSTAGRAM_TOKEN = 'IGAAN23idbCJ1BZAGIxVUthNkdpclA4X0Rpa1VzMmt6YlltUU5uZAWw1cEZAjU2JFNWlmSmQ2YzlZAa0lIWFZAQeXB3QlV4emdRY3BVU3VBTmlsOUFmWmRydXh6aTVTbW1CMkNlMG8xZAHZAzelU5TkFVUTlZASzdIbXZAEdElvSmhTaHR2WQZDZD';

app.get('/api/instagram/feed', async (req, res) => {
  const limit = parseInt(req.query['limit'] as string) || 9;

  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_url,permalink,thumbnail_url,media_type&limit=${limit}&access_token=${INSTAGRAM_TOKEN}`
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
  } catch (error: any) {
    res.status(500).json({ posts: [], error: error.message });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
