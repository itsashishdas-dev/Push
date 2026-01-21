
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
          </div>
          
          <div className="text-slate-400 text-xs font-medium flex items-center gap-1.5 mt-2">
            <MapPin size={12} /> {user.location}
          </div>
          
          <p className="text-xs text-slate-500 italic mt-1 line-clamp-2">{user.bio}</p>

          <button 
             onClick={() => setShowEditProfile(true)}
             className="mt-4 bg-slate-800 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
             <Edit3 size={12} /> Edit Profile
          </button>
        </div>
      </section>

      {/* Level Progress */}
      <section className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
         <div className="flex justify-between items-end mb-2 relative z-10">
            <div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Current Level</span>
               <div className="text-4xl font-black italic text-white leading-none">
                  LVL {user.level}
               </div>
            </div>
            <div className="text-right">
               <div className="text-indigo-400 text-xs font-black">{user.xp} XP</div>
               <span className="text-[8px] font-bold uppercase text-slate-600">Total Experience</span>
            </div>
         </div>
         {/* Progress Bar */}
         <div className="h-3 bg-slate-800 rounded-full overflow-hidden relative z-10">
            <div 
               className={`h-full bg-indigo-500 relative ${animateLevel ? 'animate-pulse' : ''}`} 
               style={{ width: `${(user.xp % 1000) / 10}%` }} 
            >
               <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
            </div>
         </div>
         <p className="text-[9px] text-slate-500 mt-2 font-medium text-right relative z-10">{1000 - (user.xp % 1000)} XP to Next Level</p>
         
         <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 blur-3xl -mr-10 -mt-10" />
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-3 gap-3">
         <div 
           onClick={simulateStreak}
           className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
         >
            <Flame size={20} className={user.streak > 0 ? "text-amber-500" : "text-slate-600"} />
            <span className="text-xl font-black italic text-white">{user.streak}</span>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Streak</span>
         </div>
         <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-1">
            <Trophy size={20} className="text-indigo-500" />
            <span className="text-xl font-black italic text-white">{user.masteredCount}</span>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Tricks</span>
         </div>
         <div 
           onClick={() => { setShowFriendsModal(true); playSound('click'); }}
           className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
         >
            <Users size={20} className="text-green-500" />
            <span className="text-xl font-black italic text-white">{user.friends.length}</span>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Friends</span>
         </div>
      </section>

      {/* Locker / Collectibles */}
      <section className="space-y-4">
         <h3 className="text-lg font-black uppercase italic tracking-tight text-white px-2 flex items-center gap-2">
            <Package size={18} className="text-slate-500" /> Locker
         </h3>
         
         {/* Decks */}
         <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">Decks</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
               {allDecks.map(deck => {
                  const unlocked = isUnlocked(deck.id);
                  const isEquipped = user.equippedDeckId === deck.id;
                  return (
                     <div 
                        key={deck.id}
                        onClick={() => unlocked ? handleItemClick(deck) : null}
                        className={`aspect-[2/3] rounded-xl border relative overflow-hidden transition-all ${
                           unlocked 
                           ? `cursor-pointer active:scale-95 ${getRarityStyles(deck.rarity)} ${isEquipped ? 'ring-2 ring-white shadow-lg' : ''}`
                           : 'bg-slate-900/50 border-slate-800 opacity-50 grayscale'
                        }`}
                     >
                        <img src={deck.imageUrl} className="w-full h-full object-cover" alt={deck.name} />
                        {!unlocked && <div className="absolute inset-0 flex items-center justify-center bg-black/50"><Lock size={16} className="text-white/50" /></div>}
                        {isEquipped && <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5"><Check size={8} className="text-black" strokeWidth={4} /></div>}
                     </div>
                  )
               })}
            </div>
         </div>

         {/* Stickers & Trophies */}
         <div className="space-y-2 pt-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">Stickers & Trophies</p>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4">
               {[...allStickers, ...allTrophies].map(item => {
                  const unlocked = isUnlocked(item.id);
                  return (
                     <div 
                        key={item.id}
                        onClick={() => unlocked ? handleItemClick(item) : null}
                        className={`w-16 h-16 rounded-xl border flex items-center justify-center shrink-0 relative transition-all ${
                           unlocked 
                           ? `cursor-pointer active:scale-95 ${getRarityStyles(item.rarity)} bg-slate-900`
                           : 'bg-slate-900/50 border-slate-800 opacity-40 grayscale'
                        }`}
                     >
                        <img src={item.imageUrl} className="w-10 h-10 object-contain drop-shadow-md" alt={item.name} />
                        {!unlocked && <div className="absolute inset-0 flex items-center justify-center"><Lock size={12} className="text-white/50" /></div>}
                     </div>
                  )
               })}
            </div>
         </div>
      </section>

      {/* Completed Challenges */}
      <section className="space-y-4 pt-2">
         <h3 className="text-lg font-black uppercase italic tracking-tight text-white px-2 flex items-center gap-2">
            <Swords size={18} className="text-slate-500" /> Completed Battles
         </h3>
         <div className="space-y-2">
            {completedChallenges.length === 0 ? (
               <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl p-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-600">
                  No battles won yet. Go skate!
               </div>
            ) : (
               completedChallenges.map(c => (
                  <div key={c.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                     <div>
                        <h4 className="text-sm font-black italic text-white uppercase">{c.title}</h4>
                        <p className="text-[9px] font-bold text-slate-500 uppercase">{c.spotName}</p>
                     </div>
                     <div className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                        <Check size={8} /> Done
                     </div>
                  </div>
               ))
            )}
         </div>
      </section>

      {/* --- MODALS --- */}
      
      {/* Item Detail Modal */}
      {selectedItemDetail && (
         <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-6 animate-view relative overflow-hidden">
               <button onClick={() => setSelectedItemDetail(null)} className="absolute top-4 right-4 p-2 text-slate-500 z-10"><X size={20} /></button>
               
               <div className="flex justify-center py-6 relative">
                  <div className={`absolute inset-0 opacity-20 blur-[60px] ${selectedItemDetail.rarity === Rarity.LEGENDARY ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                  <img src={selectedItemDetail.imageUrl} className="w-40 h-40 object-contain drop-shadow-2xl relative z-10" alt={selectedItemDetail.name} />
               </div>

               <div className="text-center space-y-2">
                  <div className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getRarityStyles(selectedItemDetail.rarity)}`}>
                     {selectedItemDetail.rarity}
                  </div>
                  <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">{selectedItemDetail.name}</h2>
                  <p className="text-sm text-slate-400 font-medium">{selectedItemDetail.description}</p>
               </div>

               {selectedItemDetail.type === CollectibleType.DECK && user.equippedDeckId !== selectedItemDetail.id && (
                  <button 
                     onClick={() => equipDeck(selectedItemDetail.id)}
                     className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-transform"
                  >
                     Equip Deck
                  </button>
               )}
            </div>
         </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
         <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-4 animate-view max-h-[90vh] overflow-y-auto hide-scrollbar">
               <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-black italic uppercase text-white">Edit Profile</h3>
                  <button onClick={() => setShowEditProfile(false)}><X size={24} className="text-slate-500" /></button>
               </div>
               
               <div className="space-y-3">
                  <div className="space-y-1">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Display Name</label>
                     <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Location</label>
                     <input type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Bio</label>
                     <textarea value={editBio} onChange={e => setEditBio(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm resize-none h-20" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Instagram</label>
                        <input type="text" value={editInstagram} onChange={e => setEditInstagram(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm" placeholder="@username" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Stance</label>
                        <select value={editStance} onChange={e => setEditStance(e.target.value as any)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm">
                           <option value="regular">Regular</option>
                           <option value="goofy">Goofy</option>
                        </select>
                     </div>
                  </div>
               </div>

               <button 
                  onClick={handleSaveProfile}
                  disabled={isUpdating}
                  className="w-full py-4 bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg mt-2 flex items-center justify-center gap-2"
               >
                  {isUpdating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Changes
               </button>
            </div>
         </div>
      )}

      {/* Settings Modal */}
      {showSettingsMenu && (
         <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-6 animate-view shadow-2xl">
               <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black italic uppercase text-white">Settings</h3>
                  <button onClick={() => setShowSettingsMenu(false)}><X size={24} className="text-slate-500" /></button>
               </div>

               <div className="space-y-2">
                  <button onClick={toggleSound} className="w-full p-4 bg-slate-800/50 rounded-2xl flex items-center justify-between group">
                     <div className="flex items-center gap-3">
                        <Volume2 size={20} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-200">App Sounds</span>
                     </div>
                     <div className={`w-10 h-6 rounded-full p-1 transition-colors ${user.soundEnabled ? 'bg-green-500' : 'bg-slate-600'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${user.soundEnabled ? 'translate-x-4' : ''}`} />
                     </div>
                  </button>

                  <button onClick={toggleRetroMode} className="w-full p-4 bg-slate-800/50 rounded-2xl flex items-center justify-between group">
                     <div className="flex items-center gap-3">
                        <Gamepad2 size={20} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-200">Retro Mode</span>
                     </div>
                     <div className={`w-10 h-6 rounded-full p-1 transition-colors ${user.retroModeEnabled ? 'bg-amber-500' : 'bg-slate-600'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${user.retroModeEnabled ? 'translate-x-4' : ''}`} />
                     </div>
                  </button>

                  <button onClick={toggleAdmin} className="w-full p-4 bg-slate-800/50 rounded-2xl flex items-center justify-between group">
                     <div className="flex items-center gap-3">
                        <ShieldAlert size={20} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-200">Admin Mode</span>
                     </div>
                     <div className={`w-10 h-6 rounded-full p-1 transition-colors ${user.isAdmin ? 'bg-indigo-500' : 'bg-slate-600'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${user.isAdmin ? 'translate-x-4' : ''}`} />
                     </div>
                  </button>
               </div>

               <div className="pt-4 space-y-3">
                  <button onClick={onLogout} className="w-full py-4 border border-slate-700 rounded-xl text-slate-300 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-800">
                     <LogOut size={16} /> Sign Out
                  </button>
                  <button onClick={handleDeleteAccount} className="w-full py-4 text-red-500 font-bold uppercase tracking-widest text-[10px] hover:text-red-400">
                     Delete Account
                  </button>
               </div>

               <div className="text-center">
                  <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">PUSH v1.2.0 (Beta)</p>
               </div>
            </div>
         </div>
      )}

      {/* Friends Modal */}
      {showFriendsModal && (
         <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-start pt-10 pb-0 sm:justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2rem] flex flex-col max-h-[85vh] shadow-2xl animate-view overflow-hidden">
               <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
                  <h3 className="text-xl font-black italic uppercase text-white">Squad</h3>
                  <button onClick={() => setShowFriendsModal(false)}><X size={24} className="text-slate-500" /></button>
               </div>
               
               <div className="flex p-1 bg-slate-800/50 m-4 rounded-xl shrink-0">
                  <button onClick={() => setActiveFriendTab('friends')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest ${activeFriendTab === 'friends' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>My Friends</button>
                  <button onClick={() => setActiveFriendTab('search')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest ${activeFriendTab === 'search' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>Search</button>
                  <button onClick={() => setActiveFriendTab('requests')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest ${activeFriendTab === 'requests' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>
                     Requests {user.friendRequests.length > 0 && `(${user.friendRequests.length})`}
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* FRIENDS LIST */}
                  {activeFriendTab === 'friends' && (
                     <div className="space-y-3">
                        {friendsList.length === 0 ? (
                           <div className="text-center py-10 text-slate-500 text-xs font-bold uppercase tracking-widest">No friends yet. Add some!</div>
                        ) : (
                           friendsList.map(friend => (
                              <div key={friend.id} onClick={() => handleOpenChat(friend)} className="bg-slate-800/50 p-3 rounded-xl flex items-center justify-between active:scale-98 transition-transform cursor-pointer">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
                                       <img src={friend.avatar} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                       <div className="text-sm font-bold text-white">{friend.name}</div>
                                       <div className="text-[9px] text-slate-500 font-bold uppercase">{friend.location}</div>
                                    </div>
                                 </div>
                                 <MessageCircle size={18} className="text-indigo-400" />
                              </div>
                           ))
                        )}
                     </div>
                  )}

                  {/* SEARCH */}
                  {activeFriendTab === 'search' && (
                     <div className="space-y-4">
                        <div className="relative">
                           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                           <input 
                              type="text" 
                              placeholder="Search username..." 
                              className="w-full bg-slate-800 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              value={friendSearchQuery}
                              onChange={e => handleFriendSearch(e.target.value)}
                           />
                        </div>
                        <div className="space-y-2">
                           {isSearchingFriends ? <div className="text-center py-4"><Loader2 className="animate-spin mx-auto text-indigo-500" /></div> : 
                              searchResults.map(result => (
                                 <div key={result.id} className="bg-slate-800/30 p-3 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                                          <img src={result.avatar} alt="" className="w-full h-full object-cover" />
                                       </div>
                                       <div className="text-xs font-bold text-white">{result.name}</div>
                                    </div>
                                    <button 
                                       onClick={() => handleAddFriend(result.id)}
                                       className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg hover:bg-indigo-500 hover:text-white transition-colors"
                                    >
                                       <UserPlus size={16} />
                                    </button>
                                 </div>
                              ))
                           }
                        </div>
                     </div>
                  )}

                  {/* REQUESTS */}
                  {activeFriendTab === 'requests' && (
                     <div className="space-y-3">
                        {user.friendRequests.length === 0 ? (
                           <div className="text-center py-10 text-slate-500 text-xs font-bold uppercase tracking-widest">No pending requests.</div>
                        ) : (
                           user.friendRequests.map(req => (
                              <div key={req.id} className="bg-slate-800/50 p-4 rounded-xl flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
                                       <img src={req.fromUserAvatar} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-sm font-bold text-white">{req.fromUserName}</div>
                                 </div>
                                 <div className="flex gap-2">
                                    <button onClick={() => handleRejectRequest(req.id)} className="p-2 bg-slate-700 rounded-lg text-red-400"><X size={16} /></button>
                                    <button onClick={() => handleAcceptRequest(req.id)} className="p-2 bg-green-500 text-white rounded-lg"><Check size={16} /></button>
                                 </div>
                              </div>
                           ))
                        )}
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}

      {/* DM Chat Modal */}
      {activeChatFriend && (
         <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col">
            <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center gap-4 shrink-0">
               <button onClick={handleCloseChat}><ArrowLeft size={24} className="text-slate-400" /></button>
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800">
                     <img src={activeChatFriend.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-sm font-black uppercase italic text-white">{activeChatFriend.name}</h3>
               </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
               {dmMessages.length === 0 && <div className="text-center text-slate-600 text-xs mt-10">Start the conversation...</div>}
               {dmMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.userId === user.id ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                        msg.userId === user.id 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-none'
                     }`}>
                        {msg.text}
                     </div>
                  </div>
               ))}
               <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
               <div className="flex gap-2">
                  <input 
                     type="text" 
                     className="flex-1 bg-slate-950 border border-slate-800 rounded-full px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                     placeholder="Message..."
                     value={dmInput}
                     onChange={e => setDmInput(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleSendDm()}
                  />
                  <button 
                     onClick={handleSendDm} 
                     disabled={!dmInput.trim()}
                     className="bg-indigo-500 text-white p-3 rounded-full disabled:opacity-50"
                  >
                     <Send size={20} />
                  </button>
               </div>
            </div>
         </div>
      )}
      
      {/* Unlocked Item Modal (if from streak) */}
      {unlockedItem && (
        <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-6">
           <div className="flex flex-col items-center text-center space-y-6 animate-view">
             <div className="relative">
               <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-50 animate-pulse"></div>
               <img src={unlockedItem.imageUrl} className="w-48 h-48 object-contain relative z-10 drop-shadow-2xl" alt="Unlocked" />
             </div>
             
             <div className="space-y-2 relative z-10">
               <h2 className="text-sm font-black uppercase tracking-[0.5em] text-indigo-400">Streak Reward!</h2>
               <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">{unlockedItem.name}</h1>
               <p className="text-slate-400 text-sm max-w-xs mx-auto">{unlockedItem.description}</p>
             </div>

             <button 
               onClick={() => setUnlockedItem(null)}
               className="bg-white text-black px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
             >
               Add to Locker
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
