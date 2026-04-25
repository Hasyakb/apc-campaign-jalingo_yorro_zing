import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AuthPage } from './pages/AuthPage';
import { LandingPage } from './pages/LandingPage';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { MembersList } from './pages/MembersList';
import { Messaging } from './pages/Messaging';
import { Events } from './pages/Events';
import { Feedback } from './pages/Feedback';
import { Settings } from './pages/Settings';
import { SupportersHub } from './pages/SupportersHub';
import { MediaCenter } from './pages/MediaCenter';
import api from './lib/api';
import { UserCheck, ShieldAlert, Clock, RefreshCw, LogOut } from 'lucide-react';
import { motion } from "framer-motion";

const AppContent: React.FC = () => {
  const { user, loading, fetchMe, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/api/settings');
        setSettings(res.data);
      } catch (err) {
        console.warn("Settings fetch failed in App");
      }
    };
    fetchSettings();
  }, []);

  const checkStatus = async () => {
    await fetchMe();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-apc-blue/20 border-t-apc-blue rounded-full animate-spin shadow-xl" />
          <div className="text-center">
            <p className="text-apc-blue font-black uppercase tracking-[0.3em] text-sm italic">Uplinking Comms</p>
            <p className="text-gray-400 font-medium text-xs">Accessing Tactical Personnel Database</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  if (!user.isApproved && user.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary p-6 relative overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute top-0 left-0 w-full h-full bg-apc-blue/5 -z-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-apc-green/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-apc-gold/10 rounded-full blur-[100px]" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-[48px] border border-gray-100 shadow-2xl max-w-lg w-full text-center space-y-8 relative"
        >
          <div className="w-24 h-24 apc-gradient-green rounded-[32px] flex items-center justify-center mx-auto shadow-xl shadow-apc-green/20 relative overflow-hidden">
             {settings?.logoUrl ? (
               <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-4" />
             ) : (
               <ShieldAlert className="w-12 h-12 text-white" />
             )}
             <div className="absolute inset-0 rounded-[32px] border-4 border-white/20 scale-110 animate-pulse" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-4xl font-black tracking-tighter text-apc-blue uppercase leading-none">Security Hold</h2>
            <p className="text-gray-500 font-medium tracking-tight px-4 underline decoration-apc-gold decoration-2 underline-offset-4">Your tactical profile is undergoing personnel verification.</p>
          </div>

          <div className="bg-bg-secondary p-6 rounded-[32px] text-left grid grid-cols-2 gap-4 border border-gray-50">
             <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Personnel</p>
               <p className="text-sm font-bold text-apc-blue truncate">{user.fullName}</p>
             </div>
             <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Assignment</p>
               <p className="text-sm font-bold text-apc-green uppercase tracking-tight">{user.role}</p>
             </div>
             <div className="col-span-2 space-y-1 pt-2 border-t border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tactical Sector</p>
                <p className="text-sm font-bold text-apc-blue">{user.ward}, {user.lga}</p>
             </div>
          </div>

          <div className="flex items-center justify-center space-x-3 text-xs font-bold text-gray-400">
             <Clock className="w-4 h-4 text-apc-gold" />
             <span className="uppercase tracking-widest italic">ETA: 1-12 Hours for Vetting</span>
          </div>

          <button 
            onClick={checkStatus}
            className="w-full py-5 bg-apc-blue text-white rounded-[24px] font-black uppercase tracking-[0.2em] shadow-xl shadow-apc-blue/20 hover:scale-[1.02] active:scale-95 transition-all text-xs flex items-center justify-center space-x-3"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Verifying Authorization...' : 'Check Authorization Status'}</span>
          </button>

          <button 
            onClick={() => logout()}
            className="w-full py-4 text-gray-400 hover:text-apc-red transition-colors font-black uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out & Go Back</span>
          </button>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'users': return <MembersList />;
      case 'messages': return <Messaging />;
      case 'events': return <Events />;
      case 'feedback': return <Feedback />;
      case 'settings': return <Settings />;
      case 'hub': return <SupportersHub />;
      case 'media': return <MediaCenter />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} settings={settings}>
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
