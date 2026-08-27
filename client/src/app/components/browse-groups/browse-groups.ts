import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ShellComponent } from '../shell/shell';
import { GroupCardComponent } from '../group-card/group-card';
import { ModalComponent } from '../modal/modal';
import { Group } from '../../shared/models';
import { GroupService } from '../../shared/group.service';
import { AuthService } from '../../shared/auth.service';

@Component({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ShellComponent, GroupCardComponent, ModalComponent],
  selector: 'app-browse-groups',
  styleUrl: './browse-groups.css',
  templateUrl: './browse-groups.html',
})
export class BrowseGroupsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  constructor(private router: Router, private groupService: GroupService) {}

  myGroups = signal<Group[]>([]);
  allGroups = signal<Group[]>([]);

  ngOnInit() {
    this.groupService.getMyGroups().subscribe({
      next: (gs) => {
        this.myGroups.set(gs)
      }
    });
    this.groupService.getAllGroups().subscribe({
      next: (gs) => {
        this.allGroups.update(_ => gs)
      }
    })
  }

  selectedGroup: Group | null = null;
  joinMessage = '';

  showCreateModal = false;
  createForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    minAge: [13, [Validators.required, Validators.min(0), Validators.max(99)]]
  });

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
    this.groupService.requestJoin(this.selectedGroup?.id!, this.joinMessage).subscribe();
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
      id: crypto.randomUUID(),
      requesterName: this.auth.currentUser?.firstName + " " + this.auth.currentUser?.lastName,
      requesterId: this.auth.currentUser?.email!,
      proposedTitle: this.createForm.value.title!,
      description: this.createForm.value.description!,
      date: Date.now() + "",
      ageRestriction: this.createForm.value.minAge!,
    };
    this.groupService.requestGroupCreation(request).subscribe();
    this.createForm.reset({ minAge: 13 });
    this.closeCreateModal();
  }}
