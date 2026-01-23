
import { 
  Spot, User, VerificationStatus, Discipline, Difficulty, Review, 
  SkillState, Skill, DailyNote, Challenge, Mentor,
  ChallengeSubmission, Crew, ChatMessage, ExtendedSession, Quest
} from '../types';
import { MOCK_SPOTS, SKILL_LIBRARY, MOCK_CHALLENGES, MOCK_SESSIONS, MOCK_MENTORS, MOCK_NOTES } from '../constants';

const DATA_VERSION = 'v1.7-beta';

const STORAGE_KEYS = {
  VERSION: 'push_db_version',
  SPOTS: 'push_db_spots',
  USER: 'push_db_user',
  AUTH: 'push_db_auth',
  CHATS: 'push_db_chats',
  SESSIONS: 'push_db_sessions',
  CHALLENGES: 'push_db_challenges',
  MENTORS: 'push_db_mentors',
  NOTES: 'push_db_notes',
  CUSTOM_SKILLS: 'push_db_custom_skills',
  CREWS: 'push_db_crews',
  QUESTS: 'push_db_quests'
};

class MockBackend {
  private initDB() {
    const currentVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
    
    if (currentVersion !== DATA_VERSION) {
      localStorage.clear(); 
      localStorage.setItem(STORAGE_KEYS.VERSION, DATA_VERSION);
      localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify(MOCK_SPOTS));
      localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(MOCK_CHALLENGES));
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(MOCK_SESSIONS));
      localStorage.setItem(STORAGE_KEYS.MENTORS, JSON.stringify(MOCK_MENTORS));
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(MOCK_NOTES));
      this.resetUser();
    }

    if (!localStorage.getItem(STORAGE_KEYS.SPOTS)) localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify(MOCK_SPOTS));
    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(MOCK_SESSIONS));
    if (!localStorage.getItem(STORAGE_KEYS.CHALLENGES)) localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(MOCK_CHALLENGES));
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
      reminderSet: data.reminderSet
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

  async updateVerification(spotId: string, status: VerificationStatus): Promise<void> {
    const spots = await this.getSpots();
    const index = spots.findIndex((s: Spot) => s.id === spotId);
    if (index !== -1) {
      spots[index].verificationStatus = status;
      spots[index].isVerified = status === VerificationStatus.VERIFIED;
      localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify(spots));
    }
  }

  async masterSkill(skillId: string): Promise<User> {
    const user = await this.getUser();
    if (!user.locker.includes(skillId)) {
        user.locker.push(skillId);
        user.xp += 500;
        user.masteredCount += 1;
        // Remove from pending if it was there
        user.pendingSkills = user.pendingSkills.filter(id => id !== skillId);
        return this.updateUser(user);
    }
    return user;
  }

  async submitSkillProof(skillId: string): Promise<User> {
    const user = await this.getUser();
    if (!user.pendingSkills.includes(skillId) && !user.locker.includes(skillId)) {
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
    return this.safeParse('push_db_mentor_apps', []);
  }

  async applyToBecomeMentor(data: any): Promise<void> {
    const user = await this.getUser();
    const apps = this.safeParse('push_db_mentor_apps', []);
    apps.push({ user, application: data });
    localStorage.setItem('push_db_mentor_apps', JSON.stringify(apps));
  }

  async getMyMentorProfile(): Promise<Mentor | undefined> {
    const user = await this.getUser();
    const mentors = await this.getMentors();
    return mentors.find(m => m.userId === user.id);
  }

  async getUserBookings(): Promise<any[]> {
    return this.safeParse('push_db_bookings', []);
  }

  async reviewMentorApplication(userId: string, approved: boolean): Promise<void> {
    const apps = this.safeParse('push_db_mentor_apps', []);
    const filtered = apps.filter((a: any) => a.user.id !== userId);
    localStorage.setItem('push_db_mentor_apps', JSON.stringify(filtered));
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
      state: SkillState.LEARNING,
      tutorialUrl: skill.tutorialUrl || '',
      isCustom: true
    };
    skills.push(newSkill);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_SKILLS, JSON.stringify(skills));
    return newSkill;
  }

  async getUserCrew(crewId: string): Promise<Crew | null> {
    const crews = this.safeParse(STORAGE_KEYS.CREWS, []);
    return crews.find((c: Crew) => c.id === crewId) || null;
  }

  async getCrewMembers(memberIds: string[]): Promise<User[]> {
    const currentUser = await this.getUser();
    return [currentUser];
  }

  async updateCrewSession(crewId: string, text: string): Promise<Crew> {
    const crews = this.safeParse(STORAGE_KEYS.CREWS, []);
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

  async createCrew(name: string, city: string): Promise<Crew> {
    const user = await this.getUser();
    const newCrew: Crew = {
      id: `crew-${Date.now()}`,
      name,
      city,
      avatar: '🛹',
      members: [user.id],
      level: 1,
      totalXp: 0,
      weeklyGoal: { description: 'Ride together', current: 0, target: 5 }
    };
    const crews = this.safeParse(STORAGE_KEYS.CREWS, []);
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
