import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Post, Tag, BlogSettings } from '../models/post.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private readonly POSTS_KEY = 'blog_posts';
  private readonly TAGS_KEY = 'blog_tags';
  private readonly SETTINGS_KEY = 'blog_settings';
  private readonly apiUrl = environment.apiUrl;
  private readonly useApi = environment.production;
  private isBrowser: boolean;
  private http = inject(HttpClient);

  posts = signal<Post[]>([]);
  tags = signal<Tag[]>([]);
  settings = signal<BlogSettings>(this.getDefaultSettings());

  constructor() {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    this.loadAll();
    if (this.useApi) {
      this.loadTagsFromApi();
      this.loadPostsFromApi();
    }
  }

  private getDefaultSettings(): BlogSettings {
    return {
      blogTitle: 'Pelos Olhos de Rha',
      blogDescription: 'Um blog pessoal',
      primaryColor: '#1a1a2e',
      accentColor: '#e94560',
      fontFamily: 'Georgia, serif'
    };
  }

  private loadAll(): void {
    if (!this.isBrowser) return;
    const posts = localStorage.getItem(this.POSTS_KEY);
    const tags = localStorage.getItem(this.TAGS_KEY);
    const settings = localStorage.getItem(this.SETTINGS_KEY);

    this.posts.set(posts ? JSON.parse(posts) : []);
    this.tags.set(tags ? JSON.parse(tags) : []);
    this.settings.set(settings ? JSON.parse(settings) : this.getDefaultSettings());
  }

  private savePosts(): void {
    if (this.isBrowser) localStorage.setItem(this.POSTS_KEY, JSON.stringify(this.posts()));
  }

  private saveTags(): void {
    if (this.isBrowser) localStorage.setItem(this.TAGS_KEY, JSON.stringify(this.tags()));
  }

  private saveSettings(): void {
    if (this.isBrowser) localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings()));
  }

  private loadTagsFromApi(): void {
    if (!this.isBrowser) return;
    this.http.get<any[]>(`${this.apiUrl}/tags`).subscribe({
      next: (tags) => {
        const mapped: Tag[] = tags.map(t => ({ id: t.id, name: t.name, color: t.color }));
        const localTags = this.tags();

        // If we have local tags, preserve local order and just add any new ones from API
        if (localTags.length > 0) {
          const apiIds = new Set(mapped.map(t => t.id));
          const localIds = new Set(localTags.map(t => t.id));
          // Keep local order, remove tags that no longer exist on server
          const kept = localTags.filter(t => apiIds.has(t.id));
          // Add new tags from API that aren't local yet
          const newFromApi = mapped.filter(t => !localIds.has(t.id));
          const merged = [...kept, ...newFromApi];
          this.tags.set(merged);
        } else {
          this.tags.set(mapped);
        }
        this.saveTags();
      },
      error: (err) => console.error('Erro ao carregar tags da API:', err)
    });
  }

  private loadPostsFromApi(): void {
    if (!this.isBrowser) return;
    this.http.get<any>(`${this.apiUrl}/posts`).subscribe({
      next: (response) => {
        const posts = Array.isArray(response) ? response : response.posts || [];
        this.posts.set(posts);
        this.savePosts();
      },
      error: (err) => console.error('Erro ao carregar posts da API:', err)
    });
  }

  // Posts
  getPublishedPosts(): Post[] {
    return this.posts().filter(p => p.published).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getPostById(id: string): Post | undefined {
    return this.posts().find(p => p.id === id);
  }

  getPostsByTag(tagName: string): Post[] {
    return this.getPublishedPosts().filter(p => p.tags.includes(tagName));
  }

  createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Post {
    const newPost: Post = {
      ...post,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.posts.update(posts => [...posts, newPost]);
    this.savePosts();
    return newPost;
  }

  updatePost(id: string, updates: Partial<Post>): void {
    this.posts.update(posts => posts.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ));
    this.savePosts();
  }

  deletePost(id: string): void {
    this.posts.update(posts => posts.filter(p => p.id !== id));
    this.savePosts();
  }

  // Tags
  createTag(name: string, color: string = '#6366f1'): void {
    if (!this.useApi) {
      const newTag: Tag = { id: crypto.randomUUID(), name, color };
      this.tags.update(tags => [...tags, newTag]);
      this.saveTags();
      return;
    }
    const token = this.isBrowser ? localStorage.getItem('blog_auth_token') : null;
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    this.http.post<Tag>(`${this.apiUrl}/tags`, { name, color }, { headers }).subscribe({
      next: (tag) => {
        this.tags.update(tags => [...tags, { id: tag.id, name: tag.name, color: tag.color }]);
        this.saveTags();
      },
      error: (err) => console.error('Erro ao criar tag:', err)
    });
  }

  deleteTag(id: string): void {
    if (!this.useApi) {
      this.tags.update(tags => tags.filter(t => t.id !== id));
      this.saveTags();
      return;
    }
    const token = this.isBrowser ? localStorage.getItem('blog_auth_token') : null;
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    this.http.delete(`${this.apiUrl}/tags/${id}`, { headers }).subscribe({
      next: () => {
        this.tags.update(tags => tags.filter(t => t.id !== id));
        this.saveTags();
      },
      error: (err) => console.error('Erro ao deletar tag:', err)
    });
  }

  reorderTags(orderedIds: string[]): void {
    const currentTags = this.tags();
    const reordered = orderedIds.map(id => currentTags.find(t => t.id === id)!).filter(Boolean);
    this.tags.set(reordered);
    this.saveTags();

    if (!this.useApi) return;

    const token = this.isBrowser ? localStorage.getItem('blog_auth_token') : null;
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    this.http.put(`${this.apiUrl}/tags/reorder`, { orderedIds }, { headers }).subscribe({
      error: (err) => {
        console.error('Erro ao reordenar tags:', err);
        this.loadTagsFromApi();
      }
    });
  }

  // Settings
  updateSettings(newSettings: Partial<BlogSettings>): void {
    this.settings.update(s => ({ ...s, ...newSettings }));
    this.saveSettings();
  }
}
