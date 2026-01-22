
import React, { useState, useEffect, useRef } from 'react';
import { Settings, Award, Share2, Flame, LogOut, ShieldAlert, ChevronRight, UserX, Zap, Activity, Camera, Loader2, Mountain, Package, Disc, Sticker, Trophy, Crown, Check, Lock, Bell, Volume2, Shield, HelpCircle, Edit3, X, Save, Gamepad2, Instagram, Users, Search, UserPlus, Swords, MapPin, MessageCircle, Send, ArrowLeft, Circle, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { User, Discipline, Collectible, CollectibleType, Rarity, FriendRequest, ChatMessage, Crew } from '../types';
import { COLLECTIBLES_DATABASE } from '../constants';
import { backend } from '../services/mockBackend';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audio';

interface ProfileViewProps {
  setActiveTab?: (tab: string) => void;
  onLogout?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ setActiveTab, onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [crew, setCrew] = useState<Crew | null>(null);
  const [crewMembers, setCrewMembers] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [animateLevel, setAnimateLevel] = useState(false);
  const [unlockedItem, setUnlockedItem] = useState<Collectible | null>(null);
  const [selectedItemDetail, setSelectedItemDetail] = useState<Collectible | null>(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  // Friends & Chat State
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [activeFriendTab, setActiveFriendTab] = useState<'friends' | 'search' | 'requests'>('friends');
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [isSearchingFriends, setIsSearchingFriends] = useState(false);
  
  // Crew State
  const [showCrewModal, setShowCrewModal] = useState(false);
  const [newCrewName, setNewCrewName] = useState('');
  const [newCrewCity, setNewCrewCity] = useState('');
  const [newSessionPlan, setNewSessionPlan] = useState('');
  const [isCreatingCrew, setIsCreatingCrew] = useState(false);

  // Chat Integration
  const [activeChatFriend, setActiveChatFriend] = useState<any | null>(null);
  const [dmMessages, setDmMessages] = useState<ChatMessage[]>([]);
  const [dmInput, setDmInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Challenges State
  const [completedChallenges, setCompletedChallenges] = useState<any[]>([]);

  // Edit Profile State
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editGender, setEditGender] = useState('Prefer not to say');
  const [editDob, setEditDob] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editStance, setEditStance] = useState<'regular' | 'goofy'>('regular');
  
  const prevLevelRef = useRef<number>(0);
  const longPressTimer = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProfileData = async () => {
      const u = await backend.getUser();
      setUser(u);
      prevLevelRef.current = u.level;
      
      if (u.crewId) {
          const c = await backend.getUserCrew(u.crewId);
          setCrew(c);
          if(c) {
              const members = await backend.getCrewMembers(c.members);
              setCrewMembers(members);
          }
      }

      // Initialize form state
      setEditName(u.name);
      setEditLocation(u.location);
      setEditPhone(u.phoneNumber || '');
      setEditAddress(u.address || '');
      setEditGender(u.gender || 'Prefer not to say');
      setEditDob(u.dateOfBirth || '');
      setEditInstagram(u.instagramHandle || '');
      setEditBio(u.bio || '');
      setEditStance(u.stance || 'regular');

      // Load Completed Challenges
      const allChallenges = await backend.getAllChallenges();
      const spots = await backend.getSpots();
      const completed = allChallenges
        .filter(c => u.completedChallengeIds.includes(c.id))
        .map(c => ({
          ...c,
          spotName: spots.find(s => s.id === c.spotId)?.name || 'Unknown Spot'
        }));
      setCompletedChallenges(completed);
    };

    loadProfileData();
  }, []);

  useEffect(() => {
    if (showFriendsModal && activeFriendTab === 'friends') {
        backend.getFriendsList().then(setFriendsList);
    }
  }, [showFriendsModal, activeFriendTab]);

  useEffect(() => {
    if (user && user.level > prevLevelRef.current) {
      setAnimateLevel(true);
      triggerHaptic('success');
      if (user.soundEnabled) playSound(user.retroModeEnabled ? 'retro_unlock' : 'success');
      const timer = setTimeout(() => setAnimateLevel(false), 700);
      prevLevelRef.current = user.level;
      return () => clearTimeout(timer);
    }
  }, [user?.level]);

  // Auto-scroll chat
  useEffect(() => {
    if (activeChatFriend) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dmMessages, activeChatFriend]);

  const handleAvatarPressStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (user?.soundEnabled) playSound('click');
    triggerHaptic('light');
    longPressTimer.current = window.setTimeout(() => {
      if (user?.isAdmin) {
        triggerHaptic('medium');
        setActiveTab?.('admin');
      }
    }, 1500); 
  };

  const handleAvatarPressEnd = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Avatar = reader.result as string;
      const updatedUser = await backend.updateUser({ ...user, avatar: base64Avatar });
      setUser(updatedUser);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    triggerHaptic('medium');
    if (user.soundEnabled) playSound('click');
    setIsUpdating(true);
    const updatedUser = await backend.updateUser({ 
      ...user, 
      name: editName, 
      location: editLocation,
      phoneNumber: editPhone,
      address: editAddress,
      gender: editGender,
      dateOfBirth: editDob,
      instagramHandle: editInstagram,
      bio: editBio,
      stance: editStance
    });
    setUser(updatedUser);
    setIsUpdating(false);
    setShowEditProfile(false);
  };

  const toggleAdmin = async () => {
    if (!user) return;
    setIsUpdating(true);
    const updated = await backend.updateUser({ ...user, isAdmin: !user.isAdmin });
    setUser(updated);
    setIsUpdating(false);
  };

  const toggleSound = async () => {
    if (!user) return;
    const updated = await backend.updateUser({ ...user, soundEnabled: !user.soundEnabled });
    setUser(updated);
    if (updated.soundEnabled) playSound('click');
  };

  const toggleRetroMode = async () => {
    if (!user) return;
    const updated = await backend.updateUser({ ...user, retroModeEnabled: !user.retroModeEnabled });
    setUser(updated);
    if (user.soundEnabled) playSound(updated.retroModeEnabled ? 'retro_unlock' : 'click');
  };

  const simulateStreak = async () => {
    if (!user) return;
    setIsUpdating(true);
    // Increment streak
    const newStreak = user.streak + 1;
    let updatedUser = { ...user, streak: newStreak };
    updatedUser = await backend.updateUser(updatedUser);
    
    // Check rewards
    const userAfterRewards = await backend.checkStreakRewards(updatedUser);
    
    // Check if new item was added
    const newItems = userAfterRewards.locker.filter(id => !user.locker.includes(id));
    if (newItems.length > 0) {
      triggerHaptic('success');
      if (user.soundEnabled) playSound(user.retroModeEnabled ? 'retro_unlock' : 'unlock');
      const itemData = COLLECTIBLES_DATABASE.find(c => c.id === newItems[0]);
      if (itemData) setUnlockedItem(itemData);
    } else {
      triggerHaptic('medium');
      if (user.soundEnabled) playSound('click');
    }

    setUser(userAfterRewards);
    setIsUpdating(false);
  };

  const equipDeck = async (deckId: string) => {
    if (!user) return;
    triggerHaptic('medium');
    if (user.soundEnabled) playSound('click');
    const updated = await backend.updateUser({ ...user, equippedDeckId: deckId });
    setUser(updated);
    setSelectedItemDetail(null);
  };

  const handleItemClick = (item: Collectible) => {
    if (user?.soundEnabled) playSound('click');
    triggerHaptic('light'); // Added haptic here
    setSelectedItemDetail(item);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("PERMANENT ACTION: Are you sure you want to delete your PUSH account? All your spots, clips, and XP will be lost forever.");
    if (confirmed) {
      setIsUpdating(true);
      await backend.deleteAccount();
      if(onLogout) onLogout();
      window.location.reload();
    }
  };

  // --- Crew Logic ---
  const handleCreateCrew = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!newCrewName || !newCrewCity) return;
      
      setIsCreatingCrew(true);
      try {
          const newCrew = await backend.createCrew(newCrewName, newCrewCity);
          setCrew(newCrew);
          const members = await backend.getCrewMembers(newCrew.members);
          setCrewMembers(members);
          // Refresh user to get crewId
          const u = await backend.getUser();
          setUser(u);
          triggerHaptic('success');
          playSound('success');
      } catch(e) {
          console.error(e);
      } finally {
          setIsCreatingCrew(false);
          setShowCrewModal(false);
      }
  };

  const handleUpdateSession = async () => {
      if(!crew || !newSessionPlan.trim()) return;
      const updated = await backend.updateCrewSession(crew.id, newSessionPlan);
      setCrew(updated);
      setNewSessionPlan('');
      triggerHaptic('success');
  };

  // --- Friend Logic ---
  const handleFriendSearch = async (val: string) => {
    setFriendSearchQuery(val);
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearchingFriends(true);
    const results = await backend.searchUsers(val);
    setSearchResults(results.filter(u => u.id !== user?.id)); // Exclude self
    setIsSearchingFriends(false);
  };

  const handleAddFriend = async (userId: string) => {
    if (!user) return;
    triggerHaptic('medium');
    playSound('click');
    const updatedUser = await backend.sendFriendRequest(userId);
    setUser(updatedUser);
    alert("Friend request sent!"); // Replace with toast later
  };

  const handleAcceptRequest = async (reqId: string) => {
    triggerHaptic('success');
    playSound('success');
    const updatedUser = await backend.respondToFriendRequest(reqId, true);
    setUser(updatedUser);
  };

  const handleRejectRequest = async (reqId: string) => {
    triggerHaptic('light');
    const updatedUser = await backend.respondToFriendRequest(reqId, false);
    setUser(updatedUser);
  };

  // --- Chat Logic ---
  const handleOpenChat = async (friend: any) => {
    setActiveChatFriend(friend);
    triggerHaptic('light');
    const dmId = [user?.id, friend.id].sort().join('-');
    const msgs = await backend.getSessionMessages(dmId);
    setDmMessages(msgs);
  };

  const handleCloseChat = () => {
    setActiveChatFriend(null);
    setDmMessages([]);
  };

  const handleSendDm = async () => {
    if (!dmInput.trim() || !activeChatFriend || !user) return;
    const text = dmInput.trim();
    setDmInput('');
    const dmId = [user.id, activeChatFriend.id].sort().join('-');
    
    // Optimistic UI update
    const tempMsg: ChatMessage = {
        id: Math.random().toString(),
        sessionId: dmId,
        userId: user.id,
        userName: user.name,
        text: text,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        isSystem: false
    };
    setDmMessages(prev => [...prev, tempMsg]);
    
    await backend.sendSessionMessage(dmId, text);
    const msgs = await backend.getSessionMessages(dmId);
    setDmMessages(msgs); // Sync
    
    if (user.soundEnabled) playSound('click');
  };

  if (!user) return null;

  const fallbackAvatar = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.name}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=0`;

  // --- Locker Grouping Logic ---
  const allDecks = COLLECTIBLES_DATABASE.filter(c => c.type === CollectibleType.DECK);
  const allWheels = COLLECTIBLES_DATABASE.filter(c => c.type === CollectibleType.WHEEL);
  const allStickers = COLLECTIBLES_DATABASE.filter(c => c.type === CollectibleType.STICKER);
  const allTrophies = COLLECTIBLES_DATABASE.filter(c => c.type === CollectibleType.TROPHY);

  const isUnlocked = (id: string) => user.locker.includes(id);

  // Helper for consistent rarity styling
  const getRarityStyles = (rarity: Rarity) => {
    switch (rarity) {
        case Rarity.LEGENDARY: return 'border-amber-400 bg-amber-500/10 shadow-amber-900/20';
        case Rarity.EPIC: return 'border-purple-500 bg-purple-500/10 shadow-purple-900/20';
        case Rarity.RARE: return 'border-blue-400 bg-blue-500/10 shadow-blue-900/20';
        default: return 'border-slate-700 bg-slate-900 shadow-black/20';
    }
  };

  // Generate tags based on discipline
  const styleTags = [];
  if (user.disciplines.includes(Discipline.SKATE)) {
    styleTags.push('Street');
    styleTags.push('Park');
  }
  if (user.disciplines.includes(Discipline.DOWNHILL)) {
    styleTags.push('Downhill');
  }

  return (
    <div className="pb-32 md:pb-10 pt-6 space-y-6 px-4 animate-view max-w-4xl mx-auto w-full relative">
      <header className="flex justify-between items-center relative z-20">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Profile</h1>
        <button 
          onClick={() => {
            if (user.soundEnabled) playSound('click');
            setShowSettingsMenu(true);
          }}
          className="text-slate-500 active:rotate-90 transition-transform p-2 -mr-2 hover:text-white"
        >
          <Settings size={24} />
        </button>
      </header>

      {/* Identity Card */}
      <section className="flex flex-col sm:flex-row items-center gap-6 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full -mr-16 -mt-16 pointer-events-none" />
        
        {/* Avatar Container */}
        <div className="relative shrink-0">
          <div 
            onMouseDown={handleAvatarPressStart}
            onMouseUp={handleAvatarPressEnd}
            onTouchStart={handleAvatarPressStart}
            onTouchEnd={handleAvatarPressEnd}
            onClick={handleAvatarClick}
            className="w-32 h-32 rounded-full border-4 border-slate-800 overflow-hidden ring-4 ring-slate-900 cursor-pointer active:scale-95 transition-all relative group shadow-2xl"
            title="Tap to change avatar"
          >
            <img 
              src={user.avatar || fallbackAvatar} 
              alt="Avatar" 
              className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-40" 
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none">
              {isUploading ? <Loader2 className="animate-spin text-white" size={32} /> : <Camera className="text-white" size={32} />}
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>

        <div className="space-y-3 text-center sm:text-left z-10 flex flex-col items-center sm:items-start w-full">
          <div>
            <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">{user.name}</h2>
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5 mt-1">
              <MapPin size={10} className="text-indigo-500" /> {user.location}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {styleTags.map(tag => (
              <div key={tag} className="flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest bg-slate-950 border-slate-800 text-slate-300 shadow-sm">
                {tag === 'Downhill' ? <Mountain size={10} strokeWidth={2.5} /> : <Zap size={10} fill="currentColor" />}
                {tag}
              </div>
            ))}
          </div>
          
          {user.bio && (
            <p className="text-xs text-slate-400 font-medium italic leading-relaxed max-w-sm">"{user.bio}"</p>
          )}

          <button 
             onClick={() => setShowEditProfile(true)}
             className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 shadow-lg"
          >
             <Edit3 size={10} /> Edit Bio & Profile
          </button>
        </div>
      </section>

      {/* Grouped Stats Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 1. Progress Section */}
        <section className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] space-y-5 shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 flex items-center gap-2 pl-1">
                <TrendingUp size={14} className="text-indigo-500" /> Skate Journey
            </h3>
            
            {/* XP Progress Bar */}
            <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Current Rank</span>
                      <span className="text-2xl font-black italic text-white leading-none">LVL {user.level}</span>
                    </div>
                    <div className="text-right">
                        <div className="text-indigo-400 text-xs font-black">{user.xp} XP</div>
                    </div>
                </div>
                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden relative">
                    <div 
                        className={`h-full bg-indigo-500 relative ${animateLevel ? 'animate-pulse' : ''}`} 
                        style={{ width: `${(user.xp % 1000) / 10}%` }} 
                    >
                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                    </div>
                </div>
                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-wider text-right">{1000 - (user.xp % 1000)} XP to Next Level</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                  <div className="text-xl font-black italic text-white">{user.streak}</div>
                  <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Day Streak</div>
               </div>
               <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                  <div className="text-xl font-black italic text-white">{user.masteredCount}</div>
                  <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Skills</div>
               </div>
            </div>
        </section>

        {/* 2. Crew Section */}
        <section className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] shadow-xl relative overflow-hidden group">
            {crew ? (
                <div className="space-y-4 h-full flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 flex items-center gap-2">
                                    <Users size={14} className="text-amber-500" /> Crew
                                </h3>
                                <h2 className="text-xl font-black italic uppercase text-white tracking-tight mt-2">{crew.name}</h2>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{crew.city} • LVL {crew.level}</p>
                            </div>
                            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xl border border-slate-700">
                                {crew.avatar}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                        <p className="text-[8px] font-black uppercase text-amber-500 tracking-widest mb-1 flex items-center gap-1">
                            <Calendar size={10} /> Next Session
                        </p>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                className="bg-transparent text-xs font-bold text-white w-full focus:outline-none placeholder:text-slate-600 truncate"
                                value={newSessionPlan || (crew.nextSession?.text || 'No plans yet')}
                                onChange={e => setNewSessionPlan(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleUpdateSession()}
                                placeholder="Set next session..."
                            />
                            {newSessionPlan && <button onClick={handleUpdateSession}><Save size={14} className="text-amber-500" /></button>}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                        <Users size={32} className="text-slate-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black italic uppercase text-white">Ride Solo?</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-[200px] mx-auto">Start a crew or get recruited to dominate spots together.</p>
                    </div>
                    <button 
                        onClick={() => setShowCrewModal(true)}
                        className="bg-amber-500 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
                    >
                        Create Crew
                    </button>
                </div>
            )}
        </section>
      </div>

      {/* Locker Section */}
      <section className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <div>
               <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">The Locker</h3>
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Collected Gear & Trophies</p>
            </div>
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{user.locker.length} Items</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {/* Decks Category */}
             <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Package size={12} /> Decks</h4>
                 <div className="grid grid-cols-4 gap-2">
                    {allDecks.map(deck => {
                        const unlocked = isUnlocked(deck.id);
                        const isEquipped = user.equippedDeckId === deck.id;
                        return (
                           <button 
                             key={deck.id}
                             onClick={() => unlocked ? handleItemClick(deck) : null}
                             className={`aspect-[2/3] rounded-xl relative overflow-hidden transition-all group ${unlocked ? 'opacity-100 hover:scale-105 cursor-pointer' : 'opacity-30 grayscale cursor-not-allowed'}`}
                           >
                              <img src={deck.imageUrl} className="w-full h-full object-cover" alt={deck.name} />
                              {isEquipped && <div className="absolute top-1 right-1 bg-green-500 w-2 h-2 rounded-full shadow-lg" />}
                              {!unlocked && <div className="absolute inset-0 flex items-center justify-center bg-black/50"><Lock size={12} className="text-white/50" /></div>}
                           </button>
                        )
                    })}
                 </div>
             </div>

             {/* Stickers & Trophies Category */}
             <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 space-y-4 col-span-1 md:col-span-2 lg:col-span-2">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Sticker size={12} /> Stickers & Awards</h4>
                 <div className="flex flex-wrap gap-2">
                    {[...allStickers, ...allTrophies].map(item => {
                        const unlocked = isUnlocked(item.id);
                        return (
                           <button 
                             key={item.id}
                             onClick={() => unlocked ? handleItemClick(item) : null}
                             className={`w-14 h-14 rounded-xl border flex items-center justify-center relative overflow-hidden transition-all bg-slate-950 ${unlocked ? getRarityStyles(item.rarity) + ' hover:scale-110 cursor-pointer' : 'border-slate-800 opacity-40 grayscale cursor-not-allowed'}`}
                           >
                              <img src={item.imageUrl} className="w-8 h-8 object-contain drop-shadow-lg" alt={item.name} />
                              {!unlocked && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Lock size={10} className="text-white/50" /></div>}
                           </button>
                        )
                    })}
                 </div>
             </div>
          </div>
      </section>

      {/* Friends Trigger */}
      <div className="flex justify-center pb-8">
        <button 
          onClick={() => setShowFriendsModal(true)}
          className="bg-slate-800 text-slate-300 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-700 hover:text-white transition-all active:scale-95 border border-slate-700 shadow-xl"
        >
          <Users size={14} /> View Friends & Requests
          {user.friendRequests.length > 0 && (
             <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full ml-1">{user.friendRequests.length}</span>
          )}
        </button>
      </div>

      {/* --- MODALS --- */}

      {/* Item Detail Modal */}
      {selectedItemDetail && (
         <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-view" onClick={() => setSelectedItemDetail(null)}>
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
               <div className="relative inline-block">
                  <div className={`absolute inset-0 blur-[60px] opacity-40 rounded-full ${selectedItemDetail.rarity === Rarity.LEGENDARY ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                  <img src={selectedItemDetail.imageUrl} className="h-40 object-contain relative z-10 drop-shadow-2xl mx-auto" alt={selectedItemDetail.name} />
               </div>
               
               <div className="space-y-2">
                  <span className={`text-[8px] font-black uppercase px-2 py-1 rounded border tracking-widest ${
                      selectedItemDetail.rarity === Rarity.LEGENDARY ? 'border-amber-500/50 text-amber-500 bg-amber-500/10' : 
                      selectedItemDetail.rarity === Rarity.EPIC ? 'border-purple-500/50 text-purple-500 bg-purple-500/10' : 
                      'border-slate-600 text-slate-400 bg-slate-800'
                  }`}>
                      {selectedItemDetail.rarity} {selectedItemDetail.type}
                  </span>
                  <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter">{selectedItemDetail.name}</h3>
                  <p className="text-xs text-slate-400 font-medium italic">"{selectedItemDetail.description}"</p>
               </div>

               {selectedItemDetail.type === CollectibleType.DECK && (
                   <button 
                     onClick={() => equipDeck(selectedItemDetail.id)}
                     disabled={user.equippedDeckId === selectedItemDetail.id}
                     className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${user.equippedDeckId === selectedItemDetail.id ? 'bg-green-500/20 text-green-500 cursor-default' : 'bg-white text-black hover:bg-slate-200 shadow-lg active:scale-95 transition-all'}`}
                   >
                     {user.equippedDeckId === selectedItemDetail.id ? <><Check size={16} /> Equipped</> : 'Equip Deck'}
                   </button>
               )}
            </div>
         </div>
      )}

      {/* Unlocked Item Celebration Modal */}
      {unlockedItem && (
        <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-6 animate-view">
           <div className="flex flex-col items-center text-center space-y-6">
             <div className="relative">
               <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-50 animate-pulse"></div>
               <img src={unlockedItem.imageUrl} className="w-48 h-48 object-contain relative z-10 drop-shadow-2xl" alt="Unlocked" />
             </div>
             
             <div className="space-y-2 relative z-10">
               <h2 className="text-sm font-black uppercase tracking-[0.5em] text-indigo-400">New Gear Unlocked!</h2>
               <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">{unlockedItem.name}</h1>
               <p className="text-slate-400 text-sm max-w-xs mx-auto">{unlockedItem.description}</p>
             </div>

             <button 
               onClick={() => setUnlockedItem(null)}
               className="bg-white text-black px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]"
             >
               Collect Reward
             </button>
           </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-6 shadow-2xl animate-view overflow-y-auto max-h-[90vh] hide-scrollbar">
              <div className="flex justify-between items-start">
                 <h3 className="text-xl font-black italic uppercase text-white tracking-tight">Edit Profile</h3>
                 <button onClick={() => setShowEditProfile(false)} className="p-2 -mr-2 text-slate-500"><X size={24} /></button>
              </div>

              <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Name</label>
                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-indigo-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Location</label>
                        <input type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-indigo-500 outline-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Bio</label>
                     <textarea value={editBio} onChange={e => setEditBio(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-indigo-500 outline-none h-20 resize-none" placeholder="Tell us your style..." />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Stance</label>
                          <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
                             <button onClick={() => setEditStance('regular')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase ${editStance === 'regular' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>Regular</button>
                             <button onClick={() => setEditStance('goofy')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase ${editStance === 'goofy' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>Goofy</button>
                          </div>
                      </div>
                      <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Instagram</label>
                          <div className="relative">
                             <Instagram size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                             <input type="text" value={editInstagram} onChange={e => setEditInstagram(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-9 pr-3 text-white text-sm focus:border-indigo-500 outline-none" placeholder="@handle" />
                          </div>
                      </div>
                  </div>

                  {/* Private Info Section */}
                  <div className="pt-4 border-t border-slate-800 space-y-4">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 flex items-center gap-1"><Lock size={10} /> Private Details</h4>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Phone</label>
                            <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-indigo-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Gender</label>
                            <select value={editGender} onChange={e => setEditGender(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-indigo-500 outline-none">
                               <option>Male</option>
                               <option>Female</option>
                               <option>Non-binary</option>
                               <option>Prefer not to say</option>
                            </select>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Date of Birth</label>
                        <input type="date" value={editDob} onChange={e => setEditDob(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-indigo-500 outline-none" />
                     </div>
                  </div>
              </div>

              <div className="pt-4 sticky bottom-0 bg-slate-900 border-t border-slate-800">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                    className="w-full py-4 bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                  >
                    {isUpdating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Changes
                  </button>
              </div>
           </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsMenu && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setShowSettingsMenu(false)}>
           <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 w-full max-w-sm space-y-6 animate-view shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Settings</h3>
                 <button onClick={() => setShowSettingsMenu(false)} className="p-2 -mr-2 text-slate-500"><X size={24} /></button>
              </div>

              <div className="space-y-2">
                  <button onClick={toggleSound} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between group active:scale-95 transition-transform">
                      <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${user.soundEnabled ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}><Volume2 size={18} /></div>
                          <span className="text-sm font-bold text-white uppercase tracking-wide">Sound FX</span>
                      </div>
                      <div className={`w-10 h-5 rounded-full p-1 transition-colors ${user.soundEnabled ? 'bg-indigo-500' : 'bg-slate-800'}`}>
                          <div className={`w-3 h-3 bg-white rounded-full transition-transform ${user.soundEnabled ? 'translate-x-5' : ''}`} />
                      </div>
                  </button>

                  <button onClick={toggleRetroMode} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between group active:scale-95 transition-transform">
                      <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${user.retroModeEnabled ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-500'}`}><Gamepad2 size={18} /></div>
                          <span className="text-sm font-bold text-white uppercase tracking-wide">Retro Mode</span>
                      </div>
                      <div className={`w-10 h-5 rounded-full p-1 transition-colors ${user.retroModeEnabled ? 'bg-amber-500' : 'bg-slate-800'}`}>
                          <div className={`w-3 h-3 bg-white rounded-full transition-transform ${user.retroModeEnabled ? 'translate-x-5' : ''}`} />
                      </div>
                  </button>
                  
                  <button onClick={simulateStreak} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between group active:scale-95 transition-transform">
                      <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-white transition-colors"><Flame size={18} /></div>
                          <span className="text-sm font-bold text-slate-400 group-hover:text-white uppercase tracking-wide">Simulate Day Streak</span>
                      </div>
                      <ChevronRight size={18} className="text-slate-600" />
                  </button>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2">
                  <button onClick={toggleAdmin} className="w-full py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                      {user.isAdmin ? 'Disable' : 'Enable'} Developer Mode
                  </button>
                  <button onClick={onLogout} className="w-full py-4 bg-slate-800 text-slate-300 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform">
                      <LogOut size={16} /> Sign Out
                  </button>
                  <button onClick={handleDeleteAccount} className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-red-900 hover:text-red-500 transition-colors">
                      Delete Account
                  </button>
              </div>
              
              <p className="text-center text-[8px] font-bold uppercase tracking-widest text-slate-700">PUSH v1.0.4 • Build 2024</p>
           </div>
        </div>
      )}

      {/* Create Crew Modal */}
      {showCrewModal && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-6 shadow-2xl animate-view">
              <div className="flex justify-between items-start">
                 <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500">New Squad</span>
                    <h3 className="text-xl font-black italic uppercase text-white tracking-tight">Create Crew</h3>
                 </div>
                 <button onClick={() => setShowCrewModal(false)} className="p-2 -mr-2 text-slate-500"><X size={24} /></button>
              </div>

              <form onSubmit={handleCreateCrew} className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Crew Name</label>
                     <input type="text" required value={newCrewName} onChange={e => setNewCrewName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm font-bold focus:border-amber-500 outline-none" placeholder="e.g. Bombay Bombers" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">City</label>
                     <input type="text" required value={newCrewCity} onChange={e => setNewCrewCity(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm font-bold focus:border-amber-500 outline-none" placeholder="e.g. Mumbai" />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isCreatingCrew}
                    className="w-full py-4 bg-amber-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                  >
                    {isCreatingCrew ? <Loader2 className="animate-spin" size={16} /> : <Users size={16} />} Establish Crew
                  </button>
              </form>
           </div>
        </div>
      )}

      {/* Friends Modal */}
      {showFriendsModal && (
         <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2rem] p-6 h-[80vh] flex flex-col shadow-2xl animate-view">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black italic uppercase text-white tracking-tight">Community</h3>
                  <button onClick={() => setShowFriendsModal(false)} className="p-2 -mr-2 text-slate-500"><X size={24} /></button>
               </div>

               {/* Tabs */}
               <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-4 shrink-0">
                  <button onClick={() => setActiveFriendTab('friends')} className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeFriendTab === 'friends' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>My Crew</button>
                  <button onClick={() => setActiveFriendTab('search')} className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeFriendTab === 'search' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>Find</button>
                  <button onClick={() => setActiveFriendTab('requests')} className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1 ${activeFriendTab === 'requests' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>
                     Requests {user.friendRequests.length > 0 && <span className="bg-red-500 text-white text-[8px] px-1 rounded-full">{user.friendRequests.length}</span>}
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto hide-scrollbar space-y-3">
                  {/* FRIENDS LIST */}
                  {activeFriendTab === 'friends' && (
                     friendsList.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-4">
                           <UserX size={32} />
                           <p className="text-xs font-bold uppercase tracking-widest">No friends yet.</p>
                        </div>
                     ) : (
                        friendsList.map(friend => (
                           <div key={friend.id} className="bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between border border-slate-800">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden"><img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" /></div>
                                 <div>
                                    <h4 className="text-sm font-black italic uppercase text-white">{friend.name}</h4>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase">{friend.location}</p>
                                 </div>
                              </div>
                              <button onClick={() => handleOpenChat(friend)} className="p-3 bg-indigo-500 text-white rounded-xl active:scale-95 transition-transform"><MessageCircle size={16} /></button>
                           </div>
                        ))
                     )
                  )}

                  {/* SEARCH */}
                  {activeFriendTab === 'search' && (
                     <div className="space-y-4">
                        <div className="relative">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                           <input 
                              type="text" 
                              placeholder="Search username..." 
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500"
                              value={friendSearchQuery}
                              onChange={e => handleFriendSearch(e.target.value)}
                           />
                        </div>
                        <div className="space-y-2">
                           {isSearchingFriends ? <div className="text-center py-4"><Loader2 className="animate-spin mx-auto text-indigo-500" /></div> : (
                              searchResults.map(result => (
                                 <div key={result.id} className="bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between border border-slate-800">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden"><img src={result.avatar} alt={result.name} className="w-full h-full object-cover" /></div>
                                       <div>
                                          <h4 className="text-sm font-black italic uppercase text-white">{result.name}</h4>
                                          <p className="text-[9px] text-slate-500 font-bold uppercase">{result.location}</p>
                                       </div>
                                    </div>
                                    <button 
                                      onClick={() => handleAddFriend(result.id)}
                                      disabled={user.friends.includes(result.id)}
                                      className="p-3 bg-slate-700 text-white rounded-xl active:scale-95 transition-transform disabled:opacity-50"
                                    >
                                       {user.friends.includes(result.id) ? <Check size={16} /> : <UserPlus size={16} />}
                                    </button>
                                 </div>
                              ))
                           )}
                        </div>
                     </div>
                  )}

                  {/* REQUESTS */}
                  {activeFriendTab === 'requests' && (
                     user.friendRequests.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-4">
                           <Bell size={32} />
                           <p className="text-xs font-bold uppercase tracking-widest">No pending requests.</p>
                        </div>
                     ) : (
                        user.friendRequests.map(req => (
                           <div key={req.id} className="bg-slate-800/50 p-4 rounded-2xl space-y-3 border border-slate-800">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden"><img src={req.fromUserAvatar} alt={req.fromUserName} className="w-full h-full object-cover" /></div>
                                 <div>
                                    <h4 className="text-sm font-black italic uppercase text-white">{req.fromUserName}</h4>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase">Wants to add you</p>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <button onClick={() => handleRejectRequest(req.id)} className="flex-1 py-3 bg-slate-700 rounded-xl text-[9px] font-black uppercase text-slate-300">Decline</button>
                                 <button onClick={() => handleAcceptRequest(req.id)} className="flex-1 py-3 bg-indigo-500 rounded-xl text-[9px] font-black uppercase text-white shadow-lg">Accept</button>
                              </div>
                           </div>
                        ))
                     )
                  )}
               </div>
            </div>
         </div>
      )}

      {/* Chat Modal */}
      {activeChatFriend && (
         <div className="fixed inset-0 z-[210] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2rem] h-[80vh] flex flex-col shadow-2xl animate-view overflow-hidden">
               {/* Header */}
               <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                     <button onClick={handleCloseChat} className="p-1 -ml-1 text-slate-500"><ArrowLeft size={20} /></button>
                     <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden"><img src={activeChatFriend.avatar} alt="" className="w-full h-full object-cover" /></div>
                     <span className="text-sm font-black italic uppercase text-white">{activeChatFriend.name}</span>
                  </div>
               </div>

               {/* Messages */}
               <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900">
                  {dmMessages.length === 0 ? (
                     <div className="h-full flex items-center justify-center text-slate-600 text-[10px] font-bold uppercase tracking-widest">Start the conversation...</div>
                  ) : (
                     dmMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.userId === user.id ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${msg.userId === user.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                              <p>{msg.text}</p>
                              <span className="text-[8px] opacity-50 mt-1 block text-right">{msg.timestamp}</span>
                           </div>
                        </div>
                     ))
                  )}
                  <div ref={chatEndRef} />
               </div>

               {/* Input */}
               <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 shrink-0">
                  <input 
                     type="text" 
                     className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-indigo-500" 
                     placeholder="Message..."
                     value={dmInput}
                     onChange={e => setDmInput(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleSendDm()}
                  />
                  <button onClick={handleSendDm} className="p-3 bg-indigo-500 text-white rounded-xl active:scale-95 transition-transform"><Send size={18} /></button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default ProfileView;
