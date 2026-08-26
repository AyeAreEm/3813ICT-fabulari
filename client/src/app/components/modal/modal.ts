import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  selector: 'app-modal',
  styleUrl: './modal.css',
  templateUrl: './modal.html',
})
export class ModalComponent {
  @Input() maxWidth = '480px';
  @Output() closed = new EventEmitter<void>();

  onBackdropClick() {
    this.closed.emit();
  }
}
