import { Component, signal, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../../services/blog.service';
import { Post } from '../../../models/post.model';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-post-editor',
  imports: [CommonModule, FormsModule, QuillModule],
  templateUrl: './post-editor.html',
  styleUrl: './post-editor.css'
})
export class PostEditorComponent {
  title = '';
  content = '';
  excerpt = '';
  coverImage = '';
  coverPreview = '';
  selectedTags: string[] = [];
  published = false;
  isEditing = false;
  editingId = '';
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  showEmojiPicker = false;

  emojis = ['😀', '😂', '🥹', '😍', '🥰', '😎', '🤩', '😢', '😭', '🥺', '😤', '🤔', '🫣', '🙃', '😇',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💕', '💖', '✨', '🌟', '⭐', '🔥', '💫',
    '🌸', '🌺', '🌻', '🌷', '🌹', '🍃', '🍂', '🌊', '☀️', '🌙', '🌈', '☁️', '🦋', '🐾', '🕊️',
    '📖', '📚', '🎬', '🎵', '🎨', '🖌️', '📷', '🎭', '☕', '🍷', '🧁', '🍰', '🫶', '👏', '🙏',
    '💪', '🤗', '💃', '🏠', '✈️', '🗺️', '📝', '💡', '🎯', '🏆', '🎉', '💐', '🎁', '👑', '💎'];

  quillModules = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['emoji'],
        ['clean']
      ],
      handlers: {
        'emoji': function() {}
      }
    }
  };

  quillEditor: any;

  onEditorCreated(editor: any): void {
    this.quillEditor = editor;
    // Setup emoji button in toolbar
    const toolbar = editor.getModule('toolbar');
    toolbar.addHandler('emoji', () => {
      this.showEmojiPicker = !this.showEmojiPicker;
    });
    // Style the emoji button
    const emojiBtn = document.querySelector('.ql-emoji') as HTMLElement;
    if (emojiBtn) {
      emojiBtn.innerHTML = '😊';
      emojiBtn.style.fontSize = '1.2rem';
      emojiBtn.style.position = 'relative';
      emojiBtn.style.left = '-5px';
      emojiBtn.style.top = '-5px';
    }
  }

  insertEmoji(emoji: string): void {
    if (this.quillEditor) {
      const range = this.quillEditor.getSelection(true);
      this.quillEditor.insertText(range.index, emoji);
      this.quillEditor.setSelection(range.index + emoji.length);
    }
    this.showEmojiPicker = false;
  }

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
        this.coverPreview = post.coverImage || '';
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

  onCoverFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.coverImage = result;
        this.coverPreview = result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeCover(): void {
    this.coverImage = '';
    this.coverPreview = '';
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
