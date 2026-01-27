
import { 
  Spot, User, VerificationStatus, Discipline, Difficulty, Review, 
  SkillState, Skill, DailyNote, Challenge, Mentor,
  ChallengeSubmission, Crew, ChatMessage, ExtendedSession, Quest, SpotStatus, SpotCategory, SpotPrivacy
} from '../types';
import { MOCK_SPOTS, SKILL_LIBRARY, MOCK_CHALLENGES, MOCK_SESSIONS, MOCK_MENTORS, MOCK_NOTES, BADGE_DATABASE, XP_SOURCES } from '../constants';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audio';

const DATA_VERSION = 'v2.2-infographics'; 

const STORAGE_KEYS = {
  VERSION: 'spots_db_version',
  SPOTS: 'spots_db_spots',
  USER: 'spots_db_user',
  AUTH: 'spots_db_auth',
  CHATS: 'spots_db_chats',
  SESSIONS: 'spots_db_sessions',
  CHALLENGES: 'spots_db_challenges',
  MENTORS: 'spots_db_mentors',
  NOTES: 'spots_db_notes',
  CUSTOM_SKILLS: 'spots_db_custom_skills',
  CREWS: 'spots_db_crews',
  QUESTS: 'spots_db_quests'
};

const MOCK_CREWS_LIST: Crew[] = [
  { id: 'c1', name: 'Night Riders', city: 'Mumbai', level: 5, members: ['u-2', 'u-3'], adminIds: ['u-2'], requests: [], maxMembers: 10, avatar: '🌑', moto: 'Own the night.', totalXp: 12500, weeklyGoal: { description: 'Night sesh streak', current: 2, target: 5 } },
  { id: 'c2', name: 'Hill Bombers', city: 'Pune', level: 8, members: ['u-4'], adminIds: ['u-4'], requests: [], maxMembers: 5, avatar: '💣', moto: 'Speed is key.', totalXp: 45000, weeklyGoal: { description: 'Clock 80kmph', current: 65, target: 80 } },
  { id: 'c3', name: 'Concrete Surfers', city: 'Bangalore', level: 3, members: ['u-5', 'u-6', 'u-7'], adminIds: ['u-5'], requests: [], maxMembers: 12, avatar: '🌊', moto: 'Flow state only.', totalXp: 8200, weeklyGoal: { description: 'Land 50 tricks', current: 12, target: 50 } }
];

class MockBackend {
  // --- XP & LEVEL LOGIC ---
  
  private calculateXpForNextLevel(currentLevel: number): number {
      // Formula: 100 + (level * 40)
      return 100 + (currentLevel * 40);
  }

  // Central method to award XP and handle level ups/badges
  async grantXp(amount: number, source: string): Promise<User> {
      const user = await this.getUser();
      
      // Add XP
      user.xp += amount;
      
      // Check for Level Up
      let xpForNext = this.calculateXpForNextLevel(user.level);
      
      let calculatedLevel = 1;
      let xpAccumulator = 0;
      let threshold = 140; // XP needed for Level 2 (100 + 1*40)
      
      while (user.xp >= xpAccumulator + threshold && calculatedLevel < 50) {
          xpAccumulator += threshold;
          calculatedLevel++;
          threshold = 100 + (calculatedLevel * 40);
      }

      if (calculatedLevel > user.level) {
          user.level = calculatedLevel;
          playSound('success'); 
          triggerHaptic('success');
          console.log(`LEVEL UP! You are now Level ${user.level}`);
      }

      // Check Badges
      await this.checkBadgeUnlocks(user);

      return this.updateUser(user);
  }

  private async checkBadgeUnlocks(user: User) {
      const currentBadges = new Set(user.badges);
      let newBadgeAwarded = false;

      // 1. Rookie: First Push (Level 2)
      if (user.level >= 2 && !currentBadges.has('badge_rookie_push')) {
          user.badges.push('badge_rookie_push');
          newBadgeAwarded = true;
      }

      // 2. Initiate: Dedicated (Streak >= 3)
      if (user.streak >= 3 && !currentBadges.has('badge_initiate_dedicated')) {
          user.badges.push('badge_initiate_dedicated');
          newBadgeAwarded = true;
      }

      // 3. Initiate: The Local (10 Sessions)
      if (user.stats && user.stats.totalSessions >= 10 && !currentBadges.has('badge_initiate_local')) {
          user.badges.push('badge_initiate_local');
          newBadgeAwarded = true;
      }

      // 4. Skilled: Scholar (5 Mastered Skills)
      if (user.masteredCount >= 5 && !currentBadges.has('badge_skilled_scholar')) {
          user.badges.push('badge_skilled_scholar');
          newBadgeAwarded = true;
      }

      // 5. Veteran: Guardian (Level 50)
      if (user.level >= 50 && !currentBadges.has('badge_legend_legacy')) {
          user.badges.push('badge_legend_legacy');
          newBadgeAwarded = true;
      }

      if (newBadgeAwarded) {
          playSound('unlock');
          triggerHaptic('success');
      }
  }

