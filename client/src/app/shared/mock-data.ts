import { Group, Room, Member, Message, GroupRequest, CreateGroupRequest, DeleteGroupRequest, BanRequest, AuditLogEntry, AuthUser } from './models';

// TODO: replace all of this with real API calls once GroupService/UserService exist

export const MOCK_ROOMS: Room[] = [
  { id: 'general', name: 'General' },
];

export const MOCK_GROUP_REQUESTS: GroupRequest[] = [
  // { id: 'r1', type: 'join', subjectName: 'Julian Drake', message: 'Graphic designer transitioning to product. Excited to share my portfolio updates!', date: 'Jan 23, 2026' },
  // { id: 'r2', type: 'join', subjectName: 'Sophia Martinez', message: 'UX Researcher interested in weekly typography and layout feedback.', date: 'Jan 24, 2026' },
  // { id: 'r3', type: 'kick', subjectName: 'SpamBot99', message: 'Spamming links across multiple chat rooms.', date: 'Jan 24, 2026' },
  // { id: 'r4', type: 'room', subjectName: 'Blender', message: 'Room to discuss and talk about the 3D modeling software Blender.', date: 'Jan 24, 2026' },
];

export const MOCK_CREATE_REQUESTS: CreateGroupRequest[] = [
  // { id: 'cg1', requesterName: 'Sophia Martinez', requesterId: '52891', proposedTitle: 'Creative Designers', description: 'A home for product designers, typographers, and illustration enthusiasts. We plan to host weekly design challenges and critique sessions.', date: 'Jan 24, 2026' },
  // { id: 'cg2', requesterName: 'Julian Drake', requesterId: '52892', proposedTitle: 'Fabulari Developers', description: 'Open support for developers building on the Fabulari platform.', date: 'Jan 23, 2026' },
  // { id: 'cg3', requesterName: 'Arthur Dent', requesterId: '52893', proposedTitle: 'Tea & Philosophy', description: 'Discussing local leaves and life, the universe and everything.', date: 'Jan 22, 2026' },
];

export const MOCK_DELETE_REQUESTS: DeleteGroupRequest[] = [
  // { id: 'dg1', requesterName: 'Marcus Vance', groupName: 'Old Crypto Group', reason: 'This community has been inactive for over a year and is currently attracting spam. The moderation team recommends purging.', date: 'Jan 24, 2026' },
  // { id: 'dg2', requesterName: 'David K.', groupName: 'Book Club & Coffee', reason: 'Activity migrated to another platform.', date: 'Jan 22, 2026' },
];

export const MOCK_BAN_REQUESTS: BanRequest[] = [
  // { id: 'br1', proposedByName: 'Alex Mercer', proposedByRole: 'Mod', targetName: 'SpamBot99', targetId: '831209', evidence: 'User has posted the same advertising link over 47 times in the general lobby room within 5 minutes.', date: 'Jan 24, 2026' },
  // { id: 'br2', proposedByName: 'Sarah Jenkins', proposedByRole: 'Mod', targetName: 'ToxicPlayer1', targetId: '774213', evidence: 'Continuous hostile language directed at other members despite repeated warnings.', date: 'Jan 24, 2026' },
];

export const MOCK_LOGS: AuditLogEntry[] = [
  // { id: 'l1', dateTime: 'Jan 24, 15:45', actor: 'System', action: 'Approved group creation: Creative Designers', metadata: 'Request originally filed by Sophia Martinez. Automatically processed and approved by Super Admin via central moderation dashboard pipeline.' },
  // { id: 'l2', dateTime: 'Jan 24, 14:12', actor: 'Super Admin', action: 'Denied deletion request: Book Club & Coffee', metadata: 'Reason provided was insufficient to justify permanent deletion.' },
  // { id: 'l3', dateTime: 'Jan 24, 11:30', actor: 'System', action: 'Banned user: SpamBot99', metadata: 'Escalated by Alex Mercer (Channel Mod) for repeated spam violations.' },
  // { id: 'l4', dateTime: 'Jan 23, 19:22', actor: 'Super Admin', action: 'Approved kick request: ToxicPlayer1', metadata: 'Reviewed evidence submitted by group moderators.' },
  // { id: 'l5', dateTime: 'Jan 23, 16:05', actor: 'System', action: 'Created room: Blender', metadata: 'Auto-approved under trusted group policy for Creative Designers.' },
  // { id: 'l6', dateTime: 'Jan 23, 09:14', actor: 'Super Admin', action: 'Denied group creation: Spam Central', metadata: 'Flagged as duplicate of an existing community.' },
];
