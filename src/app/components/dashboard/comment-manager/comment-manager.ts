import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

export interface CommentForModeration {
  id: string;
  text: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  isGoogle: boolean;
  postId: string;
  post: {
    id: string;
    title: string;
  };
  userId?: string;
  parentId?: string;
  parent?: {
    id: string;
    name: string;
    text: string;
  };
  replies?: CommentForModeration[];
}

@Component({
  selector: 'app-comment-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-manager.html',
  styleUrls: ['./comment-manager.css'],
})
export class CommentManagerComponent implements OnInit {
  comments = signal<CommentForModeration[]>([]);
  filteredComments = signal<CommentForModeration[]>([]);
  loading = signal(false);
  selectedStatus = signal('');
  selectedPost = signal('');
  searchTerm = signal('');
  
  private readonly API_URL = `${environment.apiUrl}/comments`;

  statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'approved', label: 'Aprovados' },
    { value: 'hidden', label: 'Ocultos' },
    { value: 'removed', label: 'Removidos' },
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.loading.set(true);
    this.http
      .get<CommentForModeration[]>(`${this.API_URL}/admin/all`, {
        headers: {
          Authorization: `Bearer ${this.authService.getToken()}`,
        },
      })
      .subscribe({
        next: (data) => {
          this.comments.set(data);
          this.applyFilters();
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading comments:', error);
          this.loading.set(false);
        },
      });
  }

  // Helper methods for template
  getApprovedCount(): number {
    return this.comments().filter((c) => c.status === 'approved').length;
  }

  getHiddenCount(): number {
    return this.comments().filter((c) => c.status === 'hidden').length;
  }

  getRemovedCount(): number {
    return this.comments().filter((c) => c.status === 'removed').length;
  }

  getUniquePosts(): Array<{ id: string; title: string }> {
    const postsMap = new Map<string, string>();
    this.comments().forEach(comment => {
      if (!postsMap.has(comment.postId)) {
        postsMap.set(comment.postId, comment.post.title);
      }
    });
    return Array.from(postsMap.entries())
      .map(([id, title]) => ({ id, title }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  applyFilters(): void {
    let filtered = this.comments();

    // Filtrar por status
    if (this.selectedStatus()) {
      filtered = filtered.filter((c) => c.status === this.selectedStatus());
    }

    // Filtrar por post
    if (this.selectedPost()) {
      filtered = filtered.filter((c) => c.postId === this.selectedPost());
    }

    // Filtrar por termo de busca
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.text.toLowerCase().includes(term) ||
          c.name.toLowerCase().includes(term) ||
          c.post.title.toLowerCase().includes(term)
      );
    }

    this.filteredComments.set(filtered);
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onPostChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  updateCommentStatus(commentId: string, newStatus: string): void {
    this.http
      .patch(
        `${this.API_URL}/${commentId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${this.authService.getToken()}`,
          },
        }
      )
      .subscribe({
        next: () => {
          this.loadComments();
        },
        error: (error) => {
          console.error('Error updating comment status:', error);
        },
      });
  }

  deleteComment(commentId: string): void {
    if (!confirm('Tem certeza que deseja remover este comentário?')) {
      return;
    }

    this.http
      .delete(`${this.API_URL}/${commentId}`, {
        headers: {
          Authorization: `Bearer ${this.authService.getToken()}`,
        },
      })
      .subscribe({
        next: () => {
          this.loadComments();
        },
        error: (error) => {
          console.error('Error deleting comment:', error);
        },
      });
  }

  hardDeleteComment(commentId: string): void {
    if (
      !confirm(
        'Tem certeza que deseja deletar permanentemente este comentário? Esta ação não pode ser desfeita.'
      )
    ) {
      return;
    }

    this.http
      .delete(`${this.API_URL}/${commentId}/hard`, {
        headers: {
          Authorization: `Bearer ${this.authService.getToken()}`,
        },
      })
      .subscribe({
        next: () => {
          this.loadComments();
        },
        error: (error) => {
          console.error('Error deleting comment:', error);
        },
      });
  }

  hideComment(commentId: string): void {
    this.updateCommentStatus(commentId, 'hidden');
  }

  approveComment(commentId: string): void {
    this.updateCommentStatus(commentId, 'approved');
  }

  getStatusBadge(status: string): string {
    const badges: { [key: string]: string } = {
      approved: 'approved',
      hidden: 'hidden',
      removed: 'removed',
    };
    return badges[status] || 'approved';
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now.getTime() - commentDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
    if (diffHours > 0)
      return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    if (diffMinutes > 0)
      return `${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''} atrás`;
    return 'Agora mesmo';
  }
}
