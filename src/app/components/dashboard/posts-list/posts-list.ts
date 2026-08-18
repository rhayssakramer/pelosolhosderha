import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../../services/blog.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-posts-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './posts-list.html',
  styleUrl: './posts-list.css'
})
export class PostsListComponent {
  private toast = inject(ToastService);

  constructor(public blog: BlogService) {}

  sortedPosts = computed(() =>
    [...this.blog.posts()].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );

  deletePost(id: string): void {
    const post = this.blog.getPostById(id);
    if (confirm(`Tem certeza que deseja excluir "${post?.title}"?`)) {
      this.blog.deletePost(id);
      this.toast.success('Post removido com sucesso!');
    }
  }

  togglePublish(id: string, published: boolean): void {
    const post = this.blog.getPostById(id);
    this.blog.updatePost(id, { published: !published });
    const action = published ? 'despublicado' : 'publicado';
    this.toast.success(`Post ${action} com sucesso!`);
  }
}
