import { Injectable, inject, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';
import { Message, PresenceUser, RoomNotice } from './models';

const socketUrl = 'http://localhost:3000';

type Ack<T = object> = ({ ok: true } & T) | { ok: false; error: string };

/**
 * Owns the single WebSocket connection to the server and exposes it as plain RxJS streams.
 *
 * The socket is created lazily on the first joinRoom() call and lives for the whole
 * logged-in session. A socket is only ever in one room at a time.
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private auth = inject(AuthService);

  private socket: Socket | null = null;
  private activeRoom: { groupId: string; roomId: string } | null = null;

  /** True while the WebSocket is connected. A signal so templates update under zoneless change detection. */
  readonly connected = signal(false);

  private historySubject = new Subject<Message[]>();
  private messageSubject = new Subject<Message>();
  private noticeSubject = new Subject<RoomNotice>();
  private presenceSubject = new Subject<PresenceUser[]>();
  private errorSubject = new Subject<string>();

  /** Last few messages, delivered each time the room is (re)joined. Replaces whatever is on screen. */
  readonly history$ = this.historySubject.asObservable();
  /** A new message in the current room (`message:new`). Includes your own messages. */
  readonly message$ = this.messageSubject.asObservable();
  /** Someone joined or left the current room (`room:userJoined` / `room:userLeft`). */
  readonly notice$ = this.noticeSubject.asObservable();
  /** Full list of users currently in the room. */
  readonly presence$ = this.presenceSubject.asObservable();
  /** Human-readable errors worth showing the user. */
  readonly error$ = this.errorSubject.asObservable();

  constructor() {
    // Drop the connection on logout so the next user can't inherit this identity.
    this.auth.user$.subscribe((user) => {
      if (!user) this.disconnect();
    });
  }

  joinRoom(groupId: string, roomId: string) {
    this.activeRoom = { groupId, roomId };
    const socket = this.ensureSocket();
    // If we're not connected yet, the 'connect' handler joins for us.
    if (socket.connected) this.emitJoin();
  }

  leaveRoom() {
    if (this.activeRoom && this.socket?.connected) {
      this.socket.emit('room:leave');
    }
    this.activeRoom = null;
  }

  /** Completes once the server has accepted the message; errors with the server's reason otherwise. */
  sendMessage(text: string): Observable<void> {
    return new Observable<void>((subscriber) => {
      if (!this.socket?.connected) {
        subscriber.error(new Error('Not connected to the chat server.'));
        return;
      }
      this.socket.timeout(5000).emit('message:send', { text }, (err: Error | null, res: Ack) => {
        if (err) {
          subscriber.error(new Error('The server did not respond. Please try again.'));
        } else if (!res.ok) {
          subscriber.error(new Error(res.error));
        } else {
          subscriber.next();
          subscriber.complete();
        }
      });
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.activeRoom = null;
    this.connected.set(false);
  }

  private ensureSocket(): Socket {
    if (this.socket) return this.socket;

    const socket = io(socketUrl, { auth: { email: this.auth.currentUser?.email } });
    this.socket = socket;

    socket.on('connect', () => {
      this.connected.set(true);
      // Runs on the first connect *and* every automatic reconnect. The server forgets which
      // room a dropped socket was in, so we always re-join.
      this.emitJoin();
    });

    socket.on('disconnect', () => this.connected.set(false));

    socket.on('connect_error', (err) => {
      this.connected.set(false);
      if (err.message === 'unauthorized') {
        this.errorSubject.next('Chat could not verify your account. Please log in again.');
      }
      // The server refused us outright, so Socket.IO won't retry. Forget the dead socket
      // so the next joinRoom() starts fresh.
      if (!socket.active && this.socket === socket) this.socket = null;
    });

    socket.on('message:new', (m: Message) => this.messageSubject.next(m));
    socket.on('room:userJoined', (n: RoomNotice) => this.noticeSubject.next(n));
    socket.on('room:userLeft', (n: RoomNotice) => this.noticeSubject.next(n));
    socket.on('room:presence', (users: PresenceUser[]) => this.presenceSubject.next(users));

    return socket;
  }

  private emitJoin() {
    const room = this.activeRoom;
    if (!room || !this.socket) return;

    this.socket.emit('room:join', room, (res: Ack<{ history: Message[]; users: PresenceUser[] }>) => {
      if (this.activeRoom !== room) return; // user has already moved on to another room
      if (res.ok) {
        this.historySubject.next(res.history);
        this.presenceSubject.next(res.users);
      } else {
        this.errorSubject.next(res.error);
      }
    });
  }
}
