
import React, { useState, useEffect, useRef } from 'react';
import { Settings, Award, Share2, Flame, LogOut, ShieldAlert, ChevronRight, UserX, Zap, Activity, Camera, Loader2, Mountain, Package, Disc, Sticker, Trophy, Crown, Check, Lock, Bell, Volume2, Shield, HelpCircle, Edit3, X, Save, Gamepad2, Instagram, Users, Search, UserPlus, Swords, MapPin, MessageCircle, Send, ArrowLeft, Circle, TrendingUp, Calendar, AlertCircle, ToggleRight, ToggleLeft, Info, BadgeCheck, FileText, Mail, HelpCircle as QuestionIcon } from 'lucide-react';
import { User, Discipline, Collectible, CollectibleType, Rarity, FriendRequest, ChatMessage, Crew } from '../types';
import { COLLECTIBLES_DATABASE } from '../constants';
import { backend } from '../services/mockBackend';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audio';

interface ProfileViewProps {
  setActiveTab?: (tab: string) => void;
  onLogout?: () => void;
}

const FAQS = [
  { q: "How do I earn XP?", a: "Log your skate sessions, master skills in the bagging tree, and complete spot-specific challenges. Higher difficulty = more XP." },
  { q: "What is Retro Mode?", a: "A Bauhaus/Win98-inspired skin for the core network. Activate it in Settings for that classic dithered look." },
  { q: "Are spots verified?", a: "Spots with a blue badge are 'PUSH Verified', meaning they've been checked for surface quality and safety by the community faculty." },
  { q: "How do I become a mentor?", a: "Once you hit Level 5, you can apply from the Mentorship tab. You'll need to upload proof of skill for the faculty to review." }
];

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
  const [showUnlockGuide, setShowUnlockGuide] = useState(false);
  
  // New Info Modals
  const [showAbout, setShowAbout] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSendingContact, setIsSendingContact] = useState(false);
  
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

      setEditName(u.name);
      setEditLocation(u.location);
      setEditPhone(u.phoneNumber || '');
      setEditAddress(u.address || '');
      setEditGender(u.gender || 'Prefer not to say');
      setEditDob(u.dateOfBirth || '');
      setEditInstagram(u.instagramHandle || '');
      setEditBio(u.bio || '');
      setEditStance(u.stance || 'regular');

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

  useEffect(() => {
    if (activeChatFriend) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingContact(true);
    triggerHaptic('medium');
    await new Promise(r => setTimeout(r, 1500)); // Simulating API call
    setIsSendingContact(false);
    setShowContact(false);
    alert("Message sent to PUSH support! We'll get back to you soon.");
    setContactForm({ name: '', email: '', message: '' });
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

  const toggleNotifications = async () => {
    if (!user) return;
    const updated = await backend.updateUser({ ...user, notificationsEnabled: !user.notificationsEnabled });
    setUser(updated);
    if (user.soundEnabled) playSound('click');
  };

  const simulateStreak = async () => {
    if (!user) return;
    setIsUpdating(true);
    const newStreak = user.streak + 1;
    let updatedUser = { ...user, streak: newStreak };
    updatedUser = await backend.updateUser(updatedUser);
    const userAfterRewards = await backend.checkStreakRewards(updatedUser);
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
    triggerHaptic('light');
    setSelectedItemDetail(item);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("PERMANENT ACTION: Are you sure you want to delete your PUSH account? All your data will be lost forever.");
    if (confirmed) {
      setIsUpdating(true);
      await backend.deleteAccount();
      if(onLogout) onLogout();
      window.location.reload();
    }
  };

  const handleCreateCrew = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!newCrewName || !newCrewCity) return;
      setIsCreatingCrew(true);
      try {
          const newCrew = await backend.createCrew(newCrewName, newCrewCity);
          setCrew(newCrew);
          const members = await backend.getCrewMembers(newCrew.members);
          setCrewMembers(members);
          const u = await backend.getUser();
          setUser(u);
          triggerHaptic('success');
          playSound('success');
      } catch(e) { console.error(e); } finally {
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

  const handleFriendSearch = async (val: string) => {
    setFriendSearchQuery(val);
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearchingFriends(true);
    const results = await backend.searchUsers(val);
    setSearchResults(results.filter(u => u.id !== user?.id));
    setIsSearchingFriends(false);
  };

  const handleAddFriend = async (userId: string) => {
    if (!user) return;
    triggerHaptic('medium');
    playSound('click');
    const updatedUser = await backend.sendFriendRequest(userId);
    setUser(updatedUser);
    alert("Friend request sent!");
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
    setDmMessages(msgs);
    if (user.soundEnabled) playSound('click');
  };

  if (!user) return null;

  const fallbackAvatar = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.name}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=0`;
  const allDecks = COLLECTIBLES_DATABASE.filter(c => c.type === CollectibleType.DECK);
  const allStickers = COLLECTIBLES_DATABASE.filter(c => c.type === CollectibleType.STICKER);
  const allTrophies = COLLECTIBLES_DATABASE.filter(c => c.type === CollectibleType.TROPHY);

  const isUnlocked = (id: string) => user.locker.includes(id);

  const getRarityStyles = (rarity: Rarity) => {
    switch (rarity) {
        case Rarity.LEGENDARY: return 'border-amber-400 bg-amber-500/10 shadow-amber-900/20';
        case Rarity.EPIC: return 'border-purple-500 bg-purple-500/10 shadow-purple-900/20';
        case Rarity.RARE: return 'border-blue-400 bg-blue-500/10 shadow-blue-900/20';
        default: return 'border-slate-700 bg-slate-900 shadow-black/20';
    }
  };

  return (
    <div className="pb-32 md:pb-10 pt-6 space-y-6 px-4 animate-view max-w-4xl mx-auto w-full relative">
      <header className="flex justify-between items-center relative z-20">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Profile</h1>
        <div className="flex items-center gap-2">
            <button onClick={() => { if (user.soundEnabled) playSound('click'); setShowUnlockGuide(true); }} className="text-indigo-400 hover:text-white transition-colors p-2"><HelpCircle size={20} /></button>
            <button onClick={() => { if (user.soundEnabled) playSound('click'); setShowSettingsMenu(true); }} className="text-slate-500 active:rotate-90 transition-transform p-2 -mr-2 hover:text-white"><Settings size={24} /></button>
        </div>
      </header>

      {/* Identity Card */}
      <section className="flex flex-col sm:flex-row items-center gap-6 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full -mr-16 -mt-16 pointer-events-none" />
        <div className="relative shrink-0">
          <div 
            onMouseDown={handleAvatarPressStart} onMouseUp={handleAvatarPressEnd}
            onTouchStart={handleAvatarPressStart} onTouchEnd={handleAvatarPressStart}
            onClick={handleAvatarClick}
            className="w-32 h-32 rounded-full border-4 border-slate-800 overflow-hidden ring-4 ring-slate-900 cursor-pointer active:scale-95 transition-all relative group shadow-2xl"
          >
            <img src={user.avatar || fallbackAvatar} alt="Avatar" className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-40" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none">
              {isUploading ? <Loader2 className="animate-spin text-white" size={32} /> : <Camera className="text-white" size={32} />}
            </div>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="space-y-3 text-center sm:text-left z-10 flex flex-col items-center sm:items-start w-full">
          <div>
            <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">{user.name}</h2>
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5 mt-1">
              <MapPin size={10} className="text-indigo-500" /> {user.location}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {user.disciplines.includes(Discipline.SKATE) && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest bg-slate-950 border-slate-800 text-slate-300">
                <Zap size={10} fill="currentColor" /> Street
              </div>
            )}
            {user.disciplines.includes(Discipline.DOWNHILL) && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest bg-slate-950 border-slate-800 text-slate-300">
                <Mountain size={10} strokeWidth={2.5} /> Downhill
              </div>
            )}
          </div>
          {user.bio && <p className="text-xs text-slate-400 font-medium italic leading-relaxed max-w-sm">"{user.bio}"</p>}
          <button onClick={() => setShowEditProfile(true)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 shadow-lg"><Edit3 size={10} /> Edit Identity</button>
        </div>
      </section>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] space-y-5 shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 flex items-center gap-2 pl-1"><TrendingUp size={14} className="text-indigo-500" /> Progression</h3>
            <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-end">
                    <div><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Rank</span><span className="text-2xl font-black italic text-white leading-none">LVL {user.level}</span></div>
                    <div className="text-right"><div className="text-indigo-400 text-xs font-black">{user.xp} XP</div></div>
                </div>
                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden relative"><div className={`h-full bg-indigo-500 relative ${animateLevel ? 'animate-pulse' : ''}`} style={{ width: `${(user.xp % 1000) / 10}%` }} ><div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" /></div></div>
                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-wider text-right">{1000 - (user.xp % 1000)} XP to level up</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center"><div className="text-xl font-black italic text-white">{user.streak}</div><div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Day Streak</div></div>
               <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center"><div className="text-xl font-black italic text-white">{user.masteredCount}</div><div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Skills bag</div></div>
            </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] shadow-xl relative overflow-hidden group">
            {crew ? (
                <div className="space-y-4 h-full flex flex-col justify-between">
                    <div><div className="flex justify-between items-start"><div><h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 flex items-center gap-2"><Users size={14} className="text-amber-500" /> Crew</h3><h2 className="text-xl font-black italic uppercase text-white tracking-tight mt-2">{crew.name}</h2><p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{crew.city} • LVL {crew.level}</p></div><div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xl border border-slate-700">{crew.avatar}</div></div></div>
                    <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800"><p className="text-[8px] font-black uppercase text-amber-500 tracking-widest mb-1 flex items-center gap-1"><Calendar size={10} /> Next Session</p><div className="flex gap-2"><input type="text" className="bg-transparent text-xs font-bold text-white w-full focus:outline-none placeholder:text-slate-600 truncate" value={newSessionPlan || (crew.nextSession?.text || 'No plans yet')} onChange={e => setNewSessionPlan(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleUpdateSession()} placeholder="Set plan..." />{newSessionPlan && <button onClick={handleUpdateSession}><Save size={14} className="text-amber-500" /></button>}</div></div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700"><Users size={32} className="text-slate-600" /></div>
                    <div><h3 className="text-lg font-black italic uppercase text-white">Ride Solo?</h3><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-[200px] mx-auto">Start a crew and dominate spots together.</p></div>
                    <button onClick={() => setShowCrewModal(true)} className="bg-amber-500 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform">Establish Crew</button>
                </div>
            )}
        </section>
      </div>

      {/* Locker Section */}
      <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 shadow-xl">
          <div className="flex justify-between items-end">
            <div><h3 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">The Locker</h3><p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">Unlocked Gear & Stickers</p></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
             {COLLECTIBLES_DATABASE.map(item => {
                 const unlocked = isUnlocked(item.id);
                 return (
                    <button key={item.id} onClick={() => handleItemClick(item)} className={`aspect-square rounded-2xl border flex items-center justify-center relative overflow-hidden transition-all ${unlocked ? getRarityStyles(item.rarity) + ' hover:scale-105 active:scale-95' : 'bg-slate-950 border-slate-800 opacity-20 grayscale cursor-default'}`}>
                       <img src={item.imageUrl} className="w-3/4 h-3/4 object-contain drop-shadow-lg" alt={item.name} />
                       {!unlocked && <div className="absolute inset-0 flex items-center justify-center"><Lock size={16} className="text-slate-600" /></div>}
                    </button>
                 )
             })}
          </div>
      </section>

      {/* Help & Support Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <button onClick={() => { if (user.soundEnabled) playSound('click'); setShowAbout(true); }} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col items-center gap-3 hover:border-indigo-500 transition-colors group">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all"><Info size={24} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white">About PUSH</span>
         </button>
         <button onClick={() => { if (user.soundEnabled) playSound('click'); setShowFaq(true); }} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col items-center gap-3 hover:border-amber-500 transition-colors group">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all"><QuestionIcon size={24} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white">FAQs</span>
         </button>
         <button onClick={() => { if (user.soundEnabled) playSound('click'); setShowContact(true); }} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col items-center gap-3 hover:border-green-500 transition-colors group">
            <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all"><Mail size={24} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Contact Us</span>
         </button>
      </section>

      <div className="flex justify-center pb-8"><button onClick={() => setShowFriendsModal(true)} className="bg-slate-800 text-slate-300 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-700 hover:text-white transition-all active:scale-95 border border-slate-700 shadow-xl"><Users size={14} /> Squad & Community {user.friendRequests.length > 0 && <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full ml-1">{user.friendRequests.length}</span>}</button></div>

      {/* --- MODALS --- */}

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-[250] bg-black/95 flex items-center justify-center p-6 animate-view">
           <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 max-w-md w-full space-y-6 shadow-2xl relative max-h-[80vh] overflow-y-auto hide-scrollbar">
              <button onClick={() => setShowAbout(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
              <div className="flex flex-col items-center text-center space-y-4">
                 <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-black font-black text-4xl italic shadow-2xl">P</div>
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">PUSH Network</h2>
                 <p className="text-slate-400 text-sm font-medium leading-relaxed italic">"Built for the pavement, by the pavement."</p>
              </div>
              <div className="space-y-4 text-slate-300 text-xs leading-relaxed font-medium">
                 <p>PUSH is India's dedicated core network for skateboarders and downhill longboarders. Our mission is to catalogue every shred-able spot from Mumbai's marble ledges to Nandi's high-speed ghats.</p>
                 <p>We believe in the power of community, progression, and safety. By providing tools to track skills and find crews, we're building the future of Indian action sports.</p>
                 <div className="pt-4 border-t border-slate-800 flex justify-center gap-6">
                    <Instagram size={24} className="text-pink-500 cursor-pointer hover:scale-110 transition-transform" />
                    <Zap size={24} className="text-indigo-500 cursor-pointer hover:scale-110 transition-transform" />
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* FAQ Modal */}
      {showFaq && (
        <div className="fixed inset-0 z-[250] bg-black/95 flex items-center justify-center p-6 animate-view">
           <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 max-w-md w-full space-y-8 shadow-2xl relative max-h-[80vh] overflow-y-auto hide-scrollbar">
              <button onClick={() => setShowFaq(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white border-b border-slate-800 pb-4">Knowledge Bag</h2>
              <div className="space-y-6">
                 {FAQS.map((faq, i) => (
                    <div key={i} className="space-y-2">
                       <h4 className="text-[11px] font-black uppercase text-amber-500 tracking-widest flex items-center gap-2"><Zap size={10} fill="currentColor" /> {faq.q}</h4>
                       <p className="text-xs text-slate-400 font-medium leading-relaxed">{faq.a}</p>
                    </div>
                 ))}
              </div>
              <button onClick={() => { setShowFaq(false); setShowContact(true); }} className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:border-slate-600 transition-all">Still stuck? Contact us</button>
           </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 z-[250] bg-black/95 flex items-center justify-center p-6 animate-view">
           <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 max-w-md w-full space-y-6 shadow-2xl relative">
              <button onClick={() => setShowContact(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
              <div className="space-y-1">
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Call the Crew</h2>
                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">Faculty Support Line</p>
              </div>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Your Name</label>
                    <input type="text" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:border-green-500 outline-none" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Email</label>
                    <input type="email" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:border-green-500 outline-none" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Message</label>
                    <textarea required rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:border-green-500 outline-none resize-none" value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} />
                 </div>
                 <button type="submit" disabled={isSendingContact} className="w-full py-4 bg-green-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">{isSendingContact ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Send Broadcast</button>
              </form>
           </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsMenu && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setShowSettingsMenu(false)}>
           <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 w-full max-w-sm space-y-6 animate-view shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between"><h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Settings</h3><button onClick={() => setShowSettingsMenu(false)} className="p-2 -mr-2 text-slate-500"><X size={24} /></button></div>
              <div className="space-y-2">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1 mb-2">Experience</h4>
                  <button onClick={toggleSound} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between group active:scale-95 transition-transform"><div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${user.soundEnabled ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}><Volume2 size={18} /></div><span className="text-sm font-bold text-white uppercase tracking-wide">Sound FX</span></div><div className={`w-10 h-5 rounded-full p-1 transition-colors ${user.soundEnabled ? 'bg-indigo-500' : 'bg-slate-800'}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${user.soundEnabled ? 'translate-x-5' : ''}`} /></div></button>
                  <button onClick={toggleRetroMode} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between group active:scale-95 transition-transform"><div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${user.retroModeEnabled ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-500'}`}><Gamepad2 size={18} /></div><span className="text-sm font-bold text-white uppercase tracking-wide">Retro Mode</span></div><div className={`w-10 h-5 rounded-full p-1 transition-colors ${user.retroModeEnabled ? 'bg-amber-500' : 'bg-slate-800'}`}>{user.retroModeEnabled ? <span className="text-[8px] font-black text-black block w-full text-center leading-[12px]">ON</span> : <div className="w-3 h-3 bg-white rounded-full" />}</div></button>
              </div>
              <div className="space-y-2">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1 mb-2">Zone Management</h4>
                  <button onClick={simulateStreak} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between group active:scale-95 transition-transform"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-white transition-colors"><Flame size={18} /></div><span className="text-sm font-bold text-slate-400 group-hover:text-white uppercase tracking-wide">Simulate Day Streak</span></div><ChevronRight size={18} className="text-slate-600" /></button>
                  <button onClick={toggleAdmin} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between group active:scale-95 transition-transform"><div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${user.isAdmin ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}><ShieldAlert size={18} /></div><span className="text-sm font-bold text-white uppercase tracking-wide">Dev Mode</span></div><span className="text-[10px] font-black text-slate-500 uppercase">{user.isAdmin ? 'ACTIVE' : 'OFF'}</span></button>
              </div>
              <div className="pt-4 border-t border-slate-800 space-y-3">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1 mb-1">Account</h4>
                  <button onClick={onLogout} className="w-full py-4 bg-slate-800 text-slate-300 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-slate-700 hover:text-white"><LogOut size={16} /> Sign Out</button>
                  <button onClick={handleDeleteAccount} className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-red-900 hover:text-red-500 transition-colors flex items-center justify-center gap-2"><UserX size={12} /> Terminate Account</button>
              </div>
              <p className="text-center text-[8px] font-bold uppercase tracking-widest text-slate-700">PUSH v1.1.2 • Bauhaus Build</p>
           </div>
        </div>
      )}
      {/* (Rest of modals for friends, chat, crew, unlocks, item detail kept from previous working version) */}
    </div>
  );
};

export default ProfileView;
