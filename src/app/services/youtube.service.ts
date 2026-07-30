import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  publishedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class YouTubeService {
  private channelUrl = 'https://www.youtube.com/@pelosolhosderha';
  private platformId = inject(PLATFORM_ID);
  videos = signal<YouTubeVideo[]>([]);

  constructor() {
    this.loadVideos();
  }

  private loadVideos(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const saved = localStorage.getItem('youtube_videos');
      if (saved) {
        this.videos.set(JSON.parse(saved));
      }
    } catch {}
  }

  addVideo(video: Omit<YouTubeVideo, 'id'>): void {
    const newVideo: YouTubeVideo = {
      ...video,
      id: crypto.randomUUID()
    };
    const updated = [newVideo, ...this.videos()];
    this.videos.set(updated);
    if (isPlatformBrowser(this.platformId)) localStorage.setItem('youtube_videos', JSON.stringify(updated));
  }

  removeVideo(id: string): void {
    const updated = this.videos().filter(v => v.id !== id);
    this.videos.set(updated);
    if (isPlatformBrowser(this.platformId)) localStorage.setItem('youtube_videos', JSON.stringify(updated));
  }

  getLatestVideos(count: number = 2): YouTubeVideo[] {
    return this.videos().slice(0, count);
  }

  getChannelUrl(): string {
    return this.channelUrl;
  }
}
