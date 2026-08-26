import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Room } from '../../shared/models';

@Component({
  imports: [CommonModule, RouterLink, RouterLinkActive],
  selector: 'app-group-nav',
  styleUrl: './group-nav.css',
  templateUrl: './group-nav.html',
})
export class GroupNavComponent {
  @Input({ required: true }) groupId!: string;
  @Input() rooms: Room[] = [];
  @Input() activeRoomId: string | null = null;
}
