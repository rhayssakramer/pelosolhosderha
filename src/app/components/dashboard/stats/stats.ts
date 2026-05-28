import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatsService } from '../../../services/stats.service';
import { BlogService } from '../../../services/blog.service';

@Component({
  selector: 'app-dashboard-stats',
  imports: [CommonModule, RouterLink],
  templateUrl: './stats.html',
  styleUrl: './stats.css'
})
export class DashboardStatsComponent {
  constructor(public stats: StatsService, public blog: BlogService) {}

  getPostTitle(postId: string): string {
    return this.blog.getPostById(postId)?.title || 'Post removido';
  }
}
