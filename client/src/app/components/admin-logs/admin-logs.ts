import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminShellComponent } from '../admin-shell/admin-shell';
import { ModalComponent } from '../modal/modal';
import { AuditLogEntry } from '../../shared/models';
import { MOCK_LOGS } from '../../shared/mock-data';

@Component({
  imports: [CommonModule, AdminShellComponent, ModalComponent],
  selector: 'app-admin-logs',
  styleUrl: './admin-logs.css',
  templateUrl: './admin-logs.html',
})
export class AdminLogsComponent {
  logs: AuditLogEntry[] = MOCK_LOGS;
  selected: AuditLogEntry | null = null;

  view(log: AuditLogEntry) { this.selected = log; }
  close() { this.selected = null; }
}
