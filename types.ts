
export enum Discipline {
  SKATE = 'skate',
  DOWNHILL = 'downhill'
}

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export enum SkillState {
  LEARNING = 'learning',
  LANDED = 'landed',
  MASTERED = 'mastered'
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export enum CollectibleType {
  DECK = 'deck',
  WHEEL = 'wheel',
  STICKER = 'sticker',
  TROPHY = 'trophy'
}

export enum Rarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export interface Collectible {
  id: string;
  name: string;
  type: CollectibleType;
  rarity: Rarity;
  imageUrl: string;
  description: string;
  unlockCondition?: string; // Text description of how to get it
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  location: string;
  disciplines: Discipline[];
  level: number;
  xp: number;
  streak: number;
  masteredCount: number;
  isAdmin: boolean;
  onboardingComplete: boolean;
  avatar?: string;
  locker: string[]; // Array of Collectible IDs
  equippedDeckId?: string;
  completedChallengeIds: string[]; // New: Track completed challenges
  isMentor: boolean; // New: Mentor Status
  friends: string[]; // List of User IDs
  friendRequests: FriendRequest[];
  // User Preferences
  soundEnabled: boolean;
  retroModeEnabled: boolean;

  // Extended Profile
  phoneNumber?: string;
  address?: string;
  gender?: string;
  dateOfBirth?: string;
  instagramHandle?: string;
  bio?: string;
  stance?: 'regular' | 'goofy';
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
  userDeckId?: string; // To show deck icon in reviews
}

export interface DailyNote {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  text: string;
  timestamp: string;
}

export interface Challenge {
  id: string;
  spotId: string;
  creatorId: string;
  creatorName: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  xpReward: number;
  completions: number;
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  videoUrl: string;
  thumbnailUrl: string;
  date: string;
}

export type MentorBadge = 'VERIFIED_PRO' | 'RISING_STAR' | 'TOP_RATED' | 'COMMUNITY_FAV' | 'VETERAN';

export interface Mentor {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  disciplines: Discipline[];
  rate: number; // Price per session in INR
  bio: string;
  rating: number;
  reviewCount: number;
  earnings: number; // Total earnings
  studentsTrained: number;
  badges: MentorBadge[];
}

export interface Booking {
  id: string;
  mentorId: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  time: string;
  status: 'pending' | 'confirmed' | 'completed';
  amount: number;
  commission: number; // App fee
}

export interface Spot {
  id: string;
  name: string;
  type: Discipline;
  difficulty: Difficulty;
  state: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  notes: string;
  // Indexed Fields from Phase 5
  surface?: string; 
  risk?: string;
  
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  verificationNote?: string;
  images?: string[];
  sessions: Session[];
  rating: number;
  reviews?: Review[];
}

export interface Session {
  id: string;
  userId: string; // Acts as Host ID
  userName: string;
  title: string;
  date: string;
  time: string;
  note: string;
  attendees: string[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string; // ISO string or time string
  isSystem?: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: Discipline;
  difficulty: Difficulty;
  state: SkillState;
  videoUrl?: string;
  tutorialUrl: string;
  unlockableCollectibleId?: string;
}

export interface CommunityVideo {
  id: string;
  userName: string;
  discipline: Discipline;
  spotName?: string;
  videoUrl: string;
  thumbnailUrl: string;
  length: number;
}
