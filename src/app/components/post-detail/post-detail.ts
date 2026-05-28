import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { StatsService } from '../../services/stats.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css'
})
export class PostDetailComponent {
  post?: Post;

  constructor(private route: ActivatedRoute, private blog: BlogService, private stats: StatsService) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.post = this.blog.getPostById(id);
      if (this.post) {
        this.stats.trackView(id);
      }
    }
  }
}
