import { Component, inject, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Group, Member } from '../../shared/models';
import { GroupService } from '../../shared/group.service';

type GroupWithColour = Group & { colour?: string };

@Component({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  selector: 'app-group-settings',
  styleUrl: './group-settings.css',
  templateUrl: './group-settings.html',
})
export class GroupSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private groupService = inject(GroupService);

  @Input({ required: true }) group!: Group;
  @Input() members: Member[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Group>();
  @Output() successorAppointed = new EventEmitter<string>();

  colours = ['#ffffff', '#e5e3df', '#d9e6f5', '#f7dfe4', '#dcf0e2'];
  selectedColour = this.colours[0];
  successorId = '';

  saving = signal(false);
  appointing = signal(false);
  saveError = signal('');
  successorError = signal('');
  successorNotice = signal('');

  deleteReason = '';
  showDeleteForm = signal(false);
  deletePending = signal(false);
  deleteSubmitting = signal(false);
  deleteError = signal('');
  deleteNotice = signal('');

  form = this.fb.group({
    description: ['', Validators.required]
  });

  get successors(): Member[] {
    return this.members.filter(m => m.role !== 'Admin');
  }

  ngOnInit() {
    this.form.patchValue({ description: this.group.description });

    const currentColour = (this.group as GroupWithColour).colour;
    if (currentColour && this.colours.includes(currentColour)) {
      this.selectedColour = currentColour;
    }

    this.successorId = this.successors[0]?.id ?? '';

    this.groupService.getDeleteRequestStatus(this.group.id).subscribe({
      next: (status) => this.deletePending.set(status.pending),
      error: () => {},
    });
  }

  selectColour(c: string) {
    this.selectedColour = c;
  }

  save() {
    const description = (this.form.value.description ?? '').trim();
    this.form.controls.description.setValue(description);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.saveError.set('');

    const colour = this.selectedColour;
    this.groupService.updateSettings(this.group.id, { description, colour }).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.saved.emit({ ...this.group, description, colour, ...(updated as Partial<GroupWithColour>) });
        this.closed.emit();
      },
      error: (err) => {
        this.saving.set(false);
        this.saveError.set(this.errorText(err, 'Could not save settings. Please try again.'));
      },
    });
  }

  appointSuccessor() {
    const memberId = this.successorId;
    if (!memberId || this.appointing()) return;

    this.appointing.set(true);
    this.successorError.set('');
    this.successorNotice.set('');

    this.groupService.appointSuccessor(this.group.id, memberId).subscribe({
      next: () => {
        const name = this.members.find(m => m.id === memberId)?.name ?? 'Member';
        this.appointing.set(false);
        this.successorNotice.set(`${name} has been appointed as an admin.`);
        this.successorAppointed.emit(memberId);
        this.successorId = this.successors.find(m => m.id !== memberId)?.id ?? '';
      },
      error: (err) => {
        this.appointing.set(false);
        this.successorError.set(this.errorText(err, 'Could not appoint successor. Please try again.'));
      },
    });
  }

  openDeleteForm() {
    this.deleteError.set('');
    this.deleteNotice.set('');
    this.showDeleteForm.set(true);
  }

  cancelDeleteForm() {
    this.showDeleteForm.set(false);
    this.deleteReason = '';
    this.deleteError.set('');
  }

  requestDelete() {
    const reason = this.deleteReason.trim();
    if (!reason) {
      this.deleteError.set('Please give a reason for deleting this group.');
      return;
    }
    if (this.deleteSubmitting()) return;

    this.deleteSubmitting.set(true);
    this.deleteError.set('');

    this.groupService.requestGroupDeletion(this.group.id, reason).subscribe({
      next: () => {
        this.deleteSubmitting.set(false);
        this.deletePending.set(true);
        this.showDeleteForm.set(false);
        this.deleteReason = '';
        this.deleteNotice.set('Deletion request sent to the Super Admin. You will be notified of the outcome.');
      },
      error: (err) => {
        this.deleteSubmitting.set(false);
        if (err?.status === 409) this.deletePending.set(true);
        this.deleteError.set(this.errorText(err, 'Could not send the deletion request. Please try again.'));
      },
    });
   }

  private errorText(err: any, fallback: string): string {
    return err?.error?.status ?? err?.error?.message ?? fallback;
  }
}
