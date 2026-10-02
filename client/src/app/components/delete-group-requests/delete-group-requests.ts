import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminShellComponent } from '../admin-shell/admin-shell';
import { ModalComponent } from '../modal/modal';
import { DeleteGroupRequest } from '../../shared/models';
import { AdminService } from '../../shared/super-admin.service';

@Component({
  imports: [CommonModule, AdminShellComponent, ModalComponent],
  selector: 'app-delete-group-requests',
  styleUrl: './delete-group-requests.css',
  templateUrl: './delete-group-requests.html',
})
export class DeleteGroupRequestsComponent implements OnInit {
  admin = inject(AdminService);

  requests = signal<DeleteGroupRequest[]>([]);
  selected: DeleteGroupRequest | null = null;
  error = signal('');
  busy = signal(false);

  ngOnInit() {
    this.admin.getDeleteRequests().subscribe({
      next: (reqs) => this.requests.set(reqs),
      error: () => this.error.set('Could not load deletion requests.'),
    });
  }

  view(req: DeleteGroupRequest) { this.selected = req; }
  close() { this.selected = null; }

  confirmDelete(req: DeleteGroupRequest) {
    this.admin.confirmDeleteRequest(req.id).subscribe({
      next: () => {
        this.busy.set(false);
        this.remove(req);
      },
      error: (err) => {
        this.busy.set(false);
        this.error.set(err.error?.status ?? 'Could not delete the group.');
        this.close();
      },
    });
  }

  deny(req: DeleteGroupRequest) {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');

    this.admin.denyDeleteRequest(req.id).subscribe({
      next: () => {
        this.busy.set(false);
        this.remove(req);
      },
      error: (err) => {
        this.busy.set(false);
        this.error.set(err.error?.status ?? 'Could not deny the request.');
      },
    });
  }

  private remove(req: DeleteGroupRequest) {
    this.requests.update(rs => rs.filter(r => r.id !== req.id));
    if (this.selected?.id === req.id) this.close();
  }
}
