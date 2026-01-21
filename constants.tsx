
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
  { state: "Assam", city: "Guwahati", name: "NFR Skatepark (Maligaon)", discipline: "Skatepark", gps: "26.1600,91.7000", notes: "Railways community skatepark (NFR)", source: "Local listings", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low" },
  { state: "Delhi", city: "Noida", name: "Noida Pump Track", discipline: "Skatepark", gps: "28.5355,77.3910", notes: "Pumptrack and skate areas", source: "100Ramps", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low" },
  { state: "Goa", city: "Anjuna", name: "Anjuna Bowl", discipline: "Skatepark", gps: "15.5736,73.7406", notes: "Concrete bowl & local community", source: "Community", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low" },
  { state: "Goa", city: "Miramar", name: "Miramar Skatepark", discipline: "Skatepark", gps: "15.4732,73.8079", notes: "Public skate area", source: "Community / 100Ramps / Indian Skate Culture", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low" },
  { state: "Gujarat", city: "Ahmedabad", name: "Sabarmati Riverfront Skatepark", discipline: "Skatepark", gps: "23.0225,72.5714", notes: "Riverfront skate facilities", source: "100Ramps", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low" },
  { state: "Gujarat", city: "Vadodara", name: "Vadodara Skatepark", discipline: "Skatepark", gps: "22.3072,73.1812", notes: "Community skatepark", source: "Community / 100Ramps / Indian Skate Culture", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low" },
  { state: "Haryana", city: "Chandigarh", name: "Sector 17 / civic plazas", discipline: "Skatepark", gps: "30.7333,76.7794", notes: "Public plazas and civic spaces", source: "Community", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low" },
  { state: "Karnataka", city: "Bengaluru", name: "Holystoked Skatepark", discipline: "Skatepark", gps: "12.9352,77.6245", notes: "Community-built park", source: "PisoSkateboards", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low" },
  { state: "Karnataka", city: "Bengaluru", name: "Play Arena Skatepark", discipline: "Skatepark", gps: "12.8426,77.6648", notes: "Commercial skatepark", source: "GoSkate", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low" },
  { state: "Kerala", city: "Kovalam", name: "Kovalam Skatepark", discipline: "Skatepark", gps: "8.3833,76.9714", notes: "Community beachside skatepark", source: "Community / 100Ramps / Indian Skate Culture", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low" },
  { state: "Madhya Pradesh", city: "Gwalior", name: "GSC Skatepark", discipline: "Skatepark", gps: "26.1910,78.1700", notes: "Gwalior Sickness Centre skatepark", source: "Community / 100Ramps / Indian Skate Culture", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low" },
  { state: "Madhya Pradesh", city: "Panna", name: "Janwaar Skatepark", discipline: "Skatepark", gps: "24.3300,80.2700", notes: "Rural community skatepark", source: "Community / 100Ramps / Indian Skate Culture", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low" },
  { state: "Maharashtra", city: "Mumbai", name: "Carter Road Skatepark", discipline: "Skatepark", gps: "19.0607,72.8227", notes: "Public promenade skatepark", source: "Community / 100Ramps / Indian Skate Culture", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low" },
  { state: "Maharashtra", city: "Navi Mumbai", name: "Nerul Skatepark", discipline: "Skatepark", gps: "19.0365,73.0186", notes: "Concrete plaza with modules", source: "Outlook Traveller", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low" },
  { state: "Maharashtra", city: "Pune", name: "Sahakarnagar Skatepark", discipline: "Skatepark", gps: "18.4870,73.8470", notes: "Municipal skatepark", source: "Community / 100Ramps / Indian Skate Culture", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low" },
  { state: "Meghalaya", city: "Shillong", name: "Pro-Life Skatepark", discipline: "Skatepark", gps: "25.5788,91.8933", notes: "Community-built skatepark", source: "Community / 100Ramps / Indian Skate Culture", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low" },
  { state: "Odisha", city: "Bhubaneswar", name: "Proto Village Skatepark", discipline: "Skatepark", gps: "20.2961,85.8245", notes: "Community skatepark", source: "Community / 100Ramps / Indian Skate Culture", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low" },
  { state: "Punjab", city: "Chandigarh", name: "Sector 17 Skate Area", discipline: "Skatepark", gps: "30.7333,76.7794", notes: "Civic skate space", source: "Community / 100Ramps / Indian Skate Culture", difficulty: "Beginner–Advanced", surface: "Concrete", risk: "Low" },
  { state: "Rajasthan", city: "Jaipur", name: "Jawahar Circle Skate Area", discipline: "Skatepark", gps: "26.8393,75.8054", notes: "Public circle with smooth patches", source: "Community", difficulty: "Beginner", surface: "Concrete", risk: "Low" }
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
    id: `spot-${index}`,
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
    images: getImage(type, index),
    sessions: [],
    rating: 4.0 + (Math.random() * 1.0), // Random high rating
    reviews: generateReviews(`spot-${index}`, type, difficulty)
  };
});
