import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppNotification } from './models';
import { AuthService } from './auth.service';

const apiUrl = "http://localhost:3000";

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private get userId(): string {
    return encodeURIComponent(this.auth.currentUser?.email ?? '');
  }

  getNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${apiUrl}/notifications/${this.userId}`);
  }

  markAllRead(): Observable<void> {
    return this.http.patch<void>(`${apiUrl}/notifications/${this.userId}/read`, {});
  }
}
