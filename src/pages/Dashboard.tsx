import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  MapPin,
  Clock,
  Target,
  LogOut
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

import { StrategicIntelligence } from '../components/StrategicIntelligence';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    delegates: 0,
    supporters: 0,
    pendingApproval: 0
  });
  const [wardData, setWardData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, settingsRes] = await Promise.all([
          isAdmin ? api.get('/api/users').catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
          api.get('/api/settings').catch(() => ({ data: null }))
        ]);
        
        const users = usersRes.data;
        setSettings(settingsRes.data);
        
        const total = users.length;
        const delegates = users.filter((u: any) => u.role === 'Delegate').length;
        const supporters = users.filter((u: any) => u.role === 'Supporter').length;
        const pending = users.filter((u: any) => !u.isApproved).length;

        setStats({ totalUsers: total, delegates, supporters, pendingApproval: pending });

        const counts: Record<string, number> = {};
        users.forEach((u: any) => {
          if (u.ward) counts[u.ward] = (counts[u.ward] || 0) + 1;
        });

        const chartData = Object.entries(counts).map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);
        setWardData(chartData);

        setRecentActivity(users.slice(0, 5));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen bg-bg-secondary"><div className="w-12 h-12 border-4 border-apc-blue/20 border-t-apc-blue rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 space-y-1 text-left">
          <h1 className="text-4xl font-extrabold tracking-tighter text-apc-blue uppercase">Campaign Intelligence</h1>
          <p className="text-gray-500 font-medium tracking-tight">Strategic Overview for Jalingo/Yorro/Zing Constituency</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 bg-white p-3 rounded-3xl shadow-xl shadow-black/[0.02] border border-gray-100">
            <div className="w-12 h-12 rounded-2xl apc-gradient-green flex items-center justify-center shadow-lg shadow-apc-green/20">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="pr-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">Status Report</p>
              <p className="text-sm font-bold text-apc-blue">Real-time Synchronized</p>
            </div>
          </div>
          <button 
            onClick={() => {
              // Sign out logic
              document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              window.location.reload();
            }}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-apc-red border border-gray-100 hover:bg-apc-red hover:text-white transition-all shadow-xl shadow-black/[0.02]"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>
      
      {/* Bento Grid Strategic Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {/* Core Momentum Card - Large */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:col-span-2 lg:col-span-3 bg-white p-10 rounded-[56px] border border-gray-100 shadow-xl shadow-black/[0.02] flex flex-col justify-between group overflow-hidden relative"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-apc-blue/5 rounded-full blur-3xl group-hover:bg-apc-blue/10 transition-colors" />
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-apc-blue rounded-2xl flex items-center justify-center shadow-lg shadow-apc-blue/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-apc-blue/60">Campaign Momentum</span>
            </div>
            <h3 className="text-7xl font-display font-black text-apc-blue tracking-tighter leading-none mb-4">
              92<span className="text-apc-green">%</span>
            </h3>
            <p className="text-gray-400 font-medium max-w-[240px] leading-relaxed">
              Strategic objective reach across Jalingo, Yorro, and Zing sectors.
            </p>
          </div>
          <div className="mt-8 flex items-center space-x-4 relative z-10">
             <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-gray-200" />
               ))}
             </div>
             <span className="text-xs font-bold text-apc-blue/60">+1.2k today</span>
          </div>
        </motion.div>

        {/* Tactical Personnel Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 lg:col-span-3 bg-apc-blue p-10 rounded-[56px] text-white flex flex-col justify-between relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,215,0,0.1),transparent)]" />
           <div className="relative z-10">
             <div className="flex items-center justify-between mb-8">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                 <Users className="w-6 h-6 text-apc-gold" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Total Operatives</span>
             </div>
             <div className="space-y-1">
               <p className="text-6xl font-display font-black tracking-tighter leading-none">{stats.totalUsers.toLocaleString()}</p>
               <div className="flex items-center space-x-2 text-apc-green">
                 <Target className="w-3 h-3" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Active Database</span>
               </div>
             </div>
           </div>
           <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                <p className="text-2xl font-black">{stats.delegates}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Delegates</p>
              </div>
              <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                <p className="text-2xl font-black">{stats.supporters}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Supporters</p>
              </div>
           </div>
        </motion.div>

        {/* AI Strategic Advisor - Vertical Accent */}
        <div className="md:col-span-4 lg:col-span-4">
          <StrategicIntelligence stats={stats} wardData={wardData} settings={settings} />
        </div>

        {/* Ward Performance Mini List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-4 lg:col-span-2 bg-white p-8 rounded-[48px] border border-gray-100 shadow-xl shadow-black/[0.02] flex flex-col justify-between"
        >
          <div>
            <h4 className="text-lg font-black text-apc-blue uppercase tracking-tight mb-6">Top Wards</h4>
            <div className="space-y-4">
              {wardData.slice(0, 4).map((ward, i) => (
                <div key={ward.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] font-black text-gray-300">0{i+1}</span>
                    <span className="font-bold text-sm text-apc-blue">{ward.name}</span>
                  </div>
                  <span className="text-xs font-black text-apc-green">{ward.value}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="mt-6 w-full py-4 bg-bg-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest text-apc-blue hover:bg-apc-blue hover:text-white transition-all">
            Full Sector Report
          </button>
        </motion.div>

        {/* Large Data Visualization */}
        <div className="md:col-span-4 lg:col-span-6">
          <div className="bg-white p-10 rounded-[64px] border border-gray-100 shadow-xl shadow-black/[0.02]">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-3xl font-display font-black tracking-tighter text-apc-blue uppercase">Growth Intelligence</h3>
                <p className="text-gray-400 font-medium">Personnel density mapping by strategic ward</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-apc-green" />
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Live Data Stream</span>
              </div>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wardData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }} />
                  <Tooltip 
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ borderRadius: '32px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[16, 16, 0, 0]} barSize={40}>
                    {wardData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#008751' : '#0050A1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
