import { Group, Room, Member, Message, GroupRequest, CreateGroupRequest, DeleteGroupRequest, BanRequest, AuditLogEntry, AuthUser } from './models';

// TODO: replace all of this with real API calls once GroupService/UserService exist

export const MOCK_MY_GROUPS: Group[] = [
  { id: 'creative-designers', name: 'Creative Designers', description: 'A home for product designers, typographers, and illustration enthusiasts. Share your current projects, request design feedback, or browse our weekly design challenges.', memberCount: 1240, ageRestriction: '16+', icon: '🎨', isMember: true },
  { id: 'fabulari-developers', name: 'Fabulari Developers', description: 'Open discussion on Fabulari APIs, web sockets, and component libraries.', memberCount: 840, ageRestriction: '18+', icon: '💻', isMember: true },
  { id: 'book-club-coffee', name: 'Book Club & Coffee', description: 'Monthly reading goals paired with the absolute best roasts.', memberCount: 420, ageRestriction: '16+', icon: '📚', isMember: true },
];

export const MOCK_ALL_GROUPS: Group[] = [
  ...MOCK_MY_GROUPS,
  { id: 'gaming-community', name: 'Gaming Community', description: "Let's matchmake and host weekend squad tournaments across PC & console. Apply below to request direct community access.", memberCount: 3100, ageRestriction: '13+', icon: '🎮', isMember: false },
];

export const MOCK_ROOMS: Room[] = [
  { id: 'general', name: 'General' },
  { id: 'off-topic', name: 'Off-topic' },
  { id: 'announcements', name: 'Announcements' },
];

export const MOCK_MEMBERS: Member[] = [
  { id: 'jane-doe', name: 'Jane Doe', initials: 'JD', role: 'Admin' },
  { id: 'alex-mercer', name: 'Alex Mercer', initials: 'AM', role: 'Member' },
  { id: 'david-k', name: 'David K.', initials: 'DK', role: 'Member' },
];

export const MOCK_MESSAGES: Message[] = [
  { id: '1', authorId: 'jane-doe', authorName: 'Jane Doe', initials: 'JD', timestamp: '10:14 AM', text: 'Hey team! Happy to join the challenge this week. Has anyone picked out their color palette yet?' },
  { id: '2', authorId: 'alex-mercer', authorName: 'Alex Mercer', initials: 'AM', timestamp: '10:16 AM', text: 'Welcome Jane! I am going for a retro warm palette. Lot of cream, soft clay tones, and deep forest green.' },
  { id: '3', authorId: 'david-k', authorName: 'David K.', initials: 'DK', timestamp: '10:17 AM', text: 'Same here. I think sticking to 3 primary tones is the sweet spot. Keeps the UI focused.' },
  { id: '4', authorId: 'sophia-martinez', authorName: 'Sophia Martinez', initials: 'SM', timestamp: '10:20 AM', text: 'We actually published some helpful reference guidelines in the #Announcements channel too if you need inspiration.' },
  { id: '5', authorId: 'jane-doe', authorName: 'Jane Doe', initials: 'JD', timestamp: '10:22 AM', text: 'Perfect, checking that out now. Thanks for the quick pointers everyone!' },
];

export const MOCK_GROUP_REQUESTS: GroupRequest[] = [
  { id: 'r1', type: 'join', subjectName: 'Julian Drake', message: 'Graphic designer transitioning to product. Excited to share my portfolio updates!', date: 'Jan 23, 2026' },
  { id: 'r2', type: 'join', subjectName: 'Sophia Martinez', message: 'UX Researcher interested in weekly typography and layout feedback.', date: 'Jan 24, 2026' },
  { id: 'r3', type: 'kick', subjectName: 'SpamBot99', message: 'Spamming links across multiple chat rooms.', date: 'Jan 24, 2026' },
  { id: 'r4', type: 'room', subjectName: 'Blender', message: 'Room to discuss and talk about the 3D modeling software Blender.', date: 'Jan 24, 2026' },
];

export const MOCK_CREATE_REQUESTS: CreateGroupRequest[] = [
  { id: 'cg1', requesterName: 'Sophia Martinez', requesterId: '52891', proposedTitle: 'Creative Designers', description: 'A home for product designers, typographers, and illustration enthusiasts. We plan to host weekly design challenges and critique sessions.', date: 'Jan 24, 2026' },
  { id: 'cg2', requesterName: 'Julian Drake', requesterId: '52892', proposedTitle: 'Fabulari Developers', description: 'Open support for developers building on the Fabulari platform.', date: 'Jan 23, 2026' },
  { id: 'cg3', requesterName: 'Arthur Dent', requesterId: '52893', proposedTitle: 'Tea & Philosophy', description: 'Discussing local leaves and life, the universe and everything.', date: 'Jan 22, 2026' },
];

export const MOCK_DELETE_REQUESTS: DeleteGroupRequest[] = [
  { id: 'dg1', requesterName: 'Marcus Vance', groupName: 'Old Crypto Group', reason: 'This community has been inactive for over a year and is currently attracting spam. The moderation team recommends purging.', date: 'Jan 24, 2026' },
  { id: 'dg2', requesterName: 'David K.', groupName: 'Book Club & Coffee', reason: 'Activity migrated to another platform.', date: 'Jan 22, 2026' },
];

export const MOCK_BAN_REQUESTS: BanRequest[] = [
  { id: 'br1', proposedByName: 'Alex Mercer', proposedByRole: 'Mod', targetName: 'SpamBot99', targetId: '831209', evidence: 'User has posted the same advertising link over 47 times in the general lobby room within 5 minutes.', date: 'Jan 24, 2026' },
  { id: 'br2', proposedByName: 'Sarah Jenkins', proposedByRole: 'Mod', targetName: 'ToxicPlayer1', targetId: '774213', evidence: 'Continuous hostile language directed at other members despite repeated warnings.', date: 'Jan 24, 2026' },
];

export const MOCK_LOGS: AuditLogEntry[] = [
  { id: 'l1', dateTime: 'Jan 24, 15:45', actor: 'System', action: 'Approved group creation: Creative Designers', metadata: 'Request originally filed by Sophia Martinez. Automatically processed and approved by Super Admin Jane via central moderation dashboard pipeline.' },
  { id: 'l2', dateTime: 'Jan 24, 14:12', actor: 'Super Admin Jane', action: 'Denied deletion request: Book Club & Coffee', metadata: 'Reason provided was insufficient to justify permanent deletion.' },
  { id: 'l3', dateTime: 'Jan 24, 11:30', actor: 'System', action: 'Banned user: SpamBot99', metadata: 'Escalated by Alex Mercer (Channel Mod) for repeated spam violations.' },
  { id: 'l4', dateTime: 'Jan 23, 19:22', actor: 'Super Admin Jane', action: 'Approved kick request: ToxicPlayer1', metadata: 'Reviewed evidence submitted by group moderators.' },
  { id: 'l5', dateTime: 'Jan 23, 16:05', actor: 'System', action: 'Created room: Blender', metadata: 'Auto-approved under trusted group policy for Creative Designers.' },
  { id: 'l6', dateTime: 'Jan 23, 09:14', actor: 'Super Admin Jane', action: 'Denied group creation: Spam Central', metadata: 'Flagged as duplicate of an existing community.' },
];

export const MOCK_CURRENT_USER: AuthUser = {
  id: 'jane-doe',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@email.com',
  initials: 'JD',
  isSuperAdmin: true
};
