
import { Discipline, SpotCategory, Difficulty, SkillState, Spot, Skill, VerificationStatus, Collectible, CollectibleType, Rarity, ExtendedSession, Challenge, Mentor, MentorBadge, DailyNote } from './types';

export const RETRO_AVATARS = [
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=SkaterBoy',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=RetroContra',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=LegoMan',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=ArcadeQueen'
];

export const STATE_IMAGES: Record<string, string> = {
  "Maharashtra": "https://images.unsplash.com/photo-1562920618-3e26f9ee00ad?w=800",
  "Karnataka": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800",
  "Goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
  "Delhi": "https://images.unsplash.com/photo-1587474260584-136574528615?w=800",
  "Assam": "https://images.unsplash.com/photo-1572011700201-8316c09d5718?w=800",
  "Tamil Nadu": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
  "Telangana": "https://images.unsplash.com/photo-1572445271230-a78b5944a659?w=800",
  "West Bengal": "https://images.unsplash.com/photo-1558431382-bb7461053791?w=800",
  "Gujarat": "https://images.unsplash.com/photo-1599933023673-c248a3014795?w=800",
  "Punjab": "https://images.unsplash.com/photo-1605303273449-338600c71a36?w=800",
  "Haryana": "https://images.unsplash.com/photo-1622313762347-3c09fe5f2719?w=800",
  "Rajasthan": "https://images.unsplash.com/photo-1599661046289-e31887846eac?w=800"
};

export const MOCK_SPOTS: Spot[] = [
  {
    id: 'spot-mumbai-carter',
    name: 'Carter Road Skatepark',
    type: Discipline.SKATE,
    category: SpotCategory.PARK,
    difficulty: Difficulty.INTERMEDIATE,
    state: 'Maharashtra',
    surface: 'Smooth Concrete',
    location: { lat: 19.0607, lng: 72.8227, address: 'Bandra, Mumbai' },
    notes: 'Public promenade skatepark. Best vibes in the evening.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.8,
    images: ['https://images.unsplash.com/photo-1520156584189-1e4529f8c9b3?w=800'],
    sessions: []
  },
  {
    id: 'spot-pune-sahakar',
    name: 'Sahakarnagar Skatepark',
    type: Discipline.SKATE,
    category: SpotCategory.PARK,
    difficulty: Difficulty.INTERMEDIATE,
    state: 'Maharashtra',
    surface: 'Concrete',
    location: { lat: 18.4870, lng: 73.8470, address: 'Sahakarnagar, Pune' },
    notes: 'Municipal skatepark. Good concrete surface.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.5,
    sessions: []
  },
  {
    id: 'spot-lonavala-khandala',
    name: 'Khandala Ghat',
    type: Discipline.DOWNHILL,
    category: SpotCategory.DOWNHILL,
    difficulty: Difficulty.ADVANCED,
    state: 'Maharashtra',
    surface: 'Asphalt',
    location: { lat: 18.7509, lng: 73.3897, address: 'Lonavala' },
    notes: 'Classic ghats for longboard runs. High risk, high reward.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.9,
    sessions: []
  },
  {
    id: 'spot-blr-holystoked',
    name: 'Holystoked Skatepark',
    type: Discipline.SKATE,
    category: SpotCategory.DIY,
    difficulty: Difficulty.INTERMEDIATE,
    state: 'Karnataka',
    surface: 'Smooth Concrete',
    location: { lat: 12.9352, lng: 77.6245, address: 'Koramangala, Bengaluru' },
    notes: 'Community-built park. The heart of BLR skating.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.7,
    sessions: []
  },
  {
    id: 'spot-nandi-hills',
    name: 'Nandi Hills Descent',
    type: Discipline.DOWNHILL,
    category: SpotCategory.DOWNHILL,
    difficulty: Difficulty.ADVANCED,
    state: 'Karnataka',
    surface: 'Smooth Asphalt',
    location: { lat: 13.3702, lng: 77.6835, address: 'Chikkaballapur' },
    notes: 'Famous technical downhill run. 40+ hairpins. Early morning only.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 5.0,
    sessions: []
  },
  {
    id: 'spot-goa-anjuna',
    name: 'Anjuna Bowl',
    type: Discipline.SKATE,
    category: SpotCategory.PARK,
    difficulty: Difficulty.INTERMEDIATE,
    state: 'Goa',
    surface: 'Polished Concrete',
    location: { lat: 15.5736, lng: 73.7406, address: 'Anjuna' },
    notes: 'Concrete bowl by the beach. Beautiful at sunset.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.6,
    sessions: []
  },
  {
    id: 'spot-noida-pump',
    name: 'Noida Pump Track',
    type: Discipline.SKATE,
    category: SpotCategory.PARK,
    difficulty: Difficulty.INTERMEDIATE,
    state: 'Delhi',
    surface: 'Asphalt',
    location: { lat: 28.5355, lng: 77.3910, address: 'Noida Sector 78' },
    notes: 'Modern pumptrack and skate areas by 100Ramps.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.7,
    sessions: []
  },
  {
    id: 'spot-hyd-wallride',
    name: 'WallRide Park',
    type: Discipline.SKATE,
    category: SpotCategory.PARK,
    difficulty: Difficulty.INTERMEDIATE,
    state: 'Telangana',
    surface: 'Concrete/Composite',
    location: { lat: 17.3000, lng: 78.4250, address: 'Peerancheru, Hyderabad' },
    notes: 'First-class pumptrack and skatepark facility.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.9,
    sessions: []
  },
  {
    id: 'spot-kol-newtown',
    name: 'New Town Plaza',
    type: Discipline.SKATE,
    category: SpotCategory.STREET,
    difficulty: Difficulty.BEGINNER,
    state: 'West Bengal',
    surface: 'Concrete',
    location: { lat: 22.5873, lng: 88.4861, address: 'New Town, Kolkata' },
    notes: 'Municipal skatepark. Very active local community.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.4,
    sessions: []
  },
  {
    id: 'spot-raj-desert-dolphin',
    name: 'Desert Dolphin',
    type: Discipline.SKATE,
    category: SpotCategory.DIY,
    difficulty: Difficulty.INTERMEDIATE,
    state: 'Rajasthan',
    surface: 'Smooth Concrete',
    location: { lat: 26.2100, lng: 73.3200, address: 'Khempur' },
    notes: 'Large transition park built for the movie "Skater Girl".',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.8,
    sessions: []
  }
];

