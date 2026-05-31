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
  private isBrowser: boolean;
  private http = inject(HttpClient);

  posts = signal<Post[]>([]);
  tags = signal<Tag[]>([]);
  settings = signal<BlogSettings>(this.getDefaultSettings());

  constructor() {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    this.loadAll();
    this.loadTagsFromApi();
    this.loadPostsFromApi();
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
        this.tags.set(mapped);
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
    const token = this.isBrowser ? localStorage.getItem('blog_auth_token') : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    this.http.post<Tag>(`${this.apiUrl}/tags`, { name, color }, { headers }).subscribe({
      next: () => {
        this.loadTagsFromApi();
      },
      error: (err) => console.error('Erro ao criar tag:', err)
    });
  }

  deleteTag(id: string): void {
    const token = this.isBrowser ? localStorage.getItem('blog_auth_token') : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    this.http.delete(`${this.apiUrl}/tags/${id}`, { headers }).subscribe({
      next: () => {
        this.loadTagsFromApi();
      },
      error: (err) => console.error('Erro ao deletar tag:', err)
    });
  }

  // Settings
  updateSettings(newSettings: Partial<BlogSettings>): void {
    this.settings.update(s => ({ ...s, ...newSettings }));
    this.saveSettings();
  }
}