  // --- INIT ---

  private initDB() {
    const currentVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
    
    if (currentVersion !== DATA_VERSION) {
      // Preserve User if migrating from minor version, but for this demo, we can just clear
      localStorage.clear(); 
      localStorage.setItem(STORAGE_KEYS.VERSION, DATA_VERSION);
      
      const enrichedSpots = MOCK_SPOTS.map(s => ({
        ...s,
        status: Math.random() > 0.8 ? SpotStatus.WET : Math.random() > 0.8 ? SpotStatus.CROWDED : SpotStatus.DRY,
        privacy: SpotPrivacy.PUBLIC // Default for legacy spots
      }));
      localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify(enrichedSpots));
      
      localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(MOCK_CHALLENGES));
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(MOCK_SESSIONS));
      localStorage.setItem(STORAGE_KEYS.MENTORS, JSON.stringify(MOCK_MENTORS));
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(MOCK_NOTES));
      localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(MOCK_CREWS_LIST));
      this.resetUser();
    }

    // Fallbacks if data missing
    if (!localStorage.getItem(STORAGE_KEYS.SPOTS)) localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify(MOCK_SPOTS));
    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(MOCK_SESSIONS));
  }

  private resetUser() {
    const defaultUser: User = {
      id: 'u-arjun',
      shareId: 'AJ88', // Unique short ID
      name: 'Arjun S.',
      location: 'Pune',
      disciplines: [Discipline.SKATE],
      level: 1,
      xp: 0,
      streak: 0,
      masteredCount: 0,
      isAdmin: true,
      onboardingComplete: false, 
      locker: [],
      completedChallengeIds: [],
      pendingSkills: [],
      landedSkills: [], 
      masteredSkills: [], 
      badges: [],
      isMentor: false,
      friends: [],
      friendRequests: [],
      soundEnabled: true,
      retroModeEnabled: false,
      notificationsEnabled: true,
      stance: 'regular',
      stats: {
          totalSessions: 0,
          spotsFound: 0,
          distanceTraveled: 0
      }
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultUser));
    return defaultUser;
  }

  private safeParse(key: string, defaultValue: any) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  async isLoggedIn(): Promise<boolean> {
    this.initDB();
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  }

  async login(): Promise<User> {
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    return this.getUser();
  }

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }

  async getUser(): Promise<User> {
    const user = this.safeParse(STORAGE_KEYS.USER, null) || this.resetUser();
    if (!user.stats) user.stats = { totalSessions: 0, spotsFound: 0, distanceTraveled: 0 };
    if (!user.badges) user.badges = [];
    if (!user.shareId) user.shareId = user.id.slice(0, 4).toUpperCase(); // Backfill shareId
    return user;
  }

  async updateUser(user: User): Promise<User> {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  }

  async getSpots(): Promise<Spot[]> {
    this.initDB();
    const spots = this.safeParse(STORAGE_KEYS.SPOTS, MOCK_SPOTS);
    const sessions = await this.getAllSessions();
    return spots.map((s: Spot) => ({
      ...s,
      sessions: sessions.filter((sess: ExtendedSession) => sess.spotId === s.id)
    }));
  }

  async addSpot(spotData: Partial<Spot>): Promise<Spot> {
      const spots = await this.getSpots();
      const newSpot: Spot = {
          id: `spot-${Date.now()}`,
          name: spotData.name || 'Unknown Spot',
          type: spotData.type || Discipline.SKATE,
          category: SpotCategory.STREET,
          difficulty: Difficulty.BEGINNER,
          state: 'Unknown',
          surface: 'Concrete',
          location: spotData.location || { lat: 20.5937, lng: 78.9629, address: 'Unknown' },
          notes: spotData.notes || '',
          isVerified: false,
          verificationStatus: VerificationStatus.PENDING,
          status: SpotStatus.DRY,
          rating: 0,
          sessions: [],
          privacy: spotData.privacy || SpotPrivacy.PUBLIC,
          ownerId: spotData.ownerId,
          images: spotData.images || [],
          videoUrl: spotData.videoUrl || '',
          ...spotData
      };
      
      const rawSpots = spots.map(({sessions, ...s}) => s);
      rawSpots.push(newSpot);
      localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify(rawSpots));

      // XP Reward
      await this.grantXp(XP_SOURCES.SPOT_CONTRIBUTION, 'Spot Discovery');
      
      return newSpot;
  }

  async getAllChallenges(): Promise<Challenge[]> {
    this.initDB();
    return this.safeParse(STORAGE_KEYS.CHALLENGES, MOCK_CHALLENGES);
  }

  async createChallenge(data: Partial<Challenge>): Promise<Challenge> {
    const user = await this.getUser();
    const challenges = await this.getAllChallenges();
    const newChallenge: Challenge = {
        id: `c-${Date.now()}`,
        creatorId: user.id,
        creatorName: user.name,
        completions: 0,
        xpReward: 300,
        spotId: data.spotId!,
        title: data.title || 'Challenge',
        description: data.description || '',
        difficulty: data.difficulty || Difficulty.INTERMEDIATE,
        ...data
    };
    challenges.push(newChallenge);
    localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
    return newChallenge;
  }

  async getAllSessions(): Promise<ExtendedSession[]> {
    this.initDB();
    return this.safeParse(STORAGE_KEYS.SESSIONS, MOCK_SESSIONS);
  }

  async createSession(data: Partial<ExtendedSession>): Promise<ExtendedSession> {
    const user = await this.getUser();
    const sessions = await this.getAllSessions();
    const newSession: ExtendedSession = {
      id: `sess-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      title: data.title || 'Untitled Shred',
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || '10:00',
      spotId: data.spotId!,
      spotName: data.spotName!,
      spotType: data.spotType!,
      participants: [user.id],
      reminderSet: data.reminderSet,
      notes: data.notes || '',
      intent: data.intent || 'Chill'
    };
    sessions.push(newSession);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    
    // XP Reward & Stats
    if (user.stats) user.stats.totalSessions += 1;
    await this.updateUser(user);
    await this.grantXp(XP_SOURCES.SESSION_PLANNED, 'Session Created');
    
    // Auto-Log to Journal
    await this.saveDailyNote(`Planned Session: ${newSession.title} at ${newSession.spotName}.`);

    return newSession;
  }

  async getMentors(): Promise<Mentor[]> { return this.safeParse(STORAGE_KEYS.MENTORS, MOCK_MENTORS); }
  async bookMentorSession(mentor: Mentor, date: string, time: string): Promise<void> {
      const user = await this.getUser();
      const sessions = await this.getAllSessions();
      const newSession: ExtendedSession = { id: `sess-mentor-${Date.now()}`, userId: mentor.userId, userName: mentor.name, title: `Training with ${mentor.name}`, date: date === 'Today' ? new Date().toISOString().split('T')[0] : date, time: time, spotId: 'spot-virtual', spotName: 'Mentorship Uplink', spotType: mentor.disciplines[0], participants: [user.id, mentor.userId], reminderSet: true, intent: 'Training' };
      sessions.push(newSession);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      await this.saveDailyNote(`Confirmed Mentorship: ${mentor.name} @ ${time}. Get ready.`);
      await this.grantXp(50, 'Mentorship Booked');
  }
  async getDailyNotes(): Promise<DailyNote[]> { return this.safeParse(STORAGE_KEYS.NOTES, MOCK_NOTES); }
  
  async saveDailyNote(text: string, mediaUrl?: string, mediaType?: 'image' | 'video'): Promise<DailyNote> {
    const user = await this.getUser();
    const notes = await this.getDailyNotes();
    const newNote: DailyNote = { 
        id: `note-${Date.now()}`, 
        userId: user.id, 
        date: new Date().toISOString().split('T')[0], 
        text: text, 
        timestamp: new Date().toISOString(),
        mediaUrl,
        mediaType
    };
    notes.unshift(newNote);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    return newNote;
  }

  async updateVerification(spotId: string, status: VerificationStatus): Promise<void> {
    const spots = await this.getSpots();
    const index = spots.findIndex((s: Spot) => s.id === spotId);
    if (index !== -1) {
      spots[index].verificationStatus = status;
      spots[index].isVerified = status === VerificationStatus.VERIFIED;
      const rawSpots = spots.map(({sessions, ...s}) => s);
      localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify(rawSpots));
    }
  }
  async markSkillLanded(skillId: string): Promise<User> { const user = await this.getUser(); if (!user.landedSkills) user.landedSkills = []; if (!user.landedSkills.includes(skillId)) { user.landedSkills.push(skillId); return this.grantXp(XP_SOURCES.SKILL_LANDED, 'Skill Landed'); } return user; }
  async masterSkill(skillId: string): Promise<User> { const user = await this.getUser(); if (!user.masteredSkills) user.masteredSkills = []; if (!user.masteredSkills.includes(skillId)) { user.masteredSkills.push(skillId); if (!user.landedSkills.includes(skillId)) user.landedSkills.push(skillId); user.masteredCount += 1; await this.updateUser(user); return this.grantXp(XP_SOURCES.SKILL_MASTERED, 'Skill Mastered'); } return user; }
  async joinSession(sessionId: string): Promise<ExtendedSession> { const sessions = await this.getAllSessions(); const user = await this.getUser(); const index = sessions.findIndex((s: ExtendedSession) => s.id === sessionId); if (index !== -1) { if (!sessions[index].participants) sessions[index].participants = []; if (!sessions[index].participants.includes(user.id)) { sessions[index].participants.push(user.id); localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions)); await this.grantXp(XP_SOURCES.SESSION_COMPLETE, 'Joined Session'); await this.saveDailyNote(`Joined Ops: ${sessions[index].title} at ${sessions[index].spotName}.`); } return sessions[index]; } throw new Error("Session not found"); }
  async completeOnboarding(data: any): Promise<User> { const user = await this.getUser(); const updatedUser = { ...user, ...data, onboardingComplete: true }; await this.updateUser(updatedUser); return this.grantXp(50, 'Identity Established'); }
  async completeChallenge(challengeId: string): Promise<{ newUnlocks: string[], user: User }> { const user = await this.getUser(); const challenges = await this.getAllChallenges(); const challenge = challenges.find(c => c.id === challengeId); if (!user.completedChallengeIds.includes(challengeId) && challenge) { user.completedChallengeIds.push(challengeId); await this.updateUser(user); const xp = challenge.xpReward || XP_SOURCES.CHALLENGE_COMPLETE; const updatedUser = await this.grantXp(xp, 'Challenge Victory'); await this.updateQuestProgress('UPLOAD', 1); return { newUnlocks: [`sticker_${challengeId}`], user: updatedUser }; } return { newUnlocks: [], user }; }
  async getPendingMentorApplications(): Promise<any[]> { return this.safeParse('spots_db_mentor_apps', []); }
  async applyToBecomeMentor(data: any): Promise<void> { const user = await this.getUser(); const apps = this.safeParse('spots_db_mentor_apps', []); apps.push({ user, application: data }); localStorage.setItem('spots_db_mentor_apps', JSON.stringify(apps)); }
  async reviewMentorApplication(userId: string, approved: boolean): Promise<void> { const apps: { user: User, application: any }[] = this.safeParse('spots_db_mentor_apps', []); const index = apps.findIndex((a: any) => a.user.id === userId); if (index !== -1) { if (approved) { const app = apps[index]; const mentors = await this.getMentors(); if (!mentors.some(m => m.userId === userId)) { const newMentor: Mentor = { id: `m-${Date.now()}`, userId: userId, name: app.user.name, avatar: app.user.avatar || '', disciplines: app.user.disciplines || [Discipline.SKATE], rate: app.application.rate || 0, bio: app.application.style || '', rating: 5.0, reviewCount: 0, earnings: 0, studentsTrained: 0, badges: [] }; mentors.push(newMentor); localStorage.setItem(STORAGE_KEYS.MENTORS, JSON.stringify(mentors)); } } apps.splice(index, 1); localStorage.setItem('spots_db_mentor_apps', JSON.stringify(apps)); } }
  async getChallengeSubmissions(id: string): Promise<ChallengeSubmission[]> { return [ { id: 'sub-1', challengeId: id, userId: 'u-1', userName: 'Rahul', userAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Rahul', videoUrl: 'https://shiksha.skate.io/vid1.mp4', thumbnailUrl: 'https://picsum.photos/seed/skate/200/300', date: '2 days ago' } ]; }
  async getCustomSkills(): Promise<Skill[]> { this.initDB(); return this.safeParse(STORAGE_KEYS.CUSTOM_SKILLS, []); }
  async getAllCrews(): Promise<Crew[]> { this.initDB(); return this.safeParse(STORAGE_KEYS.CREWS, MOCK_CREWS_LIST); }
  async getUserCrew(crewId: string): Promise<Crew | null> { const crews = await this.getAllCrews(); return crews.find((c: Crew) => c.id === crewId) || null; }
  async requestJoinCrew(crewId: string): Promise<void> { const user = await this.getUser(); const crews = await this.getAllCrews(); const index = crews.findIndex(c => c.id === crewId); if (index !== -1) { const crew = crews[index]; if (!crew.requests) crew.requests = []; if (!crew.members.includes(user.id) && !crew.requests.includes(user.id)) { crew.requests.push(user.id); localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(crews)); } } }
  async respondToJoinRequest(crewId: string, userId: string, approved: boolean): Promise<Crew> { const crews = await this.getAllCrews(); const index = crews.findIndex(c => c.id === crewId); if (index !== -1) { const crew = crews[index]; crew.requests = (crew.requests || []).filter(id => id !== userId); if (approved) { if (!crew.members.includes(userId)) { crew.members.push(userId); const currentUser = await this.getUser(); if (currentUser.id === userId) { currentUser.crewId = crewId; await this.updateUser(currentUser); } } } localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(crews)); return crew; } throw new Error("Crew not found"); }
  async leaveCrew(): Promise<User> { const user = await this.getUser(); if (!user.crewId) return user; const crews = await this.getAllCrews(); const crewIndex = crews.findIndex(c => c.id === user.crewId); if (crewIndex !== -1) { crews[crewIndex].members = crews[crewIndex].members.filter(id => id !== user.id); if (crews[crewIndex].adminIds) { crews[crewIndex].adminIds = crews[crewIndex].adminIds.filter(id => id !== user.id); } localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(crews)); } delete user.crewId; await this.updateUser(user); return user; }
  
  async createCrew(data: { name: string, city: string, moto: string, homeSpotId: string, homeSpotName: string, avatar: string, maxMembers?: number }): Promise<Crew> {
    const user = await this.getUser();
    const crews = await this.getAllCrews();
    
    const newCrew: Crew = {
      id: `crew-${Date.now()}`,
      name: data.name,
      city: data.city,
      moto: data.moto,
      homeSpotId: data.homeSpotId,
      homeSpotName: data.homeSpotName,
      avatar: data.avatar,
      members: [user.id],
      adminIds: [user.id],
      requests: [],
      level: 1,
      totalXp: 0,
      weeklyGoal: { description: 'Establish dominance', current: 0, target: 100 },
      maxMembers: data.maxMembers || 10
    };
    
    crews.push(newCrew);
    localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(crews));
    
    user.crewId = newCrew.id;
    await this.updateUser(user);
    
    return newCrew;
  }

  async getDailyQuests(): Promise<Quest[]> {
      const quests = this.safeParse(STORAGE_KEYS.QUESTS, [
          { id: 'q1', title: 'Daily Check-in', description: 'Check in at a spot', type: 'CHECK_IN', target: 1, current: 0, xpReward: 50, isCompleted: false, expiresIn: '12h' },
          { id: 'q2', title: 'Content Creator', description: 'Upload a clip', type: 'UPLOAD', target: 1, current: 0, xpReward: 100, isCompleted: false, expiresIn: '12h' }
      ]);
      return quests;
  }

  async updateQuestProgress(type: 'CHECK_IN' | 'UPLOAD' | 'DISTANCE', amount: number): Promise<void> {
      const quests: Quest[] = await this.getDailyQuests();
      let updated = false;
      
      for (const q of quests) {
          if (q.type === type && !q.isCompleted) {
              q.current += amount;
              if (q.current >= q.target) {
                  q.isCompleted = true;
                  q.current = q.target;
                  await this.grantXp(q.xpReward, 'Quest Complete');
              }
              updated = true;
          }
      }
      
      if (updated) {
          localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(quests));
      }
  }

  // --- CHAT SYSTEM ---
  async getChatMessages(channelId: string): Promise<ChatMessage[]> {
      this.initDB();
      const allChats: Record<string, ChatMessage[]> = this.safeParse(STORAGE_KEYS.CHATS, {});
      return allChats[channelId] || [];
  }

  async sendChatMessage(channelId: string, text: string): Promise<ChatMessage> {
      const user = await this.getUser();
      const allChats: Record<string, ChatMessage[]> = this.safeParse(STORAGE_KEYS.CHATS, {});
      
      if (!allChats[channelId]) {
          allChats[channelId] = [];
      }

      const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          sessionId: channelId,
          userId: user.id,
          userName: user.name,
          text: text,
          timestamp: new Date().toISOString()
      };

      allChats[channelId].push(newMessage);
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(allChats));
      
      return newMessage;
  }
}

export const backend = new MockBackend();
