import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleUser } from '../../services/google-auth.service';

export interface CommentData {
  id: string;
  name: string;
  email?: string;
  text: string;
  avatar?: string;
  date: string;
  replies?: CommentData[];
}

export interface ReplyFormData {
  name: string;
  email: string;
  website: string;
  text: string;
  saveData?: boolean;
}

@Component({
  selector: 'app-comment-thread',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-thread.html',
  styleUrl: '../post-detail/post-detail.css'
})
export class CommentThreadComponent {
  @Input() comments: CommentData[] = [];
  @Input() postId!: string;
  @Input() isReply = false;
  @Input() replyingTo: string | null = null;
  @Input() replyFormData: ReplyFormData = { name: '', email: '', website: '', text: '' };
  @Input() currentUser: GoogleUser | null = null;
  
  @Output() startReplyEvent = new EventEmitter<string>();
  @Output() submitReplyEvent = new EventEmitter<{ parentId: string; formData: ReplyFormData }>();
  @Output() cancelReplyEvent = new EventEmitter<void>();

  expandedReplies = signal<Set<string>>(new Set());

  toggleExpanded(commentId: string): void {
    const expanded = new Set(this.expandedReplies());
    if (expanded.has(commentId)) {
      expanded.delete(commentId);
    } else {
      expanded.add(commentId);
    }
    this.expandedReplies.set(expanded);
  }

  isExpanded(commentId: string): boolean {
    return this.expandedReplies().has(commentId);
  }

  startReply(commentId: string): void {
    this.startReplyEvent.emit(commentId);
  }

  submitReply(parentId: string): void {
    this.submitReplyEvent.emit({ parentId, formData: this.replyFormData });
  }

  cancelReply(): void {
    this.cancelReplyEvent.emit();
  }

  onStartReply(commentId: string): void {
    this.startReplyEvent.emit(commentId);
  }

  onSubmitReply(event: { parentId: string; formData: ReplyFormData }): void {
    this.submitReplyEvent.emit(event);
  }

  onCancelReply(): void {
    this.cancelReplyEvent.emit();
  }

  loadPlaceholder = (event: any) => {
    event.target.style.display = 'none';
  };
}
