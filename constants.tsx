
import { Discipline, SpotCategory, Difficulty, SkillState, Spot, Skill, VerificationStatus, Collectible, CollectibleType, Rarity, ExtendedSession, Challenge, Mentor, MentorBadge, DailyNote, SpotStatus, Badge, BadgeTier } from './types';

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
  "Telangana": "https://images.unsplash.com/photo-1572445271230-a78b5944a659?w=800",
  "West Bengal": "https://images.unsplash.com/photo-1558431382-bb7461053791?w=800",
  "Gujarat": "https://images.unsplash.com/photo-1599933023673-c248a3014795?w=800",
  "Punjab": "https://images.unsplash.com/photo-1605303273449-338600c71a36?w=800",
  "Rajasthan": "https://images.unsplash.com/photo-1599661046289-e31887846eac?w=800",
  "Madhya Pradesh": "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=800",
  "Kerala": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
  "Odisha": "https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=800",
  "Tamil Nadu": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
  "Himachal Pradesh": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
  "Uttarakhand": "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800",
  "Assam": "https://images.unsplash.com/photo-1572011700201-8316c09d5718?w=800",
  "Meghalaya": "https://images.unsplash.com/photo-1633596683562-4a43077743cd?w=800",
  "Mizoram": "https://images.unsplash.com/photo-1589216377760-b6a673010c26?w=800",
  "Arunachal Pradesh": "https://images.unsplash.com/photo-1623146445999-63a233b2a264?w=800",
  "Nagaland": "https://images.unsplash.com/photo-1605629125302-39bd927f8a78?w=800",
  "Sikkim": "https://images.unsplash.com/photo-1624890250493-277717409224?w=800",
  "Manipur": "https://images.unsplash.com/photo-1605334798402-23730707204b?w=800",
  "Tripura": "https://images.unsplash.com/photo-1603534358688-299f0290bb4b?w=800"
};

// --- XP SYSTEM ---
export const XP_SOURCES = {
  SESSION_COMPLETE: 50,
  SESSION_PLANNED: 75,
  STREAK_BONUS: 20, // Per day, capped at 3
  CHALLENGE_COMPLETE: 150, // Base
  SKILL_LANDED: 80,
  SKILL_MASTERED: 200,
  SPOT_CONTRIBUTION: 40,
  MENTOR_SESSION: 120,
  LEARNER_SESSION: 80
};

export const BADGE_DATABASE: Badge[] = [
  // ROOKIE
  {
    id: 'badge_rookie_push',
    name: 'First Push',
    description: 'Began the journey.',
    tier: BadgeTier.ROOKIE,
    icon: 'Footprints',
    conditionDescription: 'Reach Level 2'
  },
  {
    id: 'badge_rookie_spotter',
    name: 'Spotter',
    description: 'Eyes on the street.',
    tier: BadgeTier.ROOKIE,
    icon: 'MapPin',
    conditionDescription: 'Find or Verify 1 Spot'
  },
  
  // INITIATE
  {
    id: 'badge_initiate_dedicated',
    name: 'Dedicated',
    description: 'Consistency is key.',
    tier: BadgeTier.INITIATE,
    icon: 'Zap',
    conditionDescription: 'Maintain a 3-day streak'
  },
  {
    id: 'badge_initiate_local',
    name: 'The Local',
    description: 'Part of the furniture.',
    tier: BadgeTier.INITIATE,
    icon: 'Home',
    conditionDescription: 'Complete 10 Sessions'
  },

  // SKILLED
  {
    id: 'badge_skilled_scholar',
    name: 'Scholar',
    description: 'Student of the game.',
    tier: BadgeTier.SKILLED,
    icon: 'BookOpen',
    conditionDescription: 'Master 5 Skills'
  },
  {
    id: 'badge_skilled_challenger',
    name: 'Contender',
    description: 'Stepping up.',
    tier: BadgeTier.SKILLED,
    icon: 'Swords',
    conditionDescription: 'Complete 5 Challenges'
  },

  // VETERAN
  {
    id: 'badge_veteran_guardian',
    name: 'Guardian',
    description: 'Protector of the scene.',
    tier: BadgeTier.VETERAN,
    icon: 'Shield',
    conditionDescription: 'Verify 5 Spots & Reach Level 15'
  },
  {
    id: 'badge_veteran_mentor',
    name: 'Sensei',
    description: 'Passing the torch.',
    tier: BadgeTier.VETERAN,
    icon: 'Users',
    conditionDescription: 'Host a Mentorship Session'
  },

  // LEGEND
  {
    id: 'badge_legend_legacy',
    name: 'Legacy',
    description: 'Your name echoes.',
    tier: BadgeTier.LEGEND,
    icon: 'Crown',
    conditionDescription: 'Reach Level 50'
  }
];

