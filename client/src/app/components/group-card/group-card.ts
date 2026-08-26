import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Group } from '../../shared/models';

@Component({
  imports: [CommonModule],
  selector: 'app-group-card',
  styleUrl: './group-card.css',
  templateUrl: './group-card.html',
})
export class GroupCardComponent {
  @Input({ required: true }) group!: Group;
  @Output() action = new EventEmitter<Group>();
}
