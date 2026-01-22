
import { Spot, User, VerificationStatus, Discipline, Difficulty, Review, Collectible, CollectibleType, ChatMessage, Session, DailyNote, Challenge, Mentor, Booking, MentorBadge, ChallengeSubmission, FriendRequest, SkillState, MentorApplication, Crew } from '../types';
import { MOCK_SPOTS, COLLECTIBLES_DATABASE, SKILL_LIBRARY } from '../constants';

const STORAGE_KEYS = {
  SPOTS: 'push_spots_data_v22_stable',
  USER: 'push_user_data_v4', // Incremented for Crew ID
  AUTH: 'push_is_logged_in',
  CHATS: 'push_session_chats',
  STATE_COVERS: 'push_state_covers',
  NOTES: 'push_daily_notes',
  CHALLENGES: 'push_challenges_v1',
  MENTORS: 'push_mentors_v1',
  BOOKINGS: 'push_bookings_v1',
  SUBMISSIONS: 'push_submissions_v1',
  SKILLS: 'push_user_skills_v1',
  CREWS: 'push_crews_v1'
};

export interface ExtendedSession extends Session {
  spotId: string;
  spotName: string;
  spotType: Discipline;
  spotImage?: string;
  spotLocation: string;
}

// Mock User Database for Search
const MOCK_USERS_DB = [
  { id: 'u-rahul', name: 'Rahul V.', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Rahul', location: 'Mumbai', disciplines: [Discipline.SKATE] },
  { id: 'u-simran', name: 'Simran K.', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Simran', location: 'Delhi', disciplines: [Discipline.SKATE, Discipline.DOWNHILL] },
  { id: 'u-anish', name: 'Anish G.', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Anish', location: 'Bangalore', disciplines: [Discipline.SKATE] },
  { id: 'u-vikram', name: 'Vikram S.', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Vikram', location: 'Pune', disciplines: [Discipline.SKATE] },
  { id: 'u-priya', name: 'Priya M.', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Priya', location: 'Goa', disciplines: [Discipline.DOWNHILL] },
  { id: 'u-kabir', name: 'Kabir B.', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Kabir', location: 'Hyderabad', disciplines: [Discipline.DOWNHILL] },
  { id: 'u-zoya', name: 'Zoya F.', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Zoya', location: 'Mumbai', disciplines: [Discipline.DOWNHILL] },
  { id: 'u-dev', name: 'Dev R.', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Dev', location: 'Chandigarh', disciplines: [Discipline.SKATE] },
];

class MockBackend {
  private async delay(ms: number = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Auth Management
  async isLoggedIn(): Promise<boolean> {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  }

  async login(): Promise<User> {
    await this.delay(600);
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    const user = await this.getUser();
    
    // Check login rewards (First Push)
    const { user: updatedUser } = await this.evaluateRewards(user, { type: 'login' });
    return updatedUser;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }

  async deleteAccount(): Promise<void> {
    await this.delay(800);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.CHATS);
    localStorage.removeItem(STORAGE_KEYS.STATE_COVERS);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.CHALLENGES);
    localStorage.removeItem(STORAGE_KEYS.MENTORS);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.SKILLS);
    localStorage.removeItem(STORAGE_KEYS.CREWS);
  }

  // --- REWARD ENGINE ---
  async evaluateRewards(user: User, context: { type: 'streak' | 'skill' | 'session' | 'login' | 'challenge', id?: string }): Promise<{ user: User, newUnlocks: string[] }> {
    const streak = user.streak;
    const locker = new Set(user.locker);
    
    // 1. Streak Rewards
    if (streak >= 3 && !locker.has('sticker_gnarly')) locker.add('sticker_gnarly');
    if (streak >= 7 && !locker.has('deck_street_soldier')) locker.add('deck_street_soldier');
    if (streak >= 14 && !locker.has('wheel_asphalt')) locker.add('wheel_asphalt');
    if (streak >= 30 && !locker.has('deck_flow_state')) locker.add('deck_flow_state');
    if (streak >= 45 && !locker.has('trophy_iron_legs')) locker.add('trophy_iron_legs');
    if (streak >= 60 && !locker.has('trophy_consistency')) locker.add('trophy_consistency');

    // 2. Skill Mastery Rewards
    if (context.type === 'skill' && context.id) {
       // Legacy Check
       if (context.id === 's-b1' && !locker.has('sticker_first_ollie')) {
         locker.add('sticker_first_ollie');
       }
       
       // Dynamic Reward System based on SKILL_LIBRARY config
       const skill = SKILL_LIBRARY.find(s => s.id === context.id);
       if (skill && skill.unlockableCollectibleId && !locker.has(skill.unlockableCollectibleId)) {
         locker.add(skill.unlockableCollectibleId);
       }
    }

    // 3. Session/Login Rewards
    if (!locker.has('deck_first_push')) locker.add('deck_first_push');
    
    if (context.type === 'session' && !locker.has('deck_hill_runner')) {
        locker.add('deck_hill_runner');
    }

    const newLockerArray = Array.from(locker);
    const newUnlocks = newLockerArray.filter(id => !user.locker.includes(id));
    
    let finalUser = user;
    if (newUnlocks.length > 0) {
      finalUser = { ...user, locker: newLockerArray };
      await this.updateUser(finalUser);
    }

    return { user: finalUser, newUnlocks };
  }

  // Session & Chat Management
  async getAllSessions(): Promise<ExtendedSession[]> {
    await this.delay(200);
    const spots = await this.getSpots();
    const allSessions: ExtendedSession[] = [];
    
    spots.forEach(spot => {
      if (spot.sessions) {
        spot.sessions.forEach(session => {
           allSessions.push({
             ...session,
             spotId: spot.id,
             spotName: spot.name,
             spotType: spot.type,
             spotImage: spot.images && spot.images.length > 0 ? spot.images[0] : undefined,
             spotLocation: spot.location.address || spot.state
           });
        });
      }
    });

    // Sort by Date + Time
    return allSessions.sort((a, b) => {
       const dateA = new Date(`${a.date}T${a.time}`);
       const dateB = new Date(`${b.date}T${b.time}`);
       return dateA.getTime() - dateB.getTime();
    });
  }

  async joinSession(spotId: string, sessionId: string): Promise<Spot> {
    await this.delay(300);
    const spots = await this.getSpots();
    const user = await this.getUser();
    const spotIndex = spots.findIndex(s => s.id === spotId);
    
    if (spotIndex > -1) {
      const sessions = spots[spotIndex].sessions;
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex > -1) {
        const session = sessions[sessionIndex];
        // Only join if not already joined
        if (!session.attendees.includes(user.name)) {
          session.attendees.push(user.name);
          spots[spotIndex].sessions[sessionIndex] = session;
          
          await this.saveSpot(spots[spotIndex]);
          
          // Inject system message
          await this.sendSessionMessage(sessionId, `${user.name} joined the session.`, true);
        }
        return spots[spotIndex];
      }
    }
    throw new Error('Session or Spot not found');
  }

  async deleteSession(spotId: string, sessionId: string): Promise<Spot> {
    await this.delay(400);
    const spots = await this.getSpots();
    const index = spots.findIndex(s => s.id === spotId);
    
    if (index > -1) {
      // Remove session from spot
      spots[index].sessions = spots[index].sessions.filter(s => s.id !== sessionId);
      await this.saveSpot(spots[index]);
      
      // Clear associated chat
      const chats = await this.getSessionChats();
      delete chats[sessionId];
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
      
      return spots[index];
    }
    throw new Error('Spot not found');
  }

  async sendSessionMessage(sessionId: string, text: string, isSystem: boolean = false): Promise<void> {
    await this.delay(100);
    const chats = await this.getSessionChats();
    const user = await this.getUser();
    
    if (!chats[sessionId]) chats[sessionId] = [];
    
    const message: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sessionId,
      userId: isSystem ? 'system' : user.id,
      userName: isSystem ? 'PUSH Bot' : user.name,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem
    };
    
    chats[sessionId].push(message);
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  }

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    await this.delay(200);
    const chats = await this.getSessionChats();
    return chats[sessionId] || [];
  }

  private async getSessionChats(): Promise<Record<string, ChatMessage[]>> {
    const json = localStorage.getItem(STORAGE_KEYS.CHATS);
    return json ? JSON.parse(json) : {};
  }

  // User Profile
  async getUser(): Promise<User> {
    const json = localStorage.getItem(STORAGE_KEYS.USER);
    if (json) {
        const parsed = JSON.parse(json);
        // Migration check for old user objects without friends
        if (!parsed.friends) {
            parsed.friends = [];
            parsed.friendRequests = [];
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(parsed));
        }
        return parsed;
    }
    
    // Default User
    const defaultUser: User = {
      id: 'u-arjun',
      name: 'Arjun S.',
      location: 'Pune',
      disciplines: [Discipline.SKATE],
      level: 1, // Start low for new users
      xp: 0,
      streak: 0,
      masteredCount: 0,
      isAdmin: true, // Dev mode default
      onboardingComplete: false, // Force flow for demo if storage cleared
      locker: ['deck_first_push'],
      equippedDeckId: 'deck_first_push',
      completedChallengeIds: [],
      isMentor: false,
      friends: [],
      friendRequests: [],
      crewId: 'crew-bombers', // Seed user into a crew for demo
      soundEnabled: true,
      retroModeEnabled: false,
      stance: 'regular',
      gender: 'Male',
      bio: 'Just pushing wood and plastic.'
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultUser));
    
    // Ensure default crew exists if we assigned it
    if (defaultUser.crewId) {
        await this.ensureDefaultCrew(defaultUser.crewId);
    }
    
    return defaultUser;
  }

  async updateUser(user: User): Promise<User> {
    // Recalculate level based on XP before saving
    // Level formula: 1 + floor(XP / 1000)
    const newLevel = Math.max(1, 1 + Math.floor(user.xp / 1000));
    const userWithLevel = { ...user, level: newLevel };
    
    await this.delay(400);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithLevel));
    return userWithLevel;
  }

  async completeOnboarding(data: Partial<User>): Promise<User> {
    const user = await this.getUser();
    // Default to level 1 for new users
    const updated = { ...user, ...data, onboardingComplete: true, level: 1 };
    return this.updateUser(updated);
  }

  async checkStreakRewards(user: User): Promise<User> {
    const { user: updatedUser } = await this.evaluateRewards(user, { type: 'streak' });
    return updatedUser;
  }

  async logSession(sessionId: string): Promise<{ newUnlocks: string[] }> {
    const user = await this.getUser();
    const updatedUser = { ...user, xp: user.xp + 100 }; // 100 XP per session
    const { user: finalUser, newUnlocks } = await this.evaluateRewards(updatedUser, { type: 'session' });
    await this.updateUser(finalUser);
    return { newUnlocks };
  }

  async updateSkillState(skillId: string, state: SkillState): Promise<void> {
      // Store skill state locally or fetch map
      // For now, we mainly update XP if they land a trick
      const user = await this.getUser();
      
      // Calculate XP Gain for LANDED (smaller reward than mastered)
      // Mastered reward is handled in masterSkill separately
      if (state === SkillState.LANDED) {
          // Give 50 XP for landing a trick (simulated one-time per session/day or just add it)
          // To prevent infinite XP farming, we could track 'landed' history, but for MVP just add it
          const updatedUser = { ...user, xp: user.xp + 50 };
          await this.updateUser(updatedUser);
      }
  }

  async masterSkill(skillId: string): Promise<{ newUnlocks: string[] }> {
    const user = await this.getUser();
    // Big XP drop for mastery
    const updatedUser = { 
      ...user, 
      xp: user.xp + 500, 
      masteredCount: user.masteredCount + 1 
    };
    const { user: finalUser, newUnlocks } = await this.evaluateRewards(updatedUser, { type: 'skill', id: skillId });
    await this.updateUser(finalUser);
    return { newUnlocks };
  }

  async addReview(spotId: string, review: Omit<Review, 'id' | 'date' | 'userDeckId'>): Promise<Spot> {
    await this.delay(500);
    const spots = await this.getSpots();
    const user = await this.getUser();
    const index = spots.findIndex(s => s.id === spotId);
    
    if (index > -1) {
      if (!spots[index].reviews) spots[index].reviews = [];
      const newReview: Review = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0],
        userDeckId: user.equippedDeckId,
        ...review
      };
      
      spots[index].reviews!.unshift(newReview);
      
      // Update Average Rating
      const total = spots[index].reviews!.reduce((acc, r) => acc + r.rating, 0);
      spots[index].rating = total / spots[index].reviews!.length;
      
      await this.saveSpot(spots[index]);
      
      // Award XP for contributing
      const updatedUser = { ...user, xp: user.xp + 50 };
      await this.updateUser(updatedUser);
      
      return spots[index];
    }
    throw new Error('Spot not found');
  }

  // --- CREW MANAGEMENT ---
  private async ensureDefaultCrew(crewId: string) {
      const json = localStorage.getItem(STORAGE_KEYS.CREWS);
      let crews: Crew[] = json ? JSON.parse(json) : [];
      
      if (!crews.find(c => c.id === crewId)) {
          const defaultCrew: Crew = {
              id: crewId,
              name: 'Bombay Bombers',
              city: 'Mumbai',
              avatar: '💣',
              level: 4,
              totalXp: 12500,
              members: ['u-arjun', 'u-rahul', 'u-zoya'],
              nextSession: {
                  text: 'Sunday Morning @ Carter Rd',
                  date: new Date(Date.now() + 86400000).toISOString(),
                  author: 'Rahul V.'
              },
              weeklyGoal: {
                  description: 'Log 15 sessions total',
                  current: 12,
                  target: 15
              }
          };
          crews.push(defaultCrew);
          localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(crews));
      }
  }

  async getUserCrew(crewId?: string): Promise<Crew | null> {
      if (!crewId) return null;
      await this.delay(300);
      const json = localStorage.getItem(STORAGE_KEYS.CREWS);
      const crews: Crew[] = json ? JSON.parse(json) : [];
      return crews.find(c => c.id === crewId) || null;
  }

  async createCrew(name: string, city: string): Promise<Crew> {
      await this.delay(800);
      const user = await this.getUser();
      
      const newCrew: Crew = {
          id: `crew-${Math.random().toString(36).substr(2, 6)}`,
          name,
          city,
          avatar: '🛹',
          level: 1,
          totalXp: 0,
          members: [user.id],
          weeklyGoal: {
              description: 'Complete 3 sessions',
              current: 0,
              target: 3
          }
      };

      const json = localStorage.getItem(STORAGE_KEYS.CREWS);
      const crews: Crew[] = json ? JSON.parse(json) : [];
      crews.push(newCrew);
      localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(crews));

      // Update user
      const updatedUser = { ...user, crewId: newCrew.id };
      await this.updateUser(updatedUser);

      return newCrew;
  }

  async updateCrewSession(crewId: string, text: string): Promise<Crew> {
      await this.delay(300);
      const user = await this.getUser();
      const json = localStorage.getItem(STORAGE_KEYS.CREWS);
      const crews: Crew[] = json ? JSON.parse(json) : [];
      const idx = crews.findIndex(c => c.id === crewId);
      
      if (idx > -1) {
          crews[idx].nextSession = {
              text,
              date: new Date().toISOString(),
              author: user.name
          };
          localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(crews));
          return crews[idx];
      }
      throw new Error("Crew not found");
  }

  async getCrewMembers(memberIds: string[]): Promise<any[]> {
      // In a real app this fetches user profiles. For mock, we map to our mock DB + current user
      const currentUser = await this.getUser();
      const allProfiles = [
          { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar, location: currentUser.location },
          ...MOCK_USERS_DB
      ];
      
      return memberIds.map(id => {
          const found = allProfiles.find(p => p.id === id);
          return found || { id, name: 'Unknown Skater', avatar: '', location: 'India' };
      });
  }

  // --- FRIENDS MANAGEMENT ---
  async searchUsers(query: string): Promise<any[]> {
    await this.delay(600);
    if (!query) return [];
    const lowerQ = query.toLowerCase();
    return MOCK_USERS_DB.filter(u => u.name.toLowerCase().includes(lowerQ));
  }

  async sendFriendRequest(toUserId: string): Promise<User> {
    await this.delay(500);
    const user = await this.getUser();
    
    // In a real app, we'd update the recipient's DB record. 
    // Here we just mock success and maybe update local state if we want to show 'Pending' in UI.
    // For this mock, we'll simulate the other user automatically accepting after a reload or just assume request sent.
    
    // Check if already friends
    if (user.friends.includes(toUserId)) return user;

    // Add to outbound requests (omitted for simplicity in this mock, assume sent)
    return user; 
  }

  async respondToFriendRequest(requestId: string, accept: boolean): Promise<User> {
    await this.delay(400);
    const user = await this.getUser();
    const requestIndex = user.friendRequests.findIndex(r => r.id === requestId);
    
    if (requestIndex > -1) {
      const request = user.friendRequests[requestIndex];
      const newRequests = [...user.friendRequests];
      newRequests.splice(requestIndex, 1);
      
      let newFriends = [...user.friends];
      if (accept) {
        newFriends.push(request.fromUserId);
      }
      
      const updatedUser = { ...user, friendRequests: newRequests, friends: newFriends };
      return this.updateUser(updatedUser);
    }
    return user;
  }

  async getFriendsList(): Promise<any[]> {
    const user = await this.getUser();
    // Simulate hydrating friend IDs with full user data from Mock DB
    return MOCK_USERS_DB.filter(u => user.friends.includes(u.id));
  }

  // Debug helper to inject a request
  async injectMockFriendRequest(): Promise<void> {
    const user = await this.getUser();
    if (user.friendRequests.length > 0) return;
    
    const mockReq: FriendRequest = {
        id: 'freq-1',
        fromUserId: 'u-kabir',
        fromUserName: 'Kabir B.',
        fromUserAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Kabir',
        status: 'pending',
        timestamp: new Date().toISOString()
    };
    
    const updated = { ...user, friendRequests: [...user.friendRequests, mockReq] };
    await this.updateUser(updated);
  }

  // Challenge Management
  async getChallenges(spotId: string): Promise<Challenge[]> {
    const json = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
    let allChallenges: Challenge[] = json ? JSON.parse(json) : [];
    
    // Seed default challenges if none exist
    if (allChallenges.length === 0) {
       allChallenges = [
         { id: 'c1', spotId: 'csv-26', creatorId: 'sys', creatorName: 'PUSH', title: 'Kickflip the 3-block', description: 'Clean landing required. No tic-tacs.', difficulty: Difficulty.INTERMEDIATE, xpReward: 300, completions: 12 },
         { id: 'c2', spotId: 'csv-26', creatorId: 'sys', creatorName: 'PUSH', title: 'Manual the ledge', description: 'Hold it for at least 5 seconds.', difficulty: Difficulty.BEGINNER, xpReward: 150, completions: 45 }
       ];
       localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(allChallenges));
    }

    return allChallenges.filter(c => c.spotId === spotId);
  }

  async getAllChallenges(): Promise<Challenge[]> {
    await this.delay(200);
    // Ensure seeding runs by calling getChallenges for a dummy ID
    await this.getChallenges('dummy'); 
    
    const json = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
    return json ? JSON.parse(json) : [];
  }

  async getChallengeSubmissions(challengeId: string): Promise<ChallengeSubmission[]> {
    const json = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    let allSubmissions: ChallengeSubmission[] = json ? JSON.parse(json) : [];

    // Seed if empty and requesting for default challenge
    if (allSubmissions.length === 0) {
        allSubmissions = [
            {
                id: 'sub-1',
                challengeId: 'c1', // Kickflip the 3-block
                userId: 'u-skater1',
                userName: 'Rahul V.',
                userAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Rahul',
                videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-skater-doing-a-trick-at-a-skate-park-4260-large.mp4',
                thumbnailUrl: 'https://images.unsplash.com/photo-1564982024202-75396c22c12d?q=80&w=400&auto=format&fit=crop',
                date: '2 days ago'
            },
            {
                id: 'sub-2',
                challengeId: 'c1',
                userId: 'u-skater2',
                userName: 'Simran K.',
                userAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Simran',
                videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-skateboarding-on-a-road-4263-large.mp4',
                thumbnailUrl: 'https://images.unsplash.com/photo-1520156584189-af296a5bf7e7?q=80&w=400&auto=format&fit=crop',
                date: '1 week ago'
            }
        ];
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(allSubmissions));
    }

    return allSubmissions.filter(s => s.challengeId === challengeId);
  }

  async createChallenge(challenge: Omit<Challenge, 'id' | 'creatorId' | 'creatorName' | 'completions'>): Promise<Challenge> {
    await this.delay(400);
    const user = await this.getUser();
    const json = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
    const challenges: Challenge[] = json ? JSON.parse(json) : [];
    
    const newChallenge: Challenge = {
      id: Math.random().toString(36).substr(2, 9),
      creatorId: user.id,
      creatorName: user.name,
      completions: 0,
      ...challenge
    };
    
    challenges.push(newChallenge);
    localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
    return newChallenge;
  }

  async completeChallenge(challengeId: string): Promise<{ newUnlocks: string[], user: User }> {
    await this.delay(800); // Simulate upload time
    
    // 1. Update Challenge Count
    const json = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
    const challenges: Challenge[] = json ? JSON.parse(json) : [];
    const idx = challenges.findIndex(c => c.id === challengeId);
    let rewardXp = 100;
    
    if (idx > -1) {
      challenges[idx].completions += 1;
      rewardXp = challenges[idx].xpReward;
      localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
    }

    // 2. Update User (Add ID, Add XP)
    const user = await this.getUser();
    let finalUser = user;
    let newUnlocks: string[] = [];

    if (!user.completedChallengeIds.includes(challengeId)) {
        const updatedUser = { 
            ...user, 
            xp: user.xp + rewardXp,
            completedChallengeIds: [...user.completedChallengeIds, challengeId]
        };
        const rewards = await this.evaluateRewards(updatedUser, { type: 'challenge' });
        finalUser = rewards.user;
        newUnlocks = rewards.newUnlocks;
        await this.updateUser(finalUser);
    }

    // 3. Create Submission (Simulated)
    const submission: ChallengeSubmission = {
        id: Math.random().toString(36).substr(2, 9),
        challengeId,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.name}`,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-skater-doing-a-trick-at-a-skate-park-4260-large.mp4', // Mock uploaded video
        thumbnailUrl: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?q=80&w=400&auto=format&fit=crop',
        date: 'Just now'
    };

    const jsonSub = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    const submissions: ChallengeSubmission[] = jsonSub ? JSON.parse(jsonSub) : [];
    submissions.unshift(submission);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    
    return { newUnlocks, user: finalUser };
  }

  // --- MENTORSHIP & BOOKINGS ---
  
  // Helper to calculate badges based on stats
  private calculateMentorBadges(mentor: Mentor): MentorBadge[] {
    const badges: MentorBadge[] = [];
    if (mentor.reviewCount > 0 && mentor.rating >= 4.8) badges.push('TOP_RATED');
    if (mentor.studentsTrained > 20) badges.push('VETERAN');
    if (mentor.studentsTrained > 5 && mentor.rating >= 4.5 && !badges.includes('VETERAN')) badges.push('RISING_STAR');
    if (mentor.studentsTrained > 10 && mentor.reviewCount > 5) badges.push('COMMUNITY_FAV');
    
    // Mock check for verified pro status
    if (mentor.rate > 1000 && mentor.rating > 4.5) badges.push('VERIFIED_PRO');
    
    return badges;
  }

  async getMentors(): Promise<Mentor[]> {
    const json = localStorage.getItem(STORAGE_KEYS.MENTORS);
    let mentors: Mentor[] = json ? JSON.parse(json) : [];
    
    // Seed mentors if empty
    if (mentors.length === 0) {
      mentors = [
        { id: 'm1', userId: 'u-coach1', name: 'Vikram S.', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Vikram', disciplines: [Discipline.SKATE], rate: 800, bio: '10 years of street skating. I can teach you ollies, flips, and grinds.', rating: 4.8, reviewCount: 24, earnings: 12000, studentsTrained: 15, badges: [] },
        { id: 'm2', userId: 'u-coach2', name: 'Zoya F.', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Zoya', disciplines: [Discipline.DOWNHILL], rate: 1200, bio: 'Downhill specialist. Learn to slide safely at high speeds.', rating: 5.0, reviewCount: 12, earnings: 8400, studentsTrained: 8, badges: [] },
        { id: 'm3', userId: 'u-coach3', name: 'Kabir B.', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Kabir', disciplines: [Discipline.SKATE, Discipline.DOWNHILL], rate: 1000, bio: 'All terrain ripper. Skatepark basics to hill bombing.', rating: 4.6, reviewCount: 30, earnings: 18000, studentsTrained: 22, badges: [] }
      ];
    }

    // Ensure badges are up to date
    mentors = mentors.map(m => ({ ...m, badges: this.calculateMentorBadges(m) }));
    localStorage.setItem(STORAGE_KEYS.MENTORS, JSON.stringify(mentors));
    
    return mentors;
  }

  async applyToBecomeMentor(data: { rate: number, bio: string, experience: string, style: string, video: string }): Promise<User> {
    await this.delay(800);
    const user = await this.getUser();
    
    // Mock Level Check (in production this would be strict)
    if (user.level < 5) {
        throw new Error("You must be at least Level 5 to apply.");
    }

    // Check if already applied
    if (user.mentorApplication && user.mentorApplication.status === 'pending') {
        throw new Error("You already have a pending application.");
    }

    const application: MentorApplication = {
        status: 'pending',
        date: new Date().toISOString(),
        experience: data.experience,
        videoUrl: data.video,
        style: data.style,
        rate: data.rate,
        bio: data.bio
    };

    const updatedUser = { ...user, mentorApplication: application };
    return this.updateUser(updatedUser);
  }

  async getPendingMentorApplications(): Promise<{ user: User, application: MentorApplication }[]> {
      await this.delay(300);
      const user = await this.getUser();
      const apps = [];
      
      // Add current user if pending
      if (user.mentorApplication && user.mentorApplication.status === 'pending') {
          apps.push({ user, application: user.mentorApplication });
      }

      // Add a mock application if none exists for demo purposes
      if (apps.length === 0 && !user.isMentor) {
          apps.push({
              user: { ...user, id: 'u-mock-applicant', name: 'Rohan D.', level: 8, location: 'Bangalore' } as User,
              application: {
                  status: 'pending',
                  date: new Date().toISOString(),
                  experience: '5 years of downhill racing. Podium finish at Nandi 2023.',
                  videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-skateboarding-on-a-road-4263-large.mp4',
                  style: 'Technical and safety-focused.',
                  rate: 800,
                  bio: 'Teaching speed control and pre-drifts.'
              } as MentorApplication
          });
      }

      return apps;
  }

  async reviewMentorApplication(userId: string, approved: boolean): Promise<void> {
    await this.delay(600);
    const currentUser = await this.getUser();
    
    if (currentUser.id === userId && currentUser.mentorApplication) {
        if (approved) {
             const mentors = await this.getMentors();
             const app = currentUser.mentorApplication!;
             const newMentor: Mentor = {
                 id: `m-${userId}`,
                 userId: userId,
                 name: currentUser.name,
                 avatar: currentUser.avatar || '',
                 disciplines: currentUser.disciplines,
                 rate: app.rate,
                 bio: app.bio,
                 rating: 5.0, 
                 reviewCount: 0,
                 earnings: 0,
                 studentsTrained: 0,
                 badges: ['RISING_STAR']
             };
             mentors.push(newMentor);
             localStorage.setItem(STORAGE_KEYS.MENTORS, JSON.stringify(mentors));
             
             currentUser.isMentor = true;
             currentUser.mentorApplication!.status = 'approved';
        } else {
             currentUser.mentorApplication!.status = 'rejected';
        }
        await this.updateUser(currentUser);
    } 
  }

  async bookMentor(mentorId: string, date: string, time: string): Promise<Booking> {
    await this.delay(1000);
    const user = await this.getUser();
    const mentors = await this.getMentors();
    const mentorIndex = mentors.findIndex(m => m.id === mentorId);
    
    if (mentorIndex === -1) throw new Error("Mentor not found");
    
    const mentor = mentors[mentorIndex];
    const fee = mentor.rate;
    const commission = fee * 0.10; // 10% commission
    const netEarnings = fee - commission;

    // Create Booking
    const booking: Booking = {
        id: Math.random().toString(36).substr(2, 9),
        mentorId: mentor.id,
        studentId: user.id,
        studentName: user.name,
        date,
        time,
        status: 'confirmed',
        amount: fee,
        commission
    };

    // Store Booking
    const bookingsJson = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    const bookings: Booking[] = bookingsJson ? JSON.parse(bookingsJson) : [];
    bookings.push(booking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    // Update Mentor Stats
    mentors[mentorIndex].earnings += netEarnings;
    mentors[mentorIndex].studentsTrained += 1;
    // Recalculate badges after stats update
    mentors[mentorIndex].badges = this.calculateMentorBadges(mentors[mentorIndex]);
    
    localStorage.setItem(STORAGE_KEYS.MENTORS, JSON.stringify(mentors));

    return booking;
  }

  async getUserBookings(): Promise<Booking[]> {
    const user = await this.getUser();
    const bookingsJson = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    const bookings: Booking[] = bookingsJson ? JSON.parse(bookingsJson) : [];
    
    // Return bookings where user is student OR user is mentor (via mentorId lookup)
    const mentors = await this.getMentors();
    const myMentorProfile = mentors.find(m => m.userId === user.id);
    
    return bookings.filter(b => b.studentId === user.id || (myMentorProfile && b.mentorId === myMentorProfile.id));
  }

  async getMyMentorProfile(): Promise<Mentor | undefined> {
    const user = await this.getUser();
    const mentors = await this.getMentors();
    return mentors.find(m => m.userId === user.id);
  }

  // Spot Management
  async getSpots(): Promise<Spot[]> {
    const json = localStorage.getItem(STORAGE_KEYS.SPOTS);
    let storedSpots: Spot[] = [];
    
    if (json) {
        try {
            storedSpots = JSON.parse(json);
        } catch (e) {
            console.error("Error parsing spots", e);
            storedSpots = [];
        }
    }

    const storedMap = new Map(storedSpots.map(s => [s.id, s]));
    
    const mergedSpots = MOCK_SPOTS.map(mockSpot => {
      const stored = storedMap.get(mockSpot.id);
      if (stored) {
        return {
          ...mockSpot, 
          sessions: stored.sessions || [], 
          reviews: stored.reviews || [],
          rating: stored.rating || mockSpot.rating, 
          isVerified: stored.isVerified,
          verificationStatus: stored.verificationStatus,
          verificationNote: stored.verificationNote,
        };
      }
      return mockSpot;
    });

    const mockIds = new Set(MOCK_SPOTS.map(s => s.id));
    const userCreatedSpots = storedSpots.filter(s => !mockIds.has(s.id));
    
    const finalSpots = [...mergedSpots, ...userCreatedSpots];
    
    localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify(finalSpots));

    return finalSpots;
  }

  async saveSpot(spot: Spot): Promise<Spot> {
    await this.delay(500);
    const spots = await this.getSpots();
    const index = spots.findIndex(s => s.id === spot.id);
    
    if (index >= 0) {
      spots[index] = spot;
    } else {
      spots.unshift(spot);
    }
    
    localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify(spots));
    return spot;
  }

  async updateVerification(spotId: string, status: VerificationStatus): Promise<Spot> {
    const spots = await this.getSpots();
    const index = spots.findIndex(s => s.id === spotId);
    if (index > -1) {
      spots[index].verificationStatus = status;
      spots[index].isVerified = status === VerificationStatus.VERIFIED;
      localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify(spots));
      return spots[index];
    }
    throw new Error("Spot not found");
  }

  // Image Generation Caching
  async getStateCovers(): Promise<Record<string, string>> {
    const json = localStorage.getItem(STORAGE_KEYS.STATE_COVERS);
    return json ? JSON.parse(json) : {};
  }

  async saveStateCover(stateName: string, imageUrl: string): Promise<Record<string, string>> {
    const covers = await this.getStateCovers();
    covers[stateName] = imageUrl;
    localStorage.setItem(STORAGE_KEYS.STATE_COVERS, JSON.stringify(covers));
    return covers;
  }

  // Daily Notes Management
  async getDailyNotes(): Promise<DailyNote[]> {
    const json = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!json) return [];
    try {
      const notes: DailyNote[] = JSON.parse(json);
      return notes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (e) {
      return [];
    }
  }

  async getLatestNote(): Promise<DailyNote | null> {
    const notes = await this.getDailyNotes();
    return notes.length > 0 ? notes[0] : null;
  }

  async saveDailyNote(text: string): Promise<DailyNote> {
    await this.delay(300);
    const user = await this.getUser();
    const notes = await this.getDailyNotes();
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const existingIndex = notes.findIndex(n => n.date === today);
    let note: DailyNote;

    if (existingIndex > -1) {
        notes[existingIndex].text = text;
        notes[existingIndex].timestamp = now;
        note = notes[existingIndex];
    } else {
        note = {
            id: Math.random().toString(36).substr(2, 9),
            userId: user.id,
            date: today,
            text,
            timestamp: now
        };
        notes.unshift(note);
    }
    
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    return note;
  }
}

export const backend = new MockBackend();
