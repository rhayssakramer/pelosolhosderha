import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Post, Tag, BlogSettings } from '../models/post.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

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
  private auth = inject(AuthService);

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
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(this.POSTS_KEY, JSON.stringify(this.posts()));
    } catch (e) {
      console.warn('Cache local excedeu o limite, limpando cache de posts:', e);
      try { localStorage.removeItem(this.POSTS_KEY); } catch {}
    }
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
    // Use admin endpoint if authenticated to get all posts (including drafts)
    const endpoint = this.auth.isLoggedIn()
      ? `${this.apiUrl}/posts/admin/all`
      : `${this.apiUrl}/posts`;
    this.http.get<any>(endpoint).subscribe({
      next: (response) => {
        const posts = Array.isArray(response) ? response : response.posts || [];
        this.posts.set(posts);
        this.savePosts();
      },
      error: (err) => console.error('Erro ao carregar posts da API:', err)
    });
  }

  reloadPosts(): void {
    if (this.useApi) {
      this.loadPostsFromApi();
    }
  }

  // Upload
  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload`, formData).pipe(
      map(res => {
        const url = res.url;
        // If it's already a full URL (Azure Blob Storage), return as-is
        if (url.startsWith('http')) return url;
        // For relative URLs (local dev), prefix with API base
        const baseUrl = this.apiUrl.replace(/\/api\/?$/, '');
        return `${baseUrl}${url}`;
      })
    );
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

    if (this.useApi) {
      this.http.post<any>(`${this.apiUrl}/posts`, {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        published: post.published,
        tags: post.tags
      }).subscribe({
        next: (saved) => {
          // Update local post with server ID
          this.posts.update(posts => posts.map(p =>
            p.id === newPost.id ? { ...p, id: saved.id } : p
          ));
          this.savePosts();
        },
        error: (err) => console.error('Erro ao criar post na API:', err)
      });
    }
    return newPost;
  }

  updatePost(id: string, updates: Partial<Post>): void {
    this.posts.update(posts => posts.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ));
    this.savePosts();

    if (this.useApi) {
      this.http.put<any>(`${this.apiUrl}/posts/${id}`, {
        title: updates.title,
        content: updates.content,
        excerpt: updates.excerpt,
        coverImage: updates.coverImage,
        published: updates.published,
        tags: updates.tags
      }).subscribe({
        error: (err) => console.error('Erro ao atualizar post na API:', err)
      });
    }
  }

  deletePost(id: string): void {
    this.posts.update(posts => posts.filter(p => p.id !== id));
    this.savePosts();

    if (this.useApi) {
      this.http.delete(`${this.apiUrl}/posts/${id}`).subscribe({
        error: (err) => console.error('Erro ao deletar post na API:', err)
      });
    }
  }

  // Tags
  createTag(name: string, color: string = '#6366f1'): void {
    if (!this.useApi) {
      const newTag: Tag = { id: crypto.randomUUID(), name, color };
      this.tags.update(tags => [...tags, newTag]);
      this.saveTags();
      return;
    }
    this.http.post<Tag>(`${this.apiUrl}/tags`, { name, color }).subscribe({
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
    this.http.delete(`${this.apiUrl}/tags/${id}`).subscribe({
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

    this.http.put(`${this.apiUrl}/tags/reorder`, { orderedIds }).subscribe({
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
