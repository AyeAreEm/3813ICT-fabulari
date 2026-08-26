import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ShellComponent } from '../shell/shell';
import { GroupCardComponent } from '../group-card/group-card';
import { ModalComponent } from '../modal/modal';
import { Group } from '../../shared/models';
import { MOCK_ALL_GROUPS, MOCK_MY_GROUPS } from '../../shared/mock-data';

@Component({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ShellComponent, GroupCardComponent, ModalComponent],
  selector: 'app-browse-groups',
  styleUrl: './browse-groups.css',
  templateUrl: './browse-groups.html',
})
export class BrowseGroupsComponent {
  private fb = inject(FormBuilder);
  myGroups: Group[] = MOCK_MY_GROUPS;
  allGroups: Group[] = MOCK_ALL_GROUPS;

  selectedGroup: Group | null = null;
  joinMessage = '';

  showCreateModal = false;
  createForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    reason: ['', Validators.required],
    minAge: [13, [Validators.required, Validators.min(0), Validators.max(99)]]
  });

  constructor(private router: Router) {}

  onCardAction(group: Group) {
    if (group.isMember) {
      this.router.navigate(['/groups', group.id]);
    } else {
      this.selectedGroup = group;
      this.joinMessage = '';
    }
  }

  closeModal() {
    this.selectedGroup = null;
  }

  sendJoinRequest() {
    console.log('join request', this.selectedGroup?.id, this.joinMessage);
    // TODO: call GroupService.requestJoin(...)
    this.closeModal();
  }

  openCreateModal() {
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  submitCreateGroup() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    console.log('create group request', this.createForm.value);
    // TODO: GroupService.requestGroupCreation(...) — surfaces in admin/create-requests for Super Admin review
    this.createForm.reset({ minAge: 13 });
    this.closeCreateModal();
  }}
