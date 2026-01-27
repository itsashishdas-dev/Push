
export enum Discipline {
  SKATE = 'skate',
  DOWNHILL = 'downhill',
  FREESTYLE = 'freestyle'
}

export enum SpotCategory {
  STREET = 'street',
  PARK = 'park',
  DIY = 'diy',
  DOWNHILL = 'downhill',
  FLATGROUND = 'flatground'
}

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  PRO = 'pro'
}

export enum SkillState {
  LOCKED = 'locked',
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

export enum SpotStatus {
  DRY = 'dry',
  WET = 'wet',
  CROWDED = 'crowded',
  MAINTENANCE = 'maintenance'
}

export enum SpotPrivacy {
  PUBLIC = 'public',
  CREW = 'crew',
  PRIVATE = 'private'
}

export enum CollectibleType {
  DECK = 'deck',
  STICKER = 'sticker',
  TROPHY = 'trophy'
}

export enum Rarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum MentorBadge {
  CERTIFIED = 'certified',
  EXPERT = 'expert'
}

export enum BadgeTier {
  ROOKIE = 'rookie',
  INITIATE = 'initiate',
  SKILLED = 'skilled',
  VETERAN = 'veteran',
  LEGEND = 'legend'
}

// --- UI STATE TYPES ---
export type AppView = 'MAP' | 'LIST' | 'CHALLENGES' | 'MENTORSHIP' | 'JOURNEY' | 'PROFILE' | 'CREW' | 'ADMIN';
export type ModalType = 'NONE' | 'SPOT_DETAIL' | 'ADD_SPOT' | 'CREATE_SESSION' | 'CREATE_CHALLENGE' | 'SETTINGS' | 'VIDEO_UPLOAD' | 'CHAT';

export interface Badge {
  id: string;
  name: string;
  description: string;
  tier: BadgeTier;
  icon: string; 
  conditionDescription: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'CHECK_IN' | 'UPLOAD' | 'DISTANCE';
  target: number;
  current: number;
  xpReward: number;
  isCompleted: boolean;
  expiresIn: string;
}

export interface Collectible {
  id: string;
  name: string;
  type: CollectibleType;
  rarity: Rarity;
  imageUrl: string;
  description: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Crew {
  id: string;
  name: string;
  moto?: string;
  city: string;
  avatar: string;
  homeSpotId?: string;
  homeSpotName?: string;
  maxMembers?: number;
  members: string[];
  adminIds: string[]; // List of user IDs who can manage the crew
  requests: string[]; // List of user IDs requesting to join
  level: number;
  totalXp: number;
  weeklyGoal: {
    description: string;
    current: number;
    target: number;
  };
  nextSession?: {
    text: string;
    date: string;
    author: string;
  };
}

export interface MentorApplication {
  experience: string;
  style: string;
  rate: number;
  videoUrl: string;
  thumbnailUrl?: string;
}

export interface Booking {
  id: string;
  mentorId: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
  commission: number;
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

export interface User {
  id: string;
  shareId?: string; // Unique short code for invites
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
  locker: string[];
  completedChallengeIds: string[];
  pendingSkills: string[];
  landedSkills: string[];
  masteredSkills: string[];
  badges: string[];
  isMentor: boolean;
  friends: string[];
  friendRequests: FriendRequest[];
  crewId?: string;
  soundEnabled: boolean;
  retroModeEnabled: boolean;
  notificationsEnabled: boolean;
  stance?: 'regular' | 'goofy';
  bio?: string;
  phoneNumber?: string;
  address?: string;
  gender?: string;
  dateOfBirth?: string;
  instagramHandle?: string;
  equippedDeckId?: string;
  deckDetails?: {
    skate?: string;
    downhill?: string;
  };
  stats?: {
    totalSessions: number;
    spotsFound: number;
    distanceTraveled: number;
  }
}

export interface Spot {
  id: string;
  ownerId?: string; // Creator ID for privacy management
  name: string;
  type: Discipline;
  category?: SpotCategory;
  difficulty: Difficulty;
  state: string;
  surface: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  notes: string;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  status?: SpotStatus;
  privacy: SpotPrivacy; // Visibility Protocol
  distance?: number;
  images?: string[];
  videoUrl?: string; // Short clip
  sessions: any[];
  rating: number;
  reviews?: Review[];
  verificationNote?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
  time?: string;
}

export interface ExtendedSession {
  id: string;
  userId: string;
  userName: string;
  title: string;
  date: string;
  time: string;
  spotId: string;
  spotName: string;
  spotType: Discipline;
  participants: string[];
  reminderSet?: boolean;
  notes?: string;
  intent?: string;
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

export interface Mentor {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  disciplines: Discipline[];
  rate: number;
  bio: string;
  rating: number;
  reviewCount: number;
  earnings: number;
  studentsTrained: number;
  badges: MentorBadge[];
  stats?: {
      technical: number;
      style: number;
      teaching: number;
  }
}

export interface Skill {
  id: string;
  name: string;
  category: Discipline;
  difficulty: Difficulty;
  tier: 1 | 2 | 3 | 4;
  description: string;
  xpReward: number;
  tutorialUrl: string;
  prerequisiteId?: string;
  isCustom?: boolean;
}

export interface ChatMessage {
  id: string;
  sessionId: string; // Used for both Crew ID and Session ID
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface DailyNote {
  id: string;
  userId: string;
  date: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  timestamp: string;
}
