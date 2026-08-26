import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ShellComponent } from '../shell/shell';
import { GroupNavComponent } from '../group-nav/group-nav';
import { Group, Member, Message, Room } from '../../shared/models';
import { MOCK_ALL_GROUPS, MOCK_MEMBERS, MOCK_MESSAGES, MOCK_MY_GROUPS, MOCK_ROOMS } from '../../shared/mock-data';

@Component({
  imports: [CommonModule, FormsModule, ShellComponent, GroupNavComponent],
  selector: 'app-room',
  styleUrl: './room.css',
  templateUrl: './room.html',
})
export class RoomComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  myGroups: Group[] = MOCK_MY_GROUPS;
  group!: Group;
  rooms: Room[] = MOCK_ROOMS;
  activeRoom!: Room;
  members: Member[] = MOCK_MEMBERS;
  messages: Message[] = MOCK_MESSAGES;
  draft = '';

  private paramSub?: Subscription;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.paramSub = this.route.paramMap.subscribe(params => {
      const groupId = params.get('id');
      const roomId = params.get('roomId');
      // TODO: replace with GroupService.getGroup(id) + ChatService.getMessages(roomId)
      this.group = MOCK_ALL_GROUPS.find(g => g.id === groupId) ?? MOCK_ALL_GROUPS[0];
      this.activeRoom = this.rooms.find(r => r.id === roomId) ?? this.rooms[0];
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
      authorId: 'me',
      authorName: 'You',
      initials: 'JD',
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
