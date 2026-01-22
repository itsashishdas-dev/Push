
import { Discipline, Difficulty, SkillState, Spot, Skill, VerificationStatus, Collectible, CollectibleType, Rarity, MentorBadge, Review } from './types';
import { ShieldCheck, Star, Zap, Heart, Award } from 'lucide-react';

export const RETRO_AVATARS = [
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=SkaterBoy',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=RetroContra',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=LegoMan',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=ArcadeQueen',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=8BitHero',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=NinjaGaiden',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=StreetFighter',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=CyberPunk'
];

export const MENTOR_BADGE_META: Record<MentorBadge, { label: string, description: string, color: string, icon: any }> = {
  'VERIFIED_PRO': { label: 'Verified Pro', description: 'Proven professional track record.', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: ShieldCheck },
  'RISING_STAR': { label: 'Rising Star', description: 'Fast growing student base.', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Zap },
  'TOP_RATED': { label: 'Top Rated', description: 'Consistently 5-star feedback.', color: 'text-green-400 bg-green-400/10 border-green-400/20', icon: Star },
  'COMMUNITY_FAV': { label: 'Community Fav', description: 'Most booked this month.', color: 'text-pink-400 bg-pink-400/10 border-pink-400/20', icon: Heart },
  'VETERAN': { label: 'Veteran', description: 'Over 20+ students coached.', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20', icon: Award },
};

export const STATE_LANDMARKS: Record<string, string> = {
  "Andaman & Nicobar": "Havelock Island Radhanagar Beach turquoise water",
  "Andhra Pradesh": "Araku Valley mist covered hills coffee plantations",
  "Arunachal Pradesh": "Tawang Monastery snow capped mountains breathtaking",
  "Assam": "Kaziranga National Park tea gardens misty morning",
  "Bihar": "Mahabodhi Temple Bodh Gaya spiritual architecture",
  "Chandigarh": "Open Hand Monument Le Corbusier architecture modern",
  "Chhattisgarh": "Chitrakote Falls waterfalls lush green",
  "Dadra & Nagar Haveli": "Vanganga Lake Garden lush greenery",
  "Daman & Diu": "Diu Fort coastal historic architecture sea view",
  "Delhi": "India Gate wide angle sunset dramatic sky",
  "Goa": "Palolem Beach coconut palm trees golden hour coastline",
  "Gujarat": "Rann of Kutch white desert salt flats endless horizon",
  "Haryana": "Cyber Hub Gurgaon futuristic skyline modern architecture",
  "Himachal Pradesh": "Spiti Valley winding roads mountains adventure",
  "Jammu & Kashmir": "Dal Lake Shikara boat reflection snow peaks",
  "Jharkhand": "Hundru Falls rocky terrain waterfalls nature",
  "Karnataka": "Hampi ancient ruins stone chariot sunset",
  "Kerala": "Alleppey Backwaters houseboat palm trees reflection water",
  "Ladakh": "Pangong Lake blue water barren mountains landscape",
  "Lakshadweep": "Agatti Island coral reefs aerial view turquoise",
  "Madhya Pradesh": "Khajuraho Temples intricate architecture historic",
  "Maharashtra": "Gateway of India Mumbai sea face dramatic",
  "Manipur": "Loktak Lake floating phumdis nature aerial",
  "Meghalaya": "Living Root Bridges rainforest mist nature",
  "Mizoram": "Phawngpui Blue Mountain hills clouds landscape",
  "Nagaland": "Dzukou Valley rolling hills green flowers trekking",
  "Odisha": "Konark Sun Temple stone wheel architecture historic",
  "Puducherry": "French Colony White Town architecture yellow walls streets",
  "Punjab": "Golden Temple Amritsar reflection night lights",
  "Rajasthan": "Hawa Mahal Jaipur intricate windows pink sandstone",
  "Sikkim": "Kanchenjunga mountain peak snow sunrise himalayas",
  "Tamil Nadu": "Meenakshi Temple Madurai colorful gopuram architecture",
  "Telangana": "Charminar Hyderabad historic architecture busy street",
  "Tripura": "Neermahal Water Palace architecture lake view",
  "Uttar Pradesh": "Taj Mahal Agra white marble sunrise iconic",
  "Uttarakhand": "Rishikesh Ganga river suspension bridge mountains",
  "West Bengal": "Howrah Bridge Kolkata river iconic steel structure"
};

export const STATE_IMAGES: Record<string, string> = {
  "Goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop",
  "Kerala": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&auto=format&fit=crop",
  "Maharashtra": "https://images.unsplash.com/photo-1562920618-3e26f9ee00ad?w=800&auto=format&fit=crop",
  "Delhi": "https://images.unsplash.com/photo-1587474260584-136574528615?w=800&auto=format&fit=crop",
  "Karnataka": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop",
  "Tamil Nadu": "https://images.unsplash.com/photo-1582510003544-4d00b7853894?w=800&auto=format&fit=crop",
  "West Bengal": "https://images.unsplash.com/photo-1558431382-27e303142255?w=800&auto=format&fit=crop",
  "Rajasthan": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop",
  "Himachal Pradesh": "https://images.unsplash.com/photo-1605649487215-47678681458e?w=800&auto=format&fit=crop",
  "Uttarakhand": "https://images.unsplash.com/photo-1596023249767-eb969397e3eb?w=800&auto=format&fit=crop",
  "Jammu & Kashmir": "https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800&auto=format&fit=crop",
  "Meghalaya": "https://images.unsplash.com/photo-1623145437672-04e4c9354796?w=800&auto=format&fit=crop"
};

// Helper for consistent images
const SKATE_IMAGES = [
  'https://images.unsplash.com/photo-1547447134-cd3f5c716030?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520156584189-af296a5bf7e7?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1564982024202-75396c22c12d?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1471079502516-21f58c9f5dfd?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=800&auto=format&fit=crop'
];

const DOWNHILL_IMAGES = [
  'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=800&auto=format&fit=crop'
];

const getImage = (type: Discipline, index: number) => {
  const source = type === Discipline.SKATE ? SKATE_IMAGES : DOWNHILL_IMAGES;
  return [source[index % source.length]];
};

// Generate realistic mock reviews based on discipline and difficulty
const generateReviews = (spotId: string, type: Discipline, difficulty: Difficulty): Review[] => {
  const reviews: Review[] = [];
  const count = Math.floor(Math.random() * 4) + 1; // 1 to 4 reviews
  
  const users = [
    { id: 'u-vikram', name: 'Vikram S.', deck: 'deck_street_soldier' },
    { id: 'u-zoya', name: 'Zoya F.', deck: 'deck_first_push' },
    { id: 'u-anish', name: 'Anish G.', deck: 'deck_flow_state' },
    { id: 'u-kabir', name: 'Kabir B.', deck: 'deck_hill_runner' },
    { id: 'u-rahul', name: 'Rahul V.', deck: 'deck_champion' },
    { id: 'u-simran', name: 'Simran K.', deck: 'deck_street_soldier' }
  ];

  const skateComments = [
    "Smooth concrete, great flow.",
    "Gets crowded in evenings but lights are good.",
    "Ledges are buttery perfectly waxed.",
    "A bit rough in patches but skateable.",
    "Security is chill if you go early.",
    "Best spot in the city hands down.",
    "Good for beginners, lots of flat ground.",
    "Transition is a bit steep but fun."
  ];

  const downhillComments = [
    "Pavement is fresh, grip is insane.",
    "Watch out for traffic on the blind corner.",
    "Super fast run, slide gloves mandatory.",
    "Perfect gradient for learning slides.",
    "Locals are friendly, spot is safe.",
    "Road surface is a bit chundery.",
    "Epic view from the top.",
    "Requires a spotter for the hairpin."
  ];

  const comments = type === Discipline.SKATE ? skateComments : downhillComments;

  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const comment = comments[Math.floor(Math.random() * comments.length)];
    const rating = Math.random() > 0.7 ? 5 : 4;
    
    // Generate a date within last 3 months
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    
    reviews.push({
      id: `rev-${spotId}-${i}`,
      userId: user.id,
      userName: user.name,
      rating,
      text: comment,
      date: date.toISOString().split('T')[0],
      userDeckId: user.deck
    });
  }
  
  return reviews;
};

