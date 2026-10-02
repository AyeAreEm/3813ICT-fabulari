import { ChangeDetectorRef, Component, ElementRef, ViewChild, OnDestroy, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ShellComponent } from '../shell/shell';
import { GroupNavComponent } from '../group-nav/group-nav';
import { FeedItem, Group, Member, PresenceUser, Room } from '../../shared/models';
import { AuthService } from '../../shared/auth.service';
import { GroupService } from '../../shared/group.service';
import { ChatService } from '../../shared/chat.service';

// keep the DOM small in long-running sessions.
const MAX_FEED_ITEMS = 200;

@Component({
  imports: [CommonModule, FormsModule, ShellComponent, GroupNavComponent],
  selector: 'app-room',
  styleUrl: './room.css',
  templateUrl: './room.html',
})
export class RoomComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('messagesEl') messagesEl?: ElementRef<HTMLElement>;

  myGroups = signal<Group[]>([]);
  group = signal<Group>({} as Group);
  rooms = signal<Room[]>([]);
  activeRoom = signal<Room>({} as Room);
  members = signal<Member[]>([]);

  feed = signal<FeedItem[]>([]);
  present = signal<PresenceUser[]>([]);
  chatError = signal<string | null>(null);

  draft = '';
  currentId = "";

  private pinnedToBottom = true;
  private paramSub?: Subscription;
  private chatSubs = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private groupService: GroupService,
    readonly chat: ChatService,
    private cdr: ChangeDetectorRef,
  ) {
    effect(() => {
      this.feed();
      setTimeout(() => this.scrollToBottom());
    });
  }

  get isGroupAdmin(): boolean {
    return this.members().some(m => m.id === this.auth.currentUser?.email && m.role === 'Admin');
  }

  ngOnInit() {
    this.groupService.getMyGroups().subscribe({
      next: (gs) => {
        this.myGroups.update(_ => gs)
      }
    });

    this.chatSubs.add(this.chat.history$.subscribe(history => {
      this.chatError.set(null);
      this.feed.set(history.map(message => ({ type: 'message', message })));
    }));

    this.chatSubs.add(this.chat.message$.subscribe(message => this.append({ type: 'message', message })));
    this.chatSubs.add(this.chat.notice$.subscribe(notice => this.append({ type: 'notice', notice })));
    this.chatSubs.add(this.chat.presence$.subscribe(users => this.present.set(users)));
    this.chatSubs.add(this.chat.error$.subscribe(error => this.chatError.set(error)));

    this.paramSub = this.route.paramMap.subscribe(params => {
      this.currentId = params.get('id')!;
      this.groupService.getGroup(this.currentId).subscribe(g => {
        this.group.set(g);
      });

      const roomId = params.get('roomId')!;

      this.groupService.getRooms(this.currentId).subscribe(rs => {
        this.rooms.set(rs);
        this.activeRoom.set(this.rooms().find(r => r.id === roomId) ?? this.rooms()[0]);
        if (!this.activeRoom) return;

        this.feed.set([]);
        this.present.set([]);
        this.chatError.set(null);
        this.pinnedToBottom = true;
        this.chat.joinRoom(this.currentId, this.activeRoom().id);
      });
    });

    this.groupService.getMembers(this.currentId).subscribe(ms => {
      this.members.set(ms);
    });
  }

  ngOnDestroy() {
    this.paramSub?.unsubscribe();
    this.chatSubs.unsubscribe();
    this.chat.leaveRoom();
  }

  sendMessage() {
    const text = this.draft.trim();
    if (!text) return;

    this.draft = '';
    this.chatError.set(null);
    this.pinnedToBottom = true;

    this.chat.sendMessage(text).subscribe({
      error: (err: Error) => {
        this.chatError.set(err.message);
        this.draft = text;
        this.cdr.markForCheck();
      },
    });
  }

  onScroll() {
    const el = this.messagesEl?.nativeElement;
    if (!el) return;
    this.pinnedToBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  trackFeedItem(_: number, item: FeedItem) {
    return item.type === 'message' ? item.message.id : item.notice.id;
  }

  trackUser(_: number, user: PresenceUser) {
    return user.id;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.chatError.set(null);
    this.pinnedToBottom = true;

    this.chat.sendFile(file).subscribe({
      error: (err: Error) => {
        this.chatError.set(err.message);
        this.cdr.markForCheck();
      },
    });

    input.value = '';
  }

  onImageLoad() {
    this.scrollToBottom();
  }

  getAvatar(id: string): string | null {
    const m = this.members().find((m) => m.id === id);

    if (m?.avatar) {
      return this.attachmentUrl(m.avatar);
    }

    return null
  }

  private readonly serverOrigin = 'http://localhost:3000';

  attachmentUrl(path: string): string {
    return this.serverOrigin + path;
  }

  private append(item: FeedItem) {
    this.feed.update(items => [...items, item].slice(-MAX_FEED_ITEMS));
  }

  private scrollToBottom() {
    const el = this.messagesEl?.nativeElement;
    if (el && this.pinnedToBottom) el.scrollTop = el.scrollHeight;
  }
}
