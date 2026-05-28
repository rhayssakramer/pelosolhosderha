import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../../services/blog.service';
import { Post } from '../../../models/post.model';

@Component({
  selector: 'app-post-editor',
  imports: [CommonModule, FormsModule],
  templateUrl: './post-editor.html',
  styleUrl: './post-editor.css'
})
export class PostEditorComponent {
  title = '';
  content = '';
  excerpt = '';
  coverImage = '';
  selectedTags: string[] = [];
  published = false;
  isEditing = false;
  editingId = '';

  constructor(
    public blog: BlogService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const post = this.blog.getPostById(id);
      if (post) {
        this.isEditing = true;
        this.editingId = id;
        this.title = post.title;
        this.content = post.content;
        this.excerpt = post.excerpt;
        this.coverImage = post.coverImage || '';
        this.selectedTags = [...post.tags];
        this.published = post.published;
      }
    }
  }

  toggleTag(tagName: string): void {
    const idx = this.selectedTags.indexOf(tagName);
    if (idx >= 0) {
      this.selectedTags.splice(idx, 1);
    } else {
      this.selectedTags.push(tagName);
    }
  }

  save(): void {
    if (!this.title.trim()) return;

    if (this.isEditing) {
      this.blog.updatePost(this.editingId, {
        title: this.title,
        content: this.content,
        excerpt: this.excerpt,
        coverImage: this.coverImage || undefined,
        tags: this.selectedTags,
        published: this.published
      });
    } else {
      this.blog.createPost({
        title: this.title,
        content: this.content,
        excerpt: this.excerpt,
        coverImage: this.coverImage || undefined,
        tags: this.selectedTags,
        published: this.published
      });
    }
    this.router.navigate(['/dashboard']);
  }
}
