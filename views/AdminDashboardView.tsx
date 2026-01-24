import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ShieldCheck, 
  MapPin, 
  Users, 
  Check, 
  X, 
  Trash2, 
  Edit, 
  AlertCircle, 
  BarChart3, 
  Activity, 
  Database,
  Search,
  Filter,
  FileText,
  Play
} from 'lucide-react';
import { Spot, VerificationStatus, Discipline, MentorApplication, User } from '../types';
import { backend } from '../services/mockBackend';

interface AdminDashboardViewProps {
  onBack: () => void;
}

const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onBack }) => {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [mentorApps, setMentorApps] = useState<{ user: User, application: MentorApplication }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'verifications' | 'spots' | 'users' | 'mentor-apps'>('verifications');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const allSpots = await backend.getSpots();
    const pendingApps = await backend.getPendingMentorApplications();
    setSpots(allSpots);
    setMentorApps(pendingApps);
    setIsLoading(false);
  };

  const handleAction = async (spotId: string, status: VerificationStatus) => {
    await backend.updateVerification(spotId, status);
    loadData();
  };

  const handleDeleteSpot = async (spotId: string) => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this spot? This action cannot be undone.")) return;
    
    // Using simple filter for mock deletion since we don't have a backend.deleteSpot
    const allSpots = await backend.getSpots();
    const filtered = allSpots.filter(s => s.id !== spotId);
    localStorage.setItem('spots_spots_data', JSON.stringify(filtered));
    loadData();
  };

  const handleReviewApp = async (userId: string, approved: boolean) => {
      await backend.reviewMentorApplication(userId, approved);
      loadData();
  };

  const pendingSpots = spots.filter(s => s.verificationStatus === VerificationStatus.PENDING);
  const filteredSpots = spots.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-24 pt-6 md:pb-10 space-y-8 px-4 animate-view min-h-full">
      {/* Header */}
      <header className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 active:scale-95 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">Admin Portal</h1>
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em]">Management & Intelligence</p>
        </div>
      </header>

      {/* Quick Stats */}
      <section className="grid grid-cols-4 gap-2">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-1">
          <Database size={14} className="text-indigo-400" />
          <div className="text-lg font-black italic">{spots.length}</div>
          <div className="text-[7px] text-slate-500 font-black uppercase">Spots</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-1">
          <AlertCircle size={14} className="text-amber-500" />
          <div className="text-lg font-black italic">{pendingSpots.length}</div>
          <div className="text-[7px] text-slate-500 font-black uppercase">Verify</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-1">
          <Users size={14} className="text-blue-400" />
          <div className="text-lg font-black italic">{mentorApps.length}</div>
          <div className="text-[7px] text-slate-500 font-black uppercase">Apps</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-1">
          <Activity size={14} className="text-green-500" />
          <div className="text-lg font-black italic">142</div>
          <div className="text-[7px] text-slate-500 font-black uppercase">Active</div>
        </div>
      </section>

      {/* View Selector */}
      <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 overflow-x-auto hide-scrollbar">
        {['verifications', 'mentor-apps', 'spots', 'users'].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t as any)}
            className={`flex-1 min-w-[80px] py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === t ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500'
            }`}
          >
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {activeTab === 'verifications' && (
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase italic tracking-widest text-slate-400 flex items-center gap-2">
              <ShieldCheck size={16} /> Verification Queue
            </h2>
            {pendingSpots.length === 0 ? (
              <div className="py-12 text-center bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
                <Check size={32} className="mx-auto text-slate-700 mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Queue is clear.</p>
              </div>
            ) : (
              pendingSpots.map(spot => (
                <div key={spot.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-black uppercase italic tracking-tight text-white">{spot.name}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                        <MapPin size={10} className="text-indigo-400" /> {spot.location.address}, {spot.state}
                      </p>
                    </div>
                    <span className="text-[8px] font-black uppercase bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20">
                      {spot.type}
                    </span>
                  </div>

                  {spot.verificationNote && (
                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                      <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1 italic">Submitter's Note:</p>
                      <p className="text-xs text-slate-300 italic">"{spot.verificationNote}"</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => handleAction(spot.id, VerificationStatus.REJECTED)}
                      className="flex-1 py-3 bg-slate-800 text-red-400 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                      <X size={14} /> Reject
                    </button>
                    <button 
                      onClick={() => handleAction(spot.id, VerificationStatus.VERIFIED)}
                      className="flex-[2] py-3 bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform"
                    >
                      <Check size={14} /> Approve Spot
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'mentor-apps' && (
            <div className="space-y-4">
                <h2 className="text-sm font-black uppercase italic tracking-widest text-slate-400 flex items-center gap-2">
                    <FileText size={16} /> Mentor Requests
                </h2>
                {mentorApps.length === 0 ? (
                    <div className="py-12 text-center bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
                        <Check size={32} className="mx-auto text-slate-700 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">No pending applications.</p>
                    </div>
                ) : (
                    mentorApps.map(({ user, application }, idx) => (
                        <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
                            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                                    <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase italic text-white leading-none">{user.name}</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Level {user.level} • {user.location}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-[8px] font-black uppercase text-indigo-400 tracking-widest mb-1">Experience</p>
                                    <p className="text-xs text-slate-300 leading-relaxed">{application.experience}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[8px] font-black uppercase text-indigo-400 tracking-widest mb-1">Style</p>
                                        <p className="text-xs text-slate-300">{application.style}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase text-indigo-400 tracking-widest mb-1">Rate</p>
                                        <p className="text-xs text-slate-300">₹{application.rate}/hr</p>
                                    </div>
                                </div>
                                
                                <div className="bg-slate-950 rounded-xl p-3 flex items-center justify-between border border-slate-800">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Play size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{application.videoUrl}</span>
                                    </div>
                                    <button className="text-[9px] font-black uppercase text-indigo-400 hover:text-white">View</button>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button 
                                onClick={() => handleReviewApp(user.id, false)}
                                className="flex-1 py-3 bg-slate-800 text-red-400 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                >
                                <X size={14} /> Deny
                                </button>
                                <button 
                                onClick={() => handleReviewApp(user.id, true)}
                                className="flex-[2] py-3 bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform"
                                >
                                <Check size={14} /> Approve Mentor
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {activeTab === 'spots' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                <input 
                  type="text" 
                  placeholder="Filter database..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              {filteredSpots.map(spot => (
                <div key={spot.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-slate-800 ${spot.type === Discipline.SKATE ? 'text-indigo-400' : 'text-amber-400'}`}>
                      {spot.type === Discipline.SKATE ? <Database size={18} /> : <Database size={18} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase italic text-white line-clamp-1">{spot.name}</h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase truncate">{spot.state}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => alert('Editing coming soon...')}
                      className="p-2 text-slate-500 hover:text-white transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteSpot(spot.id)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase italic tracking-tight text-white">Community Activity</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Weekly Snapshot</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Trick Uploads', value: '42', trend: '+12%', color: 'text-green-400' },
                  { label: 'Spot Submissions', value: '8', trend: '-2%', color: 'text-slate-400' },
                  { label: 'Community XP', value: '840k', trend: '+22%', color: 'text-indigo-400' }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</span>
                    <div className="text-right">
                      <div className="text-sm font-black italic text-white">{stat.value}</div>
                      <div className={`text-[8px] font-bold ${stat.color}`}>{stat.trend}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button className="w-full py-4 bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-700/50 flex items-center justify-center gap-2">
                  <Activity size={14} /> View Full Logs
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Recent Users</h3>
              {[
                { name: 'Arjun S.', location: 'Pune', xp: '14,500' },
                { name: 'Rahul V.', location: 'Mumbai', xp: '8,200' },
                { name: 'Simran K.', location: 'Delhi', xp: '12,000' }
              ].map((u, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                      <img src={`https://picsum.photos/seed/${u.name}/40`} alt="" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-white italic uppercase">{u.name}</h4>
                      <p className="text-[8px] text-slate-500 font-bold uppercase">{u.location}</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-black italic text-indigo-400">{u.xp} XP</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Safety Overlay Decor */}
      <div className="fixed top-0 left-0 w-full h-[2px] bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] z-50 pointer-events-none" />
    </div>
  );
};

export default AdminDashboardView;