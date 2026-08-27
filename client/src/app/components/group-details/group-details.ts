import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ShellComponent } from '../shell/shell';
import { GroupNavComponent } from '../group-nav/group-nav';
import { ModalComponent } from '../modal/modal';
import { GroupSettingsComponent } from '../group-settings/group-settings';
import { Group, Member, Room } from '../../shared/models';
import { MOCK_ALL_GROUPS, MOCK_MEMBERS, MOCK_MY_GROUPS, MOCK_ROOMS } from '../../shared/mock-data';
import { AuthService } from '../../shared/auth.service';

@Component({
  imports: [CommonModule, ShellComponent, GroupNavComponent, ModalComponent, GroupSettingsComponent],
  selector: 'app-group-details',
  styleUrl: './group-details.css',
  templateUrl: './group-details.html',
})
export class GroupDetailsComponent implements OnInit {
  myGroups: Group[] = MOCK_MY_GROUPS;
  group!: Group;
  rooms: Room[] = MOCK_ROOMS;
  members: Member[] = MOCK_MEMBERS;
  showSettings = false;

  private paramSub?: Subscription;

  constructor(private route: ActivatedRoute, private auth: AuthService) {}

  ngOnInit() {
    this.paramSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      // TODO: replace with GroupService.getGroup(id) + GroupService.getMembers(id)
      this.group = MOCK_ALL_GROUPS.find(g => g.id === id) ?? MOCK_ALL_GROUPS[0];
      this.showSettings = false;
    });
  }

  ngOnDestroy() {
    this.paramSub?.unsubscribe();
  }

  get isGroupAdmin(): boolean {
    return this.members.some(m => m.id === this.auth.currentUser?.email && m.role === 'Admin');
  }

  openSettings() {
    this.showSettings = true;
  }

  closeSettings() {
    this.showSettings = false;
  }
}
