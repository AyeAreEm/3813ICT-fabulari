import { Component, DestroyRef, ElementRef, HostListener, Input, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap, timer } from 'rxjs';
import { AppNotification, Group } from '../../shared/models';
import { AuthService } from '../../shared/auth.service';
import { NotificationService } from '../../shared/notification.service';

const NOTIFICATION_POLL_MS = 30_000;

@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-shell',
  styleUrl: './shell.css',
  templateUrl: './shell.html',
})
export class ShellComponent implements OnInit {
  private auth = inject(AuthService);
  private notificationService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  @ViewChild('notifWrap') notifWrap?: ElementRef<HTMLElement>;

  name = (this.auth.currentUser?.firstName ?? "") + " " + (this.auth.currentUser?.lastName ?? "");

  @Input() groups: Group[] = [];
  @Input() activeGroupId: string | null = null;

  notifications = signal<AppNotification[]>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.read).length);
  panelOpen = signal(false);

  ngOnInit() {
    // Fetch now, then every 30s. A failed poll is skipped rather than ending the stream.
    timer(0, NOTIFICATION_POLL_MS).pipe(
      switchMap(() => this.notificationService.getNotifications().pipe(catchError(() => of(null)))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((list) => {
      if (list) this.notifications.set(list);
    });
  }

  togglePanel() {
    if (this.panelOpen()) {
      this.closePanel();
    } else {
      this.panelOpen.set(true);
    }
  }

  // Items stay highlighted while the panel is open and are marked read once it's closed.
  closePanel() {
    if (!this.panelOpen()) return;
    this.panelOpen.set(false);

    if (this.unreadCount() === 0) return;
    this.notificationService.markAllRead().subscribe({
      next: () => this.notifications.update(list => list.map(n => ({ ...n, read: true }))),
      error: () => {},
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.panelOpen() && !this.notifWrap?.nativeElement.contains(event.target as Node)) {
      this.closePanel();
    }
  }
}
