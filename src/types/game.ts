// Core game types for Puzzle Kit prototype

export interface PlayerState {
  coins: number;
  lives: number;
  maxLives: number;
  stars: number;
  currentLevel: number;
  currentArea: number;
  teamId: string | null;
  username: string;
}

export interface AreaTask {
  id: string;
  name: string;
  starsRequired: number;
  completed: boolean;
}

export interface Area {
  id: number;
  name: string;
  tasks: AreaTask[];
  completed: boolean;
  unlocked: boolean;
}

export interface Booster {
  id: string;
  name: string;
  type: 'pre-game' | 'in-game';
  count: number;
  description: string;
}

export interface LiveOpsEvent {
  id: string;
  type: EventType;
  name: string;
  active: boolean;
  endTime: Date | null;
  progress: number;
  maxProgress: number;
  rewards: Reward[];
}

export type EventType =
  | 'royal-pass'
  | 'sky-race'
  | 'kings-cup'
  | 'team-chest'
  | 'book-of-treasure'
  | 'lightning-rush'
  | 'lava-quest'
  | 'album'
  | 'collection';

export interface Reward {
  type: 'coins' | 'booster' | 'stars' | 'lives' | 'card';
  amount: number;
  name?: string;
}

export interface TeamMember {
  id: string;
  username: string;
  level: number;
  contributedStars: number;
  online: boolean;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  maxMembers: number;
  weeklyStars: number;
  rank: number;
  chestProgress: number;
  chestGoal: number;
}

export interface ShopItem {
  id: string;
  category: 'coins' | 'booster' | 'special';
  name: string;
  price: number;
  value: number;
  bonus?: number;
  featured?: boolean;
}

export interface Settings {
  music: boolean;
  sound: boolean;
  notifications: boolean;
  haptics: boolean;
  language: string;
}

export interface InboxMessage {
  id: string;
  type: 'reward' | 'news' | 'team' | 'system';
  title: string;
  content: string;
  claimed: boolean;
  reward?: Reward;
  timestamp: Date;
}

export interface DailyReward {
  day: number;
  reward: Reward;
  claimed: boolean;
  current: boolean;
}
