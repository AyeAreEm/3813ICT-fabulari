import { Group, Room, Member } from './models';

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
