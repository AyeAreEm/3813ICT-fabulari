import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupService } from '../../shared/group.service';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-create-room-request',
  styleUrl: './create-room-request.css',
  templateUrl: './create-room-request.html',
})
export class CreateRoomRequestComponent {
  private fb = inject(FormBuilder);
  private groupService = inject(GroupService);

  @Input({ required: true }) groupId!: string;
  @Output() closed = new EventEmitter<void>();

  form = this.fb.group({
    name: ['', Validators.required],
    reason: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, reason } = this.form.value;
    this.groupService.requestRoom(this.groupId, name!, reason!).subscribe({
      next: () => this.closed.emit(),
    });
  }
}
