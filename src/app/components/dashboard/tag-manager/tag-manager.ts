import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../../services/blog.service';

@Component({
  selector: 'app-tag-manager',
  imports: [CommonModule, FormsModule],
  templateUrl: './tag-manager.html',
  styleUrl: './tag-manager.css'
})
export class TagManagerComponent {
  newTagName = '';
  newTagColor = '#e94560';

  constructor(public blog: BlogService) {}

  addTag(): void {
    if (this.newTagName.trim()) {
      this.blog.createTag(this.newTagName.trim(), this.newTagColor);
      this.newTagName = '';
      this.newTagColor = '#e94560';
    }
  }

  deleteTag(id: string): void {
    if (confirm('Excluir esta tag?')) {
      this.blog.deleteTag(id);
    }
  }
}