export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: 'battle-balewadi-kickflip',
    spotId: 'spot-mumbai-carter',
    creatorId: 'u-arjun',
    creatorName: 'Arjun S.',
    title: 'Carter Road Kickflip',
    description: 'Kickflip the gap over the planter.',
    difficulty: Difficulty.INTERMEDIATE,
    xpReward: 1200,
    completions: 14
  }
];

export const MOCK_SESSIONS: ExtendedSession[] = [
  {
    id: 'sess-1',
    userId: 'u-arjun',
    userName: 'Arjun S.',
    title: 'Sunday Morning Shred',
    date: '2025-05-20',
    time: '07:00',
    spotId: 'spot-mumbai-carter',
    spotName: 'Carter Road Skatepark',
    spotType: Discipline.SKATE,
    participants: ['u-arjun']
  }
];

export const MOCK_MENTORS: Mentor[] = [
  {
    id: 'm-1',
    userId: 'u-arjun',
    name: 'Arjun S.',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Arjun',
    disciplines: [Discipline.SKATE],
    rate: 800,
    bio: 'Specializing in technical street and ledge work.',
    rating: 4.9,
    reviewCount: 22,
    earnings: 15000,
    studentsTrained: 12,
    badges: [MentorBadge.CERTIFIED, MentorBadge.EXPERT]
  }
];

export const MOCK_NOTES: DailyNote[] = [
  {
    id: 'note-1',
    userId: 'u-system',
    date: new Date().toISOString().split('T')[0],
    text: 'Skate conditions in Mumbai are prime today. Humidity is low.',
    timestamp: new Date().toISOString()
  }
];

export const SKILL_LIBRARY: Skill[] = [
  { id: 'skate-ollie', name: 'Ollie', category: Discipline.SKATE, difficulty: Difficulty.BEGINNER, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=ArLl1N35ZWs' },
  { id: 'skate-kickflip', name: 'Kickflip', category: Discipline.SKATE, difficulty: Difficulty.INTERMEDIATE, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=p35Pj_b8W9U', prerequisiteId: 'skate-ollie' },
  { id: 'dh-footbrake', name: 'Footbrake', category: Discipline.DOWNHILL, difficulty: Difficulty.BEGINNER, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=6t2j7S7Jp4E' }
];

export const COLLECTIBLES_DATABASE: Collectible[] = [
  { id: 'deck_first_push', name: 'First Push', type: CollectibleType.DECK, rarity: Rarity.COMMON, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=deck1', description: 'Your first set of wheels.' }
];

export const MENTOR_BADGE_META: Record<string, { label: string, color: string }> = {
  [MentorBadge.CERTIFIED]: { label: 'SPOTS Certified', color: 'bg-indigo-500' },
  [MentorBadge.EXPERT]: { label: 'Expert Faculty', color: 'bg-amber-500' }
};
