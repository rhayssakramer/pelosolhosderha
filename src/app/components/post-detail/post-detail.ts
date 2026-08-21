import { Component, HostListener, ViewEncapsulation, signal, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { StatsService } from '../../services/stats.service';
import { InstagramService } from '../../services/instagram.service';
import { YouTubeService } from '../../services/youtube.service';
import { GoogleAuthService, GoogleUser } from '../../services/google-auth.service';
import { Post } from '../../models/post.model';
import { VideoEmbedPipe } from '../../pipes/video-embed.pipe';
import { CommentThreadComponent } from './comment-thread';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-post-detail',
  imports: [CommonModule, RouterLink, VideoEmbedPipe, FormsModule, CommentThreadComponent],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css',
  encapsulation: ViewEncapsulation.None
})
export class PostDetailComponent implements OnInit, AfterViewInit {
  post?: Post;
  previousPost?: Post;
  nextPost?: Post;
  isStuck = false;
  showAllArchive = false;
  searchTerm = '';
  currentUrl = '';
  mobileMenuOpen = false;

  // Comentários
  currentUser = signal<GoogleUser | null>(null);
  submitLoading = signal(false);
  replyingTo = signal<string | null>(null);
  expandedReplies = signal<Set<string>>(new Set());
  
  // Formulários de comentários
  commentForm = {
    name: '',
    email: '',
    website: '',
    text: '',
    saveData: false
  };

  replyForm = {
    name: '',
    email: '',
    website: '',
    text: '',
    saveData: false
  };

