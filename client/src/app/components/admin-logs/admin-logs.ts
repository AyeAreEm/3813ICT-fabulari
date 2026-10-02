import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminShellComponent } from '../admin-shell/admin-shell';
import { AuditLogEntry } from '../../shared/models';
import { AdminService } from '../../shared/super-admin.service';

@Component({
  imports: [CommonModule, FormsModule, AdminShellComponent],
  providers: [DatePipe],
  selector: 'app-admin-logs',
  styleUrl: './admin-logs.css',
  templateUrl: './admin-logs.html',
})
export class AdminLogsComponent implements OnInit {
  logs = signal<AuditLogEntry[]>([]);
  searchTerm = signal<string>('');
  selected: AuditLogEntry | null = null;

  private admin = inject(AdminService);
  private datePipe = inject(DatePipe);

  filteredLogs = computed(() => {
    const query = this.searchTerm().toLowerCase().trim();
    if (!query) return this.logs();

    return this.logs().filter((log) => {
      const actorMatch = log.actor?.toLowerCase().includes(query) ?? false;
      const actionMatch = log.action?.toLowerCase().includes(query) ?? false;

      const formattedDate = log.dateTime
        ? this.datePipe.transform(log.dateTime, 'yyyy-MM-dd h:mm a')?.toLowerCase() ?? ''
        : '';
      const dateMatch = formattedDate.includes(query);

      return actorMatch || actionMatch || dateMatch;
    });
  });

  ngOnInit(): void {
    this.admin.getLogs().subscribe({
      next: (ls) => {
        this.logs.set(ls);
      },
    });
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
  }
}
