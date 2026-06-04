import { Component, HostListener, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { StatsService } from '../../services/stats.service';
import { InstagramService } from '../../services/instagram.service';
import { YouTubeService } from '../../services/youtube.service';
import { Post } from '../../models/post.model';
import { SafePipe } from '../../pipes/safe.pipe';

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
    public youtube: YouTubeService
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

  getSanitizedContent(): string {
    if (!this.post?.content) return '';
    return this.post.content.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');
  }

  getFullImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (typeof window !== 'undefined') {
      return window.location.origin + (url.startsWith('/') ? url : '/' + url);
    }
    return url;
  }

  pinIt(event: Event): void {
    event.preventDefault();
    if (typeof window === 'undefined') return;
    const w: any = window;
    if (w.PinUtils) {
      w.PinUtils.pinOne({
        url: this.currentUrl,
        media: this.getFullImageUrl(this.post?.coverImage || ''),
        description: this.post?.title || ''
      });
    } else {
      const pinUrl = `https://www.pinterest.com/pin-builder/?url=${encodeURIComponent(this.currentUrl)}&description=${encodeURIComponent(this.post?.title || '')}`;
      window.open(pinUrl, '_blank', 'width=750,height=550');
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
