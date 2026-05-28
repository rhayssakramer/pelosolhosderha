import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstagramService } from '../../../services/instagram.service';

@Component({
  selector: 'app-instagram-manager',
  imports: [CommonModule],
  templateUrl: './instagram-manager.html',
  styleUrl: './instagram-manager.css'
})
export class InstagramManagerComponent {
  constructor(public instagram: InstagramService) {}

  refresh(): void {
    localStorage.removeItem('blog_instagram_cache');
    this.instagram.fetchPosts();
  }
}
