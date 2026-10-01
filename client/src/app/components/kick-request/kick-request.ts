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
  selector: 'app-kick-request',
  styleUrl: './kick-request.css',
  templateUrl: './kick-request.html',
})
export class KickRequestComponent implements OnInit, OnDestroy {
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

  private paramSub?: Subscription;

  form = this.fb.group({
    memberId: ['', Validators.required],
    reason: ['', Validators.required]
  });

  get isGroupAdmin(): boolean {
    return this.allMembers().some(m => m.id === this.auth.currentUser?.email && m.role === 'Admin');
  }

  ngOnInit() {
    this.groupService.getMyGroups().subscribe(gs => this.myGroups.set(gs));

    this.paramSub = this.route.paramMap.subscribe(params => {
      this.currentId = params.get('id')!;

      this.groupService.getGroup(this.currentId).subscribe(g => this.group.set(g));
      this.groupService.getRooms(this.currentId).subscribe(rs => this.rooms.set(rs));

      this.groupService.getMembers(this.currentId).subscribe(ms => {
        this.allMembers.set(ms);

        // group admins review kicks rather than request them
        if (this.isGroupAdmin) {
          this.router.navigate(['/groups', this.currentId]);
          return;
        }

        const eligible = ms.filter(m => m.role !== 'Admin' && m.id !== this.auth.currentUser?.email);
        this.members.set(eligible);
        if (eligible.length) {
          this.form.patchValue({ memberId: eligible[0].id });
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

    const { memberId, reason } = this.form.value;
    this.groupService.requestKick(this.currentId, memberId!, reason!).subscribe({
      next: () => this.router.navigate(['/groups', this.currentId]),
      error: (err) => this.error.set(err.error?.status ?? 'Could not submit the request.'),
    });
  }
}
