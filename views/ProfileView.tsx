
import React, { useState, useEffect, useRef } from 'react';
import { Settings, Award, Share2, Flame, LogOut, ShieldAlert, ChevronRight, UserX, Zap, Activity, Camera, Loader2, Mountain, Package, Disc, Sticker, Trophy, Crown, Check, Lock, Bell, Volume2, Shield, HelpCircle, Edit3, X, Save, Gamepad2, Instagram, Users, Search, UserPlus, Swords, MapPin, MessageCircle, Send, ArrowLeft, Circle } from 'lucide-react';
import { User, Discipline, Collectible, CollectibleType, Rarity, FriendRequest, ChatMessage } from '../types';
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
      window.location.reload();
    }
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

  return (
    <div className="pb-32 md:pb-10 pt-6 space-y-8 px-4 animate-view max-w-4xl mx-auto w-full relative">
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

      {/* Profile Header Card */}
      <section className="flex flex-col sm:flex-row items-center gap-6 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[64px] rounded-full -mr-16 -mt-16" />
        
        {/* Avatar Container */}
        <div className="relative">
          <div 
            onMouseDown={handleAvatarPressStart}
            onMouseUp={handleAvatarPressEnd}
            onTouchStart={handleAvatarPressStart}
            onTouchEnd={handleAvatarPressEnd}
            onClick={handleAvatarClick}
            className="w-32 h-32 rounded-full border-4 border-slate-800 overflow-hidden shrink-0 ring-4 ring-slate-900 cursor-pointer active:scale-95 transition-all relative group"
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

        <div className="space-y-2 text-center sm:text-left z-10 flex flex-col items-center sm:items-start w-full">
          <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">{user.name}</h2>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {user.disciplines.map(d => (
              <div key={d} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
                d === Discipline.SKATE 
                  ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' 
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
              }`}>
                {d === Discipline.SKATE ? <Zap size={10} fill="currentColor" /> : <Mountain size={10} strokeWidth={2.5} />}
                {d === Discipline.SKATE ? 'Skate' : 'Downhill'}
              </div>
            ))}
            <div className="w-1 h-1 bg-slate-700 rounded-full mx-1" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user.location}</span>
          </div>

          <div className="flex gap-2 mt-2 items-center justify-center sm:justify-start">
            <span 
              className={`bg-indigo-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-black italic uppercase transition-all duration-300 shadow-lg shadow-indigo-500/20 ${animateLevel ? 'animate-level-pop' : ''}`}
            >
              LVL {user.level}
            </span>
            <span className="bg-slate-800 text-slate-400 px-3 py-1.5 rounded-xl text-[10px] font-black italic uppercase">{user.stance.charAt(0).toUpperCase() + user.stance.slice(1)}</span>
          </div>
          
          {user.bio && (
            <p className="text-xs text-slate-400 italic mt-2 max-w-sm border-l-2 border-slate-700 pl-3 leading-relaxed hidden sm:block">
              {user.bio}
            </p>
          )}

          {user.instagramHandle && (
            <div className="flex items-center gap-1.5 mt-2 sm:mt-1 text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
              <Instagram size={12} /> @{user.instagramHandle.replace('@','')}
            </div>
          )}
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={simulateStreak} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col gap-2 items-center text-center shadow-xl hover:bg-slate-800 transition-colors group">
          <Flame size={24} className="text-orange-500 group-hover:scale-110 transition-transform" />
          <div className="text-3xl font-black italic text-white">{user.streak}</div>
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Day Streak</div>
        </button>
        <button onClick={() => setShowFriendsModal(true)} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col gap-2 items-center text-center shadow-xl hover:bg-slate-800 transition-colors group relative">
          <Users size={24} className="text-pink-500 group-hover:scale-110 transition-transform" />
          <div className="text-3xl font-black italic text-white">{user.friends.length}</div>
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Crew</div>
          {user.friendRequests.length > 0 && (
            <div className="absolute top-4 right-4 w-3 h-3 bg-indigo-500 rounded-full animate-pulse ring-2 ring-slate-900" />
          )}
        </button>
         <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col gap-2 items-center text-center shadow-xl">
          <Trophy size={24} className="text-amber-500" />
          <div className="text-3xl font-black italic text-white">{(user.completedChallengeIds || []).length}</div>
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Challenges</div>
        </div>
         <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col gap-2 items-center text-center shadow-xl">
          <Award size={24} className="text-indigo-400" />
          <div className="text-3xl font-black italic text-white">{user.locker.length}</div>
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Collectibles</div>
        </div>
      </section>

      {/* The Locker - Updated to Carousels */}
      <section className="space-y-6 pt-4">
         <div className="flex items-center gap-3">
           <Package size={20} className="text-indigo-500" />
           <h3 className="text-xl font-black italic uppercase tracking-tighter">Locker</h3>
         </div>

         {/* Decks - Horizontal Scroll Carousel */}
         <div className="space-y-3">
           <div className="flex justify-between items-center px-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Decks</h4>
              <span className="text-[9px] text-slate-600 font-bold">{user.locker.filter(id => allDecks.find(d => d.id === id)).length} / {allDecks.length}</span>
           </div>
           <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 snap-x">
             {allDecks.map(item => {
               const unlocked = isUnlocked(item.id);
               const equipped = user.equippedDeckId === item.id;
               const rarityStyles = getRarityStyles(item.rarity);
               
               return (
                 <button
                   key={item.id}
                   onClick={() => unlocked && handleItemClick(item)}
                   className={`shrink-0 relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 transition-all duration-200 group overflow-hidden snap-start
                     ${unlocked 
                       ? `${rarityStyles} hover:scale-110 hover:shadow-lg cursor-pointer` 
                       : 'border-slate-800 bg-slate-900 opacity-50 grayscale cursor-not-allowed'
                     }
                     ${equipped ? 'ring-2 ring-indigo-500 ring-offset-4 ring-offset-black scale-105' : ''}
                   `}
                 >
                   <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                   
                   {!unlocked && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
                       <Lock size={12} className="text-slate-400" />
                     </div>
                   )}
                 </button>
               );
             })}
           </div>
         </div>

         {/* Wheels - Horizontal Scroll Carousel */}
         <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Wheels</h4>
              <span className="text-[9px] text-slate-600 font-bold">{user.locker.filter(id => allWheels.find(d => d.id === id)).length} / {allWheels.length}</span>
            </div>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 snap-x">
                {allWheels.map(item => {
                   const unlocked = isUnlocked(item.id);
                   const rarityStyles = getRarityStyles(item.rarity);
                   
                   return (
                   <button
                    key={item.id}
                    onClick={() => unlocked && handleItemClick(item)}
                    className={`shrink-0 relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 transition-all duration-200 group overflow-hidden snap-start
                        ${unlocked ? `${rarityStyles} hover:scale-110 hover:shadow-lg cursor-pointer` : 'border-slate-800 bg-slate-900 opacity-50 grayscale cursor-not-allowed'}
                    `}
                   >
                     <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                     {!unlocked && <div className="absolute inset-0 flex items-center justify-center bg-black/60"><Lock size={12} className="text-slate-400" /></div>}
                   </button>
                )})}
            </div>
         </div>

         {/* Stickers - Horizontal Scroll Carousel */}
         <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Stickers</h4>
              <span className="text-[9px] text-slate-600 font-bold">{user.locker.filter(id => allStickers.find(d => d.id === id)).length} / {allStickers.length}</span>
            </div>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 snap-x">
                {allStickers.map(item => {
                   const unlocked = isUnlocked(item.id);
                   const rarityStyles = getRarityStyles(item.rarity);
                   
                   return (
                   <button
                    key={item.id}
                    onClick={() => unlocked && handleItemClick(item)}
                    className={`shrink-0 relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 transition-all duration-200 group flex items-center justify-center snap-start
                        ${unlocked ? `${rarityStyles} hover:scale-110 hover:shadow-lg cursor-pointer` : 'border-slate-800 bg-slate-900 opacity-30 grayscale cursor-not-allowed'}
                    `}
                   >
                     <img src={item.imageUrl} className="w-4/5 h-4/5 object-contain" alt={item.name} />
                     {!unlocked && <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full"><Lock size={12} className="text-slate-400" /></div>}
                   </button>
                )})}
            </div>
         </div>

         {/* Trophies - Horizontal Scroll Carousel */}
         <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Trophies</h4>
              <span className="text-[9px] text-slate-600 font-bold">{user.locker.filter(id => allTrophies.find(d => d.id === id)).length} / {allTrophies.length}</span>
            </div>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 snap-x">
              {allTrophies.map(item => {
                   const unlocked = isUnlocked(item.id);
                   const rarityStyles = getRarityStyles(item.rarity);
                   
                   return (
                <div 
                  key={item.id} 
                  onClick={() => unlocked && handleItemClick(item)}
                  className={`shrink-0 relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 flex items-center justify-center transition-all duration-200 group snap-start
                    ${unlocked ? `${rarityStyles} hover:scale-110 hover:shadow-lg cursor-pointer` : 'border-slate-800 bg-slate-900 opacity-40 grayscale'}
                  `}
                >
                   <img src={item.imageUrl} className="w-3/5 h-3/5 object-contain drop-shadow-md" alt={item.name} />
                   {!unlocked && <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full"><Lock size={12} className="text-slate-400" /></div>}
                </div>
              )})}
            </div>
         </div>

         {/* Battle Record */}
         <div className="space-y-3 pt-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 pl-1">Battle Record</h4>
            {completedChallenges.length === 0 ? (
              <div className="bg-slate-900/30 border border-slate-800/50 border-dashed rounded-2xl p-6 text-center">
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">No victories yet. Go seek battles!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {completedChallenges.map((challenge, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                        <Swords size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase italic text-white line-clamp-1">{challenge.title}</h4>
                        <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                          <MapPin size={8} /> {challenge.spotName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-indigo-400 block">+{challenge.xpReward} XP</span>
                      <span className="text-[7px] font-bold text-green-500 uppercase tracking-widest">Victory</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
         </div>
      </section>

      {/* Main Logout Button */}
      <div className="pt-4 pb-4">
          <button 
            onClick={onLogout} 
            className="w-full py-4 border border-red-900/30 text-red-500/80 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-red-950/20 hover:text-red-400 transition-colors active:scale-95"
          >
              <LogOut size={14} /> Log Out
          </button>
      </div>

      {/* Item Detail Modal */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-sm p-6 relative animate-view shadow-2xl flex flex-col items-center text-center space-y-4">
              <button onClick={() => setSelectedItemDetail(null)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white"><X size={20} /></button>
              
              <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center mb-2 shadow-2xl overflow-hidden ${getRarityStyles(selectedItemDetail.rarity)}`}>
                 <img src={selectedItemDetail.imageUrl} className={`w-full h-full ${[CollectibleType.DECK, CollectibleType.WHEEL].includes(selectedItemDetail.type) ? 'object-cover' : 'object-contain p-4'}`} alt={selectedItemDetail.name} />
              </div>

              <div>
                <div className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mb-2 ${
                  selectedItemDetail.rarity === Rarity.LEGENDARY ? 'bg-amber-500 text-black' :
                  selectedItemDetail.rarity === Rarity.EPIC ? 'bg-purple-500 text-white' :
                  selectedItemDetail.rarity === Rarity.RARE ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  {selectedItemDetail.rarity}
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">{selectedItemDetail.name}</h3>
                <p className="text-xs text-slate-400 mt-2 font-medium">{selectedItemDetail.description}</p>
              </div>

              {selectedItemDetail.type === CollectibleType.DECK && (
                <button 
                  onClick={() => equipDeck(selectedItemDetail.id)}
                  disabled={user.equippedDeckId === selectedItemDetail.id}
                  className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                    user.equippedDeckId === selectedItemDetail.id 
                    ? 'bg-green-500/20 text-green-500 cursor-default' 
                    : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95'
                  }`}
                >
                  {user.equippedDeckId === selectedItemDetail.id ? 'Equipped' : 'Equip Deck'}
                </button>
              )}
           </div>
        </div>
      )}

      {/* Unlock Celebration Modal */}
      {unlockedItem && (
        <div className="fixed inset-0 z-[250] bg-black/95 flex items-center justify-center p-6">
           <div className="flex flex-col items-center text-center space-y-6 animate-view">
             <div className="relative">
               <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-50 animate-pulse"></div>
               <img src={unlockedItem.imageUrl} className="w-48 h-48 object-contain relative z-10 drop-shadow-2xl" alt="Unlocked" />
             </div>
             
             <div className="space-y-2 relative z-10">
               <h2 className="text-sm font-black uppercase tracking-[0.5em] text-indigo-400">New Unlock</h2>
               <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">{unlockedItem.name}</h1>
               <p className="text-slate-400 text-sm max-w-xs mx-auto">{unlockedItem.description}</p>
             </div>

             <button 
               onClick={() => setUnlockedItem(null)}
               className="bg-white text-black px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
             >
               Collect
             </button>
           </div>
        </div>
      )}

      {/* Friends & Crew Modal - PlayStation Style Update with Chat */}
      {showFriendsModal && (
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
           {/* Modal Container: Adjusted height and positioning to fix 'below visible screen' issue */}
           <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col h-[85dvh] max-h-[800px] shadow-2xl animate-view relative my-auto">
              
              {/* CHAT VIEW - Renders only if chatting */}
              {activeChatFriend ? (
                <div className="flex flex-col h-full bg-slate-950">
                   {/* Chat Header */}
                   <div className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex items-center gap-3 shrink-0">
                      <button onClick={handleCloseChat} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors active:scale-90">
                         <ArrowLeft size={20} />
                      </button>
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden relative">
                         <img src={activeChatFriend.avatar} className="w-full h-full object-cover" alt={activeChatFriend.name} />
                         <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                         <h3 className="text-sm font-black italic uppercase text-white tracking-tight">{activeChatFriend.name}</h3>
                         <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1">Online</p>
                      </div>
                   </div>

                   {/* Messages Area */}
                   <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
                      {dmMessages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-700 gap-2 opacity-50">
                           <MessageCircle size={32} />
                           <p className="text-[10px] font-black uppercase tracking-widest">Start the session</p>
                        </div>
                      )}
                      {dmMessages.map((msg, idx) => {
                        const isMe = msg.userId === user.id;
                        return (
                          <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[75%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                                {msg.text}
                             </div>
                          </div>
                        )
                      })}
                      <div ref={chatEndRef} />
                   </div>

                   {/* Input Area */}
                   <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
                      <div className="flex items-center gap-2 bg-slate-950 rounded-2xl p-1 border border-slate-800">
                         <input 
                           type="text" 
                           value={dmInput}
                           onChange={(e) => setDmInput(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleSendDm()}
                           placeholder={`Message ${activeChatFriend.name.split(' ')[0]}...`}
                           className="flex-1 bg-transparent px-4 py-3 text-sm text-white focus:outline-none placeholder:text-slate-600"
                         />
                         <button 
                           onClick={handleSendDm} 
                           disabled={!dmInput.trim()}
                           className="p-2.5 bg-indigo-500 text-white rounded-xl active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 shadow-lg"
                         >
                            <Send size={16} fill="currentColor" />
                         </button>
                      </div>
                   </div>
                </div>
              ) : (
                /* FRIENDS LIST VIEW */
                <>
                  <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 shrink-0">
                     <div className="space-y-1">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Social Hub</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                           <Circle size={6} className="text-green-500 fill-green-500" /> {user.friends.length} Online
                        </p>
                     </div>
                     <button onClick={() => setShowFriendsModal(false)} className="p-2 -mr-2 text-slate-500 active:scale-90"><X size={24} /></button>
                  </div>

                  {/* Tabs */}
                  <div className="flex p-2 bg-slate-950 border-b border-slate-800 shrink-0">
                     <button onClick={() => setActiveFriendTab('friends')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFriendTab === 'friends' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}>Friends</button>
                     <button onClick={() => setActiveFriendTab('search')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFriendTab === 'search' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Add Player</button>
                     <button onClick={() => setActiveFriendTab('requests')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${activeFriendTab === 'requests' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                        Requests
                        {user.friendRequests.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 scroll-smooth hide-scrollbar">
                     {/* FRIENDS LIST */}
                     {activeFriendTab === 'friends' && (
                        <div className="space-y-2">
                           {friendsList.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                                 <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-600">
                                    <Users size={24} />
                                 </div>
                                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Your crew is empty.</p>
                                 <button onClick={() => setActiveFriendTab('search')} className="text-indigo-400 text-[10px] font-black uppercase tracking-widest underline">Find Players</button>
                              </div>
                           ) : (
                              friendsList.map(friend => {
                                 // Mock Status Logic
                                 const statusColors = ['bg-green-500', 'bg-blue-500', 'bg-slate-600'];
                                 const statusTexts = ['Online', 'In Session', 'Offline'];
                                 const statusIdx = Math.floor(Math.random() * 2); // Mostly online for demo
                                 
                                 const activity = statusIdx === 1 ? 'Skating at Carter Road' : (statusIdx === 0 ? 'In Main Menu' : 'Last seen 2h ago');

                                 return (
                                   <div key={friend.id} className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-2xl hover:border-slate-700 transition-colors group cursor-default">
                                      <div className="flex items-center gap-4 flex-1 min-w-0">
                                         <div className="relative shrink-0">
                                            <img src={friend.avatar} className="w-12 h-12 rounded-full border-2 border-slate-800 bg-slate-900" alt={friend.name} />
                                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 ${statusColors[statusIdx]}`}></div>
                                         </div>
                                         <div className="min-w-0">
                                            <h4 className="text-sm font-bold text-white truncate">{friend.name}</h4>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                               {statusIdx === 1 && <Activity size={10} className="text-blue-400 animate-pulse" />}
                                               <p className="text-[10px] text-slate-400 font-medium truncate">{activity}</p>
                                            </div>
                                         </div>
                                      </div>
                                      <button 
                                        onClick={() => handleOpenChat(friend)}
                                        className="p-3 bg-slate-900 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95 border border-slate-800"
                                      >
                                         <MessageCircle size={18} />
                                      </button>
                                   </div>
                                 );
                              })
                           )}
                        </div>
                     )}

                     {/* SEARCH */}
                     {activeFriendTab === 'search' && (
                        <div className="space-y-4">
                           <div className="relative">
                              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                              <input 
                                 type="text" 
                                 placeholder="Enter Push ID or Name..."
                                 value={friendSearchQuery}
                                 onChange={(e) => handleFriendSearch(e.target.value)}
                                 className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 font-medium"
                              />
                           </div>
                           
                           {isSearchingFriends ? (
                              <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>
                           ) : (
                              <div className="space-y-2">
                                 {searchResults.length === 0 && friendSearchQuery.length > 2 && (
                                    <div className="text-center py-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest">No skaters found.</div>
                                 )}
                                 {searchResults.map(result => {
                                    const isFriend = user.friends.includes(result.id);
                                    const isPending = user.friendRequests.some(r => r.fromUserId === result.id);
                                    return (
                                       <div key={result.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
                                          <div className="flex items-center gap-3">
                                             <img src={result.avatar} className="w-10 h-10 rounded-full bg-slate-800" alt={result.name} />
                                             <div>
                                                <h4 className="text-sm font-bold text-white">{result.name}</h4>
                                                <div className="flex gap-2">
                                                  {result.disciplines.map((d: any) => (
                                                    <span key={d} className="text-[8px] text-slate-500 uppercase font-black bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{d}</span>
                                                  ))}
                                                </div>
                                             </div>
                                          </div>
                                          {!isFriend && !isPending && (
                                             <button onClick={() => handleAddFriend(result.id)} className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-900/20">
                                                <UserPlus size={18} />
                                             </button>
                                          )}
                                          {isFriend && <span className="text-[9px] text-green-500 font-bold uppercase tracking-widest px-3 flex items-center gap-1"><Check size={10} /> Crew</span>}
                                       </div>
                                    );
                                 })}
                              </div>
                           )}
                        </div>
                     )}

                     {/* REQUESTS */}
                     {activeFriendTab === 'requests' && (
                        <div className="space-y-3">
                           {user.friendRequests.length === 0 ? (
                              <div className="text-center py-12 text-slate-600 text-xs font-bold uppercase tracking-widest">No pending requests.</div>
                           ) : (
                              user.friendRequests.map(req => (
                                 <div key={req.id} className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50 space-y-3">
                                    <div className="flex items-center gap-3">
                                       <img src={req.fromUserAvatar} className="w-10 h-10 rounded-full bg-slate-900" alt={req.fromUserName} />
                                       <div>
                                          <h4 className="text-sm font-bold text-white">{req.fromUserName}</h4>
                                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Wants to join your crew</p>
                                       </div>
                                    </div>
                                    <div className="flex gap-2">
                                       <button onClick={() => handleAcceptRequest(req.id)} className="flex-1 py-2 bg-green-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">Accept</button>
                                       <button onClick={() => handleRejectRequest(req.id)} className="flex-1 py-2 bg-slate-700 text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">Ignore</button>
                                    </div>
                                 </div>
                              ))
                           )}
                           {/* Debug Helper to inject a fake request */}
                           <button onClick={() => backend.injectMockFriendRequest().then(() => backend.getUser().then(setUser))} className="w-full py-4 text-[9px] font-black uppercase tracking-widest text-slate-700 hover:text-indigo-500 transition-colors">Simulate Incoming Request</button>
                        </div>
                     )}
                  </div>
                </>
              )}
           </div>
        </div>
      )}

      {/* Settings Menu Modal */}
      {showSettingsMenu && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xs h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col animate-view shadow-2xl">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-black uppercase italic tracking-tighter">Settings</h3>
               <button onClick={() => setShowSettingsMenu(false)} className="p-2 -mr-2 text-slate-500 active:rotate-90 transition-transform"><X size={24} /></button>
             </div>

             <div className="flex-1 space-y-6 overflow-y-auto">
               {/* Account Section */}
               <div className="space-y-3">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Account</h4>
                 <button 
                   onClick={() => { setShowSettingsMenu(false); setShowEditProfile(true); }}
                   className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors group"
                 >
                   <Edit3 size={18} className="text-indigo-400" />
                   <span className="text-sm font-bold text-slate-300 group-hover:text-white">Edit Profile</span>
                 </button>
                 
                 <button 
                    onClick={toggleSound}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-colors group"
                  >
                   <div className="flex items-center gap-3">
                      <Volume2 size={18} className="text-indigo-400" />
                      <span className="text-sm font-bold text-slate-300 group-hover:text-white">Sound Effects</span>
                   </div>
                   <div className={`w-8 h-4 rounded-full relative transition-colors ${user.soundEnabled ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${user.soundEnabled ? 'right-0.5' : 'left-0.5'}`} />
                   </div>
                 </button>

                 <button 
                    onClick={toggleRetroMode}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-colors group"
                  >
                   <div className="flex items-center gap-3">
                      <Gamepad2 size={18} className="text-indigo-400" />
                      <span className="text-sm font-bold text-slate-300 group-hover:text-white">Retro Mode</span>
                   </div>
                   <div className={`w-8 h-4 rounded-full relative transition-colors ${user.retroModeEnabled ? 'bg-amber-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${user.retroModeEnabled ? 'right-0.5' : 'left-0.5'}`} />
                   </div>
                 </button>
               </div>

               {/* Support Section */}
               <div className="space-y-3">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Support</h4>
                 <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors group"
                   onClick={() => window.alert("Privacy policy view coming soon.")}
                 >
                   <Shield size={18} className="text-indigo-400" />
                   <span className="text-sm font-bold text-slate-300 group-hover:text-white">Privacy Policy</span>
                 </button>
                 <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors group">
                   <HelpCircle size={18} className="text-indigo-400" />
                   <span className="text-sm font-bold text-slate-300 group-hover:text-white">Help Center</span>
                 </button>
               </div>

               {/* Admin Area (Conditional) */}
               <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                    <span className="text-xs font-bold text-slate-400">Admin Mode</span>
                    <button 
                      onClick={toggleAdmin}
                      className={`w-10 h-5 rounded-full transition-colors relative ${user.isAdmin ? 'bg-indigo-500' : 'bg-slate-700'}`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${user.isAdmin ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                  {user.isAdmin && (
                    <button 
                       onClick={() => { setShowSettingsMenu(false); setActiveTab?.('admin'); }}
                       className="w-full mt-2 p-3 bg-indigo-500/10 text-indigo-400 rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all"
                    >
                      Enter Admin Portal
                    </button>
                  )}
               </div>
             </div>

             <div className="pt-6 border-t border-slate-800 space-y-3">
               <button onClick={onLogout} className="w-full py-4 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                 <LogOut size={16} /> <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
               </button>
               <button onClick={handleDeleteAccount} className="w-full py-2 text-red-900/50 hover:text-red-500 text-[9px] font-black uppercase tracking-widest">
                 Delete Account
               </button>
               <div className="text-center">
                 <p className="text-[9px] text-slate-700 font-bold">PUSH v1.0.6</p>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal - EXTENDED */}
      {showEditProfile && (
        <div className="fixed inset-0 z-[160] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[2rem] p-6 space-y-6 shadow-2xl animate-view flex flex-col max-h-[90vh]">
             <div className="flex justify-between items-center shrink-0">
               <h3 className="text-xl font-black uppercase italic tracking-tighter">Edit Profile</h3>
               <button onClick={() => setShowEditProfile(false)} className="p-2 -mr-2 text-slate-500"><X size={24} /></button>
             </div>

             <div className="flex-1 overflow-y-auto pr-2 space-y-8 hide-scrollbar">
                {/* Section 1: Public Identity */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 border-b border-indigo-500/20 pb-2">Public Identity</h4>
                  
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Display Name</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-bold text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="Your skater name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Bio</label>
                    <textarea 
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none h-20"
                      placeholder="Skate or die..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Home Spot / City</label>
                    <input 
                      type="text" 
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-bold text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="e.g. Pune, Carter Road"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Stance</label>
                        <select 
                           value={editStance}
                           onChange={(e) => setEditStance(e.target.value as 'regular' | 'goofy')}
                           className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-bold text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        >
                          <option value="regular">Regular</option>
                          <option value="goofy">Goofy</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Instagram</label>
                        <input 
                          type="text" 
                          value={editInstagram}
                          onChange={(e) => setEditInstagram(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-bold text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                          placeholder="@username"
                        />
                     </div>
                  </div>
                </div>

                {/* Section 2: Private / Brand Info */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 border-b border-amber-500/20 pb-2">Brand & Shipping Info (Private)</h4>
                  <p className="text-[9px] text-slate-500 italic">Used for verified brand drops and sponsorship validation.</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Phone</label>
                       <input 
                         type="tel" 
                         value={editPhone}
                         onChange={(e) => setEditPhone(e.target.value)}
                         className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                         placeholder="+91..."
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Gender</label>
                       <select 
                          value={editGender}
                          onChange={(e) => setEditGender(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                       >
                         <option value="Male">Male</option>
                         <option value="Female">Female</option>
                         <option value="Non-binary">Non-binary</option>
                         <option value="Prefer not to say">Prefer not to say</option>
                       </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Date of Birth</label>
                     <input 
                       type="date" 
                       value={editDob}
                       onChange={(e) => setEditDob(e.target.value)}
                       className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Shipping Address</label>
                     <textarea 
                       value={editAddress}
                       onChange={(e) => setEditAddress(e.target.value)}
                       className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none h-24"
                       placeholder="Full address for gear deliveries..."
                     />
                  </div>
                </div>
             </div>

             <div className="pt-2 shrink-0">
               <button 
                 onClick={handleSaveProfile}
                 disabled={isUpdating}
                 className="w-full py-4 bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-400 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
               >
                 {isUpdating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Changes
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
