import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminShellComponent } from '../admin-shell/admin-shell';
import { ModalComponent } from '../modal/modal';
import { BanRequest } from '../../shared/models';
import { MOCK_BAN_REQUESTS } from '../../shared/mock-data';

@Component({
  imports: [CommonModule, AdminShellComponent, ModalComponent],
  selector: 'app-ban-requests',
  styleUrl: './ban-requests.css',
  templateUrl: './ban-requests.html',
})
export class BanRequestsComponent {
  requests: BanRequest[] = [...MOCK_BAN_REQUESTS];
  selected: BanRequest | null = null;

  view(req: BanRequest) { this.selected = req; }
  close() { this.selected = null; }

  deny(req: BanRequest) {
    console.log('deny ban', req);
    this.remove(req);
  }

  banUser(req: BanRequest) {
    console.log('ban user confirmed', req);
    // TODO: AdminService.banUser(req.targetId)
    this.remove(req);
  }

  dismissFlag(req: BanRequest) {
    console.log('dismiss flag', req);
    this.remove(req);
  }

  private remove(req: BanRequest) {
    this.requests = this.requests.filter(r => r.id !== req.id);
    if (this.selected?.id === req.id) this.close();
  }
}