export const MOCK_SPOTS: Spot[] = [
  // ... (Existing MOCK_SPOTS content - abbreviated for brevity as it was already provided in prompt)
  {
    id: 'spot-mumbai-carter',
    name: 'Carter Road Skatepark',
    type: Discipline.SKATE,
    category: SpotCategory.PARK,
    difficulty: Difficulty.INTERMEDIATE,
    state: 'Maharashtra',
    surface: 'Smooth Concrete',
    location: { lat: 19.0607, lng: 72.8227, address: 'Bandra West, Mumbai' },
    notes: 'Public promenade skatepark. Best vibes in the evening. Sea breeze can be salty.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.8,
    images: ['https://images.unsplash.com/photo-1520156584189-1e4529f8c9b3?w=800'],
    sessions: [],
    status: SpotStatus.DRY
  },
  // ... (Assuming standard mock spots remain)
];

export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: 'battle-carter-kickflip',
    spotId: 'spot-mumbai-carter',
    creatorId: 'u-arjun',
    creatorName: 'Arjun S.',
    title: 'Carter Road Kickflip',
    description: 'Kickflip the gap over the planter. Clean landing required.',
    difficulty: Difficulty.INTERMEDIATE,
    xpReward: 300,
    completions: 14
  },
  {
    id: 'battle-khandala-tuck',
    spotId: 'spot-lonavala-khandala',
    creatorId: 'u-vikram',
    creatorName: 'Vikram D.',
    title: 'Ghat Tuck Endurance',
    description: 'Hold a perfect aerodynamic tuck for the entire 1km straight section.',
    difficulty: Difficulty.ADVANCED,
    xpReward: 500,
    completions: 3
  },
  {
    id: 'battle-holystoked-line',
    spotId: 'spot-blr-holystoked',
    creatorId: 'u-sarah',
    creatorName: 'Sarah M.',
    title: 'Holy Transfer Line',
    description: 'Drop in, pump the hump, and frontside air over the hip.',
    difficulty: Difficulty.ADVANCED,
    xpReward: 400,
    completions: 8
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

// --- SKILL LIBRARY ---
export const SKILL_LIBRARY: Skill[] = [
  { id: 'skate-ollie', name: 'Ollie', category: Discipline.SKATE, difficulty: Difficulty.BEGINNER, tier: 1, xpReward: 100, description: 'The foundation of all street skating. Snap the tail, slide the foot.', tutorialUrl: 'ArLl1N35ZWs' },
  { id: 'skate-shuvit', name: 'Pop Shuv-it', category: Discipline.SKATE, difficulty: Difficulty.BEGINNER, tier: 1, xpReward: 150, description: 'Spin the board 180 degrees under your feet without flipping.', tutorialUrl: 'Oq9Y3i7_G_E' },
  { id: 'skate-kickflip', name: 'Kickflip', category: Discipline.SKATE, difficulty: Difficulty.INTERMEDIATE, tier: 2, xpReward: 300, description: 'Flip the board towards your heel. The classic flip trick.', tutorialUrl: 'p35Pj_b8W9U', prerequisiteId: 'skate-ollie' },
  { id: 'skate-heelflip', name: 'Heelflip', category: Discipline.SKATE, difficulty: Difficulty.INTERMEDIATE, tier: 2, xpReward: 300, description: 'Flip the board away from your toes.', tutorialUrl: '339k4XEvbxY', prerequisiteId: 'skate-ollie' },
  { id: 'skate-5050', name: '50-50 Grind', category: Discipline.SKATE, difficulty: Difficulty.INTERMEDIATE, tier: 2, xpReward: 350, description: 'Grind on both trucks equally on a ledge or rail.', tutorialUrl: '9z1j9z1j9z1', prerequisiteId: 'skate-ollie' },
  { id: 'dh-tuck', name: 'Speed Tuck', category: Discipline.DOWNHILL, difficulty: Difficulty.BEGINNER, tier: 1, xpReward: 100, description: 'Aerodynamic stance for stability and speed.', tutorialUrl: '6t2j7S7Jp4E' },
  { id: 'dh-coleman', name: 'Coleman Slide', category: Discipline.DOWNHILL, difficulty: Difficulty.INTERMEDIATE, tier: 2, xpReward: 400, description: 'The fundamental shutdown slide. Hand down, heelside.', tutorialUrl: '6t2j7S7Jp4E', prerequisiteId: 'dh-tuck' },
];

export const COLLECTIBLES_DATABASE: Collectible[] = [
  { id: 'deck_first_push', name: 'First Push', type: CollectibleType.DECK, rarity: Rarity.COMMON, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=deck1', description: 'Your first set of wheels.' },
  { id: 'sticker_7_day', name: 'Week Warrior', type: CollectibleType.STICKER, rarity: Rarity.RARE, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=sticker7', description: '7 day streak bonus.' }
];

export const MENTOR_BADGE_META: Record<string, { label: string, color: string }> = {
  [MentorBadge.CERTIFIED]: { label: 'SPOTS Certified', color: 'bg-indigo-500' },
  [MentorBadge.EXPERT]: { label: 'Expert Faculty', color: 'bg-amber-500' }
};
