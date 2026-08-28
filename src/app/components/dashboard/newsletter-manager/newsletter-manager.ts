import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsletterService, Newsletter, NewsletterStats } from '../../../services/newsletter.service.js';
import { ToastService } from '../../../services/toast.service.js';

@Component({
  selector: 'app-newsletter-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './newsletter-manager.html',
  styleUrls: ['./newsletter-manager.css']
})
export class NewsletterManagerComponent implements OnInit {
  newsletters: Newsletter[] = [];
  stats: NewsletterStats | null = null;
  loading = false;
  searching = false;
  searchTerm = '';
  selectedStatus = 'active';
  filterStatuses = ['active', 'unsubscribed', 'bounced'];

  private newsletterService = inject(NewsletterService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.loadNewsletters();
    this.loadStats();
  }

  loadNewsletters(): void {
    this.loading = true;
    this.newsletterService.getAllSubscribers().subscribe({
      next: (data: Newsletter[]) => {
        this.newsletters = data;
        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
        this.toastService.show('Erro ao carregar inscritos', 'error');
      }
    });
  }

  loadStats(): void {
    this.newsletterService.getStats().subscribe({
      next: (data: NewsletterStats) => {
        this.stats = data;
      },
      error: (error: any) => {
        this.toastService.show('Erro ao carregar estatísticas', 'error');
      }
    });
  }

  get filteredNewsletters(): Newsletter[] {
    return this.newsletters.filter(newsletter => {
      const matchesStatus = this.selectedStatus === '' || newsletter.status === this.selectedStatus;
      const matchesSearch = this.searchTerm === '' || 
        newsletter.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  updateStatus(newsletter: Newsletter, newStatus: string): void {
    if (newStatus === newsletter.status) {
      return;
    }

    this.newsletterService.updateStatus(newsletter.id, newStatus).subscribe({
      next: (updated: Newsletter) => {
        const index = this.newsletters.findIndex(n => n.id === newsletter.id);
        if (index !== -1) {
          this.newsletters[index] = updated;
        }
        this.loadStats();
        this.toastService.show('Status atualizado com sucesso', 'success');
      },
      error: (error: any) => {
        this.toastService.show('Erro ao atualizar status', 'error');
      }
    });
  }

  deleteNewsletter(newsletter: Newsletter): void {
    if (!confirm(`Tem certeza que deseja remover ${newsletter.email}?`)) {
      return;
    }

    this.newsletterService.deleteSubscriber(newsletter.id).subscribe({
      next: () => {
        this.newsletters = this.newsletters.filter(n => n.id !== newsletter.id);
        this.loadStats();
        this.toastService.show('Inscrito removido com sucesso', 'success');
      },
      error: (error: any) => {
        this.toastService.show('Erro ao remover inscrito', 'error');
      }
    });
  }

  exportToCSV(): void {
    const csvContent = [
      ['Email', 'Status', 'Data de Inscrição'],
      ...this.filteredNewsletters.map(n => [
        n.email,
        n.status,
        new Date(n.createdAt).toLocaleDateString('pt-BR')
      ])
    ]
      .map((row: any) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `newsletter-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.toastService.show('Dados exportados com sucesso', 'success');
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Ativo',
      'unsubscribed': 'Desinscrito',
      'bounced': 'Devolvido'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'active': '#22c55e',
      'unsubscribed': '#f59e0b',
      'bounced': '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
