import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../../services/blog.service';

@Component({
  selector: 'app-posts-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './posts-list.html',
  styleUrl: './posts-list.css'
})
export class PostsListComponent {
  constructor(public blog: BlogService) {}

  sortedPosts = computed(() =>
    [...this.blog.posts()].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );

  deletePost(id: string): void {
    if (confirm('Tem certeza que deseja excluir esta postagem?')) {
      this.blog.deletePost(id);
    }
  }

  togglePublish(id: string, published: boolean): void {
    this.blog.updatePost(id, { published: !published });
  }
}
