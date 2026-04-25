import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, Calendar, MessageSquare, Terminal, X, ChevronRight, Bell, Heart, Video, Film } from 'lucide-react';
import api from '../lib/api';

interface CommandCenterProps {
  onNavigate: (tab: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setResults(null);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/api/search?q=${query}`);
        setResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const allItems = results ? [
    ...(results.users || []).map((u: any) => ({ ...u, type: 'user' })),
    ...(results.events || []).map((e: any) => ({ ...e, type: 'event' })),
    ...(results.messages || []).map((m: any) => ({ ...m, type: 'message' })),
    ...(results.videos || []).map((v: any) => ({ ...v, type: 'video' }))
  ] : [];

  const handleSelect = (item: any) => {
    setIsOpen(false);
    if (item.type === 'user') onNavigate('users');
    if (item.type === 'event') onNavigate('events');
    if (item.type === 'message') onNavigate('messages');
    if (item.type === 'video') onNavigate('media');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-[32px] shadow-2xl z-[101] overflow-hidden border border-gray-100"
          >
            <div className="relative">
              <div className="p-6 border-b border-gray-100 flex items-center space-x-4">
                <Search className="w-6 h-6 text-apc-blue" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Command Intelligence Platform... (Search anything)"
                  className="w-full bg-transparent border-none outline-none text-xl font-bold text-apc-blue placeholder:text-gray-300"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                <div className="flex items-center space-x-1 px-2 py-1 bg-bg-secondary rounded-lg border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400">ESC</span>
                </div>
              </div>

              <div className="max-h-[450px] overflow-y-auto p-4 custom-scrollbar">
                {!query && (
                  <div className="space-y-6 p-4">
                    <div className="space-y-2 text-left">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Quick Navigation</p>
                       <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'Dashboard Intelligence', icon: Terminal, id: 'dashboard' },
                            { label: 'Personnel Management', icon: User, id: 'users' },
                            { label: 'Tactical Comms', icon: MessageSquare, id: 'messages' },
                            { label: 'Strategic Events', icon: Calendar, id: 'events' },
                             { label: 'Media Intelligence', icon: Video, id: 'media' },
                            { label: 'Feedback & Intel', icon: Bell, id: 'feedback' },
                            { label: 'Supporters Hub', icon: Heart, id: 'hub' },
                          ].map(item => (
                            <button
                              key={item.label}
                              onClick={() => { onNavigate(item.id); setIsOpen(false); }}
                              className="flex items-center space-x-3 p-4 rounded-2xl hover:bg-bg-secondary transition-all text-left group"
                            >
                              <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                <item.icon className="w-5 h-5 text-apc-blue" />
                              </div>
                              <span className="font-bold text-sm text-apc-blue">{item.label}</span>
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="p-12 text-center">
                    <div className="w-8 h-8 border-4 border-apc-blue/20 border-t-apc-blue rounded-full animate-spin mx-auto" />
                  </div>
                )}

                {results && allItems.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Tactical Hits ({allItems.length})</p>
                    <div className="space-y-1">
                      {allItems.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelect(item)}
                          className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-apc-blue hover:text-white transition-all group"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-xl bg-bg-secondary group-hover:bg-white/20 flex items-center justify-center">
                              {item.type === 'user' && <User className="w-5 h-5" />}
                              {item.type === 'event' && <Calendar className="w-5 h-5" />}
                              {item.type === 'message' && <MessageSquare className="w-5 h-5" />}
                              {item.type === 'video' && <Video className="w-5 h-5" />}
                            </div>
                            <div className="text-left">
                              <p className="font-bold text-sm">{item.fullName || item.title || item.content?.substring(0, 30)}</p>
                              <p className="text-[10px] uppercase font-black tracking-tight opacity-60">
                                {item.type} {item.ward && `• ${item.ward}`}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {query.length >= 2 && !loading && allItems.length === 0 && (
                  <div className="p-12 text-center">
                    <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="font-bold text-gray-400 italic">No actionable intelligence found for "{query}"</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-bg-secondary/50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                   <div className="flex items-center space-x-1">
                     <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded-md text-[10px] font-black text-gray-500 shadow-sm">↵</span>
                     <span className="text-[10px] font-bold text-gray-400">Select</span>
                   </div>
                   <div className="flex items-center space-x-1">
                     <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded-md text-[10px] font-black text-gray-500 shadow-sm">↑↓</span>
                     <span className="text-[10px] font-bold text-gray-400">Navigate</span>
                   </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-apc-green rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-apc-blue uppercase tracking-widest">Active Intelligence Session</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
