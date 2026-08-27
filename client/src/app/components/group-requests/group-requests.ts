import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ShellComponent } from '../shell/shell';
import { GroupNavComponent } from '../group-nav/group-nav';
import { Group, GroupRequest, Room, Member } from '../../shared/models';
import { MOCK_ROOMS } from '../../shared/mock-data';
import { AuthService } from '../../shared/auth.service';
import { GroupService } from '../../shared/group.service';

@Component({
  imports: [CommonModule, ShellComponent, GroupNavComponent],
  selector: 'app-group-requests',
  styleUrl: './group-requests.css',
  templateUrl: './group-requests.html',
})
export class GroupRequestsComponent implements OnInit, OnDestroy {
  myGroups = signal<Group[]>([]);
  group = signal<Group>({} as Group);
  rooms: Room[] = MOCK_ROOMS;
  requests = signal<GroupRequest[]>([]);
  members = signal<Member[]>([]);
  currentId = "";

  private paramSub?: Subscription;

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router, private groupService: GroupService) {}

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

      this.groupService.getMembers(this.currentId).subscribe(ms => {
        this.members.set(ms);

        if (!this.isGroupAdmin) {
          this.router.navigate(['/groups', this.group().id]);
        }
      });

      this.groupService.getGroupRequests(this.currentId).subscribe(rs => {
        this.requests.set(rs);
      });
    });
  }

  ngOnDestroy() {
    this.paramSub?.unsubscribe();
  }

  typeLabel(type: GroupRequest['type']): string {
    return type === 'join' ? 'Join' : type === 'kick' ? 'Kick' : 'Room';
  }

  approve(req: GroupRequest) {
    console.log('approve', req);
    this.groupService.approveRequest(this.currentId, req.id).subscribe();
    this.remove(req);
  }

  deny(req: GroupRequest) {
    console.log('deny', req);
    // TODO: GroupService.denyRequest(req.id)
    this.remove(req);
  }

  ban(req: GroupRequest) {
    console.log('escalate ban', req);
    // TODO: routes to something like /ban-request prefilled with req.subjectName
    this.remove(req);
  }

  private remove(req: GroupRequest) {
    this.requests.set(this.requests().filter(r => r.id !== req.id));
  }
}
