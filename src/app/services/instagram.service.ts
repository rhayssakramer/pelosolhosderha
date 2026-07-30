import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

export interface InstagramPost {
  id: string;
  imageUrl: string;
  permalink: string;
}

@Injectable({
  providedIn: 'root'
})
export class InstagramService {
  private readonly CACHE_KEY = 'blog_instagram_cache';
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hora
  private platformId = inject(PLATFORM_ID);

  posts = signal<InstagramPost[]>([]);
  loading = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const cached = this.loadCache();
      if (!cached) {
        this.fetchPosts();
      }
    }
  }

  private loadCache(): boolean {
    const data = localStorage.getItem(this.CACHE_KEY);
    if (data) {
      const { posts, timestamp } = JSON.parse(data);
      if (Date.now() - timestamp < this.CACHE_DURATION) {
        this.posts.set(posts);
        return true;
      }
    }
    return false;
  }

  private saveCache(posts: InstagramPost[]): void {
    localStorage.setItem(this.CACHE_KEY, JSON.stringify({ posts, timestamp: Date.now() }));
  }

  async fetchPosts(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loading.set(true);

    try {
      const res = await fetch(`${environment.apiUrl}/instagram/feed?limit=9`);
      const data = await res.json();

      if (data.posts && data.posts.length > 0) {
        this.posts.set(data.posts);
        this.saveCache(data.posts);
      }
    } catch (e) {
      // mantém cache anterior
    } finally {
      this.loading.set(false);
    }
  }

  removePost(id: string): void {
    this.posts.update(p => p.filter(x => x.id !== id));
    this.saveCache(this.posts());
  }
}
