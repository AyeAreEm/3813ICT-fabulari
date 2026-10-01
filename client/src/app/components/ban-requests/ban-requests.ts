import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminShellComponent } from '../admin-shell/admin-shell';
import { ModalComponent } from '../modal/modal';
import { BanRequest } from '../../shared/models';
import { AdminService } from '../../shared/super-admin.service';

@Component({
  imports: [CommonModule, AdminShellComponent, ModalComponent],
  selector: 'app-ban-requests',
  styleUrl: './ban-requests.css',
  templateUrl: './ban-requests.html',
})
export class BanRequestsComponent implements OnInit {
  admin = inject(AdminService);

  requests = signal<BanRequest[]>([]);
  selected: BanRequest | null = null;
  error = signal('');

  ngOnInit() {
    this.admin.getBanRequests().subscribe(reqs => this.requests.set(reqs));
  }

  view(req: BanRequest) { this.selected = req; }
  close() { this.selected = null; }

  deny(req: BanRequest) {
    this.error.set('');
    this.admin.denyBanRequest(req.id).subscribe({
      next: () => this.remove(req),
      error: (err) => this.error.set(err.error?.status ?? 'Could not deny the request.'),
    });
  }

  banUser(req: BanRequest) {
    this.error.set('');
    this.admin.banUser(req.id).subscribe({
      next: () => this.remove(req),
      error: (err) => {
        this.error.set(err.error?.status ?? 'Could not ban the user.');
        this.close();
      },
    });
  }

  private remove(req: BanRequest) {
    this.requests.update(rs => rs.filter(r => r.id !== req.id));
    if (this.selected?.id === req.id) this.close();
  }
}
