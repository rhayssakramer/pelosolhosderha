import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post } from '../../../models/post.model';
import { SafePipe } from '../../../pipes/safe.pipe';

@Component({
  selector: 'app-post-card',
  imports: [CommonModule, RouterLink, SafePipe],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
  encapsulation: ViewEncapsulation.None
})
export class PostCardComponent {
  @Input({ required: true }) post!: Post;
}
