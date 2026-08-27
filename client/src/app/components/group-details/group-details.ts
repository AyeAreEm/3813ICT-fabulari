import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ShellComponent } from '../shell/shell';
import { GroupNavComponent } from '../group-nav/group-nav';
import { ModalComponent } from '../modal/modal';
import { GroupSettingsComponent } from '../group-settings/group-settings';
import { Group, Member, Room } from '../../shared/models';
import { MOCK_ROOMS } from '../../shared/mock-data';
import { AuthService } from '../../shared/auth.service';
import { GroupService } from '../../shared/group.service';

@Component({
  imports: [CommonModule, ShellComponent, GroupNavComponent, ModalComponent, GroupSettingsComponent],
  selector: 'app-group-details',
  styleUrl: './group-details.css',
  templateUrl: './group-details.html',
})
export class GroupDetailsComponent implements OnInit, OnDestroy {
  myGroups = signal<Group[]>([]);
  group = signal<Group>({} as Group);
  rooms: Room[] = MOCK_ROOMS;
  members = signal<Member[]>([]);
  showSettings = false;

  private paramSub?: Subscription;

  constructor(private route: ActivatedRoute, private auth: AuthService, private groupService: GroupService) {}

  ngOnInit() {
    this.groupService.getMyGroups().subscribe({
      next: (gs) => {
        this.myGroups.update(_ => gs)
      }
    });

    this.paramSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id')!;
      this.groupService.getGroup(id).subscribe(g => {
        this.group.set(g);
      });

      this.groupService.getMembers(id).subscribe(ms => {
        this.members.set(ms);
      });

      this.showSettings = false;
    });
  }

  ngOnDestroy() {
    this.paramSub?.unsubscribe();
  }

  get isGroupAdmin(): boolean {
    return this.members().some(m => m.id === this.auth.currentUser?.email && m.role === 'Admin');
  }

  openSettings() {
    this.showSettings = true;
  }

  closeSettings() {
    this.showSettings = false;
  }
}
