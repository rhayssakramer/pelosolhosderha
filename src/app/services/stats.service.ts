import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface PostStats {
  postId: string;
  views: number;
  comments: number;
  lastViewed?: string;
}

export interface BlogAnalytics {
  totalViews: number;
  totalComments: number;
  postsStats: PostStats[];
  dailyViews: { date: string; count: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private readonly STATS_KEY = 'blog_stats';
  private platformId = inject(PLATFORM_ID);

  analytics = signal<BlogAnalytics>(this.getDefault());

  constructor() {
    this.load();
  }

  private getDefault(): BlogAnalytics {
    return { totalViews: 0, totalComments: 0, postsStats: [], dailyViews: [] };
  }

  private load(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const data = localStorage.getItem(this.STATS_KEY);
    this.analytics.set(data ? JSON.parse(data) : this.getDefault());
  }

  private save(): void {
    if (isPlatformBrowser(this.platformId)) localStorage.setItem(this.STATS_KEY, JSON.stringify(this.analytics()));
  }

  trackView(postId: string): void {
    this.analytics.update(a => {
      const today = new Date().toISOString().split('T')[0];
      let postStats = a.postsStats.find(p => p.postId === postId);
      if (!postStats) {
        postStats = { postId, views: 0, comments: 0 };
        a.postsStats.push(postStats);
      }
      postStats.views++;
      postStats.lastViewed = new Date().toISOString();
      a.totalViews++;

      const dailyEntry = a.dailyViews.find(d => d.date === today);
      if (dailyEntry) {
        dailyEntry.count++;
      } else {
        a.dailyViews.push({ date: today, count: 1 });
      }

      return { ...a };
    });
    this.save();
  }

  addComment(postId: string): void {
    this.analytics.update(a => {
      let postStats = a.postsStats.find(p => p.postId === postId);
      if (!postStats) {
        postStats = { postId, views: 0, comments: 0 };
        a.postsStats.push(postStats);
      }
      postStats.comments++;
      a.totalComments++;
      return { ...a };
    });
    this.save();
  }

  getMostViewed(limit: number = 5): PostStats[] {
    return [...this.analytics().postsStats]
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  getMostCommented(limit: number = 5): PostStats[] {
    return [...this.analytics().postsStats]
      .sort((a, b) => b.comments - a.comments)
      .slice(0, limit);
  }

  getRecentViews(days: number = 30): { date: string; count: number }[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return this.analytics().dailyViews.filter(d => new Date(d.date) >= cutoff);
  }

  getPostViews(postId: string): number {
    return this.analytics().postsStats.find(p => p.postId === postId)?.views || 0;
  }
}
