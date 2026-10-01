import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Group, Member, Room } from '../../shared/models';
import { AuthService } from '../../shared/auth.service';
import { GroupService } from '../../shared/group.service';
import { ShellComponent } from '../shell/shell';
import { GroupNavComponent } from '../group-nav/group-nav';

@Component({
  imports: [CommonModule, ReactiveFormsModule, ShellComponent, GroupNavComponent],
  selector: 'app-ban-request',
  styleUrl: './ban-request.css',
  templateUrl: './ban-request.html',
})
export class BanRequestComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private groupService = inject(GroupService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  myGroups = signal<Group[]>([]);
  group = signal<Group>({} as Group);
  rooms = signal<Room[]>([]);
  allMembers = signal<Member[]>([]);
  members = signal<Member[]>([]);
  error = signal('');
  currentId = '';

  // set via query params when escalating a kick request from the requests page,
  // so the target is fixed and the kick request is resolved
  targetId: string | null = null;
  targetName = '';
  sourceKickRequestId: string | null = null;
  reason = '';

  private paramSub?: Subscription;

  form = this.fb.group({
    userToBan: ['', Validators.required],
    requestFrom: [{ value: '', disabled: true }],
    reason: ['', Validators.required]
  });

  get isGroupAdmin(): boolean {
    return this.allMembers().some(m => m.id === this.auth.currentUser?.email && m.role === 'Admin');
  }

  ngOnInit() {
    this.groupService.getMyGroups().subscribe(gs => this.myGroups.set(gs));

    const query = this.route.snapshot.queryParamMap;
    this.targetId = query.get('targetId');
    this.targetName = query.get('targetName') ?? '';
    this.sourceKickRequestId = query.get('sourceKickRequestId');
    this.reason = query.get('reason') ?? '';

    const user = this.auth.currentUser;
    this.form.patchValue({
      userToBan: this.targetId ?? '',
      requestFrom: user ? `${user.firstName} ${user.lastName}` : '',
      reason: this.reason,
    });

    this.paramSub = this.route.paramMap.subscribe(params => {
      this.currentId = params.get('id')!;

      this.groupService.getGroup(this.currentId).subscribe(g => this.group.set(g));
      this.groupService.getRooms(this.currentId).subscribe(rs => this.rooms.set(rs));

      this.groupService.getMembers(this.currentId).subscribe(ms => {
        this.allMembers.set(ms);

        // only group admins can request a platform ban
        if (!this.isGroupAdmin) {
          this.router.navigate(['/groups', this.currentId]);
          return;
        }

        if (!this.targetId) {
          const eligible = ms.filter(m => m.role !== 'Admin');
          this.members.set(eligible);
          if (eligible.length) {
            this.form.patchValue({ userToBan: eligible[0].id });
          }
        }
      });
    });
  }

  ngOnDestroy() {
    this.paramSub?.unsubscribe();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { userToBan, reason } = this.form.value;
    this.groupService.requestBan(this.currentId, userToBan!, reason!, this.sourceKickRequestId ?? undefined).subscribe({
      next: () => {
        // escalated from a kick request -> back to the requests list, otherwise the group details
        const target = this.sourceKickRequestId
          ? ['/groups', this.currentId, 'requests']
          : ['/groups', this.currentId];
        this.router.navigate(target);
      },
      error: (err) => this.error.set(err.error?.status ?? 'Could not submit the request.'),
    });
  }
}
