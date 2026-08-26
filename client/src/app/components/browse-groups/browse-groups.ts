import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ShellComponent } from '../shell/shell';
import { GroupCardComponent } from '../group-card/group-card';
import { ModalComponent } from '../modal/modal';
import { Group } from '../../shared/models';
import { MOCK_ALL_GROUPS, MOCK_MY_GROUPS } from '../../shared/mock-data';

@Component({
  imports: [CommonModule, FormsModule, ShellComponent, GroupCardComponent, ModalComponent],
  selector: 'app-browse-groups',
  styleUrl: './browse-groups.css',
  templateUrl: './browse-groups.html',
})
export class BrowseGroupsComponent {
  myGroups: Group[] = MOCK_MY_GROUPS;
  allGroups: Group[] = MOCK_ALL_GROUPS;

  selectedGroup: Group | null = null;
  joinMessage = '';

  private router = inject(Router);

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
}
