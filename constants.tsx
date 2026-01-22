
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
  "Andaman & Nicobar": "https://images.unsplash.com/photo-1598976644143-69450c265322?q=80&w=800&auto=format&fit=crop",
  "Andhra Pradesh": "https://images.unsplash.com/photo-1628000854291-030917639556?q=80&w=800&auto=format&fit=crop",
  "Arunachal Pradesh": "https://images.unsplash.com/photo-1619846285223-74d6c4424905?q=80&w=800&auto=format&fit=crop",
  "Assam": "https://images.unsplash.com/photo-1588523956463-b88307c80536?q=80&w=800&auto=format&fit=crop",
  "Bihar": "https://images.unsplash.com/photo-1594132899723-88849b282920?q=80&w=800&auto=format&fit=crop",
  "Chandigarh": "https://images.unsplash.com/photo-1570535977923-286a1c43236e?q=80&w=800&auto=format&fit=crop",
  "Chhattisgarh": "https://images.unsplash.com/photo-1620214648589-32215c26b527?q=80&w=800&auto=format&fit=crop",
  "Dadra & Nagar Haveli": "https://images.unsplash.com/photo-1616429532585-11075d95392e?q=80&w=800&auto=format&fit=crop",
  "Daman & Diu": "https://images.unsplash.com/photo-1599583488896-1c73656c0734?q=80&w=800&auto=format&fit=crop",
  "Delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop",
  "Goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop",
  "Gujarat": "https://images.unsplash.com/photo-1555948924-f72671520633?q=80&w=800&auto=format&fit=crop",
  "Haryana": "https://images.unsplash.com/photo-1617470355106-25807469774a?q=80&w=800&auto=format&fit=crop",
  "Himachal Pradesh": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=800&auto=format&fit=crop",
  "Jammu & Kashmir": "https://images.unsplash.com/photo-1566837945700-30057527ade0?q=80&w=800&auto=format&fit=crop",
  "Jharkhand": "https://images.unsplash.com/photo-1589136777351-94328825f361?q=80&w=800&auto=format&fit=crop",
  "Karnataka": "https://images.unsplash.com/photo-1600619520037-c79375e87a21?q=80&w=800&auto=format&fit=crop",
  "Kerala": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop",
  "Ladakh": "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800&auto=format&fit=crop",
  "Lakshadweep": "https://images.unsplash.com/photo-1629864271810-7058df53493e?q=80&w=800&auto=format&fit=crop",
  "Madhya Pradesh": "https://images.unsplash.com/photo-1616428464670-65e100868f63?q=80&w=800&auto=format&fit=crop",
  "Maharashtra": "https://images.unsplash.com/photo-1572883454114-1cf0031a026e?q=80&w=800&auto=format&fit=crop",
  "Manipur": "https://images.unsplash.com/photo-1622304919799-73e4802c6104?q=80&w=800&auto=format&fit=crop",
  "Meghalaya": "https://images.unsplash.com/photo-1579493922765-b1660d2387a3?q=80&w=800&auto=format&fit=crop",
  "Mizoram": "https://images.unsplash.com/photo-1628178864708-3a4792695572?q=80&w=800&auto=format&fit=crop",
  "Nagaland": "https://images.unsplash.com/photo-1619942478335-0814472d736a?q=80&w=800&auto=format&fit=crop",
  "Odisha": "https://images.unsplash.com/photo-1627448827756-3b26c6d0426d?q=80&w=800&auto=format&fit=crop",
  "Puducherry": "https://images.unsplash.com/photo-1617196014467-33230870533e?q=80&w=800&auto=format&fit=crop",
  "Punjab": "https://images.unsplash.com/photo-1583306346248-f6aca3880531?q=80&w=800&auto=format&fit=crop",
  "Rajasthan": "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800&auto=format&fit=crop",
  "Sikkim": "https://images.unsplash.com/photo-1549141091-a1288219463c?q=80&w=800&auto=format&fit=crop",
  "Tamil Nadu": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop",
  "Telangana": "https://images.unsplash.com/photo-1572455044322-864627d3c0a5?q=80&w=800&auto=format&fit=crop",
  "Tripura": "https://images.unsplash.com/photo-1596700818275-5654378f8564?q=80&w=800&auto=format&fit=crop",
  "Uttar Pradesh": "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800&auto=format&fit=crop",
  "Uttarakhand": "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?q=80&w=800&auto=format&fit=crop",
  "West Bengal": "https://images.unsplash.com/photo-1581423807212-e8cb55474776?q=80&w=800&auto=format&fit=crop"
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
  // --- SKATEPARKS (Cleaned, Deduplicated, Verified) ---
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

  // --- STREET (Imported All) ---
  { state: "Andaman & Nicobar", city: "Port Blair", name: "Port Blair promenades", discipline: "Street", gps: "11.6670,92.7350", notes: "Coastal promenades", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Andhra Pradesh", city: "Vijayawada", name: "Vijayawada riverfront promenade", discipline: "Street", gps: "16.5062,80.6480", notes: "Promenade skating", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Andhra Pradesh", city: "Visakhapatnam", name: "RK Beach promenade", discipline: "Street", gps: "17.6868,83.2185", notes: "Beach promenade cruising", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Arunachal Pradesh", city: "Itanagar", name: "Itanagar public plazas", discipline: "Street", gps: "27.0844,93.6053", notes: "Small gatherings & ramps", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Assam", city: "Dibrugarh", name: "Dibrugarh promenades", discipline: "Street", gps: "27.4728,94.9110", notes: "Riverfront skating", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Assam", city: "Guwahati", name: "Six Mile / Dispur spots", discipline: "Street", gps: "26.1445,91.7362", notes: "Local skate parks and roller rinks", source: "Local listings", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Bihar", city: "Gaya", name: "Bodh Gaya approach plazas", discipline: "Street", gps: "24.6958,85.0008", notes: "Promenade skating", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Bihar", city: "Patna", name: "Patna riverfront promenades", discipline: "Street", gps: "25.5941,85.1376", notes: "Promenade areas used by skaters", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Chhattisgarh", city: "Raipur", name: "Raipur community plazas", discipline: "Street", gps: "21.2514,81.6296", notes: "Small community parks", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Delhi", city: "Gurgaon", name: "DLF Promenade / Cyber Hub areas", discipline: "Street", gps: "28.4595,77.0266", notes: "Open plazas & promenades", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Delhi", city: "Hauz Khas", name: "Deer Park / Hauz Khas", discipline: "Street", gps: "28.5496,77.1986", notes: "DIY ramps & events", source: "YouTube/News", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Delhi", city: "HillRoad", name: "HillRoad Skate Spot #5", discipline: "Street", gps: "", notes: "Community-identified spot (needs local verification)", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Delhi", city: "New Delhi", name: "Connaught Place (Inner Circle)", discipline: "Street", gps: "28.6315,77.2167", notes: "Classic plaza – ledges and tiles", source: "PisoSkateboards", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Delhi", city: "New Delhi", name: "India Gate Lawns (perimeter)", discipline: "Street", gps: "28.6129,77.2295", notes: "Smooth walking paths", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Delhi", city: "New Delhi", name: "Janpath / Connaught Place extensions", discipline: "Street", gps: "28.6315,77.2167", notes: "Extension plazas", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Delhi", city: "New Delhi", name: "Mandi House (Mandi Monkeys spot)", discipline: "Street", gps: "28.6261,77.2064", notes: "Informal jam spot near theaters", source: "Instagram/community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Goa", city: "Calangute", name: "Calangute Promenade", discipline: "Street", gps: "15.5505,73.7546", notes: "Beach promenade skating", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Goa", city: "Margao", name: "Margao promenade", discipline: "Street", gps: "15.2962,73.9583", notes: "Promenade skating", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Goa", city: "Panaji", name: "Mandovi Riverside Promenade", discipline: "Street", gps: "15.4909,73.8278", notes: "Promenade cruising", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Gujarat", city: "Rajkot", name: "Rajkot civic plazas", discipline: "Street", gps: "22.3039,70.8022", notes: "Public plazas", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Gujarat", city: "Surat", name: "Surat riverfront promenades", discipline: "Street", gps: "21.1702,72.8311", notes: "Promenades suited for cruising", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Haryana", city: "Faridabad", name: "Township plazas", discipline: "Street", gps: "28.4089,77.3178", notes: "Local plazas used by skaters", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Jammu & Kashmir", city: "Jammu", name: "Jammu promenades", discipline: "Street", gps: "32.7266,74.8570", notes: "Local plazas", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Jammu & Kashmir", city: "Srinagar", name: "Dal Lake Promenade / approach roads", discipline: "Street", gps: "34.0837,74.7973", notes: "Promenades and open roads", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Jharkhand", city: "Jamshedpur", name: "Jamshedpur plazas", discipline: "Street", gps: "22.8035,86.2029", notes: "Community sessions", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Jharkhand", city: "Ranchi", name: "Ranchi promenades", discipline: "Street", gps: "23.3441,85.3096", notes: "Public plazas", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Karnataka", city: "Belur", name: "Temple Town roads", discipline: "Street", gps: "13.1619,75.8650", notes: "Low-traffic streets", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Karnataka", city: "Bengaluru", name: "Jayanagar/Koramangala spots", discipline: "Street", gps: "12.9279,77.6271", notes: "Plazas & colleges", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Karnataka", city: "Bengaluru", name: "Whitefield Skate Spots", discipline: "Street", gps: "12.9699,77.7498", notes: "Tech parks & plazas used by skaters", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Karnataka", city: "Downtown", name: "Downtown Skate Spot #2", discipline: "Street", gps: "", notes: "Community-identified spot (needs local verification)", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Karnataka", city: "Mangaluru", name: "Tannirbhavi Promenade", discipline: "Street", gps: "12.8700,74.8536", notes: "Promenade skating", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Karnataka", city: "Mysuru", name: "Mysore University Plazas", discipline: "Street", gps: "12.2958,76.6394", notes: "Wide plazas", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Karnataka", city: "Mysuru", name: "Yuva Kala Kendra Plaza", discipline: "Street", gps: "12.2958,76.6394", notes: "Public plaza used by skaters", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Karnataka", city: "Udupi", name: "Malpe Beach Promenade", discipline: "Street", gps: "13.3566,74.7378", notes: "Seaside cruising", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Karnataka", city: "Yelahanka", name: "Open Plazas", discipline: "Street", gps: "13.1007,77.5963", notes: "Flatground & pumptrack", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Kerala", city: "Alappuzha", name: "Canal-side roads", discipline: "Street", gps: "9.4981,76.3388", notes: "Smooth cruising", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Kerala", city: "Kannur", name: "Payyambali Beach Road", discipline: "Street", gps: "11.8745,75.3704", notes: "Promenade skating", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Kerala", city: "Kochi", name: "Marine Drive Promenade", discipline: "Street", gps: "9.9312,76.2673", notes: "Promenade cruising", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Kerala", city: "Kollam", name: "Kollam Beach Road", discipline: "Street", gps: "8.8864,76.5958", notes: "Flat seaside road", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Kerala", city: "Kozhikode", name: "Kozhikode Beach Promenade", discipline: "Street", gps: "11.2588,75.7804", notes: "Promenade skating", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Kerala", city: "Thrissur", name: "Town Hall Road", discipline: "Street", gps: "10.5276,76.2144", notes: "Urban flatground", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Lakshadweep", city: "Kavaratti", name: "Kavaratti promenades", discipline: "Street", gps: "10.5644,72.6366", notes: "Island promenades", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Madhya Pradesh", city: "Indore", name: "Indore promenade spots", discipline: "Street", gps: "22.7196,75.8577", notes: "Public plazas used by skaters", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Maharashtra", city: "Kolhapur", name: "Rankala Lake Promenade", discipline: "Street", gps: "16.7040,74.2433", notes: "Smooth promenade", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Maharashtra", city: "Mumbai", name: "BKC Grounds (cruising)", discipline: "Street", gps: "19.0673,72.8687", notes: "Open plazas for cruising", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Maharashtra", city: "Mumbai", name: "Bandra Bandstand Promenade", discipline: "Street", gps: "19.0556,72.8220", notes: "Flatground & ledges", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Maharashtra", city: "Mumbai", name: "Lower Parel Mill Areas", discipline: "Street", gps: "19.0047,72.8258", notes: "Urban street spots", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Maharashtra", city: "Mumbai", name: "NESCO / Bandra plaza", discipline: "Street", gps: "", notes: "Urban plaza spot", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Maharashtra", city: "Pune", name: "Viman Nagar Skate Plaza", discipline: "Street", gps: "18.5679,73.9143", notes: "Tiles & ledges", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Maharashtra", city: "Thane", name: "Upvan Lake / Kolshet Road", discipline: "Street", gps: "19.2183,72.9781", notes: "Local skate meet spots", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Manipur", city: "Imphal", name: "Imphal public squares", discipline: "Street", gps: "24.8170,93.9368", notes: "Emerging skate community spots", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Nagaland", city: "Dimapur", name: "Dimapur riverfront promenades", discipline: "Street", gps: "25.9031,93.7266", notes: "Promenade skating", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Nagaland", city: "Kohima", name: "Kohima plazas", discipline: "Street", gps: "25.6740,94.1108", notes: "Small community meets", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Odisha", city: "Cuttack", name: "Cuttack riverfront / promenades", discipline: "Street", gps: "20.4625,85.8828", notes: "Riverfront skating", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Odisha", city: "Puri", name: "Puri beach promenade", discipline: "Street", gps: "19.8135,85.8312", notes: "Beach promenade skating", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Puducherry", city: "Puducherry", name: "Beach Road promenade", discipline: "Street", gps: "11.9416,79.8083", notes: "Seaside cruising spot", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Punjab", city: "Amritsar", name: "Amritsar Riverfront plazas", discipline: "Street", gps: "31.6340,74.8723", notes: "Promenade skating", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Punjab", city: "Chandigarh", name: "Sector 17 / Sukhna Lake promenade", discipline: "Street", gps: "30.7333,76.7794", notes: "Public plazas & promenades", source: "100Ramps", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Punjab", city: "Ludhiana", name: "Ludhiana plazas", discipline: "Street", gps: "30.9010,75.8573", notes: "Community sessions", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Rajasthan", city: "Jaipur", name: "Jawahar Circle / public plazas", discipline: "Street", gps: "26.8850,75.7889", notes: "Promenades used by skaters", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Rajasthan", city: "Jaipur", name: "MI Road promenades", discipline: "Street", gps: "26.9226,75.7789", notes: "City promenades used by skaters", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Rajasthan", city: "Udaipur", name: "City Lake Promenades", discipline: "Street", gps: "24.5854,73.7125", notes: "Promenade skating", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Sikkim", city: "Gangtok", name: "MG Marg & Terraces", discipline: "Street", gps: "27.3389,88.6065", notes: "Clean promenades", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Tamil Nadu", city: "Chennai", name: "Ambattur Industrial Estate plazas", discipline: "Street", gps: "13.1233,80.1810", notes: "Flatground areas", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Tamil Nadu", city: "Chennai", name: "Besant Nagar / Elliot's Beach Promenade", discipline: "Street", gps: "13.0095,80.2707", notes: "Beach cruising & flatground", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Tamil Nadu", city: "Coimbatore", name: "Race Course Road / Town", discipline: "Street", gps: "11.0168,76.9558", notes: "Wide smooth roads", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Tamil Nadu", city: "Madurai", name: "Corporation Plazas", discipline: "Street", gps: "9.9252,78.1198", notes: "Urban plazas for sessions", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Tamil Nadu", city: "Riverside", name: "Riverside Skate Spot #3", discipline: "Street", gps: "", notes: "Community-identified spot (needs local verification)", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Tamil Nadu", city: "Trichy", name: "Riverfront Promenade", discipline: "Street", gps: "10.7905,78.7047", notes: "Promenade skating", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Tamil Nadu", city: "Vellore", name: "University Grounds", discipline: "Street", gps: "12.9165,79.1325", notes: "Flat plazas", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Telangana", city: "Hyderabad", name: "HITEC City plazas", discipline: "Street", gps: "17.4450,78.3498", notes: "Corporate plazas used by skaters", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Telangana", city: "Hyderabad", name: "Tank Bund / Necklace Road", discipline: "Street", gps: "17.3942,78.4678", notes: "Even promenades for cruising", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Telangana", city: "Karimnagar", name: "Karimnagar civic spaces", discipline: "Street", gps: "18.4386,79.1288", notes: "Local plazas", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Telangana", city: "Secunderabad", name: "Secunderabad open plazas", discipline: "Street", gps: "17.4360,78.4980", notes: "Local meet spots", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Telangana", city: "Warangal", name: "Warangal promenades", discipline: "Street", gps: "18.0005,79.5858", notes: "Public plazas used", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Uttar Pradesh", city: "Agra", name: "Parade Ground / Promenades", discipline: "Street", gps: "27.1767,78.0081", notes: "Open spaces used by skaters", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Uttar Pradesh", city: "Lucknow", name: "Lucknow plazas", discipline: "Street", gps: "26.8467,80.9462", notes: "University plazas", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "Uttar Pradesh", city: "Varanasi", name: "Assi Ghat Promenade", discipline: "Street", gps: "25.3106,82.9739", notes: "Riverfront skating", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "West Bengal", city: "Kolkata", name: "Millennium Park / Strand Road", discipline: "Street", gps: "22.5726,88.3639", notes: "Promenades and university courtyards", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },
  { state: "West Bengal", city: "Kolkata", name: "Victoria Memorial Promenade", discipline: "Street", gps: "22.5448,88.3424", notes: "Wide promenades", source: "Community", difficulty: "Intermediate", surface: "Concrete / Tiles / Asphalt", risk: "Medium" },

  // --- DOWNHILL (Imported All) ---
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
    images: getImage(type, index),
    sessions: [],
    rating: 4.0 + (Math.random() * 1.0), // Random high rating
    reviews: generateReviews(`csv-${index}`, type, difficulty)
  };
});
