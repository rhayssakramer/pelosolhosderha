import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post } from '../../../models/post.model';
import { SafePipe } from '../../../pipes/safe.pipe';

@Component({
  selector: 'app-post-card',
  imports: [CommonModule, RouterLink, SafePipe],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css'
})
export class PostCardComponent {
  @Input({ required: true }) post!: Post;

  get excerptText(): string {
    const html = this.post.excerpt || this.post.content || '';
    return html
      .replace(/[\u00AD\u200B\u200C\u200D\uFEFF]/g, '') // invisible chars
      .replace(/<[^>]+>/g, ' ')                          // all tags → space
      .replace(/&nbsp;/gi, ' ')                          // &nbsp; → space
      .replace(/&amp;/gi, '&')                           // &amp; → &
      .replace(/&lt;/gi, '<')                            // &lt; → <
      .replace(/&gt;/gi, '>')                            // &gt; → >
      .replace(/&quot;/gi, '"')                          // &quot; → "
      .replace(/&#39;/gi, "'")                           // &#39; → '
      .replace(/&[a-z]+;/gi, '')                         // remaining entities
      .replace(/\s+/g, ' ')                              // collapse spaces
      .trim();
  }
}
