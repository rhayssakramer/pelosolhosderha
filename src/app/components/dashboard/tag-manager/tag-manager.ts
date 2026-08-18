import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../../services/blog.service';
import { ToastService } from '../../../services/toast.service';

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
  
  private toast = inject(ToastService);

  constructor(public blog: BlogService) {}

  addTag(): void {
    if (this.newTagName.trim()) {
      this.blog.createTag(this.newTagName.trim(), '#8c6add');
      this.toast.success(`Tag "${this.newTagName.trim()}" criada com sucesso!`);
      this.newTagName = '';
    } else {
      this.toast.warning('Por favor, insira um nome para a tag.');
    }
  }

  deleteTag(id: string): void {
    const tag = this.blog.tags().find(t => t.id === id);
    if (confirm(`Excluir a tag "${tag?.name}"?`)) {
      this.blog.deleteTag(id);
      this.toast.success(`Tag "${tag?.name}" removida com sucesso!`);
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
    this.toast.success('Ordem das tags atualizada!');
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