  private readonly API_URL = `${environment.apiUrl}/comments`;

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
    private titleService: Title,
    private googleAuthService: GoogleAuthService,
    private http: HttpClient
  ) {
    this.currentUser.set(this.googleAuthService.googleUser());
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (typeof window !== 'undefined') {
        this.currentUrl = window.location.href;
      }
      if (id) {
        this.post = this.blog.getPostById(id);
        if (this.post) {
          this.loadPostRelations(id);
        } else {
          // Post not in local cache (e.g., accessed directly via Pinterest link).
          // Fetch it directly from the API.
          this.blog.getPostByIdFromApi(id).subscribe({
            next: (post) => {
              if (post) {
                this.post = post;
                this.loadPostRelations(id);
              }
            },
            error: (err) => console.error('Erro ao buscar post da API:', err)
          });
        }
      }
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
      }
    });
  }

  private loadPostRelations(id: string): void {
    if (!this.post) return;
    this.stats.trackView(id);
    this.setMetaTags(this.post);
    
    // Carregar comentários do backend
    this.http.get<any[]>(`${this.API_URL}/${id}`).subscribe({
      next: (comments) => {
        if (this.post) {
          this.post.comments = comments;
        }
      },
      error: (err) => console.error('Erro ao carregar comentários:', err)
    });
    
    const allPosts = this.blog.getPublishedPosts()
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const idx = allPosts.findIndex(p => p.id === id);
    this.previousPost = idx > 0 ? allPosts[idx - 1] : undefined;
    this.nextPost = idx < allPosts.length - 1 ? allPosts[idx + 1] : undefined;
  }

  private setMetaTags(post: Post): void {
    const siteUrl = environment.siteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    const pageUrl = `${siteUrl}/post/${post.id}`;
    const imageUrl = this.getProxiedImageUrl(post.coverImage || '');
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
    // Pinterest-specific meta tags to ensure PIN redirects to post, not image
    this.meta.updateTag({ property: 'pin:media', content: imageUrl });
    this.meta.updateTag({ property: 'pin:url', content: pageUrl });
    this.meta.updateTag({ property: 'pin:description', content: description });
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
    // Already a full URL (Azure Blob Storage, external, etc.)
    if (url.startsWith('http')) return url;
    // Relative URL: resolve through Vercel proxy or API base
    const base = this.getApiBase() || environment.siteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    return base + (url.startsWith('/') ? url : '/' + url);
  }

  shareOnPinterest(): void {
    if (typeof window === 'undefined') return;
    const baseSiteUrl = environment.siteUrl || window.location.origin;
    const postId = this.post?.id;

    // Pin URL points directly to the post page, so clicking "Visit" on Pinterest
    // takes the user straight to the post. The cover image and description are
    // passed explicitly to Pinterest below, so we don't rely on server-side
    // Open Graph meta tags.
    const shareUrl = `${baseSiteUrl}/post/${postId}`;

    // The image displayed in the pin (blob storage - publicly accessible)
    const coverImageUrl = this.getProxiedImageUrl(this.post?.coverImage || '');

    const title = this.post?.title || '';
    const excerpt = this.post?.excerpt || '';
    const description = excerpt ? `${title} - ${excerpt}` : title;
    const trimmedDescription = description.length > 500 ? description.substring(0, 497) + '...' : description;

    // Use Pinterest SDK overlay (PinUtils.pinOne)
    const PinUtils = (window as any).PinUtils;
    if (PinUtils && PinUtils.pinOne) {
      PinUtils.pinOne({
        url: shareUrl,
        media: coverImageUrl,
        description: trimmedDescription
      });
      return;
    }

    // SDK not ready yet - wait for it to load (it's async)
    this.waitForPinUtils(3000).then(PU => {
      PU.pinOne({
        url: shareUrl,
        media: coverImageUrl,
        description: trimmedDescription
      });
    }).catch(() => {
      window.location.href = `https://www.pinterest.com/pin-builder/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(coverImageUrl)}&description=${encodeURIComponent(trimmedDescription)}`;
    });
  }

  /**
   * Returns an image URL for sharing on social media (Pinterest, etc.).
   * Azure Blob Storage URLs are already publicly accessible.
   * For relative paths or old Azure Container App URLs, proxy through Vercel.
   */
  private getProxiedImageUrl(url: string): string {
    if (!url) return '';
    const siteUrl = environment.siteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    // Azure Blob Storage URLs are directly accessible and Pinterest can fetch them
    if (url.includes('.blob.core.windows.net')) {
      return url;
    }
    // If it's already a full Azure Container App URL, rewrite it to go through site proxy
    if (url.includes('azurecontainerapps.io')) {
      const uploadsPath = url.split('/uploads/')[1];
      if (uploadsPath) {
        return `${siteUrl}/uploads/${uploadsPath}`;
      }
    }
    // If it's a relative path like /uploads/abc.jpg
    if (url.startsWith('/uploads/')) {
      return `${siteUrl}${url}`;
    }
    if (url.startsWith('uploads/')) {
      return `${siteUrl}/${url}`;
    }
    // Already a full URL to somewhere else
    if (url.startsWith('http')) return url;
    // Default: prefix with site URL
    return `${siteUrl}${url.startsWith('/') ? url : '/' + url}`;
  }

  private waitForPinUtils(timeout: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        const PU = (window as any).PinUtils;
        if (PU && PU.pinOne) {
          resolve(PU);
        } else if (Date.now() - start > timeout) {
          reject();
        } else {
          setTimeout(check, 200);
        }
      };
      check();
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

  // Métodos de comentários
  ngOnInit(): void {
    this.loadSavedCommentData();
  }

  ngAfterViewInit(): void {
    this.initializeGoogleSignIn();
  }

  private loadSavedCommentData(): void {
    // Carregar dados salvos do localStorage
    const name = localStorage.getItem('comment_name') || '';
    const email = localStorage.getItem('comment_email') || '';
    const website = localStorage.getItem('comment_website') || '';
    const saveData = localStorage.getItem('comment_saveData') === 'true';
    const googleAvatar = localStorage.getItem('google_avatar');
    const isGoogleAuthenticated = localStorage.getItem('google_authenticated') === 'true';
    
    this.commentForm.name = name;
    this.commentForm.email = email;
    this.commentForm.website = website;
    this.commentForm.saveData = saveData;
    
    // Também preencher formulário de resposta
    this.replyForm.name = name;
    this.replyForm.email = email;
    this.replyForm.website = website;
    this.replyForm.saveData = saveData;
    
    // Se foi autenticado com Google anteriormente, restaurar dados
    if (isGoogleAuthenticated && name && email) {
      console.log('✅ Dados do Google restaurados do localStorage');
      this.currentUser.set({
        name: name,
        email: email,
        avatar: googleAvatar || undefined,
      } as GoogleUser);
    }
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
    // Renderizar no container principal
    const googleButtonContainer = document.getElementById('google_signin_button');

    if (!googleButtonContainer) {
      console.error('❌ Container google_signin_button não encontrado no DOM');
      return;
    }

    try {
      // Apenas inicializar uma vez
      if (!this.googleInitialized) {
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (response: any) => this.handleGoogleLogin(response),
        });
        this.googleInitialized = true;
      }

      // Renderizar botão principal
      google.accounts.id.renderButton(
        googleButtonContainer,
        {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          logo_alignment: 'center',
        }
      );
      console.log('✅ Botão Google Sign-In renderizado com sucesso');

      // Também renderizar com Google One Tap
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('One Tap não foi exibido ou foi pulado');
        }
      });
    } catch (error) {
      console.error('❌ Erro ao renderizar Google Sign-In:', error);
    }
  }
  
  private googleInitialized = false;

  private handleGoogleLogin(response: any): void {
    if (response.credential) {
      console.log('🔐 Google Sign-In iniciado');
      console.log('Credential:', response.credential.substring(0, 50) + '...');
      
      this.submitLoading.set(true);
      
      // Enviar ID token para o backend
      this.http
        .post<any>(`${environment.apiUrl}/auth/google/login`, { 
          token: response.credential,
          accessToken: response.accessToken || null
        })
        .subscribe({
          next: (backendResponse) => {
            console.log('✅ Backend response:', backendResponse);
            const user = backendResponse.user;
            
            console.log('User data received:');
            console.log('  Name:', user.name);
            console.log('  Email:', user.email);
            console.log('  Avatar:', user.avatar);
            
            this.currentUser.set(user);
            
            // Preencher ambos os formulários (comentários e respostas)
            this.commentForm.name = user.name;
            this.commentForm.email = user.email;
            this.replyForm.name = user.name;
            this.replyForm.email = user.email;
            
            // Salvar dados do Google no localStorage se checkbox estiver marcado
            if (this.commentForm.saveData || this.replyForm.saveData) {
              localStorage.setItem('comment_name', user.name);
              localStorage.setItem('comment_email', user.email);
              localStorage.setItem('google_authenticated', 'true');
              localStorage.setItem('google_avatar', user.avatar || '');
              console.log('✅ Dados do Google salvos no localStorage');
            }
            
            console.log('✅ Formulários preenchidos com dados do Google');
            
            this.submitLoading.set(false);
          },
          error: (error) => {
            console.error('❌ Backend error:', error);
            if (error.error?.error) {
              alert('Erro: ' + error.error.error);
            } else {
              alert('Erro ao conectar com Google');
            }
            this.submitLoading.set(false);
          }
        });
    } else {
      console.error('❌ No credential in response');
    }
  }

  submitNewComment(): void {
    const text = this.commentForm.text.trim();
    const name = this.commentForm.name.trim();
    const email = this.commentForm.email.trim();
    
    console.log('📝 submitNewComment chamado - text:', !!text, 'name:', !!name, 'email:', !!email);
    
    if (!text || !name || !email) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!this.post) {
      console.error('❌ Post não encontrado');
      return;
    }

    this.submitLoading.set(true);
    
    // Determinar se é comentário Google ou não
    const isGoogle = this.currentUser() !== null;
    const avatar = isGoogle ? this.currentUser()!.avatar : undefined;

    const payload = {
      text,
      name,
      email,
      website: this.commentForm.website.trim() || null,
      avatar,
      parentId: null
    };

    console.log('📨 Enviando comentário para:', `${this.API_URL}/${this.post.id}`, 'payload:', payload);

    this.http
      .post<any>(`${this.API_URL}/${this.post.id}`, payload)
      .subscribe({
        next: (comment) => {
          console.log('✅ Comentário enviado com sucesso:', comment);
          // Recarregar todos os comentários do backend para garantir sync
          this.reloadCommentsAfterSubmit();
          
          // Limpar formulário
          this.commentForm.text = '';
          if (!this.currentUser() && this.commentForm.saveData) {
            // Salvar dados no localStorage
            localStorage.setItem('comment_name', this.commentForm.name);
            localStorage.setItem('comment_email', this.commentForm.email);
            localStorage.setItem('comment_website', this.commentForm.website);
          } else if (!this.currentUser()) {
            // Limpar dados se não salvar
            this.commentForm.name = '';
            this.commentForm.email = '';
            this.commentForm.website = '';
          }
          
          this.submitLoading.set(false);
        },
        error: (error) => {
          console.error('❌ Error submitting comment:', error);
          console.error('Status:', error.status);
          console.error('Error body:', error.error);
          
          // Mostrar erro específico
          let errorMsg = 'Erro ao enviar comentário';
          if (error.error?.error) {
            errorMsg = error.error.error;
            if (error.error.details) {
              errorMsg += '\nDetalhes: ' + error.error.details;
            }
          } else if (error.error?.message) {
            errorMsg = error.error.message;
          }
          
          alert(errorMsg);
          this.submitLoading.set(false);
        },
      });
  }

  private findCommentRecursively(comments: any[] | undefined, commentId: string): any {
    if (!comments) return null;
    for (const comment of comments) {
      if (comment.id === commentId) {
        return comment;
      }
      const found = this.findCommentRecursively(comment.replies, commentId);
      if (found) return found;
    }
    return null;
  }

  private reloadCommentsAfterSubmit(): void {
    if (!this.post) return;
    // Recarregar todos os comentários do backend
    this.http.get<any[]>(`${this.API_URL}/${this.post.id}`).subscribe({
      next: (comments) => {
        if (this.post) {
          this.post.comments = comments;
          console.log('✅ Comentários recarregados automaticamente');
        }
      },
      error: (err) => console.error('Erro ao recarregar comentários:', err)
    });
  }

  submitReply(parentId: string): void {
    console.log('📤 submitReply chamado para parentId:', parentId);
    console.log('replyForm:', this.replyForm);
    
    // Usar sempre replyForm quando há resposta ativa
    const text = this.replyForm.text.trim();
    const name = this.replyForm.name.trim();
    const email = this.replyForm.email.trim();
    
    console.log('Validando - text:', !!text, 'name:', !!name, 'email:', !!email, 'post:', !!this.post);
    
    if (!text || !name || !email || !this.post) {
      alert('Por favor, preencha todos os campos obrigatórios');
      console.error('Validação falhou - text:', text, 'name:', name, 'email:', email);
      return;
    }

    // Salvar dados se solicitado
    if (this.replyForm.saveData) {
      localStorage.setItem('comment_name', name);
      localStorage.setItem('comment_email', email);
      localStorage.setItem('comment_website', this.replyForm.website);
      localStorage.setItem('comment_saveData', 'true');
    } else {
      localStorage.removeItem('comment_name');
      localStorage.removeItem('comment_email');
      localStorage.removeItem('comment_website');
      localStorage.removeItem('comment_saveData');
    }

    this.submitLoading.set(true);
    
    // Determinar se é resposta Google ou não
    const isGoogle = this.currentUser() !== null;
    const avatar = isGoogle ? this.currentUser()!.avatar : undefined;
    
    const payload = {
      text,
      name,
      avatar,
      parentId,
      isGoogle
    };
    
    console.log('📨 Enviando payload:', payload);
    console.log('API URL:', `${this.API_URL}/${this.post.id}`);

    this.http
      .post<any>(`${this.API_URL}/${this.post.id}`, {
        text,
        name,
        email,
        website: this.replyForm.website.trim() || null,
        avatar,
        parentId
      })
      .subscribe({
        next: (reply) => {
          console.log('✅ Resposta enviada com sucesso:', reply);
          
          // Recarregar todos os comentários do backend para garantir sync
          this.reloadCommentsAfterSubmit();

          this.replyingTo.set(null);
          this.replyForm = { name: '', email: '', website: '', text: '', saveData: false };
          this.submitLoading.set(false);
        },
        error: (error) => {
          console.error('❌ Erro ao enviar resposta:', error);
          console.error('Status:', error.status);
          console.error('Detalhes do erro:', error.error || error.message);
          if (error.error?.error) {
            alert('Erro ao enviar resposta: ' + error.error.error);
          } else {
            alert('Erro ao enviar resposta. Verifique o console (F12).');
          }
          this.submitLoading.set(false);
        },
      });
  }

  startReply(commentId: string): void {
    this.replyingTo.set(this.replyingTo() === commentId ? null : commentId);
    
    if (this.replyingTo() === commentId) {
      // Se temos usuário do Google, preencher o formulário
      if (this.currentUser()) {
        this.replyForm = {
          name: this.currentUser()!.name,
          email: this.currentUser()!.email,
          website: localStorage.getItem('comment_website') || '',
          text: '',
          saveData: localStorage.getItem('comment_saveData') === 'true'
        };
      } else {
        // Carregar dados salvos do localStorage
        this.replyForm = {
          name: localStorage.getItem('comment_name') || '',
          email: localStorage.getItem('comment_email') || '',
          website: localStorage.getItem('comment_website') || '',
          text: '',
          saveData: localStorage.getItem('comment_saveData') === 'true'
        };
      }
    }
  }

  cancelReply(): void {
    this.replyingTo.set(null);
    this.replyForm = { name: '', email: '', website: '', text: '', saveData: false };
  }

  logoutGoogle(): void {
    this.currentUser.set(null);
    localStorage.removeItem('google_user');
  }

  toggleReplyExpanded(replyId: string): void {
    const expanded = new Set(this.expandedReplies());
    if (expanded.has(replyId)) {
      expanded.delete(replyId);
    } else {
      expanded.add(replyId);
    }
    this.expandedReplies.set(expanded);
  }

  isReplyExpanded(replyId: string): boolean {
    return this.expandedReplies().has(replyId);
  }

  handleSubmitReply(event: { parentId: string; formData: any }): void {
    this.submitReply(event.parentId);
  }

  logoutUser(): void {
    this.googleAuthService.logout();
    this.currentUser.set(null);
    // Limpar campos do Google do formulário
    this.commentForm.name = localStorage.getItem('comment_name') || '';
    this.commentForm.email = localStorage.getItem('comment_email') || '';
  }
}
