import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminShellComponent } from '../admin-shell/admin-shell';
import { ModalComponent } from '../modal/modal';
import { AuditLogEntry } from '../../shared/models';
import { AdminService } from '../../shared/super-admin.service';

@Component({
  imports: [CommonModule, AdminShellComponent, ModalComponent],
  selector: 'app-admin-logs',
  styleUrl: './admin-logs.css',
  templateUrl: './admin-logs.html',
})
export class AdminLogsComponent implements OnInit {
  logs = signal<AuditLogEntry[]>([]);
  selected: AuditLogEntry | null = null;
  admin = inject(AdminService);

  ngOnInit(): void {
    this.admin.getLogs().subscribe({
      next: (ls) => {
        console.log(ls);
        this.logs.set(ls);
      }
    })
  }

  view(log: AuditLogEntry) { this.selected = log; }
  close() { this.selected = null; }
}
