import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.js';

export interface Newsletter {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterStats {
  total: number;
  active: number;
  unsubscribed: number;
  bounced: number;
}

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/newsletter`;

  subscribe(email: string): Observable<Newsletter> {
    return this.http.post<Newsletter>(`${this.apiUrl}/subscribe`, { email });
  }

  getAllSubscribers(): Observable<Newsletter[]> {
    return this.http.get<Newsletter[]>(this.apiUrl);
  }

  getStats(): Observable<NewsletterStats> {
    return this.http.get<NewsletterStats>(`${this.apiUrl}/stats`);
  }

  updateStatus(id: string, status: string): Observable<Newsletter> {
    return this.http.patch<Newsletter>(`${this.apiUrl}/${id}`, { status });
  }

  deleteSubscriber(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  unsubscribe(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/unsubscribe/${email}`, {});
  }
}
