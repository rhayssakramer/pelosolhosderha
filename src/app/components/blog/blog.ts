import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { StatsService } from '../../services/stats.service';
import { InstagramService } from '../../services/instagram.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-blog',
  imports: [CommonModule, RouterLink],
  templateUrl: './blog.html',
  styleUrl: './blog.css'
})
export class BlogComponent {
  searchTerm = '';

  constructor(public blog: BlogService, private stats: StatsService, public instagram: InstagramService) {}

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
  }

  get filteredPosts() {
    const posts = this.blog.getPublishedPosts();
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
}
