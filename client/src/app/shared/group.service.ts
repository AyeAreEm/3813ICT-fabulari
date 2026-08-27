import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group, GroupRequest, Member, Room, CreateGroupRequest } from './models';

const apiUrl = "http://localhost:3000";

@Injectable({ providedIn: 'root' })
export class GroupService {
  constructor(private http: HttpClient) {}

  getMyGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${apiUrl}/groups/mine`);
  }

  getAllGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${apiUrl}/groups`);
  }

  getGroup(id: string): Observable<Group> {
    return this.http.get<Group>(`${apiUrl}/groups/${id}`);
  }

  getMembers(groupId: string): Observable<Member[]> {
    return this.http.get<Member[]>(`${apiUrl}/groups/${groupId}/members`);
  }

  getRooms(groupId: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${apiUrl}/groups/${groupId}/rooms`);
  }

  requestJoin(groupId: string, message: string): Observable<void> {
    return this.http.post<void>(`${apiUrl}/groups/${groupId}/join-requests`, { message });
  }

  requestGroupCreation(request: CreateGroupRequest): Observable<void> {
    return this.http.post<void>(`${apiUrl}/create-group-requests`, request);
  }

  requestKick(groupId: string, memberId: string, reason: string): Observable<void> {
    return this.http.post<void>(`${apiUrl}/groups/${groupId}/kick-requests`, { memberId, reason });
  }

  requestRoom(groupId: string, name: string, reason: string): Observable<void> {
    return this.http.post<void>(`${apiUrl}/groups/${groupId}/room-requests`, { name, reason });
  }

  getGroupRequests(groupId: string): Observable<GroupRequest[]> {
    return this.http.get<GroupRequest[]>(`${apiUrl}/groups/${groupId}/requests`);
  }

  approveRequest(groupId: string, requestId: string): Observable<void> {
    return this.http.post<void>(`${apiUrl}/groups/${groupId}/requests/${requestId}/approve`, {});
  }

  denyRequest(groupId: string, requestId: string): Observable<void> {
    return this.http.post<void>(`${apiUrl}/groups/${groupId}/requests/${requestId}/deny`, {});
  }

  escalateBan(groupId: string, requestId: string): Observable<void> {
    return this.http.post<void>(`${apiUrl}/groups/${groupId}/requests/${requestId}/escalate-ban`, {});
  }

  updateSettings(groupId: string, payload: { description: string; colour: string }): Observable<Group> {
    return this.http.patch<Group>(`${apiUrl}/groups/${groupId}/settings`, payload);
  }

  appointSuccessor(groupId: string, memberId: string): Observable<void> {
    return this.http.post<void>(`${apiUrl}/groups/${groupId}/appoint-successor`, { memberId });
  }

  deleteGroup(groupId: string): Observable<void> {
    return this.http.delete<void>(`${apiUrl}/groups/${groupId}`);
  }
}
