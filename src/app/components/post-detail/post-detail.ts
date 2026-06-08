import { Component, HostListener, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { StatsService } from '../../services/stats.service';
import { InstagramService } from '../../services/instagram.service';
import { YouTubeService } from '../../services/youtube.service';
import { Post } from '../../models/post.model';
import { SafePipe } from '../../pipes/safe.pipe';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-post-detail',
  imports: [CommonModule, RouterLink, SafePipe],
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
    const imageUrl = this.getFullImageUrl(post.coverImage || '');
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
    this.meta.updateTag({ property: 'pin:media', content: imageUrl });
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
    if (url.startsWith('http')) return url;
    const base = this.getApiBase() || environment.siteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    return base + (url.startsWith('/') ? url : '/' + url);
  }

  shareOnPinterest(): void {
    if (typeof window === 'undefined') return;
    const baseSiteUrl = environment.siteUrl || window.location.origin;
    const path = window.location.pathname;
    const pageUrl = baseSiteUrl + path;
    const mediaUrl = this.getFullImageUrl(this.post?.coverImage || '');
    const title = this.post?.title || '';
    const excerpt = this.post?.excerpt || '';
    const description = excerpt ? `${title} - ${excerpt}` : title;
    const trimmedDescription = description.length > 500 ? description.substring(0, 497) + '...' : description;

    // Try Pinterest SDK (pinit.js) first - works as in-page overlay
    const PinUtils = (window as any).PinUtils;
    if (PinUtils && PinUtils.pinOne) {
      PinUtils.pinOne({
        url: pageUrl,
        media: mediaUrl,
        description: trimmedDescription
      });
      return;
    }

    // SDK not loaded - dynamically load and retry
    this.loadPinterestSDK().then(() => {
      const PU = (window as any).PinUtils;
      if (PU && PU.pinOne) {
        PU.pinOne({
          url: pageUrl,
          media: mediaUrl,
          description: trimmedDescription
        });
      } else {
        // Final fallback: navigator.share on mobile or copy link
        this.pinterestFallback(pageUrl, mediaUrl, trimmedDescription);
      }
    }).catch(() => {
      this.pinterestFallback(pageUrl, mediaUrl, trimmedDescription);
    });
  }

  private loadPinterestSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if ((window as any).PinUtils) {
        resolve();
        return;
      }
      // Remove existing script if any
      const existing = document.querySelector('script[src*="pinit.js"]');
      if (existing) existing.remove();

      const script = document.createElement('script');
      script.src = 'https://assets.pinterest.com/js/pinit.js';
      script.setAttribute('data-pin-build', 'parsePinBtns');
      script.async = true;
      script.onload = () => {
        // PinUtils may take a moment to initialize
        setTimeout(() => resolve(), 500);
      };
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
  }

  private pinterestFallback(pageUrl: string, mediaUrl: string, description: string): void {
    // On mobile: use Web Share API
    if (navigator.share) {
      navigator.share({
        title: this.post?.title || 'Pelos Olhos de Rha',
        text: `📌 ${description}`,
        url: pageUrl
      }).catch(() => {});
      return;
    }
    // On desktop: copy the link and show instructions
    const pinUrl = `https://www.pinterest.com/pin-builder/?url=${encodeURIComponent(pageUrl)}&media=${encodeURIComponent(mediaUrl)}&description=${encodeURIComponent(description)}`;
    navigator.clipboard.writeText(pinUrl).then(() => {
      alert('Link para criar pin copiado! Cole no navegador para criar o pin no Pinterest.');
    }).catch(() => {
      // Last resort: try opening in same window
      window.location.href = `https://www.pinterest.com/pin-builder/?url=${encodeURIComponent(pageUrl)}&media=${encodeURIComponent(mediaUrl)}&description=${encodeURIComponent(description)}`;
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
