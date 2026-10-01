import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Room } from '../../shared/models';
import { ModalComponent } from '../modal/modal';
import { CreateRoomRequestComponent } from '../create-room-request/create-room-request';

@Component({
  imports: [CommonModule, RouterLink, RouterLinkActive, ModalComponent, CreateRoomRequestComponent],
  selector: 'app-group-nav',
  styleUrl: './group-nav.css',
  templateUrl: './group-nav.html',
})
export class GroupNavComponent {
  @Input({ required: true }) groupId!: string;
  @Input() rooms: Room[] = [];
  @Input() activeRoomId: string | null = null;
  @Input() isGroupAdmin: boolean = false;

  showCreateRoom = false;

  openCreateRoom() {
    this.showCreateRoom = true;
  }
  closeCreateRoom() {
    this.showCreateRoom = false;
  }
}
