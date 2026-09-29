import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Group } from '../../shared/models';
import { AuthService } from '../../shared/auth.service';

@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-shell',
  styleUrl: './shell.css',
  templateUrl: './shell.html',
})
export class ShellComponent {
  private auth = inject(AuthService);

  name = (this.auth.currentUser?.firstName ?? "") + " " + (this.auth.currentUser?.lastName ?? "");

  @Input() groups: Group[] = [];
  @Input() activeGroupId: string | null = null;
}
