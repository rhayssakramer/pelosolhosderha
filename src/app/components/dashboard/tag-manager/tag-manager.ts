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

  constructor(public blog: BlogService) {}

  addTag(): void {
    if (this.newTagName.trim()) {
      this.blog.createTag(this.newTagName.trim(), '#8c6add');
      this.newTagName = '';
    }
  }

  deleteTag(id: string): void {
    if (confirm('Excluir esta tag?')) {
      this.blog.deleteTag(id);
    }
  }

  moveUp(index: number): void {
    if (index <= 0) return;
    const tags = [...this.blog.tags()];
    [tags[index - 1], tags[index]] = [tags[index], tags[index - 1]];
    this.blog.tags.set(tags);
    this.blog.reorderTags(tags.map(t => t.id));
  }

  moveDown(index: number): void {
    const tags = [...this.blog.tags()];
    if (index >= tags.length - 1) return;
    [tags[index], tags[index + 1]] = [tags[index + 1], tags[index]];
    this.blog.tags.set(tags);
    this.blog.reorderTags(tags.map(t => t.id));
  }
}
