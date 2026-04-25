import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  LayoutDashboard, 
  LogOut, 
  User as UserIcon,
  Bell,
  Menu,
  X,
  PlusCircle,
  BarChart3,
  Search,
  Send,
  ShieldCheck,
  Command,
  Globe,
  Heart,
  Video
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CommandCenter } from './CommandCenter';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings?: any;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, settings }) => {
  const { user, isAdmin, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Members', icon: Users, adminOnly: true },
    { id: 'messages', label: 'Messaging', icon: MessageSquare },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'feedback', label: 'Feedback', icon: Bell },
    { id: 'media', label: 'Media Center', icon: Video },
    { id: 'hub', label: 'Supporters Hub', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Globe, adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-bg-secondary flex flex-col md:flex-row font-sans text-apc-blue selection:bg-apc-blue/10">
      {isAdmin && <CommandCenter onNavigate={setActiveTab} />}
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-apc-blue border-r border-white/10 p-8 space-y-10 sticky top-0 h-screen text-white shadow-2xl relative overflow-hidden">
        {/* Abstract background for sidebar */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-apc-green/20 rounded-full blur-3xl -ml-16 -mb-16" />

        <div className="flex items-center space-x-4 px-2 relative z-10">
          <div className="w-12 h-12 apc-gradient-green rounded-2xl flex items-center justify-center shadow-lg shadow-black/20 overflow-hidden shrink-0">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
            ) : (
              <Send className="w-6 h-6 text-apc-gold" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tighter leading-none">{settings?.campaignTitle || "APC"}</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-apc-gold/80">{settings?.campaignSubtitle || "Campaign Portal"}</span>
          </div>
        </div>

        <nav className="flex-1 space-y-3 relative z-10 overflow-y-auto custom-scrollbar pr-2 -mr-2">
           {/* Command Center Hint */}
          <button 
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white/50 hover:bg-white/10 hover:text-white transition-all text-sm mb-6"
          >
            <div className="flex items-center space-x-3">
              <Search className="w-4 h-4" />
              <span className="font-bold tracking-tight">Quick Search</span>
            </div>
            <div className="flex items-center space-x-1 opacity-60">
              <Command className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase">K</span>
            </div>
          </button>

          {navItems.filter(item => !item.adminOnly || isAdmin).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-white text-apc-blue font-bold shadow-xl shadow-black/20 scale-[1.02]' 
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="text-sm tracking-wide">{item.label}</span>
              {activeTab === item.id && (
                <motion.div layoutId="activeInd" className="ml-auto w-1.5 h-1.5 rounded-full bg-apc-green shadow-sm shadow-apc-green/50" />
              )}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/10 space-y-6 relative z-10">
          <div className="flex items-center space-x-4 px-2 bg-white/5 p-4 rounded-3xl border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <UserIcon className="w-7 h-7 text-apc-gold" />
            </div>
            <div className="flex flex-col overflow-hidden text-left">
              <span className="text-sm font-bold truncate tracking-tight">{user?.fullName || 'Member'}</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-apc-green/80 flex items-center">
                <ShieldCheck className="w-3 h-3 mr-1" />
                {user?.role || 'Supporter'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center space-x-4 px-4 py-3.5 text-apc-red/80 hover:text-white hover:bg-apc-red rounded-2xl transition-all duration-300 font-bold text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden flex items-center justify-between p-4 bg-apc-blue border-b border-white/10 sticky top-0 z-50 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 apc-gradient-green rounded-lg flex items-center justify-center overflow-hidden">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </div>
          <span className="font-extrabold tracking-tighter uppercase">{settings?.campaignTitle || "APC PORTAL"}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => logout()}
            className="p-2 text-apc-red/80"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-white/10 rounded-lg"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-apc-blue border-b border-white/10 absolute top-14 left-0 right-0 z-40 overflow-hidden shadow-2xl"
          >
            <div className="p-4 space-y-2">
              {navItems.filter(item => !item.adminOnly || isAdmin).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-4 px-4 py-4 rounded-2xl font-bold transition-all ${
                    activeTab === item.id ? 'bg-white text-apc-blue shadow-lg' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
              <button 
                onClick={() => logout()}
                className="w-full flex items-center space-x-4 px-4 py-4 text-apc-red/80 font-bold"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen relative bg-bg-secondary custom-scrollbar">
        <div className="noise-bg absolute inset-0 z-0 pointer-events-none" />
        <div className="max-w-7xl mx-auto p-4 md:p-10 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};
