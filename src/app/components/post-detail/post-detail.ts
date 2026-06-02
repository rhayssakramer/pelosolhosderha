import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  styleUrl: './post-detail.css'
})
export class PostDetailComponent {
  post?: Post;
  previousPost?: Post;
  nextPost?: Post;
  isStuck = false;
  showAllArchive = false;
  searchTerm = '';
  currentUrl = '';

  encodeURI(str: string) {
    return encodeURIComponent(str);
  }

  @HostListener('window:scroll')
  onScroll() {
    this.isStuck = window.scrollY > 320;
  }

  constructor(
    private route: ActivatedRoute,
    public blog: BlogService,
    private stats: StatsService,
    public instagram: InstagramService,
    public youtube: YouTubeService
  ) {
    if (typeof window !== 'undefined') {
      this.currentUrl = window.location.href;
    }
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.post = this.blog.getPostById(id);
      if (this.post) {
        this.stats.trackView(id);
        const allPosts = this.blog.getPublishedPosts()
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const idx = allPosts.findIndex(p => p.id === id);
        if (idx > 0) this.previousPost = allPosts[idx - 1];
        if (idx < allPosts.length - 1) this.nextPost = allPosts[idx + 1];
      }
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

  filterByMonth(label: string) {}

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
