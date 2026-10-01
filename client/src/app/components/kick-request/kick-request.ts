import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Member } from '../../shared/models';
import { AuthService } from '../../shared/auth.service';
import { GroupService } from '../../shared/group.service';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-kick-request',
  styleUrl: './kick-request.css',
  templateUrl: './kick-request.html',
})
export class KickRequestComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private groupService = inject(GroupService);

  @Input({ required: true }) groupId!: string;
  @Output() closed = new EventEmitter<void>();

  members = signal<Member[]>([]);
  error = signal('');

  form = this.fb.group({
    memberId: ['', Validators.required],
    reason: ['', Validators.required]
  });

  ngOnInit() {
    this.groupService.getMembers(this.groupId).subscribe(ms => {
      console.log(ms);
      const eligible = ms.filter(m => m.role !== 'Admin' && m.id !== this.auth.currentUser?.email);
      this.members.set(eligible);
      if (eligible.length) {
        this.form.patchValue({ memberId: eligible[0].id });
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { memberId, reason } = this.form.value;
    this.groupService.requestKick(this.groupId, memberId!, reason!).subscribe({
      next: () => this.closed.emit(),
      error: (err) => this.error.set(err.error?.status ?? 'Could not submit the request.'),
    });
  }
}
