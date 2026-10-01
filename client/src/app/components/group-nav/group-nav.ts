import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Room } from '../../shared/models';
import { ModalComponent } from '../modal/modal';
import { CreateRoomRequestComponent } from '../create-room-request/create-room-request';
import { KickRequestComponent } from '../kick-request/kick-request';
import { BanRequestComponent } from '../ban-request/ban-request';

@Component({
  imports: [CommonModule, RouterLink, RouterLinkActive, ModalComponent, CreateRoomRequestComponent, KickRequestComponent, BanRequestComponent],
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
  showKick = false;
  showBan = false;

  openCreateRoom() {
    this.showCreateRoom = true;
  }
  closeCreateRoom() {
    this.showCreateRoom = false;
  }

  openKick() {
    this.showKick = true;
  }
  closeKick() {
    this.showKick = false;
  }

  openBan() {
    this.showBan = true;
  }
  closeBan() {
    this.showBan = false;
  }
}
