import { Component, HostListener, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { StatsService } from '../../services/stats.service';
import { InstagramService } from '../../services/instagram.service';
import { YouTubeService } from '../../services/youtube.service';
import { Post } from '../../models/post.model';
import { VideoEmbedPipe } from '../../pipes/video-embed.pipe';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-post-detail',
  imports: [CommonModule, RouterLink, VideoEmbedPipe],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css',
  encapsulation: ViewEncapsulation.None
})
export class PostDetailComponent {
  post?: Post;
  previousPost?: Post;
  nextPost?: Post;
  isStuck = false;
  showAllArchive = false;
  searchTerm = '';
  currentUrl = '';
  mobileMenuOpen = false;

  encodeURI(str: string) {
    return encodeURIComponent(str);
  }

  @HostListener('window:scroll')
  onScroll() {
    this.isStuck = window.scrollY > 320;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public blog: BlogService,
    private stats: StatsService,
    public instagram: InstagramService,
    public youtube: YouTubeService,
    private meta: Meta,
    private titleService: Title
  ) {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (typeof window !== 'undefined') {
        this.currentUrl = window.location.href;
      }
      if (id) {
        this.post = this.blog.getPostById(id);
        if (this.post) {
          this.stats.trackView(id);
          this.setMetaTags(this.post);
          const allPosts = this.blog.getPublishedPosts()
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          const idx = allPosts.findIndex(p => p.id === id);
          this.previousPost = idx > 0 ? allPosts[idx - 1] : undefined;
          this.nextPost = idx < allPosts.length - 1 ? allPosts[idx + 1] : undefined;
        }
      }
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
      }
    });
  }

  private setMetaTags(post: Post): void {
    const siteUrl = environment.siteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    const pageUrl = `${siteUrl}/post/${post.id}`;
    const imageUrl = this.getProxiedImageUrl(post.coverImage || '');
    const description = post.excerpt || post.title;

    this.titleService.setTitle(`${post.title} - Pelos Olhos de Rha`);
    this.meta.updateTag({ property: 'og:title', content: post.title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ property: 'og:url', content: pageUrl });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: post.title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl });
    // Pinterest-specific meta tags to ensure PIN redirects to post, not image
    this.meta.updateTag({ property: 'pin:media', content: imageUrl });
    this.meta.updateTag({ property: 'pin:url', content: pageUrl });
    this.meta.updateTag({ property: 'pin:description', content: description });
    this.meta.updateTag({ name: 'description', content: description });
  }

  getSanitizedContent(): string {
    if (!this.post?.content) return '';
    return this.post.content.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');
  }

  private getApiBase(): string {
    return environment.apiUrl ? environment.apiUrl.replace(/\/api$/, '') : '';
  }

  getFullImageUrl(url: string): string {
    if (!url) return '';
    // Already a full URL (Azure Blob Storage, external, etc.)
    if (url.startsWith('http')) return url;
    // Relative URL: resolve through Vercel proxy or API base
    const base = this.getApiBase() || environment.siteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    return base + (url.startsWith('/') ? url : '/' + url);
  }

  shareOnPinterest(): void {
    if (typeof window === 'undefined') return;
    const baseSiteUrl = environment.siteUrl || window.location.origin;
    const apiUrl = environment.apiUrl || baseSiteUrl;
    const postId = this.post?.id;
    
    // Use the API endpoint that redirects to the post
    // This way, when Pinterest or users click the pin, they go to the post
    const redirectImageUrl = `${apiUrl}/pin/${postId}/image`;
    
    const pageUrl = `${baseSiteUrl}/post/${postId}`;
    const title = this.post?.title || '';
    const excerpt = this.post?.excerpt || '';
    const description = excerpt ? `${title} - ${excerpt}` : title;
    const trimmedDescription = description.length > 500 ? description.substring(0, 497) + '...' : description;

    // Use the actual image for display, but the redirect URL as the destination
    const displayImageUrl = this.getProxiedImageUrl(this.post?.coverImage || '');

    // Use Pinterest SDK overlay (PinUtils.pinOne)
    const PinUtils = (window as any).PinUtils;
    if (PinUtils && PinUtils.pinOne) {
      PinUtils.pinOne({
        url: pageUrl,
        media: displayImageUrl,
        description: trimmedDescription
      });
      return;
    }

    // SDK not ready yet - wait for it to load (it's async)
    this.waitForPinUtils(3000).then(PU => {
      PU.pinOne({
        url: pageUrl,
        media: displayImageUrl,
        description: trimmedDescription
      });
    }).catch(() => {
      window.location.href = `https://www.pinterest.com/pin-builder/?url=${encodeURIComponent(pageUrl)}&media=${encodeURIComponent(displayImageUrl)}&description=${encodeURIComponent(trimmedDescription)}`;
    });
  }

  /**
   * Returns an image URL for sharing on social media (Pinterest, etc.).
   * Azure Blob Storage URLs are already publicly accessible.
   * For relative paths or old Azure Container App URLs, proxy through Vercel.
   */
  private getProxiedImageUrl(url: string): string {
    if (!url) return '';
    const siteUrl = environment.siteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    // Azure Blob Storage URLs are directly accessible and Pinterest can fetch them
    if (url.includes('.blob.core.windows.net')) {
      return url;
    }
    // If it's already a full Azure Container App URL, rewrite it to go through site proxy
    if (url.includes('azurecontainerapps.io')) {
      const uploadsPath = url.split('/uploads/')[1];
      if (uploadsPath) {
        return `${siteUrl}/uploads/${uploadsPath}`;
      }
    }
    // If it's a relative path like /uploads/abc.jpg
    if (url.startsWith('/uploads/')) {
      return `${siteUrl}${url}`;
    }
    if (url.startsWith('uploads/')) {
      return `${siteUrl}/${url}`;
    }
    // Already a full URL to somewhere else
    if (url.startsWith('http')) return url;
    // Default: prefix with site URL
    return `${siteUrl}${url.startsWith('/') ? url : '/' + url}`;
  }

  private waitForPinUtils(timeout: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        const PU = (window as any).PinUtils;
        if (PU && PU.pinOne) {
          resolve(PU);
        } else if (Date.now() - start > timeout) {
          reject();
        } else {
          setTimeout(check, 200);
        }
      };
      check();
    });
  }

  async shareOnInstagramStories(): Promise<void> {
    if (typeof window === 'undefined') return;
    const siteUrl = (environment.siteUrl || window.location.origin) + window.location.pathname;
    const title = this.post?.title || 'Pelos Olhos de Rha';

    if (navigator.share) {
      try {
        await navigator.share({ title, text: title, url: siteUrl });
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          window.open('https://www.instagram.com/pelosolhosderha', '_blank');
        }
      }
    } else {
      // Desktop: copy link
      navigator.clipboard.writeText(siteUrl).then(() => {
        alert('Link copiado! Abra o Instagram no celular para compartilhar.');
      }).catch(() => {
        window.open('https://www.instagram.com/pelosolhosderha', '_blank');
      });
    }
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
  }

  getPostCountByTag(tagName: string): number {
    return this.blog.getPostsByTag(tagName).length;
  }

  getMostReadPosts(): Post[] {
    const mostViewed = this.stats.getMostViewed(4);
    return mostViewed
      .map(s => this.blog.getPostById(s.postId))
      .filter((p): p is Post => !!p && p.published);
  }

  getArchiveMonths(): { label: string; count: number }[] {
    const posts = this.blog.getPublishedPosts();
    const map = new Map<string, number>();
    posts.forEach(p => {
      const d = new Date(p.createdAt);
      const month = d.toLocaleDateString('pt-BR', { month: 'long' });
      const label = `${month.charAt(0).toUpperCase() + month.slice(1)} ${d.getFullYear()}`;
      map.set(label, (map.get(label) || 0) + 1);
    });
    return Array.from(map.entries()).map(([label, count]) => ({ label, count }));
  }

  filterByMonth(label: string) {
    this.router.navigate(['/'], { queryParams: { month: label } });
  }

  filterByTag(tagName: string) {
    this.router.navigate(['/'], { queryParams: { tag: tagName } });
  }

  getRelatedPosts(): Post[] {
    if (!this.post) return [];
    let related: Post[] = [];
    if (this.post.tags.length) {
      const firstTag = this.post.tags[0];
      related = this.blog.getPostsByTag(firstTag)
        .filter(p => p.id !== this.post!.id && p.published);
    }
    if (related.length === 0) {
      related = this.blog.getPublishedPosts()
        .filter(p => p.id !== this.post!.id);
    }
    return related.slice(0, 4);
  }
}
