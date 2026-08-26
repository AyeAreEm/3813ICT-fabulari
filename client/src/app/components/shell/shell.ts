import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Group } from '../../shared/models';

@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-shell',
  styleUrl: './shell.css',
  templateUrl: './shell.html',
})
export class ShellComponent {
  @Input() groups: Group[] = [];
  @Input() activeGroupId: string | null = null;
}
