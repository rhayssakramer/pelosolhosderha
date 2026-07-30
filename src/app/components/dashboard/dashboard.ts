import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  constructor(public auth: AuthService, public blog: BlogService) {}

  ngOnInit(): void {
    // Reload tags and posts when dashboard is opened to ensure freshness from server
    this.blog.reloadTags();
    this.blog.reloadPosts();
  }
}
