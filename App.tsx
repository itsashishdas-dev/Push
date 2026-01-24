import * as React from 'react';
import { useState, useEffect } from 'react';
import Navigation from './components/Navigation.tsx';
import SpotsView from './views/SpotsView.tsx';
import SkillsView from './views/SkillsView.tsx';
import ProfileView from './views/ProfileView.tsx';
import MentorshipView from './views/MentorshipView.tsx';
import ChallengesView from './views/ChallengesView.tsx';
import JourneyView from './views/JourneyView.tsx';
import AdminDashboardView from './views/AdminDashboardView.tsx';
import LoginView from './views/LoginView.tsx';
import OnboardingView from './views/OnboardingView.tsx';
import PrivacyPolicyView from './views/PrivacyPolicyView.tsx';
import { backend } from './services/mockBackend.ts';
import { User } from './types.ts';
import { useAppStore } from './store.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('spots');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  const { user, initializeData, setUserLocation, updateUser } = useAppStore();

  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await backend.isLoggedIn();
      if (loggedIn) {
        setIsLoggedIn(true);
        initializeData();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation(pos.coords.latitude, pos.coords.longitude),
                (err) => console.warn("Location access denied or failed", err),
                { enableHighAccuracy: true }
            );
        }
      } else {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

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
    setActiveTab('spots');
  };

  if (isLoggedIn === null) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black gap-4">
        <div className="text-white font-bold tracking-widest text-sm animate-pulse">LOADING PUSH...</div>
      </div>
    );
  }

  if (showPrivacy) return <PrivacyPolicyView onBack={() => setShowPrivacy(false)} />;
  if (!isLoggedIn) return <LoginView onLogin={handleLogin} onShowPrivacy={() => setShowPrivacy(true)} />;
  
  if (user && !user.onboardingComplete) {
    return <OnboardingView onComplete={async (d) => { 
        const u = await backend.completeOnboarding(d); 
        updateUser(u); 
    }} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'spots': return <SpotsView />;
      case 'challenges': return <ChallengesView />;
      case 'mentorship': return <MentorshipView />;
      case 'skills': return <SkillsView />;
      case 'journey': return <JourneyView />;
      case 'profile': return <ProfileView setActiveTab={setActiveTab} onLogout={handleLogout} />;
      case 'admin': return <AdminDashboardView onBack={() => setActiveTab('profile')} />;
      default: return <SpotsView />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black text-slate-100 overflow-hidden relative">
      <main className="flex-1 h-full relative overflow-hidden z-10">
        <div className="h-full w-full overflow-y-auto hide-scrollbar">
            <div className="max-w-screen-md mx-auto min-h-full pb-28 md:pb-0">
                {renderContent()}
            </div>
        </div>
      </main>

      <div className="z-[100] w-full border-t border-white/5 bg-black/80 backdrop-blur-xl">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default App;