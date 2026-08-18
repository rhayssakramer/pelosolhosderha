import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { GoogleAuthService, GoogleUser } from '../../services/google-auth.service';

declare var google: any;

export interface Comment {
  id: string;
  text: string;
  name: string;
  avatar?: string;
  createdAt: string;
  status: string;
  isGoogle: boolean;
  postId: string;
  userId?: string;
  parentId?: string;
  replies?: Comment[];
  updatedAt: string;
}

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comments.html',
  styleUrls: ['./comments.css']
})
export class CommentsComponent implements OnInit {
  @Input() postId!: string;

  comments = signal<Comment[]>([]);
  newCommentText = signal('');
  loading = signal(false);
  submitLoading = signal(false);
  showGoogleLogin = signal(false);
  currentUser = signal<GoogleUser | null>(null);
  replyingTo = signal<string | null>(null);
  replyTexts = signal<Map<string, string>>(new Map());

  private readonly API_URL = `${environment.apiUrl}/comments`;

  constructor(
    private http: HttpClient,
    private googleAuthService: GoogleAuthService
  ) {
    this.currentUser.set(this.googleAuthService.googleUser());
  }

  ngOnInit(): void {
    this.loadComments();
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn(): void {
    // Aguardar o SDK do Google ser carregado
    let attempts = 0;
    const tryRender = () => {
      if (typeof google !== 'undefined' && google.accounts) {
        this.renderGoogleButton();
      } else if (attempts < 20) {
        attempts++;
        setTimeout(tryRender, 100);
      }
    };
    tryRender();
  }

  private renderGoogleButton(): void {
    const googleButtonContainer = document.getElementById('google_signin_button');
    if (!googleButtonContainer) return;

    try {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => this.handleGoogleLogin(response),
      });

      google.accounts.id.renderButton(
        googleButtonContainer,
        {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          logo_alignment: 'center',
        }
      );
    } catch (error) {
      console.error('Error rendering Google button:', error);
    }
  }

  private handleGoogleLogin(response: any): void {
    if (response.credential) {
      this.submitLoading.set(true);
      this.googleAuthService.loginWithGoogle(response.credential)
        .then((user) => {
          this.currentUser.set(user);
          this.showGoogleLogin.set(false);
          this.submitLoading.set(false);
        })
        .catch((error) => {
          console.error('Login failed:', error);
          this.submitLoading.set(false);
        });
    }
  }

  loadComments(): void {
    if (!this.postId) return;

    this.loading.set(true);
    this.http
      .get<Comment[]>(`${this.API_URL}/${this.postId}`)
      .subscribe({
        next: (data) => {
          this.comments.set(data);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading comments:', error);
          this.loading.set(false);
        },
      });
  }

  submitComment(): void {
    const text = this.newCommentText().trim();
    if (!text || !this.currentUser()) {
      alert('Por favor, conecte com Google e escreva um comentário');
      return;
    }

    this.submitLoading.set(true);
    const user = this.currentUser()!;

    this.http
      .post<Comment>(`${this.API_URL}/${this.postId}`, {
        text,
        name: user.name,
        avatar: user.avatar,
        parentId: null,
      })
      .subscribe({
        next: (comment) => {
          this.comments.update((comments) => [comment, ...comments]);
          this.newCommentText.set('');
          this.submitLoading.set(false);
        },
        error: (error) => {
          console.error('Error submitting comment:', error);
          this.submitLoading.set(false);
        },
      });
  }

  updateReplyText(commentId: string, text: string): void {
    const newMap = new Map(this.replyTexts());
    if (text) {
      newMap.set(commentId, text);
    } else {
      newMap.delete(commentId);
    }
    this.replyTexts.set(newMap);
  }

  getReplyText(commentId: string): string {
    return this.replyTexts().get(commentId) || '';
  }

  submitReply(parentId: string): void {
    const text = this.getReplyText(parentId).trim();
    if (!text || !this.currentUser()) {
      alert('Por favor, escreva uma resposta');
      return;
    }

    this.submitLoading.set(true);
    const user = this.currentUser()!;

    this.http
      .post<Comment>(`${this.API_URL}/${this.postId}`, {
        text,
        name: user.name,
        avatar: user.avatar,
        parentId,
      })
      .subscribe({
        next: (reply) => {
          this.comments.update((comments) => {
            return comments.map((comment) => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), reply],
                };
              }
              return comment;
            });
          });

          this.updateReplyText(parentId, '');
          this.replyingTo.set(null);
          this.submitLoading.set(false);
        },
        error: (error) => {
          console.error('Error submitting reply:', error);
          this.submitLoading.set(false);
        },
      });
  }

  startReply(commentId: string): void {
    this.replyingTo.set(this.replyingTo() === commentId ? null : commentId);
  }

  logout(): void {
    this.googleAuthService.logout();
    this.currentUser.set(null);
    this.replyingTo.set(null);
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now.getTime() - commentDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
    if (diffHours > 0) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    if (diffMinutes > 0) return `${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''} atrás`;
    return 'Agora mesmo';
  }
}
