
import { create } from 'zustand';
import { backend } from './services/mockBackend.ts';
import { User, Spot, ExtendedSession, Challenge, Skill, Quest, Discipline, DailyNote, Mentor } from './types.ts';
import { SKILL_LIBRARY } from './constants.tsx';

interface AppState {
  // Data State
  user: User | null;
  location: { lat: number; lng: number } | null;
  spots: Spot[];
  sessions: ExtendedSession[];
  challenges: (Challenge & { spotName: string })[];
  quests: Quest[];
  skills: Skill[]; // Merged library + custom
  mentors: Mentor[];
  notes: DailyNote[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializeData: () => Promise<void>;
  setUserLocation: (lat: number, lng: number) => void;
  refreshSpots: () => Promise<void>;
  refreshSessions: () => Promise<void>;
  updateUser: (user: User) => void;
  addNewSpot: (spotData: Partial<Spot>) => Promise<Spot>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  location: null,
  spots: [],
  sessions: [],
  challenges: [],
  quests: [],
  skills: [],
  mentors: [],
  notes: [],
  isLoading: true,
  error: null,

  initializeData: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log("Store: Initializing Data...");
      const [user, spots, sessions, rawChallenges, quests, customSkills, mentors, notes] = await Promise.all([
        backend.getUser(),
        backend.getSpots(),
        backend.getAllSessions(),
        backend.getAllChallenges(),
        backend.getDailyQuests(),
        backend.getCustomSkills(),
        backend.getMentors(),
        backend.getDailyNotes()
      ]);

      // Enrich challenges with spot names immediately
      const enrichedChallenges = rawChallenges.map(c => {
        const spot = spots.find(s => s.id === c.spotId);
        return { ...c, spotName: spot ? spot.name : 'Unknown Spot' };
      });

      // Merge skills
      const allSkills = [...SKILL_LIBRARY, ...customSkills];

      set({ 
        user, 
        spots, 
        sessions, 
        challenges: enrichedChallenges, 
        quests, 
        skills: allSkills,
        mentors,
        notes,
        isLoading: false 
      });
      console.log("Store: Initialization Complete", { user, spotsCount: spots.length });
    } catch (err) {
      console.error("Store: Initialization Failed", err);
      set({ error: "Failed to load application data. Check connection.", isLoading: false });
    }
  },

  setUserLocation: (lat, lng) => {
    console.log("Store: Updating Location", { lat, lng });
    set({ location: { lat, lng } });
  },
  
  refreshSpots: async () => {
      const spots = await backend.getSpots();
      set({ spots });
  },

  refreshSessions: async () => {
      const sessions = await backend.getAllSessions();
      set({ sessions });
      // Spots depend on sessions for badges, so refresh spots too
      get().refreshSpots();
  },

  updateUser: (user: User) => {
      set({ user });
  },

  addNewSpot: async (spotData: Partial<Spot>) => {
      const newSpot = await backend.addSpot(spotData);
      // Refresh spots to ensure state consistency
      await get().refreshSpots();
      return newSpot;
  }
}));
