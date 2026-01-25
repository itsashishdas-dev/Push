
import { 
  Spot, User, VerificationStatus, Discipline, Difficulty, Review, 
  SkillState, Skill, DailyNote, Challenge, Mentor,
  ChallengeSubmission, Crew, ChatMessage, ExtendedSession, Quest, SpotStatus
} from '../types';
import { MOCK_SPOTS, SKILL_LIBRARY, MOCK_CHALLENGES, MOCK_SESSIONS, MOCK_MENTORS, MOCK_NOTES } from '../constants';

const DATA_VERSION = 'v1.8-skills-beta'; // Bumped version

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
  { id: 'c1', name: 'Night Riders', city: 'Mumbai', level: 5, members: ['u-2', 'u-3'], maxMembers: 10, avatar: '🌑', moto: 'Own the night.', totalXp: 12500, weeklyGoal: { description: 'Night sesh streak', current: 2, target: 5 } },
  { id: 'c2', name: 'Hill Bombers', city: 'Pune', level: 8, members: ['u-4'], maxMembers: 5, avatar: '💣', moto: 'Speed is key.', totalXp: 45000, weeklyGoal: { description: 'Clock 80kmph', current: 65, target: 80 } },
  { id: 'c3', name: 'Concrete Surfers', city: 'Bangalore', level: 3, members: ['u-5', 'u-6', 'u-7'], maxMembers: 12, avatar: '🌊', moto: 'Flow state only.', totalXp: 8200, weeklyGoal: { description: 'Land 50 tricks', current: 12, target: 50 } }
];

