import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { StatsService } from '../../services/stats.service';
import { InstagramService } from '../../services/instagram.service';
import { YouTubeService } from '../../services/youtube.service';
import { Post } from '../../models/post.model';
import { PostCardComponent } from './post-card/post-card';

@Component({
  selector: 'app-blog',
  imports: [CommonModule, RouterLink, PostCardComponent],
  templateUrl: './blog.html',
  styleUrl: './blog.css'
})
export class BlogComponent {
  searchTerm = '';
  selectedTag = '';
  selectedMonth = '';
  showMoreTags = false;
  isStuck = false;
  sliderIndex = 0;
  showAllArchive = false;
  mobileMenuOpen = false;
  mobileSearchOpen = false;

  @HostListener('window:scroll')
  onScroll() {
    this.isStuck = window.scrollY > 320;
  }

  constructor(public blog: BlogService, private stats: StatsService, public instagram: InstagramService, public youtube: YouTubeService, private route: ActivatedRoute) {
    this.route.queryParamMap.subscribe(params => {
      const tag = params.get('tag');
      const month = params.get('month');
      if (tag) {
        this.selectedTag = tag;
        this.selectedMonth = '';
      } else if (month) {
        this.selectedMonth = month;
        this.selectedTag = '';
      }
    });
  }

  get featuredPosts(): Post[] {
    return this.blog.getPublishedPosts().slice(0, 9);
  }

  get totalSlides(): number {
    return Math.ceil(this.featuredPosts.length / 3);
  }

  sliderPrev() {
    this.sliderIndex = (this.sliderIndex - 1 + this.totalSlides) % this.totalSlides;
  }

  sliderNext() {
    this.sliderIndex = (this.sliderIndex + 1) % this.totalSlides;
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
  }

  filterByTag(tagName: string): void {
    this.selectedTag = this.selectedTag === tagName ? '' : tagName;
    this.selectedMonth = '';
    this.searchTerm = '';
  }

  get filteredPosts() {
    let posts = this.blog.getPublishedPosts();
    if (this.selectedTag) {
      posts = posts.filter(p => p.tags.some(t => t.toLowerCase() === this.selectedTag.toLowerCase()));
    }
    if (this.selectedMonth) {
      posts = posts.filter(p => {
        const d = new Date(p.createdAt);
        const month = d.toLocaleDateString('pt-BR', { month: 'long' });
        const label = `${month.charAt(0).toUpperCase() + month.slice(1)} ${d.getFullYear()}`;
        return label === this.selectedMonth;
      });
    }
    if (!this.searchTerm) return posts;
    return posts.filter(p =>
      p.title.toLowerCase().includes(this.searchTerm) ||
      p.excerpt.toLowerCase().includes(this.searchTerm) ||
      p.tags.some(t => t.toLowerCase().includes(this.searchTerm))
    );
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
    this.searchTerm = label.split(' de ')[0];
    this.selectedMonth = this.selectedMonth === label ? '' : label;
    this.selectedTag = '';
    this.searchTerm = '';
  }
}
