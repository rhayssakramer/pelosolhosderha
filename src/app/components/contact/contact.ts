import { Component, HostListener } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../services/blog.service';
import { StatsService } from '../../services/stats.service';
import { InstagramService } from '../../services/instagram.service';
import { YouTubeService } from '../../services/youtube.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterLink, UpperCasePipe, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class ContactComponent {
  isStuck = false;
  searchTerm = '';
  showAllArchive = false;

  name = '';
  email = '';
  subject = '';
  message = '';
  sent = false;
  sending = false;

  @HostListener('window:scroll')
  onScroll() {
    this.isStuck = window.scrollY > 320;
  }

  constructor(
    public blog: BlogService,
    private stats: StatsService,
    public instagram: InstagramService,
    public youtube: YouTubeService
  ) {}

  onSearch(event: Event) {
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
    this.searchTerm = label.split(' de ')[0];
  }

  sendMessage() {
    if (!this.name || !this.email || !this.subject || !this.message) return;

    this.sending = true;

    const mailtoLink = `mailto:rhakramer@gmail.com?subject=${encodeURIComponent(this.subject)}&body=${encodeURIComponent(
      `Nome: ${this.name}\nE-mail: ${this.email}\n\nMensagem:\n${this.message}`
    )}`;

    window.location.href = mailtoLink;

    this.sending = false;
    this.sent = true;
    this.name = '';
    this.email = '';
    this.subject = '';
    this.message = '';

    setTimeout(() => this.sent = false, 5000);
  }
}
