import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ShellComponent } from '../shell/shell';
import { GroupCardComponent } from '../group-card/group-card';
import { ModalComponent } from '../modal/modal';
import { Group } from '../../shared/models';
import { MOCK_ALL_GROUPS, MOCK_MY_GROUPS } from '../../shared/mock-data';
import { GroupService } from '../../shared/group.service';
import { AuthService } from '../../shared/auth.service';

@Component({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ShellComponent, GroupCardComponent, ModalComponent],
  selector: 'app-browse-groups',
  styleUrl: './browse-groups.css',
  templateUrl: './browse-groups.html',
})
export class BrowseGroupsComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

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

  constructor(private router: Router, private groupService: GroupService) {}

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
    this.groupService.requestJoin(this.selectedGroup?.id!, this.joinMessage);
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

    let request = {
      id: "",
      requesterName: this.auth.currentUser?.firstName + " " + this.auth.currentUser?.lastName,
      requesterId: "",
      proposedTitle: this.createForm.value.title!,
      description: this.createForm.value.reason!,
      date: Date.now() + "",
    };
    this.groupService.requestGroupCreation(request).subscribe();
    this.createForm.reset({ minAge: 13 });
    this.closeCreateModal();
  }}
