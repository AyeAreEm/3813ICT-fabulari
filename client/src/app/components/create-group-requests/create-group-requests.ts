import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminShellComponent } from '../admin-shell/admin-shell';
import { ModalComponent } from '../modal/modal';
import { CreateGroupRequest } from '../../shared/models';
import { MOCK_CREATE_REQUESTS } from '../../shared/mock-data';

@Component({
  imports: [CommonModule, AdminShellComponent, ModalComponent],
  selector: 'app-create-group-requests',
  styleUrl: './create-group-requests.css',
  templateUrl: './create-group-requests.html',
})
export class CreateGroupRequestsComponent {
requests: CreateGroupRequest[] = [...MOCK_CREATE_REQUESTS];
  selected: CreateGroupRequest | null = null;

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
    this.requests = this.requests.filter(r => r.id !== req.id);
    if (this.selected?.id === req.id) this.close();
  }
}
