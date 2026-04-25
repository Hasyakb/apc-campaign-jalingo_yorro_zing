import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ChevronRight,
  Target,
  Users
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';

export const SupportersHub: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [polls, setPolls] = useState<any[]>([]);
  const [pledges, setPledges] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pledgeType, setPledgeType] = useState<'Commitment' | 'Volunteer'>('Commitment');
  const [pledgeNote, setPledgeNote] = useState('');

  const fetchData = async () => {
    try {
      const [pollsRes, pledgesRes, settingsRes] = await Promise.all([
        api.get('/api/polls'),
        api.get('/api/pledges'),
        api.get('/api/settings')
      ]);
      setPolls(pollsRes.data);
      setPledges(pledgesRes.data);
      setStats(settingsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVote = async (pollId: string, option: string) => {
    try {
      await api.post(`/api/polls/${pollId}/vote`, { option });
      showToast("Tactical Vote Recorded", "success");
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.error || "Vote failed", "error");
    }
  };

  const handlePledge = async () => {
    try {
      await api.post('/api/pledges', { 
        type: pledgeType, 
        note: pledgeNote 
      });
      showToast("Strategic Pledge Logged", "success");
      setPledgeNote('');
      fetchData();
    } catch (err: any) {
      showToast("Failed to log pledge", "error");
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-apc-blue font-black uppercase tracking-[0.4em]">Syncing Supporters Hub...</div>;

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-display font-black tracking-tighter text-apc-blue uppercase">Supporters Hub</h1>
          <p className="text-gray-500 font-medium tracking-tight">Your mission-critical coordination center for Jalingo/Yorro/Zing.</p>
        </div>
        <div className="px-6 py-3 bg-apc-gold/10 border border-apc-gold/20 rounded-2xl flex items-center space-x-3">
           <Zap className="w-5 h-5 text-apc-gold" />
           <span className="text-xs font-black uppercase tracking-widest text-apc-blue leading-none">Momentum Level: High</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Progress & Metrics */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[64px] shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 apc-gradient-blue opacity-5 rounded-full blur-[80px] -mr-32 -mt-32" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
               <div className="space-y-4">
                 <div className="inline-block px-4 py-1.5 bg-apc-blue text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Live Objective Tracking</div>
                 <h2 className="text-4xl font-display font-black text-apc-blue tracking-tighter leading-none">CAMPAIGN MOMENTUM</h2>
                 <p className="text-gray-400 font-medium max-w-sm">We are hitting critical density milestones across all three LGAs. See the tactical progress here.</p>
               </div>
               
               <div className="grid grid-cols-2 gap-4 flex-1 max-w-md">
                  <div className="bg-bg-secondary p-6 rounded-[32px] border border-gray-100 text-center">
                    <p className="text-3xl font-display font-black text-apc-blue">{stats?.landingStat1Value || '1.2M+'}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Reach</p>
                  </div>
                  <div className="bg-bg-secondary p-6 rounded-[32px] border border-gray-100 text-center">
                    <p className="text-3xl font-display font-black text-apc-green">{stats?.landingStat2Value || '42'}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Key Sectors</p>
                  </div>
               </div>
            </div>

            <div className="mt-12 space-y-6 relative z-10">
               <div>
                 <div className="flex justify-between mb-3 items-end">
                    <p className="text-[10px] font-black uppercase tracking-widest text-apc-blue">Ward Saturation Index</p>
                    <p className="text-sm font-black text-apc-blue">78%</p>
                 </div>
                 <div className="h-4 w-full bg-bg-secondary rounded-full overflow-hidden p-1 border border-gray-50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '78%' }}
                      className="h-full apc-gradient-green rounded-full shadow-lg shadow-apc-green/20" 
                    />
                 </div>
               </div>
               <div>
                 <div className="flex justify-between mb-3 items-end">
                    <p className="text-[10px] font-black uppercase tracking-widest text-apc-blue">Supporter Enlistment Goal</p>
                    <p className="text-sm font-black text-apc-blue">64,200 / 100k</p>
                 </div>
                 <div className="h-4 w-full bg-bg-secondary rounded-full overflow-hidden p-1 border border-gray-50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '64%' }}
                      className="h-full apc-gradient-blue rounded-full shadow-lg shadow-apc-blue/20" 
                    />
                 </div>
               </div>
            </div>
          </div>

          {/* Active Polls */}
          <div className="space-y-6">
             <div className="flex items-center space-x-3 px-2">
                <BarChart3 className="w-6 h-6 text-apc-blue" />
                <h3 className="text-xl font-black text-apc-blue uppercase tracking-tight">Active Intelligence Gathering</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                {polls.map(poll => {
                  const totalVotes = Object.values(poll.results).reduce((a: any, b: any) => a + b, 0) as number;
                  const hasVoted = poll.voters.includes(user?.id);
                  
                  return (
                    <motion.div 
                      key={poll.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-8"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <h4 className="text-2xl font-display font-black text-apc-blue leading-tight uppercase max-w-lg">{poll.question}</h4>
                         {hasVoted && (
                           <div className="flex items-center space-x-2 text-apc-green px-4 py-2 bg-apc-green/10 rounded-2xl">
                             <CheckCircle2 className="w-4 h-4" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Vote Registered</span>
                           </div>
                         )}
                      </div>

                      <div className="space-y-4">
                        {poll.options.map((option: string) => {
                          const votes = (poll.results[option] || 0) as number;
                          const percent = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                          
                          return (
                            <button
                              key={option}
                              disabled={hasVoted}
                              onClick={() => handleVote(poll.id, option)}
                              className={`w-full group relative flex flex-col p-6 rounded-[32px] border transition-all ${
                                hasVoted 
                                ? 'bg-bg-secondary border-gray-100 cursor-default' 
                                : 'bg-white border-gray-100 hover:border-apc-blue hover:shadow-lg'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-2 relative z-10">
                                <span className={`font-bold transition-colors ${hasVoted ? 'text-apc-blue' : 'group-hover:text-apc-blue'}`}>{option}</span>
                                {hasVoted && <span className="text-xs font-black text-apc-blue">{Math.round(percent)}%</span>}
                              </div>
                              {hasVoted && (
                                <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
                                   <motion.div 
                                     initial={{ width: 0 }}
                                     animate={{ width: `${percent}%` }}
                                     className="h-full bg-apc-blue/5 border-r border-apc-blue/10"
                                   />
                                </div>
                              )}
                              {!hasVoted && (
                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ChevronRight className="w-5 h-5 text-apc-blue" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between pt-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-t border-gray-50">
                         <span>Collective Intelligence: {totalVotes} Contributions</span>
                         <span className="flex items-center space-x-1">
                           <ShieldCheck className="w-3 h-3" />
                           <span>Tactically Verified Session</span>
                         </span>
                      </div>
                    </motion.div>
                  );
                })}
             </div>
          </div>
        </div>

        {/* Sidebar: Pledges & Engagement */}
        <div className="space-y-8">
           {/* Pledge Support */}
           <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-apc-blue p-10 rounded-[48px] text-white shadow-2xl shadow-apc-blue/20 space-y-8 relative overflow-hidden"
           >
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mb-24 -mr-24" />
              
              <div className="space-y-2 relative z-10">
                 <div className="p-3 bg-white/10 rounded-2xl w-fit">
                    <Heart className="w-6 h-6 text-apc-gold" />
                 </div>
                 <h3 className="text-2xl font-display font-black uppercase tracking-tighter">Strategic Pledge</h3>
                 <p className="text-white/60 text-sm font-medium leading-relaxed">Commit your tactical support to the architectural transformation of Jalingo/Yorro/Zing.</p>
              </div>

              <div className="space-y-4 relative z-10">
                 <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setPledgeType('Commitment')}
                      className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        pledgeType === 'Commitment' ? 'bg-apc-gold text-apc-blue' : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      Pledge Vote
                    </button>
                    <button 
                      onClick={() => setPledgeType('Volunteer')}
                      className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        pledgeType === 'Volunteer' ? 'bg-apc-gold text-apc-blue' : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      Volunteer
                    </button>
                 </div>
                 <textarea 
                   placeholder="Tactical notes (e.g. 'I will mobilize my family in Turaki A')"
                   className="w-full h-32 px-6 py-4 bg-white/5 border border-white/10 rounded-[32px] focus:ring-2 focus:ring-apc-gold outline-none text-sm font-bold placeholder:text-white/20 resize-none text-white"
                   value={pledgeNote}
                   onChange={e => setPledgeNote(e.target.value)}
                 />
                 <button 
                   onClick={handlePledge}
                   disabled={!pledgeNote.trim()}
                   className="w-full py-5 bg-white text-apc-blue rounded-[28px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-xs disabled:opacity-50"
                 >
                   Log Strategic Pledge
                 </button>
              </div>
           </motion.div>

           {/* User's Pledge History */}
           {pledges.length > 0 && (
             <div className="bg-white p-8 rounded-[48px] shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center space-x-3">
                   <Target className="w-5 h-5 text-apc-blue" />
                   <h4 className="text-sm font-black text-apc-blue uppercase tracking-widest">Enlistment Log</h4>
                </div>
                <div className="space-y-4">
                   {pledges.map((pledge, i) => (
                     <div key={i} className="p-4 bg-bg-secondary rounded-2xl border border-gray-50 flex items-start space-x-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-apc-green shrink-0" />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase tracking-widest text-apc-blue">{pledge.type}</p>
                           <p className="text-xs font-bold text-gray-500 leading-tight">"{pledge.note}"</p>
                           <p className="text-[8px] font-bold text-gray-300 uppercase tracking-tight">{new Date(pledge.createdAt).toLocaleDateString()}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {/* Recruit Friends CTA */}
           <div className="p-10 bg-apc-green rounded-[48px] text-white shadow-xl shadow-apc-green/20 relative overflow-hidden group">
              <Users className="absolute -right-8 -top-8 w-40 h-40 opacity-10 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10 space-y-6">
                <h3 className="text-2xl font-display font-black uppercase tracking-tighter leading-none italic">Recruit <br />Intelligence.</h3>
                <p className="text-white/70 text-xs font-medium leading-relaxed">Growth is our architecture. Recruit 5 friends to secure the mandate.</p>
                <button className="w-full py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/20 transition-all">
                   Share Recruitment Link
                </button>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
