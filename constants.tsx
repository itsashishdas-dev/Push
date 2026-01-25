
import { Discipline, SpotCategory, Difficulty, SkillState, Spot, Skill, VerificationStatus, Collectible, CollectibleType, Rarity, ExtendedSession, Challenge, Mentor, MentorBadge, DailyNote, SpotStatus } from './types';

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

export const MOCK_SPOTS: Spot[] = [
  // --- MAHARASHTRA ---
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
  {
    id: 'spot-navi-mumbai-nerul',
    name: 'Nerul Skatepark',
    type: Discipline.SKATE,
    category: SpotCategory.PARK,
    difficulty: Difficulty.BEGINNER,
    state: 'Maharashtra',
    surface: 'Concrete',
    location: { lat: 19.0330, lng: 73.0297, address: 'Nerul, Navi Mumbai' },
    notes: 'Wonders Park. Good transitions and a decent bowl section.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.5,
    sessions: [],
    status: SpotStatus.CROWDED
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
    notes: 'Municipal skatepark. Good concrete surface. Can get crowded on weekends.',
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
    notes: 'Classic ghats for longboard runs. High traffic risk, go early morning.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.9,
    sessions: []
  },
  {
    id: 'spot-lavasa',
    name: 'Lavasa Downhill',
    type: Discipline.DOWNHILL,
    category: SpotCategory.DOWNHILL,
    difficulty: Difficulty.PRO,
    state: 'Maharashtra',
    surface: 'Paved',
    location: { lat: 18.4069, lng: 73.5097, address: 'Lavasa, Pune District' },
    notes: 'Steep, winding roads. Requires spotters. Pro territory.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 5.0,
    sessions: []
  },

  // --- KARNATAKA ---
  {
    id: 'spot-blr-holystoked',
    name: 'The Cave Skatepark',
    type: Discipline.SKATE,
    category: SpotCategory.DIY,
    difficulty: Difficulty.INTERMEDIATE,
    state: 'Karnataka',
    surface: 'Smooth Concrete',
    location: { lat: 13.0232, lng: 77.6435, address: 'Hennur, Bengaluru' },
    notes: 'Holystoked HQ. Community built, tight transitions, legendary status.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.9,
    sessions: [],
    status: SpotStatus.DRY
  },
  {
    id: 'spot-blr-play',
    name: 'Play Arena',
    type: Discipline.SKATE,
    category: SpotCategory.PARK,
    difficulty: Difficulty.BEGINNER,
    state: 'Karnataka',
    surface: 'Concrete',
    location: { lat: 12.9081, lng: 77.6791, address: 'Sarjapur Road, Bengaluru' },
    notes: 'Commercial park. Entry fee required. Good bowl and street section.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.6,
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

  // --- DELHI NCR ---
  {
    id: 'spot-noida-pump',
    name: 'Noida Pump Track',
    type: Discipline.SKATE,
    category: SpotCategory.PARK,
    difficulty: Difficulty.INTERMEDIATE,
    state: 'Delhi',
    surface: 'Asphalt',
    location: { lat: 28.5355, lng: 77.3910, address: 'Noida Sector 78' },
    notes: 'Modern pumptrack and skate areas by 100Ramps. Excellent flow.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.7,
    sessions: []
  },
  {
    id: 'spot-delhi-freemotion',
    name: 'Freemotion Sk8park',
    type: Discipline.SKATE,
    category: SpotCategory.DIY,
    difficulty: Difficulty.BEGINNER,
    state: 'Delhi',
    surface: 'Concrete/Wood',
    location: { lat: 28.5244, lng: 77.1855, address: 'Neb Sarai, Delhi' },
    notes: 'Indoor/Outdoor hybrid. Good for learning basics.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.3,
    sessions: []
  },

  // --- TELANGANA ---
  {
    id: 'spot-hyd-wallride',
    name: 'WallRide Park',
    type: Discipline.SKATE,
    category: SpotCategory.PARK,
    difficulty: Difficulty.INTERMEDIATE,
    state: 'Telangana',
    surface: 'Concrete/Composite',
    location: { lat: 17.3000, lng: 78.4250, address: 'Peerancheru, Hyderabad' },
    notes: 'First-class pumptrack and skatepark facility. Helmet mandatory.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.9,
    sessions: []
  },

  // --- TAMIL NADU ---
  {
    id: 'spot-chennai-madras',
    name: 'Madras Skate Garden',
    type: Discipline.SKATE,
    category: SpotCategory.DIY,
    difficulty: Difficulty.INTERMEDIATE,
    state: 'Tamil Nadu',
    surface: 'Concrete',
    location: { lat: 13.0827, lng: 80.2707, address: 'Chennai' },
    notes: 'Beautiful garden spot. Flowy lines.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.6,
    sessions: []
  },
  {
    id: 'spot-chennai-marina',
    name: 'Marina Beach Service Rd',
    type: Discipline.FREESTYLE,
    category: SpotCategory.FLATGROUND,
    difficulty: Difficulty.BEGINNER,
    state: 'Tamil Nadu',
    surface: 'Smooth Pavement',
    location: { lat: 13.0500, lng: 80.2824, address: 'Marina Beach, Chennai' },
    notes: 'Perfect for longboard dancing and freestyle. Very wide roads.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.5,
    sessions: []
  },
  {
    id: 'spot-mahabs-quiksilver',
    name: 'Mahabs Skatepark',
    type: Discipline.SKATE,
    category: SpotCategory.PARK,
    difficulty: Difficulty.INTERMEDIATE,
    state: 'Tamil Nadu',
    surface: 'Concrete',
    location: { lat: 12.6208, lng: 80.1945, address: 'Mahabalipuram' },
    notes: 'Skate and surf culture hub. Concrete bowl nearby.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.7,
    sessions: []
  },

  // --- KERALA ---
  {
    id: 'spot-kochi-regional',
    name: 'Regional Sports Centre',
    type: Discipline.SKATE,
    category: SpotCategory.STREET,
    difficulty: Difficulty.BEGINNER,
    state: 'Kerala',
    surface: 'Tiled/Paved',
    location: { lat: 9.9650, lng: 76.2990, address: 'Kadavanthra, Kochi' },
    notes: 'Skateable plaza areas. Check security before skating.',
    isVerified: false,
    verificationStatus: VerificationStatus.PENDING,
    rating: 3.8,
    sessions: []
  },
  {
    id: 'spot-calicut-beach',
    name: 'Calicut Beach Road',
    type: Discipline.FREESTYLE,
    category: SpotCategory.FLATGROUND,
    difficulty: Difficulty.BEGINNER,
    state: 'Kerala',
    surface: 'Paved',
    location: { lat: 11.2588, lng: 75.7804, address: 'Kozhikode' },
    notes: 'Good for cruising and dancing in the evenings.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.2,
    sessions: []
  },

  // --- GOA ---
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
    id: 'spot-goa-skatelife',
    name: 'Skatelife Warehouse',
    type: Discipline.SKATE,
    category: SpotCategory.DIY,
    difficulty: Difficulty.INTERMEDIATE,
    state: 'Goa',
    surface: 'Wood/Concrete',
    location: { lat: 15.6200, lng: 73.7300, address: 'Assagao, Goa' },
    notes: 'Community center with ramps and good vibes.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.7,
    sessions: []
  },

  // --- RAJASTHAN ---
  {
    id: 'spot-raj-desert-dolphin',
    name: 'Desert Dolphin',
    type: Discipline.SKATE,
    category: SpotCategory.DIY,
    difficulty: Difficulty.INTERMEDIATE,
    state: 'Rajasthan',
    surface: 'Smooth Concrete',
    location: { lat: 26.2100, lng: 73.3200, address: 'Khempur' },
    notes: 'Large transition park built for the movie "Skater Girl". Remote location.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.8,
    sessions: []
  },
  {
    id: 'spot-jaipur-central',
    name: 'Jaipur Skatepark',
    type: Discipline.SKATE,
    category: SpotCategory.PARK,
    difficulty: Difficulty.BEGINNER,
    state: 'Rajasthan',
    surface: 'Concrete',
    location: { lat: 26.9124, lng: 75.7873, address: 'Jaipur' },
    notes: 'Small local park inside Central Park.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.0,
    sessions: []
  },

  // --- MADHYA PRADESH ---
  {
    id: 'spot-mp-janwar',
    name: 'Janwar Castle',
    type: Discipline.SKATE,
    category: SpotCategory.DIY,
    difficulty: Difficulty.INTERMEDIATE,
    state: 'Madhya Pradesh',
    surface: 'Concrete',
    location: { lat: 24.6300, lng: 80.2000, address: 'Janwar, Panna District' },
    notes: 'Iconic rural skatepark. "No School, No Skate" policy. Absolute pilgrimage.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 5.0,
    sessions: []
  },
  {
    id: 'spot-indore-park',
    name: 'Indore Skatepark',
    type: Discipline.SKATE,
    category: SpotCategory.PARK,
    difficulty: Difficulty.BEGINNER,
    state: 'Madhya Pradesh',
    surface: 'Concrete',
    location: { lat: 22.7196, lng: 75.8577, address: 'Meghdoot Garden, Indore' },
    notes: 'Public park with basic ramps.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 3.9,
    sessions: []
  },

  // --- ODISHA ---
  {
    id: 'spot-bbsr-park',
    name: 'Bhubaneswar Skatepark',
    type: Discipline.SKATE,
    category: SpotCategory.PARK,
    difficulty: Difficulty.INTERMEDIATE,
    state: 'Odisha',
    surface: 'Concrete',
    location: { lat: 20.2961, lng: 85.8245, address: 'Kalinga Stadium, Bhubaneswar' },
    notes: 'Built by government. Decent street plaza.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.4,
    sessions: []
  },

  // --- PUNJAB & CHANDIGARH ---
  {
    id: 'spot-chandigarh-sector17',
    name: 'Sector 17 Plaza',
    type: Discipline.SKATE,
    category: SpotCategory.STREET,
    difficulty: Difficulty.BEGINNER,
    state: 'Punjab',
    surface: 'Tiles/Concrete',
    location: { lat: 30.7333, lng: 76.7794, address: 'Sector 17, Chandigarh' },
    notes: 'Huge open plaza. Bust on weekends.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.5,
    sessions: []
  },
  {
    id: 'spot-ludhiana-park',
    name: 'Ludhiana Skate Spot',
    type: Discipline.SKATE,
    category: SpotCategory.DIY,
    difficulty: Difficulty.BEGINNER,
    state: 'Punjab',
    surface: 'Concrete',
    location: { lat: 30.9010, lng: 75.8573, address: 'Ludhiana' },
    notes: 'Small local DIY spot.',
    isVerified: false,
    verificationStatus: VerificationStatus.PENDING,
    rating: 3.5,
    sessions: []
  },

  // --- WEST BENGAL ---
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

  // --- NORTH EAST INDIA ---
  {
    id: 'spot-assam-guwahati',
    name: 'Guwahati Skatepark',
    type: Discipline.SKATE,
    category: SpotCategory.PARK,
    difficulty: Difficulty.INTERMEDIATE,
    state: 'Assam',
    surface: 'Concrete',
    location: { lat: 26.1445, lng: 91.7362, address: 'RG Baruah Sports Complex, Guwahati' },
    notes: 'First proper skatepark in Assam. Built by 100Ramps.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.7,
    sessions: []
  },
  {
    id: 'spot-meghalaya-shillong',
    name: 'Shillong Skate Spot',
    type: Discipline.SKATE,
    category: SpotCategory.DIY,
    difficulty: Difficulty.BEGINNER,
    state: 'Meghalaya',
    surface: 'Concrete',
    location: { lat: 25.5788, lng: 91.8933, address: 'Ward\'s Lake Area, Shillong' },
    notes: 'Street spots around the lake. Scenic but weather dependent.',
    isVerified: false,
    verificationStatus: VerificationStatus.PENDING,
    rating: 4.0,
    sessions: []
  },
  {
    id: 'spot-mizoram-aizawl',
    name: 'Aizawl Skatepark',
    type: Discipline.SKATE,
    category: SpotCategory.PARK,
    difficulty: Difficulty.INTERMEDIATE,
    state: 'Mizoram',
    surface: 'Concrete',
    location: { lat: 23.7271, lng: 92.7176, address: 'Zemabawk, Aizawl' },
    notes: 'Active local scene. Good bowl section.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.8,
    sessions: []
  },
  {
    id: 'spot-arunachal-itanagar',
    name: 'Itanagar DIY',
    type: Discipline.SKATE,
    category: SpotCategory.DIY,
    difficulty: Difficulty.BEGINNER,
    state: 'Arunachal Pradesh',
    surface: 'Rough Concrete',
    location: { lat: 27.0844, lng: 93.6053, address: 'Itanagar' },
    notes: 'Small DIY obstacles built by locals.',
    isVerified: false,
    verificationStatus: VerificationStatus.PENDING,
    rating: 3.5,
    sessions: []
  },
  {
    id: 'spot-sikkim-gangtok',
    name: 'Kanchenjunga Plaza',
    type: Discipline.SKATE,
    category: SpotCategory.STREET,
    difficulty: Difficulty.INTERMEDIATE,
    state: 'Sikkim',
    surface: 'Tiles',
    location: { lat: 27.3314, lng: 88.6138, address: 'MG Marg, Gangtok' },
    notes: 'Strict security, but early morning sessions possible. Iconic view.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.5,
    sessions: []
  },
  {
    id: 'spot-nagaland-dimapur',
    name: 'Dimapur Skate Spot',
    type: Discipline.SKATE,
    category: SpotCategory.STREET,
    difficulty: Difficulty.BEGINNER,
    state: 'Nagaland',
    surface: 'Concrete',
    location: { lat: 25.9095, lng: 93.7266, address: 'Dimapur' },
    notes: 'Street spots near the stadium.',
    isVerified: false,
    verificationStatus: VerificationStatus.PENDING,
    rating: 3.8,
    sessions: []
  },
  {
    id: 'spot-tripura-agartala',
    name: 'Agartala Skatepark',
    type: Discipline.SKATE,
    category: SpotCategory.PARK,
    difficulty: Difficulty.BEGINNER,
    state: 'Tripura',
    surface: 'Concrete',
    location: { lat: 23.8315, lng: 91.2868, address: 'Agartala' },
    notes: 'Recently developed sports complex area.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 4.1,
    sessions: []
  },
  {
    id: 'spot-manipur-imphal',
    name: 'Imphal Skate Spot',
    type: Discipline.SKATE,
    category: SpotCategory.STREET,
    difficulty: Difficulty.BEGINNER,
    state: 'Manipur',
    surface: 'Paved',
    location: { lat: 24.8170, lng: 93.9368, address: 'Imphal' },
    notes: 'Local street spots.',
    isVerified: false,
    verificationStatus: VerificationStatus.PENDING,
    rating: 3.6,
    sessions: []
  },

  // --- HIMACHAL PRADESH ---
  {
    id: 'spot-manali-dh',
    name: 'Manali-Leh Highway',
    type: Discipline.DOWNHILL,
    category: SpotCategory.DOWNHILL,
    difficulty: Difficulty.PRO,
    state: 'Himachal Pradesh',
    surface: 'Asphalt',
    location: { lat: 32.2396, lng: 77.1887, address: 'Manali Outskirts' },
    notes: 'Epic scenery, dangerous drops. Only for professionals with safety crew.',
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    rating: 5.0,
    sessions: []
  }
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
    xpReward: 1200,
    completions: 14
  },
  {
    id: 'battle-khandala-tuck',
    spotId: 'spot-lonavala-khandala',
    creatorId: 'u-vikram',
    creatorName: 'Vikram D.',
    title: 'Ghat Tuck Endurance',
    description: 'Hold a perfect aerodynamic tuck for the entire 1km straight section. No breaking form.',
    difficulty: Difficulty.ADVANCED,
    xpReward: 2500,
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
    xpReward: 1800,
    completions: 8
  },
  {
    id: 'battle-nandi-slide',
    spotId: 'spot-nandi-hills',
    creatorId: 'u-dh-king',
    creatorName: 'Speed Demon',
    title: 'Hairpin Shutdown',
    description: 'Execute a Coleman slide to a complete stop exactly at the marker before the first hairpin.',
    difficulty: Difficulty.INTERMEDIATE,
    xpReward: 1500,
    completions: 21
  },
  {
    id: 'battle-carter-dancing',
    spotId: 'spot-mumbai-carter',
    creatorId: 'u-dancer',
    creatorName: 'Riya K.',
    title: 'Promenade Flow',
    description: 'Complete a line of Cross-step into Peter Pan into 180 Step without touching the ground.',
    difficulty: Difficulty.INTERMEDIATE,
    xpReward: 1000,
    completions: 45
  },
  {
    id: 'battle-wallride-pump',
    spotId: 'spot-hyd-wallride',
    creatorId: 'u-hyd-local',
    creatorName: 'WallRide Crew',
    title: 'Pump Track Time Trial',
    description: 'Complete one full lap of the pump track in under 25 seconds without pushing.',
    difficulty: Difficulty.BEGINNER,
    xpReward: 800,
    completions: 112
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
// Tier 1: Fundamentals | Tier 2: Core Tricks | Tier 3: Advanced | Tier 4: Pro

export const SKILL_LIBRARY: Skill[] = [
  // --- SKATE (STREET) ---
  { id: 'skate-ollie', name: 'Ollie', category: Discipline.SKATE, difficulty: Difficulty.BEGINNER, tier: 1, xpReward: 100, description: 'The foundation of all street skating. Snap the tail, slide the foot.', tutorialUrl: 'ArLl1N35ZWs' },
  { id: 'skate-shuvit', name: 'Pop Shuv-it', category: Discipline.SKATE, difficulty: Difficulty.BEGINNER, tier: 1, xpReward: 150, description: 'Spin the board 180 degrees under your feet without flipping.', tutorialUrl: 'Oq9Y3i7_G_E' },
  { id: 'skate-kickflip', name: 'Kickflip', category: Discipline.SKATE, difficulty: Difficulty.INTERMEDIATE, tier: 2, xpReward: 300, description: 'Flip the board towards your heel. The classic flip trick.', tutorialUrl: 'p35Pj_b8W9U', prerequisiteId: 'skate-ollie' },
  { id: 'skate-heelflip', name: 'Heelflip', category: Discipline.SKATE, difficulty: Difficulty.INTERMEDIATE, tier: 2, xpReward: 300, description: 'Flip the board away from your toes.', tutorialUrl: '339k4XEvbxY', prerequisiteId: 'skate-ollie' },
  { id: 'skate-5050', name: '50-50 Grind', category: Discipline.SKATE, difficulty: Difficulty.INTERMEDIATE, tier: 2, xpReward: 350, description: 'Grind on both trucks equally on a ledge or rail.', tutorialUrl: '9z1j9z1j9z1', prerequisiteId: 'skate-ollie' },
  { id: 'skate-boardslide', name: 'Boardslide', category: Discipline.SKATE, difficulty: Difficulty.INTERMEDIATE, tier: 2, xpReward: 350, description: 'Slide the middle of your board along a rail.', tutorialUrl: '9z1j9z1j9z1', prerequisiteId: 'skate-ollie' },
  { id: 'skate-treflip', name: '360 Flip', category: Discipline.SKATE, difficulty: Difficulty.ADVANCED, tier: 3, xpReward: 800, description: '360 Shuv-it + Kickflip. The Tre Bomb.', tutorialUrl: '9z1j9z1j9z1', prerequisiteId: 'skate-kickflip' },
  { id: 'skate-hardflip', name: 'Hardflip', category: Discipline.SKATE, difficulty: Difficulty.ADVANCED, tier: 3, xpReward: 850, description: 'Frontside Pop Shuv + Kickflip. It looks hard because it is.', tutorialUrl: '9z1j9z1j9z1', prerequisiteId: 'skate-kickflip' },
  { id: 'skate-laserflip', name: 'Laser Flip', category: Discipline.SKATE, difficulty: Difficulty.PRO, tier: 4, xpReward: 2000, description: 'Frontside 360 Shuv + Heelflip. A massive trick.', tutorialUrl: '9z1j9z1j9z1', prerequisiteId: 'skate-heelflip' },

  // --- DOWNHILL ---
  { id: 'dh-tuck', name: 'Speed Tuck', category: Discipline.DOWNHILL, difficulty: Difficulty.BEGINNER, tier: 1, xpReward: 100, description: 'Aerodynamic stance for stability and speed.', tutorialUrl: '6t2j7S7Jp4E' },
  { id: 'dh-footbrake', name: 'Footbrake', category: Discipline.DOWNHILL, difficulty: Difficulty.BEGINNER, tier: 1, xpReward: 150, description: 'Essential safety skill. Stopping with your sole.', tutorialUrl: '6t2j7S7Jp4E' },
  { id: 'dh-coleman', name: 'Coleman Slide', category: Discipline.DOWNHILL, difficulty: Difficulty.INTERMEDIATE, tier: 2, xpReward: 400, description: 'The fundamental shutdown slide. Hand down, heelside.', tutorialUrl: '6t2j7S7Jp4E', prerequisiteId: 'dh-tuck' },
  { id: 'dh-pushup', name: 'Push-up Slide', category: Discipline.DOWNHILL, difficulty: Difficulty.INTERMEDIATE, tier: 2, xpReward: 400, description: 'Toeside shutdown slide using both hands.', tutorialUrl: '6t2j7S7Jp4E', prerequisiteId: 'dh-tuck' },
  { id: 'dh-standup-180', name: 'Standup 180', category: Discipline.DOWNHILL, difficulty: Difficulty.ADVANCED, tier: 3, xpReward: 900, description: 'Sliding 180 degrees without hands touching the road.', tutorialUrl: '6t2j7S7Jp4E', prerequisiteId: 'dh-coleman' },
  { id: 'dh-predrift', name: 'Pre-drift', category: Discipline.DOWNHILL, difficulty: Difficulty.ADVANCED, tier: 3, xpReward: 1000, description: 'Shaving speed before a corner while maintaining a line.', tutorialUrl: '6t2j7S7Jp4E', prerequisiteId: 'dh-coleman' },
  { id: 'dh-toeside-standup', name: 'Toeside Standup', category: Discipline.DOWNHILL, difficulty: Difficulty.PRO, tier: 4, xpReward: 2500, description: 'High speed toeside slide, no hands. Pure style.', tutorialUrl: '6t2j7S7Jp4E', prerequisiteId: 'dh-standup-180' },

  // --- FREESTYLE (LONGBOARD DANCING) ---
  { id: 'fs-cross-step', name: 'Cross Step', category: Discipline.FREESTYLE, difficulty: Difficulty.BEGINNER, tier: 1, xpReward: 150, description: 'Crossing legs while carving. The basis of dancing.', tutorialUrl: '9z1j9z1j9z1' },
  { id: 'fs-180-step', name: '180 Step', category: Discipline.FREESTYLE, difficulty: Difficulty.BEGINNER, tier: 1, xpReward: 150, description: 'Body varial while the board keeps moving.', tutorialUrl: '9z1j9z1j9z1' },
  { id: 'fs-peter-pan', name: 'Peter Pan', category: Discipline.FREESTYLE, difficulty: Difficulty.INTERMEDIATE, tier: 2, xpReward: 350, description: 'Crossing legs consecutively over each other.', tutorialUrl: '9z1j9z1j9z1', prerequisiteId: 'fs-cross-step' },
  { id: 'fs-ghostride', name: 'Ghostride', category: Discipline.FREESTYLE, difficulty: Difficulty.INTERMEDIATE, tier: 2, xpReward: 300, description: 'Stepping off the board and jumping back on.', tutorialUrl: '9z1j9z1j9z1' },
  { id: 'fs-tiger-claw', name: 'Tiger Claw', category: Discipline.FREESTYLE, difficulty: Difficulty.ADVANCED, tier: 3, xpReward: 800, description: 'Pop the board, catch it, spin it 360, jump back on.', tutorialUrl: '9z1j9z1j9z1', prerequisiteId: 'fs-ghostride' },
  { id: 'fs-aerograb', name: 'Aero Grab', category: Discipline.FREESTYLE, difficulty: Difficulty.PRO, tier: 4, xpReward: 2000, description: 'Grab the board in mid-air during a jump.', tutorialUrl: '9z1j9z1j9z1', prerequisiteId: 'fs-tiger-claw' }
];

export const COLLECTIBLES_DATABASE: Collectible[] = [
  { id: 'deck_first_push', name: 'First Push', type: CollectibleType.DECK, rarity: Rarity.COMMON, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=deck1', description: 'Your first set of wheels.' },
  { id: 'sticker_7_day', name: 'Week Warrior', type: CollectibleType.STICKER, rarity: Rarity.RARE, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=sticker7', description: '7 day streak bonus.' }
];

export const MENTOR_BADGE_META: Record<string, { label: string, color: string }> = {
  [MentorBadge.CERTIFIED]: { label: 'SPOTS Certified', color: 'bg-indigo-500' },
  [MentorBadge.EXPERT]: { label: 'Expert Faculty', color: 'bg-amber-500' }
};
