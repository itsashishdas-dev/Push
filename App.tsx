
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useAppStore } from './store.ts';
import { backend } from './services/mockBackend.ts';

// Components
import AppLayout from './components/AppLayout.tsx';
import AddSpotModal from './components/AddSpotModal.tsx';
import SpotPreviewCard from './components/SpotPreviewCard.tsx'; 
import CreateSessionModal from './components/CreateSessionModal.tsx';
import CreateChallengeModal from './components/CreateChallengeModal.tsx';
import ChatModal from './components/ChatModal.tsx';
import LocationPermissionModal from './components/LocationPermissionModal.tsx';

// Views
import SpotsView from './views/SpotsView.tsx';
import GridView from './views/GridView.tsx';
import ChallengesView from './views/ChallengesView.tsx';
import MentorshipView from './views/MentorshipView.tsx';
import JourneyView from './views/JourneyView.tsx';
import ProfileView from './views/ProfileView.tsx';
import CrewView from './views/CrewView.tsx';
import AdminDashboardView from './views/AdminDashboardView.tsx';
import LoginView from './views/LoginView.tsx';
import OnboardingView from './views/OnboardingView.tsx';
import PrivacyPolicyView from './views/PrivacyPolicyView.tsx';

// Services
import { VerificationService } from './services/verificationService.ts';
import { triggerHaptic } from './utils/haptics.ts';
import { playSound, setSoundEnabled } from './utils/audio.ts';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [crews, setCrews] = useState<any[]>([]);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  
  const { 
    user, 
    location,
    currentView, 
    previousView,
    activeModal, 
    selectedSpot,
    sessions,
    challenges, 
    initializeData, 
    setUserLocation, 
    updateUser, 
    closeModal,
    setView
  } = useAppStore();

  // --- INITIALIZATION ---
  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await backend.isLoggedIn();
      if (loggedIn) {
        setIsLoggedIn(true);
        initializeData();
        const allCrews = await backend.getAllCrews();
        setCrews(allCrews);
      } else {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []); // Only runs once on mount

  // Sync sound settings when user loads
  useEffect(() => {
      if (user) {
          setSoundEnabled(user.soundEnabled);
      }
  }, [user]);

  const handleLogin = async () => {
    const u = await backend.login();
    updateUser(u);
    setIsLoggedIn(true);
    initializeData();
  };

  const handleLogout = async () => {
    await backend.logout();
    setIsLoggedIn(false);
    updateUser(null as any);
  };

  const handleLocationAllow = () => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (pos) => {
                  setUserLocation(pos.coords.latitude, pos.coords.longitude);
                  setShowLocationPrompt(false);
                  playSound('radar_complete');
                  triggerHaptic('success');
              },
              (err) => {
                  console.warn("Location access denied or failed", err);
                  setShowLocationPrompt(false);
                  triggerHaptic('error');
                  // Optionally show a "Manual Entry" modal here
              },
              { enableHighAccuracy: true }
          );
      } else {
          setShowLocationPrompt(false);
      }
  };

  // --- RENDERING GUARDS ---
  if (isLoggedIn === null) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black gap-4">
        <div className="text-white font-bold tracking-widest text-sm animate-pulse">LOADING PUSH...</div>
      </div>
    );
  }

  if (showPrivacy) return <PrivacyPolicyView onBack={() => setShowPrivacy(false)} />;
  if (!isLoggedIn) return <LoginView onLogin={handleLogin} onShowPrivacy={() => setShowPrivacy(true)} />;
  if (user && !user.onboardingComplete) return <OnboardingView onComplete={async (d) => { const u = await backend.completeOnboarding(d); updateUser(u); }} />;

  // Filter data for selected spot
  const spotSessions = selectedSpot ? sessions.filter(s => s.spotId === selectedSpot.id) : [];
  const spotChallenges = selectedSpot ? challenges.filter(c => c.spotId === selectedSpot.id) : [];
  const spotCrew = selectedSpot ? crews.find(c => c.homeSpotId === selectedSpot.id) : undefined;

  // --- MAIN LAYOUT ---
  return (
    <AppLayout>
      {/* ACTIVE VIEW AREA */}
      {currentView === 'MAP' && <SpotsView />} 
      {currentView === 'LIST' && <GridView />}
      {currentView === 'CHALLENGES' && <ChallengesView onNavigate={(t) => setView(t as any)} />}
      {currentView === 'MENTORSHIP' && <MentorshipView />}
      {currentView === 'JOURNEY' && <JourneyView />}
      {currentView === 'PROFILE' && <ProfileView setActiveTab={(t) => setView(t as any)} onLogout={handleLogout} />}
      {currentView === 'CREW' && <CrewView onBack={() => setView(previousView || 'CHALLENGES')} />}
      {currentView === 'ADMIN' && <AdminDashboardView onBack={() => setView('PROFILE')} />}

      {/* GLOBAL OVERLAYS */}
      
      {/* Location Permission Modal */}
      {showLocationPrompt && (
          <LocationPermissionModal 
              onAllow={handleLocationAllow}
              onDeny={() => setShowLocationPrompt(false)}
          />
      )}
      
      {/* Spot Preview Card Overlay */}
      {activeModal === 'SPOT_DETAIL' && selectedSpot && (
         <>
            {/* Backdrop (Only for compact mode conceptually, but we can keep it global) */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-40 animate-[fadeIn_0.2s_ease-out] md:hidden" onClick={closeModal} />
            
            {/* Sheet / Panel */}
            <SpotPreviewCard 
                spot={selectedSpot}
                sessions={spotSessions}
                challenges={spotChallenges}
                crew={spotCrew}
                onClose={closeModal}
                onCheckIn={() => {
                    const check = VerificationService.canCheckIn(useAppStore.getState().location, selectedSpot);
                    if (check.allowed) { triggerHaptic('success'); playSound('success'); alert("Checked In! +10 XP"); }
                    else { triggerHaptic('error'); alert(check.reason); }
                }}
            />
         </>
      )}

      {activeModal === 'ADD_SPOT' && <AddSpotModal />}
      {activeModal === 'CREATE_SESSION' && <CreateSessionModal />}
      {activeModal === 'CREATE_CHALLENGE' && <CreateChallengeModal />}
      {activeModal === 'CHAT' && <ChatModal onClose={closeModal} />}
    </AppLayout>
  );
};

export default App;