export const COLLECTIBLES_DATABASE: Collectible[] = [
  // ... (Collectibles and Skill Library remain unchanged) ...
  { id: 'deck_first_push', name: 'First Push', type: CollectibleType.DECK, rarity: Rarity.COMMON, imageUrl: 'https://images.unsplash.com/photo-1531565637446-32307b194362?w=500&auto=format&fit=crop&q=60', description: 'A reliable blank deck. Represents your first logged session.', unlockCondition: 'First Login' },
  { id: 'deck_street_soldier', name: 'Street Soldier', type: CollectibleType.DECK, rarity: Rarity.RARE, imageUrl: 'https://images.unsplash.com/photo-1520045818170-8a34be95d319?w=500&auto=format&fit=crop&q=60', description: 'Scratched up graphics from battle. You earned this.', unlockCondition: '7 Day Streak' },
  { id: 'deck_hill_runner', name: 'Hill Runner', type: CollectibleType.DECK, rarity: Rarity.RARE, imageUrl: 'https://images.unsplash.com/photo-1532443606987-24870462088c?w=500&auto=format&fit=crop&q=60', description: 'Aerodynamic shape for high speeds.', unlockCondition: '5 Downhill Sessions' },
  { id: 'deck_flow_state', name: 'Flow State', type: CollectibleType.DECK, rarity: Rarity.EPIC, imageUrl: 'https://images.unsplash.com/photo-1566453838068-d621588bd405?w=500&auto=format&fit=crop&q=60', description: 'Lightweight composite for those who never stop.', unlockCondition: '30 Day Streak' },
  { id: 'deck_champion', name: 'Season Champion', type: CollectibleType.DECK, rarity: Rarity.LEGENDARY, imageUrl: 'https://images.unsplash.com/photo-1621360841012-6eb6d4d15444?w=500&auto=format&fit=crop&q=60', description: 'Given only to the #1 rank on the leaderboard.', unlockCondition: 'Leaderboard #1' },
  { id: 'wheel_asphalt', name: 'Asphalt Rollers', type: CollectibleType.WHEEL, rarity: Rarity.COMMON, imageUrl: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=500&auto=format&fit=crop&q=60', description: 'Standard street wheels. Good for concrete.', unlockCondition: '14 Day Streak' },
  { id: 'wheel_speed', name: 'Speed Rings', type: CollectibleType.WHEEL, rarity: Rarity.RARE, imageUrl: 'https://images.unsplash.com/photo-1596564239840-798835f8ad62?w=500&auto=format&fit=crop&q=60', description: 'Wide contact patch for maximum grip.', unlockCondition: 'First Verified Downhill Run' },
  { id: 'sticker_gnarly', name: 'Gnarly', type: CollectibleType.STICKER, rarity: Rarity.COMMON, imageUrl: 'https://cdn-icons-png.flaticon.com/512/7479/7479439.png', description: 'Keep it gnarly.', unlockCondition: '3 Day Streak' },
  { id: 'sticker_first_ollie', name: 'First Ollie', type: CollectibleType.STICKER, rarity: Rarity.COMMON, imageUrl: 'https://cdn-icons-png.flaticon.com/512/1077/1077035.png', description: 'The first step of the journey.', unlockCondition: 'Master Ollie' },
  { id: 'sticker_streak', name: 'Streak Alive', type: CollectibleType.STICKER, rarity: Rarity.RARE, imageUrl: 'https://cdn-icons-png.flaticon.com/512/426/426833.png', description: 'Don\'t break the chain.', unlockCondition: 'Maintain 7 Day Streak' },
  { id: 'sticker_manual_master', name: 'Balance Beam', type: CollectibleType.STICKER, rarity: Rarity.COMMON, imageUrl: 'https://cdn-icons-png.flaticon.com/512/2554/2554039.png', description: 'Two wheels only. Style for miles.', unlockCondition: 'Master Manual' },
  { id: 'sticker_boneless_master', name: 'Old School', type: CollectibleType.STICKER, rarity: Rarity.COMMON, imageUrl: 'https://cdn-icons-png.flaticon.com/512/2821/2821804.png', description: 'Respect the roots.', unlockCondition: 'Master Boneless' },
  { id: 'sticker_ollie_master', name: 'Pop Master', type: CollectibleType.STICKER, rarity: Rarity.COMMON, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3564/3564999.png', description: 'You can fly now. Sort of.', unlockCondition: 'Master Ollie' },
  { id: 'sticker_shoveit_master', name: 'Shove It', type: CollectibleType.STICKER, rarity: Rarity.COMMON, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3565/3565003.png', description: 'Spin it without flipping it.', unlockCondition: 'Master Shove-it' },
  { id: 'sticker_fs180_master', name: 'Frontside Spin', type: CollectibleType.STICKER, rarity: Rarity.COMMON, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3565/3565008.png', description: 'Turning your back to the future.', unlockCondition: 'Master FS 180' },
  { id: 'sticker_popshove_master', name: 'Popped', type: CollectibleType.STICKER, rarity: Rarity.RARE, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3565/3565012.png', description: 'Catch it in the air.', unlockCondition: 'Master Pop Shove-it' },
  { id: 'sticker_kickflip_master', name: 'Kickflip Pro', type: CollectibleType.STICKER, rarity: Rarity.RARE, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3565/3565022.png', description: 'The gold standard of street skating.', unlockCondition: 'Master Kickflip' },
  { id: 'sticker_heelflip_master', name: 'Heelflip Hero', type: CollectibleType.STICKER, rarity: Rarity.RARE, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3565/3565017.png', description: 'Kickflip\'s opposite cousin.', unlockCondition: 'Master Heelflip' },
  { id: 'sticker_boardslide_master', name: 'Rail Ripper', type: CollectibleType.STICKER, rarity: Rarity.RARE, imageUrl: 'https://cdn-icons-png.flaticon.com/512/2821/2821827.png', description: 'Sliding on wood and steel.', unlockCondition: 'Master Boardslide' },
  { id: 'sticker_varial_master', name: 'Varial Vision', type: CollectibleType.STICKER, rarity: Rarity.RARE, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3565/3565025.png', description: 'Shove it plus a flip.', unlockCondition: 'Master Varial Flip' },
  { id: 'sticker_treflip_master', name: 'Tre Flip King', type: CollectibleType.STICKER, rarity: Rarity.EPIC, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3565/3565029.png', description: '360 shove with a kickflip. Stylish.', unlockCondition: 'Master 360 Flip' },
  { id: 'sticker_hardflip_master', name: 'Hard Mode', type: CollectibleType.STICKER, rarity: Rarity.EPIC, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3565/3565032.png', description: 'Frontside shove plus kickflip. It is hard.', unlockCondition: 'Master Hardflip' },
  { id: 'sticker_crooked_master', name: 'Get Crooked', type: CollectibleType.STICKER, rarity: Rarity.EPIC, imageUrl: 'https://cdn-icons-png.flaticon.com/512/2821/2821798.png', description: 'Pinch it and hold it.', unlockCondition: 'Master Crooked Grind' },
  { id: 'sticker_footbrake_master', name: 'Sole Survivor', type: CollectibleType.STICKER, rarity: Rarity.COMMON, imageUrl: 'https://cdn-icons-png.flaticon.com/512/2316/2316654.png', description: 'The most important skill. Stopping.', unlockCondition: 'Master Footbrake' },
  { id: 'sticker_crossstep_master', name: 'Dancer', type: CollectibleType.STICKER, rarity: Rarity.COMMON, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3195/3195971.png', description: 'Fancy footwork on the deck.', unlockCondition: 'Master Cross-step' },
  { id: 'sticker_coleman_master', name: 'Coleman Slider', type: CollectibleType.STICKER, rarity: Rarity.COMMON, imageUrl: 'https://cdn-icons-png.flaticon.com/512/2316/2316680.png', description: 'Safety first. Hand down, slide out.', unlockCondition: 'Master Coleman Slide' },
  { id: 'sticker_pushup_master', name: 'Pushup Slide', type: CollectibleType.STICKER, rarity: Rarity.COMMON, imageUrl: 'https://cdn-icons-png.flaticon.com/512/2316/2316668.png', description: 'Two hands down for stability.', unlockCondition: 'Master Pushup Slide' },
  { id: 'sticker_180standup_master', name: '180 Wizard', type: CollectibleType.STICKER, rarity: Rarity.RARE, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3195/3195977.png', description: 'Spinning while sliding.', unlockCondition: 'Master 180 Standup' },
  { id: 'sticker_standup_master', name: 'Standup Specialist', type: CollectibleType.STICKER, rarity: Rarity.RARE, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3195/3195982.png', description: 'No hands, all urethane.', unlockCondition: 'Master Stand-up Slide' },
  { id: 'sticker_tuck_master', name: 'Aerodynamic', type: CollectibleType.STICKER, rarity: Rarity.EPIC, imageUrl: 'https://cdn-icons-png.flaticon.com/512/9796/9796336.png', description: 'Maximum velocity achieved.', unlockCondition: 'Master Aerodynamic Tuck' },
  { id: 'sticker_toeside_master', name: 'Toeside Terror', type: CollectibleType.STICKER, rarity: Rarity.EPIC, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3195/3195995.png', description: 'Facing the hill while sliding.', unlockCondition: 'Master Toeside Standup' },
  { id: 'sticker_360slide_master', name: 'Helicopter', type: CollectibleType.STICKER, rarity: Rarity.LEGENDARY, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3196/3196001.png', description: 'Full rotation at speed.', unlockCondition: 'Master 360 Slide' },
  { id: 'trophy_iron_legs', name: 'Iron Legs', type: CollectibleType.TROPHY, rarity: Rarity.EPIC, imageUrl: 'https://cdn-icons-png.flaticon.com/512/3112/3112946.png', description: '45 Days of uninterrupted shredding.', unlockCondition: '45 Day Streak' },
  { id: 'trophy_consistency', name: 'Consistency King', type: CollectibleType.TROPHY, rarity: Rarity.LEGENDARY, imageUrl: 'https://cdn-icons-png.flaticon.com/512/5906/5906180.png', description: '60 Days of uninterrupted shredding.', unlockCondition: '60 Day Streak' }
];

export const SKILL_LIBRARY: Skill[] = [
  // --- STREET SKATEBOARDING ---
  { id: 'skate-manual', name: 'Manual', category: Discipline.SKATE, difficulty: Difficulty.BEGINNER, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=1d5a7d7q1a4', unlockableCollectibleId: 'sticker_manual_master' },
  { id: 'skate-boneless', name: 'Boneless', category: Discipline.SKATE, difficulty: Difficulty.BEGINNER, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=1d5a7d7q1a4', unlockableCollectibleId: 'sticker_boneless_master' },
  { id: 'skate-ollie', name: 'Ollie', category: Discipline.SKATE, difficulty: Difficulty.BEGINNER, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=ArLl1N35ZWs', unlockableCollectibleId: 'sticker_ollie_master' },
  { id: 'skate-shoveit', name: 'Shove-it', category: Discipline.SKATE, difficulty: Difficulty.BEGINNER, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=42Jj7s7jHNM', unlockableCollectibleId: 'sticker_shoveit_master' },
  { id: 'skate-fs180', name: 'Frontside 180', category: Discipline.SKATE, difficulty: Difficulty.INTERMEDIATE, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=1d5a7d7q1a4', unlockableCollectibleId: 'sticker_fs180_master' },
  { id: 'skate-popshove', name: 'Pop Shove-it', category: Discipline.SKATE, difficulty: Difficulty.INTERMEDIATE, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=Oq9y2i1y1y1', unlockableCollectibleId: 'sticker_popshove_master' },
  { id: 'skate-boardslide', name: 'Boardslide', category: Discipline.SKATE, difficulty: Difficulty.INTERMEDIATE, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=1d5a7d7q1a4', unlockableCollectibleId: 'sticker_boardslide_master' },
  { id: 'skate-kickflip', name: 'Kickflip', category: Discipline.SKATE, difficulty: Difficulty.INTERMEDIATE, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=p35Pj_b8W9U', unlockableCollectibleId: 'sticker_kickflip_master' },
  { id: 'skate-heelflip', name: 'Heelflip', category: Discipline.SKATE, difficulty: Difficulty.INTERMEDIATE, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=h1e98_uK5tQ', unlockableCollectibleId: 'sticker_heelflip_master' },
  { id: 'skate-varial', name: 'Varial Kickflip', category: Discipline.SKATE, difficulty: Difficulty.INTERMEDIATE, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=1d5a7d7q1a4', unlockableCollectibleId: 'sticker_varial_master' },
  { id: 'skate-crooked', name: 'Crooked Grind', category: Discipline.SKATE, difficulty: Difficulty.ADVANCED, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=1d5a7d7q1a4', unlockableCollectibleId: 'sticker_crooked_master' },
  { id: 'skate-hardflip', name: 'Hardflip', category: Discipline.SKATE, difficulty: Difficulty.ADVANCED, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=1d5a7d7q1a4', unlockableCollectibleId: 'sticker_hardflip_master' },
  { id: 'skate-treflip', name: '360 Flip', category: Discipline.SKATE, difficulty: Difficulty.ADVANCED, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=XGw3YkQmNig', unlockableCollectibleId: 'sticker_treflip_master' },
  { id: 'dh-footbrake', name: 'Footbrake', category: Discipline.DOWNHILL, difficulty: Difficulty.BEGINNER, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=6t2j7S7Jp4E', unlockableCollectibleId: 'sticker_footbrake_master' },
  { id: 'dh-crossstep', name: 'Cross-step', category: Discipline.DOWNHILL, difficulty: Difficulty.BEGINNER, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=6t2j7S7Jp4E', unlockableCollectibleId: 'sticker_crossstep_master' },
  { id: 'dh-pushup', name: 'Pushup Slide', category: Discipline.DOWNHILL, difficulty: Difficulty.BEGINNER, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=6t2j7S7Jp4E', unlockableCollectibleId: 'sticker_pushup_master' },
  { id: 'dh-coleman', name: 'Coleman Slide', category: Discipline.DOWNHILL, difficulty: Difficulty.BEGINNER, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=6t2j7S7Jp4E', unlockableCollectibleId: 'sticker_coleman_master' },
  { id: 'dh-180standup', name: '180 Standup', category: Discipline.DOWNHILL, difficulty: Difficulty.INTERMEDIATE, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=P1j2a3b4c5d', unlockableCollectibleId: 'sticker_180standup_master' },
  { id: 'dh-standup', name: 'Heelside Standup', category: Discipline.DOWNHILL, difficulty: Difficulty.INTERMEDIATE, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=P1j2a3b4c5d', unlockableCollectibleId: 'sticker_standup_master' },
  { id: 'dh-toeside', name: 'Toeside Standup', category: Discipline.DOWNHILL, difficulty: Difficulty.ADVANCED, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=Q7W1B8Y2g8U', unlockableCollectibleId: 'sticker_toeside_master' },
  { id: 'dh-tuck', name: 'Aerodynamic Tuck', category: Discipline.DOWNHILL, difficulty: Difficulty.ADVANCED, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=Q7W1B8Y2g8U', unlockableCollectibleId: 'sticker_tuck_master' },
  { id: 'dh-360slide', name: '360 Slide', category: Discipline.DOWNHILL, difficulty: Difficulty.ADVANCED, state: SkillState.LEARNING, tutorialUrl: 'https://www.youtube.com/watch?v=Q7W1B8Y2g8U', unlockableCollectibleId: 'sticker_360slide_master' }
];

// Helper to parse "lat,lng" string from CSV
const parseGPS = (gpsString: string): { lat: number, lng: number } => {
  if (!gpsString) return { lat: 0, lng: 0 };
  const [lat, lng] = gpsString.split(',').map(s => parseFloat(s.trim()));
  return { lat: isNaN(lat) ? 0 : lat, lng: isNaN(lng) ? 0 : lng };
};

// Helper to build note string
const buildNotes = (notes: string, surface: string, risk: string, source: string, mapsUrl: string, ytUrl: string) => {
  let note = notes;
  if(surface) note += ` | Surface: ${surface}`;
  if(risk) note += ` | Risk: ${risk}`;
  if(source) note += ` | Source: ${source}`;
  if(mapsUrl) note += ` | Maps: ${mapsUrl}`;
  if(ytUrl) note += ` | Video: ${ytUrl}`;
  return note;
};

// Raw Data from CSV Parsing
const RAW_SPOTS_DATA = [
  // --- SKATEPARKS (Verified & Preserved) ---
  { state: "Assam", city: "Guwahati", name: "NFR Skatepark (Maligaon)", discipline: "Skatepark", gps: "26.1600,91.7000", notes: "Railways community skatepark (NFR)", source: "Local listings", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Delhi", city: "Noida", name: "Noida Pump Track", discipline: "Skatepark", gps: "28.5355,77.3910", notes: "Pumptrack and skate areas", source: "100Ramps", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Goa", city: "Anjuna", name: "Anjuna Skate Bowl", discipline: "Skatepark", gps: "15.5736,73.7406", notes: "Concrete bowl by the beach", source: "Community / 100Ramps", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Goa", city: "Miramar", name: "Miramar Skatepark", discipline: "Skatepark", gps: "15.4732,73.8079", notes: "Public skate area", source: "Community / 100Ramps", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Gujarat", city: "Ahmedabad", name: "Sabarmati Riverfront Skatepark", discipline: "Skatepark", gps: "23.0225,72.5714", notes: "Riverfront skate facilities", source: "100Ramps", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Gujarat", city: "Vadodara", name: "Vadodara Skatepark", discipline: "Skatepark", gps: "22.3072,73.1812", notes: "Community skatepark", source: "Community / 100Ramps", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Chandigarh", city: "Chandigarh", name: "Sector 17 Skate Plaza", discipline: "Skatepark", gps: "30.7333,76.7794", notes: "Public plazas and civic spaces", source: "Community", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "Medium" },
  { state: "Haryana", city: "Gurgaon", name: "Leela Ambience Skatepark", discipline: "Skatepark", gps: "28.5033,77.0966", notes: "Mall skate activation zone", source: "Community / 100Ramps", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Karnataka", city: "Bengaluru", name: "Holystoked Skatepark", discipline: "Skatepark", gps: "12.9352,77.6245", notes: "Community-built park", source: "PisoSkateboards", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Karnataka", city: "Bengaluru", name: "Play Arena Skatepark", discipline: "Skatepark", gps: "12.8426,77.6648", notes: "Commercial skatepark", source: "GoSkate", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Karnataka", city: "Chintamani", name: "Chintamani Skatepark", discipline: "Skatepark", gps: "13.4300,78.0300", notes: "100Ramps hand-built park", source: "Community / 100Ramps", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Kerala", city: "Kovalam", name: "Kovalam Skatepark", discipline: "Skatepark", gps: "8.3833,76.9714", notes: "Community beachside skatepark", source: "Community / 100Ramps", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Madhya Pradesh", city: "Bhopal", name: "Bhopal Public Skate Plaza", discipline: "Skatepark", gps: "23.2599,77.4126", notes: "Community ramps and plazas", source: "Indian Skate Culture", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "Medium" },
  { state: "Madhya Pradesh", city: "Gwalior", name: "GSC Skatepark", discipline: "Skatepark", gps: "26.1910,78.1700", notes: "Gwalior Sickness Centre skatepark", source: "GSCsk8", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Madhya Pradesh", city: "Panna", name: "Janwaar Skatepark", discipline: "Skatepark", gps: "24.3300,80.2700", notes: "Rural community skatepark", source: "Community / 100Ramps", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Maharashtra", city: "Mumbai", name: "Carter Road Skatepark", discipline: "Skatepark", gps: "19.0607,72.8227", notes: "Public promenade skatepark", source: "Community / 100Ramps", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Maharashtra", city: "Navi Mumbai", name: "Kharghar Skatepark", discipline: "Skatepark", gps: "19.0330,73.0300", notes: "Community skatepark", source: "Community", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Maharashtra", city: "Navi Mumbai", name: "Nerul Skatepark", discipline: "Skatepark", gps: "19.0365,73.0186", notes: "Concrete plaza with modules", source: "Outlook Traveller", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Maharashtra", city: "Pune", name: "Baba Saheb Ambedkar Skatepark", discipline: "Skatepark", gps: "18.4870,73.8470", notes: "Municipal skatepark in Sahakarnagar", source: "Community / 100Ramps", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Maharashtra", city: "Thane", name: "Thane Pumptrack", discipline: "Skatepark", gps: "19.2183,72.9781", notes: "Pumptrack and small skate area", source: "Local listings", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "Medium" },
  { state: "Meghalaya", city: "Shillong", name: "Pro-Life Skatepark", discipline: "Skatepark", gps: "25.5788,91.8933", notes: "Community-built skatepark", source: "Community / 100Ramps", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Odisha", city: "Bhubaneswar", name: "Proto Village Skatepark", discipline: "Skatepark", gps: "20.2961,85.8245", notes: "Community skatepark", source: "Community / 100Ramps", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Rajasthan", city: "Jaipur", name: "Jawahar Circle Skatepark", discipline: "Skatepark", gps: "26.8850,75.7889", notes: "Municipal skate area", source: "Community / 100Ramps", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Rajasthan", city: "Khempur", name: "Desert Dolphin Skatepark", discipline: "Skatepark", gps: "26.2100,73.3200", notes: "Large transition skatepark", source: "GoSkate", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Tamil Nadu", city: "Chennai", name: "Madras Wheelers Skatepark", discipline: "Skatepark", gps: "13.0827,80.2707", notes: "Community skate facility", source: "GoSkate", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Tamil Nadu", city: "Mahabalipuram", name: "Mahabalipuram Skatepark", discipline: "Skatepark", gps: "12.6208,80.1936", notes: "Listed park", source: "Skate-parks.net", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Telangana", city: "Hyderabad", name: "WallRide Park", discipline: "Skatepark", gps: "17.3000,78.4250", notes: "Pump track + skatepark", source: "PisoSkateboards", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "Uttar Pradesh", city: "Lucknow", name: "Gomti Riverfront Skatepark", discipline: "Skatepark", gps: "26.8467,80.9462", notes: "Riverfront skate zone", source: "Community / 100Ramps", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },
  { state: "West Bengal", city: "Kolkata", name: "New Town Skatepark", discipline: "Skatepark", gps: "22.5873,88.4861", notes: "Municipal skatepark", source: "Community / 100Ramps", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low", confidence: "High" },

  // --- STREET (Deduplicated & Verified) ---
  // High Activity Hubs
  { state: "Delhi", city: "New Delhi", name: "Connaught Place (Rajeev Chowk)", discipline: "Street", gps: "28.6315,77.2167", notes: "Classic marble ledges and smooth tiles. Inner circle is best. Security is hit or miss.", source: "Community / Piso", difficulty: "Intermediate", surface: "Marble / Tiles", risk: "Medium", activity: { activeVotes: 45, inactiveVotes: 2, lastSkatedAt: "2024-03-10", confidence: "High" } },
  { state: "Delhi", city: "New Delhi", name: "India Gate Plazas", discipline: "Street", gps: "28.6129,77.2295", notes: "Wide open paths near the monument. Good for cruising and flatground lines.", source: "Community", difficulty: "Beginner", surface: "Asphalt / Pavers", risk: "Medium", activity: { activeVotes: 30, inactiveVotes: 5, lastSkatedAt: "2024-02-28", confidence: "High" } },
  { state: "Maharashtra", city: "Mumbai", name: "Bandstand Promenade", discipline: "Street", gps: "19.0543,72.8192", notes: "Iconic sea-facing promenade. Ledges and stairs available along the stretch.", source: "Community", difficulty: "Intermediate", surface: "Tiles", risk: "Medium", activity: { activeVotes: 50, inactiveVotes: 4, lastSkatedAt: "2024-03-14", confidence: "High" } },
  { state: "Maharashtra", city: "Mumbai", name: "BKC Jio Garden Area", discipline: "Street", gps: "19.0600,72.8636", notes: "Wide pavements and open lots near Jio Garden. Smooth cruising.", source: "Community", difficulty: "Beginner", surface: "Pavers", risk: "Low", activity: { activeVotes: 35, inactiveVotes: 3, lastSkatedAt: "2024-03-05", confidence: "High" } },
  { state: "Karnataka", city: "Bengaluru", name: "Cubbon Park Roads", discipline: "Street", gps: "12.9763,77.5929", notes: "Closed to traffic on Sundays. Paradise for longboard dancing.", source: "Community", difficulty: "Beginner", surface: "Asphalt", risk: "Low", activity: { activeVotes: 60, inactiveVotes: 2, lastSkatedAt: "2024-03-17", confidence: "High" } },
  { state: "Tamil Nadu", city: "Chennai", name: "Bessie Beach (Elliot's Beach)", discipline: "Street", gps: "13.0003,80.2737", notes: "The OG spot. Smooth promenade road, sea breeze, and chill vibes.", source: "Madras Wheelers", difficulty: "Beginner", surface: "Asphalt", risk: "Low", activity: { activeVotes: 40, inactiveVotes: 0, lastSkatedAt: "2024-03-12", confidence: "High" } },
  
  // Medium/Generic Activity (Default Vote Logic Applied)
  { state: "Delhi", city: "New Delhi", name: "Mandi House Complex", discipline: "Street", gps: "28.6261,77.2335", notes: "The 'Mandi Monkeys' spot. Theatre complex stairs and ledges.", source: "Instagram", difficulty: "Intermediate", surface: "Concrete", risk: "Medium", activity: { activeVotes: 28, inactiveVotes: 1, lastSkatedAt: "2024-03-12", confidence: "Medium" } },
  { state: "Delhi", city: "Hauz Khas", name: "Hauz Khas Village", discipline: "Street", gps: "28.5530,77.1942", notes: "Narrow lanes and DIY barriers in the back alleys. Artsy vibe.", source: "Local", difficulty: "Intermediate", surface: "Asphalt", risk: "Low", activity: { activeVotes: 12, inactiveVotes: 0, lastSkatedAt: "2024-01-15", confidence: "Medium" } },
  { state: "Delhi", city: "Gurgaon", name: "Cyber Hub", discipline: "Street", gps: "28.4950,77.0895", notes: "Futuristic corporate plazas. Security is strict but weekends are sometimes open.", source: "Community", difficulty: "Intermediate", surface: "Smooth Tiles", risk: "High", activity: { activeVotes: 15, inactiveVotes: 8, lastSkatedAt: "2023-12-20", confidence: "Medium" } },
  { state: "Delhi", city: "New Delhi", name: "Talkatora Gardens", discipline: "Street", gps: "28.6267,77.1936", notes: "Smooth downhill paths and flatground areas.", source: "Community", difficulty: "Beginner", surface: "Asphalt", risk: "Low", activity: { activeVotes: 1, inactiveVotes: 0, lastSkatedAt: null, confidence: "Low" } },

  { state: "Maharashtra", city: "Mumbai", name: "Lower Parel Plazas", discipline: "Street", gps: "19.0047,72.8258", notes: "Corporate park ledges. High bust factor but perfect ground.", source: "Community", difficulty: "Advanced", surface: "Marble", risk: "High", activity: { activeVotes: 10, inactiveVotes: 12, lastSkatedAt: "2023-11-10", confidence: "Medium" } },
  { state: "Maharashtra", city: "Mumbai", name: "Marine Drive", discipline: "Street", gps: "18.9438,72.8233", notes: "Long promenade for cruising. Crowded in evenings.", source: "Community", difficulty: "Beginner", surface: "Concrete", risk: "Low", activity: { activeVotes: 1, inactiveVotes: 0, lastSkatedAt: null, confidence: "Low" } },
  { state: "Maharashtra", city: "Mumbai", name: "Powai Lake Promenade", discipline: "Street", gps: "19.1254,72.9037", notes: "Scenic lakeside run. Good for flatground.", source: "Community", difficulty: "Beginner", surface: "Pavers", risk: "Low", activity: { activeVotes: 1, inactiveVotes: 0, lastSkatedAt: null, confidence: "Low" } },
  { state: "Maharashtra", city: "Pune", name: "Viman Nagar Skate Plaza", discipline: "Street", gps: "18.5679,73.9143", notes: "Local favorite. Open civic space with good flatground.", source: "Community", difficulty: "Beginner", surface: "Concrete", risk: "Low", activity: { activeVotes: 22, inactiveVotes: 1, lastSkatedAt: "2024-03-01", confidence: "High" } },
  
  { state: "Karnataka", city: "Bengaluru", name: "Jayanagar 4th Block Complex", discipline: "Street", gps: "12.9298,77.5834", notes: "Shopping complex ledges and open space after hours.", source: "Local", difficulty: "Intermediate", surface: "Tiles", risk: "Medium", activity: { activeVotes: 18, inactiveVotes: 3, lastSkatedAt: "2024-02-15", confidence: "Medium" } },
  { state: "Karnataka", city: "Bengaluru", name: "EPIP Zone Plazas", discipline: "Street", gps: "12.9733,77.7219", notes: "Whitefield tech parks. Busty but perfect ledges.", source: "Community", difficulty: "Advanced", surface: "Granite", risk: "High", activity: { activeVotes: 8, inactiveVotes: 10, lastSkatedAt: "2023-12-05", confidence: "Low" } },
  { state: "Karnataka", city: "Bengaluru", name: "Freedom Park", discipline: "Street", gps: "12.9796,77.5813", notes: "Central park with some skateable architecture.", source: "Community", difficulty: "Intermediate", surface: "Concrete", risk: "Medium", activity: { activeVotes: 1, inactiveVotes: 0, lastSkatedAt: null, confidence: "Low" } },

  { state: "Tamil Nadu", city: "Chennai", name: "Ambattur Estate Roads", discipline: "Street", gps: "13.1005,80.1645", notes: "Wide industrial roads, empty on weekends.", source: "Community", difficulty: "Beginner", surface: "Asphalt", risk: "Low", activity: { activeVotes: 5, inactiveVotes: 0, lastSkatedAt: "2024-01-20", confidence: "Medium" } },
  
  { state: "Telangana", city: "Hyderabad", name: "Necklace Road Promenade", discipline: "Street", gps: "17.4239,78.4738", notes: "Lakeview cruising. Long smooth stretches.", source: "Community", difficulty: "Beginner", surface: "Pavers / Asphalt", risk: "Low", activity: { activeVotes: 25, inactiveVotes: 1, lastSkatedAt: "2024-03-08", confidence: "High" } },
  { state: "Telangana", city: "Hyderabad", name: "Mindspace IT Park", discipline: "Street", gps: "17.4428,78.3794", notes: "HITEC City area. Modern architecture, good stairs.", source: "Community", difficulty: "Advanced", surface: "Tiles", risk: "High", activity: { activeVotes: 10, inactiveVotes: 5, lastSkatedAt: "2024-02-10", confidence: "Medium" } },
  { state: "Telangana", city: "Hyderabad", name: "Sanjeevaiah Park", discipline: "Street", gps: "17.4336,78.4744", notes: "Park paths suitable for longboarding.", source: "Community", difficulty: "Beginner", surface: "Asphalt", risk: "Low", activity: { activeVotes: 1, inactiveVotes: 0, lastSkatedAt: null, confidence: "Low" } },

  { state: "West Bengal", city: "Kolkata", name: "Victoria Memorial", discipline: "Street", gps: "22.5448,88.3426", notes: "Wide pathways around the monument. Very scenic.", source: "Community", difficulty: "Beginner", surface: "Asphalt", risk: "Medium", activity: { activeVotes: 20, inactiveVotes: 4, lastSkatedAt: "2024-02-25", confidence: "High" } },
  { state: "West Bengal", city: "Kolkata", name: "Millennium Park", discipline: "Street", gps: "22.5726,88.3476", notes: "Riverfront promenade. Good for flatground.", source: "Community", difficulty: "Beginner", surface: "Pavers", risk: "Low", activity: { activeVotes: 15, inactiveVotes: 1, lastSkatedAt: "2024-01-30", confidence: "Medium" } },
  
  { state: "Goa", city: "Panaji", name: "Miramar Circle", discipline: "Street", gps: "15.4745,73.8055", notes: "Roundabout area near the beach with smooth ground.", source: "Community", difficulty: "Beginner", surface: "Concrete", risk: "Low", activity: { activeVotes: 12, inactiveVotes: 0, lastSkatedAt: "2024-03-01", confidence: "Medium" } },
  { state: "Puducherry", city: "Puducherry", name: "Rock Beach Promenade", discipline: "Street", gps: "11.9363,79.8354", notes: "French quarter seaside. Closed to cars in evenings.", source: "Community", difficulty: "Beginner", surface: "Asphalt", risk: "Low", activity: { activeVotes: 30, inactiveVotes: 0, lastSkatedAt: "2024-03-15", confidence: "High" } },
  
  { state: "Gujarat", city: "Ahmedabad", name: "Riverfront Park", discipline: "Street", gps: "23.0337,72.5722", notes: "Sabarmati riverfront promenade.", source: "Community", difficulty: "Beginner", surface: "Concrete", risk: "Low", activity: { activeVotes: 1, inactiveVotes: 0, lastSkatedAt: null, confidence: "Low" } },
  { state: "Chandigarh", city: "Chandigarh", name: "Sukhna Lake", discipline: "Street", gps: "30.7421,76.8188", notes: "Lake promenade, good for cruising.", source: "Community", difficulty: "Beginner", surface: "Tiles", risk: "Low", activity: { activeVotes: 1, inactiveVotes: 0, lastSkatedAt: null, confidence: "Low" } },

  // --- DOWNHILL (Verified & Preserved) ---
  { state: "Andhra Pradesh", city: "Tirupati", name: "Tirumala ghat approach", discipline: "Downhill", gps: "13.6288,79.4192", notes: "Pilgrim ghats", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Andhra Pradesh", city: "Visakhapatnam", name: "Araku Valley ghats", discipline: "Downhill", gps: "18.3333,82.8667", notes: "Valley roads for downhill", source: "YouTube", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Arunachal Pradesh", city: "Ziro", name: "Ziro plateau roads", discipline: "Downhill", gps: "27.6126,93.8241", notes: "Rolling descents & plateaus", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Chhattisgarh", city: "Bastar", name: "Bastar approach roads", discipline: "Downhill", gps: "19.0750,82.1290", notes: "Forest descents", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Goa", city: "Vagator", name: "Vagator hill road / coastal", discipline: "Downhill", gps: "15.5991,73.7447", notes: "Short scenic descents", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Haryana", city: "Panchkula", name: "Morni Hills", discipline: "Downhill", gps: "30.7594,76.8600", notes: "Local hill runs", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Himachal Pradesh", city: "Kasauli", name: "Kasauli Ghat Road", discipline: "Downhill", gps: "30.8986,76.9647", notes: "Short descents", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Himachal Pradesh", city: "Manali", name: "Manali hill roads / Solang approach", discipline: "Downhill", gps: "32.2432,77.1892", notes: "High-altitude descents", source: "YouTube", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Himachal Pradesh", city: "Shimla", name: "Shimla ghat roads (Mashobra)", discipline: "Downhill", gps: "31.1048,77.1734", notes: "Hill roads used by riders", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Karnataka", city: "Bengaluru", name: "Nandi Hills", discipline: "Downhill", gps: "13.3702,77.6835", notes: "Famous downhill run", source: "YouTube", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Karnataka", city: "Chikkamagaluru", name: "Mullayanagiri Descent", discipline: "Downhill", gps: "13.3909,75.7204", notes: "Steep & fast", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Karnataka", city: "Chitradurga", name: "Hill Fort Approach Roads", discipline: "Downhill", gps: "14.2251,76.4000", notes: "Stone hill descent", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Karnataka", city: "Coorg", name: "Madikeri Ghat Roads", discipline: "Downhill", gps: "12.4244,75.7382", notes: "Scenic ghats", source: "YouTube", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Karnataka", city: "Hassan", name: "Shravanabelagola Road", discipline: "Downhill", gps: "12.8586,76.4895", notes: "Hill approach descent", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Karnataka", city: "Shimoga", name: "Agumbe Ghat Road", discipline: "Downhill", gps: "13.5019,75.1606", notes: "Rainforest descent (technical)", source: "YouTube", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Karnataka", city: "Uttara Kannada", name: "Yellapur / Dandeli stretches", discipline: "Downhill", gps: "15.6300,74.6239", notes: "Forest roads & descents", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Kerala", city: "Idukki", name: "Hill approach roads", discipline: "Downhill", gps: "9.9189,76.9432", notes: "Forest descents", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Kerala", city: "Munnar", name: "Munnar–Devikulam Road", discipline: "Downhill", gps: "10.0889,77.0595", notes: "Scenic descent", source: "YouTube", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Kerala", city: "Vagamon", name: "Vagamon hill roads", discipline: "Downhill", gps: "9.8731,76.7875", notes: "Short descents", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Kerala", city: "Wayanad", name: "Vythiri Ghat", discipline: "Downhill", gps: "11.5721,76.0353", notes: "Twisty ghats", source: "YouTube", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Maharashtra", city: "Alibaug", name: "Alibaug coastal roads", discipline: "Downhill", gps: "18.6414,72.8722", notes: "Low-traffic coastal descents", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Maharashtra", city: "Aurangabad", name: "Ajanta–Ellora approach", discipline: "Downhill", gps: "20.3410,75.7045", notes: "Approach roads and descents", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Maharashtra", city: "Lonavala", name: "Khandala Ghat", discipline: "Downhill", gps: "18.7509,73.3897", notes: "Classic ghats for longboard runs", source: "YouTube", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Maharashtra", city: "Mahabaleshwar", name: "Mahabaleshwar Ghats", discipline: "Downhill", gps: "17.9230,73.6580", notes: "Tourist hill roads", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Maharashtra", city: "Malshej", name: "Malshej Ghat", discipline: "Downhill", gps: "19.2560,73.6050", notes: "Hairpins & sweepers", source: "YouTube", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Maharashtra", city: "Nashik", name: "Trimbakeshwar Ghat", discipline: "Downhill", gps: "19.9406,73.5306", notes: "Good sections", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Maharashtra", city: "Pune", name: "Sinhagad Road approaches", discipline: "Downhill", gps: "18.3660,73.7931", notes: "Steady descent used by locals", source: "Local riders", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Maharashtra", city: "Ratnagiri", name: "Ganpatipule Coastal Road", discipline: "Downhill", gps: "17.1070,73.2080", notes: "Coastal descents", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Maharashtra", city: "Satara", name: "Thoseghar Road", discipline: "Downhill", gps: "17.6295,73.8345", notes: "Hill descent", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Manipur", city: "Churachandpur", name: "Local hill roads", discipline: "Downhill", gps: "24.3588,93.6820", notes: "Local descents", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Meghalaya", city: "Cherrapunji", name: "Shillong→Cherrapunji road", discipline: "Downhill", gps: "25.2755,91.7326", notes: "Scenic runs", source: "YouTube", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Rajasthan", city: "Jodhpur", name: "Mehrangarh foothills roads", discipline: "Downhill", gps: "26.2389,73.0243", notes: "Low-traffic descents", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Sikkim", city: "Namchi", name: "Namchi hill roads", discipline: "Downhill", gps: "27.1663,88.3498", notes: "Mountain road descents", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Tamil Nadu", city: "Coonoor", name: "Coonoor Ghat Road", discipline: "Downhill", gps: "11.3546,76.7956", notes: "Smooth long runs", source: "YouTube", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Tamil Nadu", city: "Kodaikanal", name: "Kodaikanal Ghats", discipline: "Downhill", gps: "10.2381,77.4890", notes: "Tourist ghats", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Tamil Nadu", city: "Ooty", name: "Ooty–Mettupalayam Ghat", discipline: "Downhill", gps: "11.4064,76.6932", notes: "Iconic downhill", source: "YouTube", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Tamil Nadu", city: "Salem", name: "Yercaud base roads", discipline: "Downhill", gps: "11.6643,78.1460", notes: "Approach descents", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Tamil Nadu", city: "Tirunelveli", name: "Western Ghats approaches", discipline: "Downhill", gps: "8.7236,77.7086", notes: "Hill descents", source: "Community", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Tamil Nadu", city: "Valparai", name: "Valparai Ghats", discipline: "Downhill", gps: "10.3950,76.9368", notes: "Technical ghats", source: "YouTube", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "Tamil Nadu", city: "Yercaud", name: "Yercaud Ghat", discipline: "Downhill", gps: "11.7753,78.2095", notes: "Smooth descent", source: "YouTube", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" },
  { state: "West Bengal", city: "Darjeeling", name: "Darjeeling Hill Cart Road", discipline: "Downhill", gps: "27.0360,88.2627", notes: "Steep descents", source: "YouTube", difficulty: "Advanced", surface: "Asphalt (mountain road)", risk: "High" }
];

export const MOCK_SPOTS: Spot[] = RAW_SPOTS_DATA.map((data, index) => {
  const gps = parseGPS(data.gps);
  // Determine discipline. Default to SKATE.
  // If discipline string contains "Downhill", map to DOWNHILL.
  const type = data.discipline.toLowerCase().includes('downhill') ? Discipline.DOWNHILL : Discipline.SKATE;
  
  // Determine difficulty
  let difficulty = Difficulty.BEGINNER;
  if (data.difficulty.toLowerCase().includes('advanced')) difficulty = Difficulty.ADVANCED;
  else if (data.difficulty.toLowerCase().includes('intermediate')) difficulty = Difficulty.INTERMEDIATE;

  return {
    id: `csv-${index}`,
    name: data.name,
    type,
    difficulty,
    state: data.state,
    location: {
      lat: gps.lat,
      lng: gps.lng,
      address: data.city
    },
    notes: buildNotes(data.notes, data.surface, data.risk, data.source, "", ""),
    surface: data.surface,
    risk: data.risk,
    isVerified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    locationConfidence: (data as any).confidence as "High" | "Medium" | "Low" | undefined,
    verificationMethod: "Imported Dataset v14",
    // Ensure activity object exists, defaulting if missing
    activity: (data as any).activity || { 
      activeVotes: 1, 
      inactiveVotes: 0, 
      lastSkatedAt: null, 
      confidence: "Low" 
    },
    images: getImage(type, index),
    sessions: [],
    rating: 4.0 + (Math.random() * 1.0), // Random high rating
    reviews: generateReviews(`csv-${index}`, type, difficulty)
  };
});
