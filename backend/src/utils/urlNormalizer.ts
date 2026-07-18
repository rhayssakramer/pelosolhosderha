import { config } from '../config/env.js';

/**
 * Normalizes image URLs in HTML content to ensure they are absolute URLs
 * Converts relative URLs and broken URLs to proper format
 */

const BACKEND_BASE_URL = config.frontendUrl ? config.frontendUrl.replace(/\/$/, '') : 'http://localhost:3000';

export function normalizeImageUrlsInHtml(html: string | null | undefined): string {
  if (!html) return '';

  // Replace relative /uploads URLs with absolute URLs
  let normalized = html.replace(
    /src="\/uploads\/([^"]+)"/g,
    (match, filename) => {
      // Check if it's already absolute
      if (filename.startsWith('http')) return match;
      return `src="${BACKEND_BASE_URL}/uploads/${filename}"`;
    }
  );

  // Fix any broken img src tags
  normalized = normalized.replace(
    /src='\/uploads\/([^']+)'/g,
    (match, filename) => {
      if (filename.startsWith('http')) return match;
      return `src='${BACKEND_BASE_URL}/uploads/${filename}'`;
    }
  );

  return normalized;
}

/**
 * Normalizes a single image URL
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return '';

  // Already absolute
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Relative URL - make it absolute
  if (url.startsWith('/')) {
    return `${BACKEND_BASE_URL}${url}`;
  }

  // Fallback
  return `${BACKEND_BASE_URL}/${url}`;
}
