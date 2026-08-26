import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminShellComponent } from '../admin-shell/admin-shell';
import { ModalComponent } from '../modal/modal';
import { DeleteGroupRequest } from '../../shared/models';
import { MOCK_DELETE_REQUESTS } from '../../shared/mock-data';

@Component({
  imports: [CommonModule, AdminShellComponent, ModalComponent],
  selector: 'app-delete-group-requests',
  styleUrl: './delete-group-requests.css',
  templateUrl: './delete-group-requests.html',
})
export class DeleteGroupRequestsComponent {
  requests: DeleteGroupRequest[] = [...MOCK_DELETE_REQUESTS];
  selected: DeleteGroupRequest | null = null;

  view(req: DeleteGroupRequest) { this.selected = req; }
  close() { this.selected = null; }

  confirmDelete(req: DeleteGroupRequest) {
    console.log('confirm delete', req);
    // TODO: AdminService.approveGroupDeletion(req.id)
    this.remove(req);
  }

  deny(req: DeleteGroupRequest) {
    console.log('deny delete', req);
    // TODO: AdminService.denyGroupDeletion(req.id)
    this.remove(req);
  }

  private remove(req: DeleteGroupRequest) {
    this.requests = this.requests.filter(r => r.id !== req.id);
    if (this.selected?.id === req.id) this.close();
  }
}
