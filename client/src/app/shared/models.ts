export interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  ageRestriction: string;
  icon: string;
  isMember: boolean;
}

export interface Room {
  id: string;
  name: string;
}

export interface Member {
  id: string;
  name: string;
  initials: string;
  role: 'Admin' | 'Member';
}

export interface Message {
  id: string;
  authorId: string;
  authorName: string;
  initials: string;
  timestamp: string;
  text: string;
}

export type GroupRequestType = 'join' | 'kick' | 'room';

export interface GroupRequest {
  id: string;
  type: GroupRequestType;
  subjectName: string; // person name for join/kick, room name for 'room'
  message: string;
  date: string;
}

export interface CreateGroupRequest {
  id: string;
  requesterName: string;
  requesterId: string;
  proposedTitle: string;
  description: string;
  date: string;
}

export interface DeleteGroupRequest {
  id: string;
  requesterName: string;
  groupName: string;
  reason: string;
  date: string;
}

export interface BanRequest {
  id: string;
  proposedByName: string;
  proposedByRole: string;
  targetName: string;
  targetId: string;
  evidence: string;
  date: string;
}

export interface AuditLogEntry {
  id: string;
  dateTime: string;
  actor: string;
  action: string;
  metadata: string;
}
