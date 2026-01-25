
import { create } from 'zustand';
import { backend } from './services/mockBackend.ts';
import { User, Spot, ExtendedSession, Challenge, Skill, Quest, Discipline, DailyNote, Mentor, AppView, ModalType } from './types.ts';
import { SKILL_LIBRARY } from './constants.tsx';

interface AppState {
  // --- CORE DATA ---
  user: User | null;
  location: { lat: number; lng: number } | null;
  spots: Spot[];
  sessions: ExtendedSession[];
  challenges: (Challenge & { spotName: string })[];
  quests: Quest[];
  skills: Skill[];
  mentors: Mentor[];
  notes: DailyNote[];
  
  // --- UI STATE (Single Source of Truth) ---
  currentView: AppView;
  activeModal: ModalType;
  selectedSpot: Spot | null;
  selectedSkill: Skill | null;
  
  // --- STATUS ---
  isLoading: boolean;
  error: string | null;
  
  // --- ACTIONS ---
  initializeData: () => Promise<void>;
  setUserLocation: (lat: number, lng: number) => void;
  updateUser: (user: User) => void;
  
  // UI Actions
  setView: (view: AppView) => void;
  openModal: (type: ModalType, data?: any) => void;
  closeModal: () => void;
  selectSpot: (spot: Spot | null) => void;
  selectSkill: (skill: Skill | null) => void;
  
  // Data Actions
  refreshSpots: () => Promise<void>;
  refreshSessions: () => Promise<void>;
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
  
  // UI Defaults
  currentView: 'MAP',
  activeModal: 'NONE',
  selectedSpot: null,
  selectedSkill: null,
  
  isLoading: true,
  error: null,

  initializeData: async () => {
    set({ isLoading: true, error: null });
    try {
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

      const enrichedChallenges = rawChallenges.map(c => {
        const spot = spots.find(s => s.id === c.spotId);
        return { ...c, spotName: spot ? spot.name : 'Unknown Spot' };
      });

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
    } catch (err) {
      set({ error: "System Failure. Data uplink severed.", isLoading: false });
    }
  },

  setUserLocation: (lat, lng) => {
    set({ location: { lat, lng } });
  },
  
  updateUser: (user: User) => {
      set({ user });
  },

  // --- UI ACTIONS ---
  setView: (view: AppView) => {
    // When switching views, ensure we reset overlay states if needed
    set({ currentView: view, activeModal: 'NONE' });
  },

  openModal: (type: ModalType, data?: any) => {
    set({ activeModal: type });
    // Handle data passing if strictly needed, usually store selection is enough
  },

  closeModal: () => {
    set({ activeModal: 'NONE' });
  },

  selectSpot: (spot: Spot | null) => {
    set({ selectedSpot: spot });
    if (spot) {
      // If we select a spot, we often want to show details immediately
      // But we let the UI decide if it opens a sheet or just highlights
    }
  },

  selectSkill: (skill: Skill | null) => {
    set({ selectedSkill: skill });
  },

  // --- DATA ACTIONS ---
  refreshSpots: async () => {
      const spots = await backend.getSpots();
      set({ spots });
  },

  refreshSessions: async () => {
      const sessions = await backend.getAllSessions();
      set({ sessions });
      get().refreshSpots();
  },

  addNewSpot: async (spotData: Partial<Spot>) => {
      const newSpot = await backend.addSpot(spotData);
      await get().refreshSpots();
      return newSpot;
  }
}));
