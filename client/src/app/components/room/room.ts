import { Component, ElementRef, ViewChild, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ShellComponent } from '../shell/shell';
import { GroupNavComponent } from '../group-nav/group-nav';
import { Group, Member, Message, Room } from '../../shared/models';
import { MOCK_ROOMS } from '../../shared/mock-data';
import { AuthService } from '../../shared/auth.service';
import { GroupService } from '../../shared/group.service';

@Component({
  imports: [CommonModule, FormsModule, ShellComponent, GroupNavComponent],
  selector: 'app-room',
  styleUrl: './room.css',
  templateUrl: './room.html',
})
export class RoomComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  myGroups = signal<Group[]>([]);
  group = signal<Group>({} as Group);
  rooms: Room[] = MOCK_ROOMS;
  activeRoom!: Room;
  members = signal<Member[]>([]);
  messages: Message[] = [];
  draft = '';
  currentId = "";

  private paramSub?: Subscription;

  constructor(private route: ActivatedRoute, private auth: AuthService, private groupService: GroupService) {}

  get isGroupAdmin(): boolean {
    return this.members().some(m => m.id === this.auth.currentUser?.email && m.role === 'Admin');
  }

  ngOnInit() {
    this.groupService.getMyGroups().subscribe({
      next: (gs) => {
        this.myGroups.update(_ => gs)
      }
    });

    this.paramSub = this.route.paramMap.subscribe(params => {
      this.currentId = params.get('id')!;
      this.groupService.getGroup(this.currentId).subscribe(g => {
        this.group.set(g);
      });

      const roomId = params.get('roomId')!;
      this.activeRoom = this.rooms.find(r => r.id === roomId) ?? this.rooms[0];
    });

    this.groupService.getMembers(this.currentId).subscribe(ms => {
      this.members.set(ms);
    });
  }

  ngOnDestroy() {
    this.paramSub?.unsubscribe();
  }

  sendMessage() {
    const text = this.draft.trim();
    if (!text) return;
    this.messages.push({
      id: crypto.randomUUID(),
      authorId: this.auth.currentUser?.email!,
      authorName: this.auth.currentUser?.firstName + " " + this.auth.currentUser?.lastName,
      initials: this.auth.currentUser?.initials || this.auth.currentUser?.firstName[0]! + this.auth.currentUser?.lastName[0]!,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text
    });
    this.draft = '';
    // TODO: emit over websocket / call ChatService.sendMessage(...)
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    console.log('file selected', file.name);
    // TODO: attach file to the outgoing message once ChatService supports uploads
    (event.target as HTMLInputElement).value = '';
  }
}
