import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../../services/blog.service';
import { BlogSettings } from '../../../models/post.model';

@Component({
  selector: 'app-blog-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './blog-settings.html',
  styleUrl: './blog-settings.css'
})
export class BlogSettingsComponent {
  settings: BlogSettings;

  constructor(private blog: BlogService) {
    this.settings = { ...this.blog.settings() };
  }

  save(): void {
    this.blog.updateSettings(this.settings);
  }
}
