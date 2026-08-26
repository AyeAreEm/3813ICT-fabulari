import { Component, inject, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Group, Member } from '../../shared/models';

@Component({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  selector: 'app-group-settings',
  styleUrl: './group-settings.css',
  templateUrl: './group-settings.html',
})
export class GroupSettingsComponent {
  private fb = inject(FormBuilder);

  @Input({ required: true }) group!: Group;
  @Input() members: Member[] = [];
  @Output() closed = new EventEmitter<void>();

  colours = ['#ffffff', '#e5e3df', '#d9e6f5', '#f7dfe4', '#dcf0e2'];
  selectedColour = this.colours[0];
  successorId = '';

  form = this.fb.group({
    description: ['', Validators.required]
  });

  ngOnInit() {
    this.form.patchValue({ description: this.group.description });
    this.successorId = this.members.find(m => m.role !== 'Admin')?.id ?? '';
  }

  selectColour(c: string) {
    this.selectedColour = c;
  }

  save() {
    console.log('save settings', this.form.value, this.selectedColour);
    // TODO: GroupService.updateSettings(...)
  }

  appointSuccessor() {
    console.log('appoint successor', this.successorId);
    // TODO: GroupService.appointAdmin(...)
  }

  deleteGroup() {
    console.log('delete group', this.group.id);
    // TODO: GroupService.deleteGroup(...) then navigate away
  }
}
