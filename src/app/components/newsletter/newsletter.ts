import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewsletterService } from '../../services/newsletter.service.js';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './newsletter.html',
  styleUrls: ['./newsletter.css']
})
export class NewsletterComponent implements OnInit {
  form: FormGroup;
  loading = false;
  submitted = false;

  private fb = inject(FormBuilder);
  private newsletterService = inject(NewsletterService);

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.submitted = true;
    this.loading = true;

    const email = this.form.get('email')?.value;
    this.newsletterService.subscribe(email).subscribe({
      next: (response) => {
        this.loading = false;
        this.form.reset();
        this.submitted = false;
      },
      error: (error) => {
        this.loading = false;
      }
    });
  }
}
