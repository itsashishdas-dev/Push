
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

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('spots');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await backend.isLoggedIn();
      if (loggedIn) {
        const u = await backend.getUser();
        setUser(u);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async () => {
    const u = await backend.login();
    setUser(u);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await backend.logout();
    setIsLoggedIn(false);
    setUser(null);
    setActiveTab('spots');
  };

  if (isLoggedIn === null) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black gap-6">
        <div className="text-white font-black italic uppercase tracking-tighter text-6xl animate-pulse">PUSH</div>
        <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-indigo-500 w-1/2 animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>
    );
  }

  if (showPrivacy) return <PrivacyPolicyView onBack={() => setShowPrivacy(false)} />;
  if (!isLoggedIn) return <LoginView onLogin={handleLogin} onShowPrivacy={() => setShowPrivacy(true)} />;
  
  if (user && !user.onboardingComplete) {
    return <OnboardingView onComplete={async (d) => { 
        const u = await backend.completeOnboarding(d); 
        setUser(u); 
    }} />;
  }

  const isRetro = user?.retroModeEnabled;

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
    <div className={`flex flex-col md:flex-row h-screen w-full bg-black text-slate-100 overflow-hidden relative ${isRetro ? 'retro-mode' : ''}`}>
      {isRetro && <div className="scanlines" />}

      <div className={`z-[100] transition-transform duration-300 ${activeTab === 'admin' ? 'translate-y-full absolute' : 'relative'}`}>
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <main className="flex-1 h-full relative overflow-hidden z-10 bg-black">
        <div className="h-full w-full overflow-y-auto hide-scrollbar">
            <div className="max-w-screen-2xl mx-auto min-h-full pb-24 md:pb-0">
                {renderContent()}
            </div>
        </div>
      </main>

      {!isRetro && (
        <div className="fixed -bottom-32 -left-32 w-64 h-64 bg-indigo-900/10 blur-[100px] pointer-events-none rounded-full z-0" />
      )}
    </div>
  );
};

export default App;
