import { Component, HostListener } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../services/blog.service';
import { StatsService } from '../../services/stats.service';
import { InstagramService } from '../../services/instagram.service';
import { YouTubeService } from '../../services/youtube.service';
import { ContactService } from '../../services/contact.service';
import { NewsletterComponent } from '../newsletter/newsletter';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterLink, UpperCasePipe, FormsModule, NewsletterComponent],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class ContactComponent {
  isStuck = false;
  searchTerm = '';
  showAllArchive = false;
  mobileMenuOpen = false;

  name = '';
  email = '';
  subject = '';
  message = '';
  sent = false;
  sending = false;
  error = '';

  @HostListener('window:scroll')
  onScroll() {
    this.isStuck = window.scrollY > 320;
  }

  constructor(
    public blog: BlogService,
    private stats: StatsService,
    public instagram: InstagramService,
    public youtube: YouTubeService,
    private contactService: ContactService
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
    // Validar campos
    if (!this.name || !this.email || !this.subject || !this.message) {
      this.error = 'Por favor, preencha todos os campos';
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.error = 'Email inválido';
      return;
    }

    // Validar comprimento mínimo da mensagem
    if (this.message.trim().length < 10) {
      this.error = 'Mensagem deve ter pelo menos 10 caracteres';
      return;
    }

    this.sending = true;
    this.error = '';

    this.contactService.sendMessage({
      name: this.name,
      email: this.email,
      subject: this.subject,
      message: this.message
    }).subscribe({
      next: () => {
        this.sending = false;
        this.sent = true;
        this.name = '';
        this.email = '';
        this.subject = '';
        this.message = '';
        this.error = '';
        
        // Limpar mensagem de sucesso após 5 segundos
        setTimeout(() => this.sent = false, 5000);
      },
      error: (err) => {
        this.sending = false;
        this.error = err.error?.error || 'Erro ao enviar mensagem. Tente novamente.';
        console.error('Erro ao enviar mensagem de contato:', err);
      }
    });
  }
}
