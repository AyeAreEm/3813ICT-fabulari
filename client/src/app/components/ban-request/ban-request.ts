import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Member } from '../../shared/models';
import { AuthService } from '../../shared/auth.service';
import { GroupService } from '../../shared/group.service';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-ban-request',
  styleUrl: './ban-request.css',
  templateUrl: './ban-request.html',
})
export class BanRequestComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private groupService = inject(GroupService);

  @Input({ required: true }) groupId!: string;
  // set when escalating a kick request, so the target is fixed and the kick request is resolved
  @Input() targetId: string | null = null;
  @Input() targetName = '';
  @Input() sourceKickRequestId: string | null = null;
  @Input() reason = '';
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  members = signal<Member[]>([]);
  error = signal('');

  form = this.fb.group({
    userToBan: ['', Validators.required],
    requestFrom: [{ value: '', disabled: true }],
    reason: ['', Validators.required]
  });

  ngOnInit() {
    const user = this.auth.currentUser;
    this.form.patchValue({
      userToBan: this.targetId ?? '',
      requestFrom: user ? `${user.firstName} ${user.lastName}` : '',
      reason: this.reason,
    });

    if (!this.targetId) {
      this.groupService.getMembers(this.groupId).subscribe(ms => {
        const eligible = ms.filter(m => m.role !== 'Admin');
        this.members.set(eligible);
        if (eligible.length) {
          this.form.patchValue({ userToBan: eligible[0].id });
        }
      });
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { userToBan, reason } = this.form.value;
    this.groupService.requestBan(this.groupId, userToBan!, reason!, this.sourceKickRequestId ?? undefined).subscribe({
      next: () => {
        this.submitted.emit();
        this.closed.emit();
      },
      error: (err) => this.error.set(err.error?.status ?? 'Could not submit the request.'),
    });
  }
}
