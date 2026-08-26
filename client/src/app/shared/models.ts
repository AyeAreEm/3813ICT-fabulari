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
