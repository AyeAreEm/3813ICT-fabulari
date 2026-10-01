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

export interface Attachment {
  url: string;
  type: string;
  size: number;
  name: string;
}

export interface Message {
  id: string;
  authorId: string;
  authorName: string;
  initials: string;
  timestamp: string;
  text: string;
  attachment?: Attachment;
}

export interface RoomNotice {
  id: string;
  kind: 'joined' | 'left';
  userId: string;
  name: string;
  timestamp: string;
}

export interface PresenceUser {
  id: string;
  name: string;
  initials: string;
  role: 'Admin' | 'Member';
}

export type FeedItem =
  | { type: 'message'; message: Message }
  | { type: 'notice'; notice: RoomNotice };

export type GroupRequestType = 'join' | 'kick' | 'room';
export interface GroupRequest {
  id: string;
  type: GroupRequestType;
  subjectName: string; // person name for join/kick, room name for 'room'
  targetId?: string; // kick only: email of the member the kick is aimed at
  requesterName?: string; // kick only: who submitted the request
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
  ageRestriction: number;
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
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dob?: string;
  initials: string;
  isSuperAdmin: boolean;
}

export interface SignupPayload {
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  password: string;
}