class MockBackend {
  private initDB() {
    const currentVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
    
    if (currentVersion !== DATA_VERSION) {
      localStorage.clear(); 
      localStorage.setItem(STORAGE_KEYS.VERSION, DATA_VERSION);
      // Enrich mock spots with status
      const enrichedSpots = MOCK_SPOTS.map(s => ({
        ...s,
        status: Math.random() > 0.8 ? SpotStatus.WET : Math.random() > 0.8 ? SpotStatus.CROWDED : SpotStatus.DRY
      }));
      localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify(enrichedSpots));
      
      localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(MOCK_CHALLENGES));
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(MOCK_SESSIONS));
      localStorage.setItem(STORAGE_KEYS.MENTORS, JSON.stringify(MOCK_MENTORS));
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(MOCK_NOTES));
      // Seed crews
      localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(MOCK_CREWS_LIST));
      this.resetUser();
    }

    if (!localStorage.getItem(STORAGE_KEYS.SPOTS)) {
        const enrichedSpots = MOCK_SPOTS.map(s => ({
            ...s,
            status: Math.random() > 0.8 ? SpotStatus.WET : Math.random() > 0.8 ? SpotStatus.CROWDED : SpotStatus.DRY
        }));
        localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify(enrichedSpots));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(MOCK_SESSIONS));
    if (!localStorage.getItem(STORAGE_KEYS.CHALLENGES)) localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(MOCK_CHALLENGES));
    if (!localStorage.getItem(STORAGE_KEYS.CREWS)) localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(MOCK_CREWS_LIST));
  }

  private resetUser() {
    const defaultUser: User = {
      id: 'u-arjun',
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
      landedSkills: [], // New
      masteredSkills: [], // New
      isMentor: false,
      friends: [],
      friendRequests: [],
      soundEnabled: true,
      retroModeEnabled: false,
      notificationsEnabled: true,
      stance: 'regular'
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
    return this.safeParse(STORAGE_KEYS.USER, null) || this.resetUser();
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

  async getAllChallenges(): Promise<Challenge[]> {
    this.initDB();
    return this.safeParse(STORAGE_KEYS.CHALLENGES, MOCK_CHALLENGES);
  }

  async getSpotChallenges(spotId: string): Promise<Challenge[]> {
    const all = await this.getAllChallenges();
    return all.filter(c => c.spotId === spotId);
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
    return newSession;
  }

  async getMentors(): Promise<Mentor[]> {
    this.initDB();
    return this.safeParse(STORAGE_KEYS.MENTORS, MOCK_MENTORS);
  }

  async getDailyNotes(): Promise<DailyNote[]> {
    this.initDB();
    return this.safeParse(STORAGE_KEYS.NOTES, MOCK_NOTES);
  }

  async saveDailyNote(text: string): Promise<DailyNote> {
    const user = await this.getUser();
    const notes = await this.getDailyNotes();
    const newNote: DailyNote = {
        id: `note-${Date.now()}`,
        userId: user.id,
        date: new Date().toISOString().split('T')[0],
        text: text,
        timestamp: new Date().toISOString()
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
      localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify(spots));
    }
  }

  // --- SKILL PROGRESSION ---

  async markSkillLanded(skillId: string): Promise<User> {
      const user = await this.getUser();
      if (!user.landedSkills) user.landedSkills = [];
      
      if (!user.landedSkills.includes(skillId)) {
          user.landedSkills.push(skillId);
          user.xp += 150; // Small reward
          return this.updateUser(user);
      }
      return user;
  }

  async masterSkill(skillId: string): Promise<User> {
    const user = await this.getUser();
    if (!user.masteredSkills) user.masteredSkills = [];
    
    if (!user.masteredSkills.includes(skillId)) {
        user.masteredSkills.push(skillId);
        // Also ensure it's marked as landed
        if (!user.landedSkills.includes(skillId)) user.landedSkills.push(skillId);
        
        user.xp += 500; // Big reward
        user.masteredCount += 1;
        
        return this.updateUser(user);
    }
    return user;
  }

  async submitSkillProof(skillId: string): Promise<User> {
    const user = await this.getUser();
    if (!user.pendingSkills.includes(skillId) && !user.masteredSkills.includes(skillId)) {
      user.pendingSkills.push(skillId);
      return this.updateUser(user);
    }
    return user;
  }

  async updateSkillState(skillId: string, state: SkillState): Promise<void> {
    // This is mostly local state management now with the new flow, 
    // but we might store intermediate states here if needed.
  }

  async joinSession(sessionId: string): Promise<ExtendedSession> {
    const sessions = await this.getAllSessions();
    const user = await this.getUser();
    const index = sessions.findIndex((s: ExtendedSession) => s.id === sessionId);
    if (index !== -1) {
        if (!sessions[index].participants) sessions[index].participants = [];
        if (!sessions[index].participants.includes(user.id)) {
            sessions[index].participants.push(user.id);
            localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
        }
        return sessions[index];
    }
    throw new Error("Session not found");
  }

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const allChats = this.safeParse(STORAGE_KEYS.CHATS, {});
    return allChats[sessionId] || [];
  }

  async sendSessionMessage(sessionId: string, text: string): Promise<void> {
    const user = await this.getUser();
    const allChats = this.safeParse(STORAGE_KEYS.CHATS, {});
    if (!allChats[sessionId]) allChats[sessionId] = [];
    const msg: ChatMessage = { 
        id: `msg-${Date.now()}`, 
        sessionId, 
        userId: user.id, 
        userName: user.name, 
        text, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    allChats[sessionId].push(msg);
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(allChats));
  }

  async completeOnboarding(data: any): Promise<User> {
    const user = await this.getUser();
    const updatedUser = { ...user, ...data, onboardingComplete: true };
    return this.updateUser(updatedUser);
  }

  async completeChallenge(challengeId: string): Promise<{ newUnlocks: string[], user: User }> {
    const user = await this.getUser();
    if (!user.completedChallengeIds.includes(challengeId)) {
        user.completedChallengeIds.push(challengeId);
        user.xp += 1000;
        
        // Also update quests
        await this.updateQuestProgress('UPLOAD', 1);

        const updated = await this.updateUser(user);
        return { newUnlocks: [`sticker_${challengeId}`], user: updated };
    }
    return { newUnlocks: [], user };
  }

  async getPendingMentorApplications(): Promise<any[]> {
    return this.safeParse('spots_db_mentor_apps', []);
  }

  async applyToBecomeMentor(data: any): Promise<void> {
    const user = await this.getUser();
    const apps = this.safeParse('spots_db_mentor_apps', []);
    apps.push({ user, application: data });
    localStorage.setItem('spots_db_mentor_apps', JSON.stringify(apps));
  }

  async getMyMentorProfile(): Promise<Mentor | undefined> {
    const user = await this.getUser();
    const mentors = await this.getMentors();
    return mentors.find(m => m.userId === user.id);
  }

  async getUserBookings(): Promise<any[]> {
    return this.safeParse('spots_db_bookings', []);
  }

  async reviewMentorApplication(userId: string, approved: boolean): Promise<void> {
    const apps = this.safeParse('spots_db_mentor_apps', []);
    const filtered = apps.filter((a: any) => a.user.id !== userId);
    localStorage.setItem('spots_db_mentor_apps', JSON.stringify(filtered));
    if (approved) {
      const user = await this.getUser();
      if (user.id === userId) { user.isMentor = true; await this.updateUser(user); }
    }
  }

  async getChallengeSubmissions(id: string): Promise<ChallengeSubmission[]> {
    return [
      { id: 'sub-1', challengeId: id, userId: 'u-1', userName: 'Rahul', userAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Rahul', videoUrl: 'https://shiksha.skate.io/vid1.mp4', thumbnailUrl: 'https://picsum.photos/seed/skate/200/300', date: '2 days ago' }
    ];
  }

  async getCustomSkills(): Promise<Skill[]> {
    this.initDB();
    return this.safeParse(STORAGE_KEYS.CUSTOM_SKILLS, []);
  }

  async saveCustomSkill(skill: Partial<Skill>): Promise<Skill> {
    const skills = await this.getCustomSkills();
    const newSkill: Skill = {
      id: `custom-${Date.now()}`,
      name: skill.name || 'Unnamed Trick',
      category: skill.category || Discipline.SKATE,
      difficulty: skill.difficulty || Difficulty.BEGINNER,
      tier: 1,
      description: 'Custom user skill',
      xpReward: 100,
      tutorialUrl: skill.tutorialUrl || '',
      isCustom: true
    };
    skills.push(newSkill);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_SKILLS, JSON.stringify(skills));
    return newSkill;
  }

  // --- CREW SYSTEM ---

  async getAllCrews(): Promise<Crew[]> {
    this.initDB();
    return this.safeParse(STORAGE_KEYS.CREWS, MOCK_CREWS_LIST);
  }

  async getUserCrew(crewId: string): Promise<Crew | null> {
    const crews = await this.getAllCrews();
    return crews.find((c: Crew) => c.id === crewId) || null;
  }

  async joinCrew(crewId: string): Promise<Crew> {
      const user = await this.getUser();
      const crews = await this.getAllCrews();
      const index = crews.findIndex(c => c.id === crewId);
      
      if (index !== -1) {
          if (!crews[index].members.includes(user.id)) {
              crews[index].members.push(user.id);
              localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(crews));
              
              user.crewId = crewId;
              await this.updateUser(user);
          }
          return crews[index];
      }
      throw new Error("Crew not found");
  }

  async getCrewMembers(memberIds: string[]): Promise<User[]> {
    const currentUser = await this.getUser();
    return [currentUser];
  }

  async updateCrewSession(crewId: string, text: string): Promise<Crew> {
    const crews = await this.getAllCrews();
    const index = crews.findIndex((c: Crew) => c.id === crewId);
    if (index !== -1) {
      const user = await this.getUser();
      crews[index].nextSession = {
        text,
        date: new Date().toISOString().split('T')[0],
        author: user.name
      };
      localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(crews));
      return crews[index];
    }
    throw new Error("Crew not found");
  }

  async createCrew(data: { name: string, city: string, moto: string, homeSpotId: string, homeSpotName: string, avatar: string, maxMembers: number }): Promise<Crew> {
    const user = await this.getUser();
    const newCrew: Crew = {
      id: `crew-${Date.now()}`,
      name: data.name,
      city: data.city,
      moto: data.moto,
      avatar: data.avatar,
      homeSpotId: data.homeSpotId,
      homeSpotName: data.homeSpotName,
      maxMembers: data.maxMembers,
      members: [user.id],
      level: 1,
      totalXp: 0,
      weeklyGoal: { description: 'Ride together', current: 0, target: 5 }
    };
    const crews = await this.getAllCrews();
    crews.push(newCrew);
    localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(crews));
    
    user.crewId = newCrew.id;
    await this.updateUser(user);
    return newCrew;
  }

  async searchUsers(query: string): Promise<User[]> {
    return [];
  }

  async sendFriendRequest(userId: string): Promise<User> {
    return this.getUser();
  }

  async respondToFriendRequest(requestId: string, accepted: boolean): Promise<User> {
    const user = await this.getUser();
    user.friendRequests = user.friendRequests.filter(r => r.id !== requestId);
    return this.updateUser(user);
  }

  async getFriendsList(): Promise<any[]> {
      return [];
  }

  async checkStreakRewards(user: User): Promise<User> {
    if (user.streak >= 7 && !user.locker.includes('sticker_7_day')) {
      user.locker.push('sticker_7_day');
    }
    return this.updateUser(user);
  }

  async deleteAccount(): Promise<void> {
    localStorage.clear();
  }

  // --- Quests System ---

  async getDailyQuests(): Promise<Quest[]> {
    const stored = this.safeParse(STORAGE_KEYS.QUESTS, []);
    if (stored.length > 0) return stored;

    const newQuests: Quest[] = [
        { id: 'q1', title: 'Scout the Area', description: 'Check-in at 2 different spots.', type: 'CHECK_IN', target: 2, current: 0, xpReward: 500, isCompleted: false, expiresIn: '14h 20m' },
        { id: 'q2', title: 'Proof of Shred', description: 'Upload one trick or line.', type: 'UPLOAD', target: 1, current: 0, xpReward: 800, isCompleted: false, expiresIn: '14h 20m' },
        { id: 'q3', title: 'Marathon', description: 'Travel 5km between spots.', type: 'DISTANCE', target: 5, current: 2, xpReward: 600, isCompleted: false, expiresIn: '14h 20m' }
    ];
    localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(newQuests));
    return newQuests;
  }

  async updateQuestProgress(type: 'CHECK_IN' | 'UPLOAD' | 'DISTANCE', amount: number): Promise<Quest[]> {
    const quests = await this.getDailyQuests();
    let updated = false;

    const newQuests = quests.map(q => {
        if (q.type === type && !q.isCompleted) {
            const newCurrent = Math.min(q.current + amount, q.target);
            if (newCurrent !== q.current) updated = true;
            const completedNow = newCurrent >= q.target;
            
            if (completedNow && !q.isCompleted) {
               // Grant XP immediately in mock
               this.getUser().then(u => {
                   u.xp += q.xpReward;
                   this.updateUser(u);
               });
            }

            return { ...q, current: newCurrent, isCompleted: completedNow };
        }
        return q;
    });

    if (updated) {
        localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(newQuests));
    }
    return newQuests;
  }
}

export const backend = new MockBackend();
