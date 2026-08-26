import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ShellComponent } from '../shell/shell';
import { GroupNavComponent } from '../group-nav/group-nav';
import { Group, GroupRequest, Room, Member } from '../../shared/models';
import { MOCK_ALL_GROUPS, MOCK_GROUP_REQUESTS, MOCK_MY_GROUPS, MOCK_ROOMS, MOCK_MEMBERS } from '../../shared/mock-data';
import { AuthService } from '../../shared/auth.service';

@Component({
  imports: [CommonModule, ShellComponent, GroupNavComponent],
  selector: 'app-group-requests',
  styleUrl: './group-requests.css',
  templateUrl: './group-requests.html',
})
export class GroupRequestsComponent implements OnInit, OnDestroy {
  myGroups: Group[] = MOCK_MY_GROUPS;
  group!: Group;
  rooms: Room[] = MOCK_ROOMS;
  requests: GroupRequest[] = [...MOCK_GROUP_REQUESTS];
  members: Member[] = MOCK_MEMBERS;

  private paramSub?: Subscription;

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router) {}

  get isGroupAdmin(): boolean {
    return this.members.some(m => m.role === 'Admin');
  }

  ngOnInit() {
    this.paramSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.group = MOCK_ALL_GROUPS.find(g => g.id === id) ?? MOCK_ALL_GROUPS[0];

      if (!this.isGroupAdmin) {
        this.router.navigate(['/groups', this.group.id]);
      }
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
    // TODO: GroupService.approveRequest(req.id)
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
    this.requests = this.requests.filter(r => r.id !== req.id);
  }
}
