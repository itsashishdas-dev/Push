import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import SpotsView from './views/SpotsView';
import SkillsView from './views/SkillsView';
import ProfileView from './views/ProfileView';
import MentorshipView from './views/MentorshipView';
import ChallengesView from './views/ChallengesView';
import AdminDashboardView from './views/AdminDashboardView';
import LoginView from './views/LoginView';
import OnboardingView from './views/OnboardingView';
import PrivacyPolicyView from './views/PrivacyPolicyView';
import { backend } from './services/mockBackend';
import { User } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('spots');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await backend.isLoggedIn();
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        const u = await backend.getUser();
        setUser(u);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async () => {
    const u = await backend.login();
    setUser(u);
    setIsLoggedIn(true);
  };

  const handleOnboardingComplete = async (onboardingData: Partial<User>) => {
    const updatedUser = await backend.completeOnboarding(onboardingData);
    setUser(updatedUser);
  };

  const handleLogout = async () => {
    await backend.logout();
    setIsLoggedIn(false);
    setUser(null);
    setActiveTab('spots');
  };

  if (isLoggedIn === null) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-black">
        <div className="text-white font-black italic uppercase tracking-tighter text-4xl animate-pulse">PUSH</div>
      </div>
    );
  }

  if (showPrivacy) {
    return <PrivacyPolicyView onBack={() => setShowPrivacy(false)} />;
  }

  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} onShowPrivacy={() => setShowPrivacy(true)} />;
  }

  if (user && !user.onboardingComplete) {
    return <OnboardingView onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-black text-slate-100 overflow-hidden relative">
      {/* Navigation - Slides away in Admin mode */}
      <div className={`z-[100] transition-transform duration-300 ${activeTab === 'admin' ? 'translate-y-full md:-translate-x-full absolute' : 'relative'}`}>
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Content Area - Preserves State of all tabs by keeping them mounted */}
      <main className="flex-1 h-full relative overflow-hidden z-10 bg-black">
        
        {/* Tab 1: Map / Spots */}
        <div 
          className={`absolute inset-0 w-full h-full overflow-y-auto hide-scrollbar transition-opacity duration-300 ${activeTab === 'spots' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
          aria-hidden={activeTab !== 'spots'}
        >
           <div className="w-full max-w-screen-2xl mx-auto min-h-full pb-24 md:pb-0">
              <SpotsView />
           </div>
        </div>

        {/* Tab 2: Challenges */}
        <div 
          className={`absolute inset-0 w-full h-full overflow-y-auto hide-scrollbar transition-opacity duration-300 ${activeTab === 'challenges' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
          aria-hidden={activeTab !== 'challenges'}
        >
           <div className="w-full max-w-screen-2xl mx-auto min-h-full pb-24 md:pb-0">
              <ChallengesView />
           </div>
        </div>

        {/* Tab 3: Mentors */}
        <div 
          className={`absolute inset-0 w-full h-full overflow-y-auto hide-scrollbar transition-opacity duration-300 ${activeTab === 'mentorship' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
          aria-hidden={activeTab !== 'mentorship'}
        >
           <div className="w-full max-w-screen-2xl mx-auto min-h-full pb-24 md:pb-0">
              <MentorshipView />
           </div>
        </div>

        {/* Tab 4: Journey / Skills */}
        <div 
          className={`absolute inset-0 w-full h-full overflow-y-auto hide-scrollbar transition-opacity duration-300 ${activeTab === 'skills' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
          aria-hidden={activeTab !== 'skills'}
        >
           <div className="w-full max-w-screen-2xl mx-auto min-h-full pb-24 md:pb-0">
              <SkillsView />
           </div>
        </div>

        {/* Tab 5: Profile */}
        <div 
          className={`absolute inset-0 w-full h-full overflow-y-auto hide-scrollbar transition-opacity duration-300 ${activeTab === 'profile' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
          aria-hidden={activeTab !== 'profile'}
        >
           <div className="w-full max-w-screen-2xl mx-auto min-h-full pb-24 md:pb-0">
              <ProfileView setActiveTab={setActiveTab} onLogout={handleLogout} />
           </div>
        </div>

        {/* Admin Overlay - Mounted when active, overlays content */}
        {activeTab === 'admin' && (
          <div className="absolute inset-0 w-full h-full bg-black z-50 overflow-y-auto animate-view">
             <AdminDashboardView onBack={() => setActiveTab('profile')} />
          </div>
        )}

      </main>

      {/* Global Background Accents - Lower Z-Index to prevent blocking */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30 z-0 pointer-events-none" />
      <div className="fixed -bottom-32 -left-32 w-64 h-64 bg-indigo-900/10 blur-[100px] pointer-events-none rounded-full z-0" />
      <div className="fixed -top-32 -right-32 w-64 h-64 bg-indigo-900/10 blur-[100px] pointer-events-none rounded-full z-0" />
    </div>
  );
};

export default App;