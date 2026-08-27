import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditLogEntry, BanRequest, CreateGroupRequest, DeleteGroupRequest } from './models';

const apiUrl = "http://localhost:3000";

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  getCreateRequests(): Observable<CreateGroupRequest[]> {
    return this.http.get<CreateGroupRequest[]>(`${apiUrl}/create-group-requests`);
  }
  approveCreateRequest(id: string): Observable<void> {
    return this.http.post<void>(`${apiUrl}/admin/create-requests/${id}/approve`, {});
  }
  denyCreateRequest(id: string): Observable<void> {
    return this.http.post<void>(`${apiUrl}/admin/create-requests/${id}/deny`, {});
  }

  getDeleteRequests(): Observable<DeleteGroupRequest[]> {
    return this.http.get<DeleteGroupRequest[]>(`${apiUrl}/admin/delete-requests`);
  }
  confirmDeleteRequest(id: string): Observable<void> {
    return this.http.post<void>(`${apiUrl}/admin/delete-requests/${id}/confirm`, {});
  }
  denyDeleteRequest(id: string): Observable<void> {
    return this.http.post<void>(`${apiUrl}/admin/delete-requests/${id}/deny`, {});
  }

  getBanRequests(): Observable<BanRequest[]> {
    return this.http.get<BanRequest[]>(`${apiUrl}/admin/ban-requests`);
  }
  banUser(id: string): Observable<void> {
    return this.http.post<void>(`${apiUrl}/admin/ban-requests/${id}/ban`, {});
  }
  dismissBanFlag(id: string): Observable<void> {
    return this.http.post<void>(`${apiUrl}/admin/ban-requests/${id}/dismiss`, {});
  }

  submitBanRequest(payload: { userToBan: string; requestFrom: string; reason: string }): Observable<void> {
    return this.http.post<void>(`${apiUrl}/ban-requests`, payload);
  }

  getLogs(): Observable<AuditLogEntry[]> {
    return this.http.get<AuditLogEntry[]>(`${apiUrl}/admin/logs`);
  }
}
