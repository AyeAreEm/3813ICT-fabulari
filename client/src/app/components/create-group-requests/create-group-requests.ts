import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminShellComponent } from '../admin-shell/admin-shell';
import { ModalComponent } from '../modal/modal';
import { CreateGroupRequest } from '../../shared/models';
import { MOCK_CREATE_REQUESTS } from '../../shared/mock-data';
import { AdminService } from '../../shared/super-admin.service';

@Component({
  imports: [CommonModule, AdminShellComponent, ModalComponent],
  selector: 'app-create-group-requests',
  styleUrl: './create-group-requests.css',
  templateUrl: './create-group-requests.html',
})
export class CreateGroupRequestsComponent implements OnInit {
  protected readonly isNaN = isNaN;

  admin = inject(AdminService);

  requests = signal<CreateGroupRequest[]>([]);
  selected: CreateGroupRequest | null = null;

  ngOnInit() {
    this.admin.getCreateRequests().subscribe({
      next: (reqs) => {
        this.requests.update(_ => [...MOCK_CREATE_REQUESTS, ...reqs]);
      }
    });
  }

  view(req: CreateGroupRequest) { this.selected = req; }
  close() { this.selected = null; }

  approve(req: CreateGroupRequest) {
    console.log('approve create', req);
    // TODO: AdminService.approveGroupCreation(req.id)
    this.remove(req);
  }

  deny(req: CreateGroupRequest) {
    console.log('deny create', req);
    // TODO: AdminService.denyGroupCreation(req.id)
    this.remove(req);
  }

  private remove(req: CreateGroupRequest) {
    this.requests.update(rs => rs.filter(r => r.id !== req.id));
    if (this.selected?.id === req.id) this.close();
  }
}
