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
  dragIndex: number | null = null;
  dropIndex: number | null = null;

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

  onDragStart(index: number): void {
    this.dragIndex = index;
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    this.dropIndex = index;
  }

  onDragLeave(): void {
    this.dropIndex = null;
  }

  onDrop(event: DragEvent, index: number): void {
    event.preventDefault();
    if (this.dragIndex === null || this.dragIndex === index) {
      this.resetDrag();
      return;
    }

    const tags = [...this.blog.tags()];
    const [moved] = tags.splice(this.dragIndex, 1);
    tags.splice(index, 0, moved);
    this.blog.tags.set(tags);
    this.blog.reorderTags(tags.map(t => t.id));
    this.resetDrag();
  }

  onDragEnd(): void {
    this.resetDrag();
  }

  private resetDrag(): void {
    this.dragIndex = null;
    this.dropIndex = null;
  }
}
