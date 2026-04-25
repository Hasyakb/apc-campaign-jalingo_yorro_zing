import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  ShieldCheck, 
  Users, 
  Target, 
  TrendingUp, 
  Zap, 
  MapPin, 
  ArrowRight,
  Menu,
  X,
  Globe,
  Database, 
  Lock,
  FileText,
  Video,
  ExternalLink
} from 'lucide-react';
import { AuthPage } from './AuthPage';
import api from '../lib/api';
import Markdown from 'react-markdown';
import ReactPlayer from 'react-player';

export const LandingPage: React.FC = () => {
  const ReactPlayerAny = ReactPlayer as any;
  const [showAuth, setShowAuth] = useState(false);
  const [showManifesto, setShowManifesto] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/api/settings');
        setSettings(res.data);
      } catch (err) {
        console.error("Failed to load landing settings", err);
      }
    };
    fetchSettings();
  }, []);

  const getTikTokId = (url: string) => {
    if (!url || !url.includes('tiktok.com')) return null;
    try {
      const parts = url.split('/video/');
      if (parts.length > 1) {
        return parts[1].split('?')[0];
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const cleanVideoUrl = (url: string) => {
    if (!url) return '';
    const tikTokId = getTikTokId(url);
    if (tikTokId) return `https://www.tiktok.com/video/${tikTokId}`;
    return url;
  };

  if (showAuth) {
    return <AuthPage onBack={() => setShowAuth(false)} />;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-apc-blue selection:bg-apc-blue/10 overflow-x-hidden relative">
      <div className="noise-bg absolute inset-0 z-[1]" />
      {/* Dynamic Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-2xl border-b border-gray-100 px-6 py-6 transition-all duration-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-12 h-12 apc-gradient-green rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <Send className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xl tracking-tighter leading-none">{settings?.campaignTitle || "APC"}</span>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-apc-green leading-none mt-1">{settings?.campaignSubtitle || "Taraba Federal"}</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-12">
            {['Strategy', 'Mission', 'Tactical Data', 'Video', 'Constituency'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`} 
                className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-apc-blue transition-colors"
              >
                {item}
              </a>
            ))}
            <button 
              onClick={() => setShowAuth(true)}
              className="px-8 py-4 bg-apc-blue text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-apc-blue/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center space-x-3"
            >
              <span>Personnel Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <button className="lg:hidden p-3 bg-gray-50 rounded-xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-24 left-0 right-0 bg-white border-b border-gray-100 z-50 p-6 space-y-4 shadow-xl"
          >
            {['Strategy', 'Mission', 'Tactical Data', 'Video', 'Constituency'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`} 
                onClick={() => setIsMenuOpen(false)}
                className="block py-4 text-xs font-black uppercase tracking-[0.4em] text-gray-400 border-b border-gray-50 last:border-0"
              >
                {item}
              </a>
            ))}
            <button 
              onClick={() => {
                setShowAuth(true);
                setIsMenuOpen(false);
              }}
              className="w-full py-6 bg-apc-blue text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs"
            >
              Personnel Portal
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <section className="relative pt-40 pb-20 px-6 overflow-hidden min-h-screen flex items-center">
        {/* Abstract Architectural BG */}
        <div className="absolute top-0 right-0 w-[60%] h-full bg-bg-secondary/50 -skew-x-12 transform translate-x-20 z-0 border-l border-gray-100" />
        <div className="absolute top-40 right-40 w-96 h-96 bg-apc-blue/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-40 left-40 w-96 h-96 bg-apc-green/5 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10 w-full">
          <div className="space-y-12">
            <motion.div 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-4">
                <div className="h-0.5 w-12 bg-apc-gold" />
                <span className="text-xs font-black uppercase tracking-[0.5em] text-apc-gold">{settings?.landingHeroTagline || "The People's Mandate"}</span>
              </div>
              <h1 className="text-[6.5vw] lg:text-[5.5vw] font-display font-black tracking-tighter leading-[0.9] uppercase whitespace-pre-line break-words">
                {settings?.landingHeroTitle || "SMART \nGOVERNANCE \nFOR PROGRESS"}
              </h1>
              <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-lg">
                {settings?.landingHeroSubtitle || "Driving strategic grassroots transformation across Jalingo, Yorro, and Zing. Built for integrity, data-driven decisions, and sustainable prosperity."}
              </p>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-6"
            >
               <button 
                onClick={() => setShowAuth(true)}
                className="px-10 py-6 bg-apc-blue text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-apc-blue/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center space-x-4 group"
               >
                 <span>Join the Movement</span>
                 <Zap className="w-5 h-5 text-apc-gold group-hover:scale-125 transition-transform" />
               </button>
               <button 
                 onClick={() => setShowManifesto(true)}
                 className="px-10 py-6 bg-white border border-gray-100 text-apc-blue rounded-[32px] font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-gray-50 transition-all"
               >
                 Our Manifesto
               </button>
            </motion.div>
          </div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="relative"
          >
            {/* Main Visual Component - Architectural Card */}
            <div className="relative aspect-[4/5] bg-gray-100 rounded-[80px] overflow-hidden shadow-2xl group border-[12px] border-white">
              <img 
                src={settings?.landingHeroImage || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2670"} 
                alt="Architecture" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-apc-blue/60 to-transparent" />
              
              {/* Floating Stat Card */}
              <div className="absolute bottom-12 left-12 right-12 p-8 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[48px] flex items-center justify-between shadow-2xl">
                 <div className="space-y-1">
                    <p className="text-3xl font-display font-black text-white tracking-tighter leading-none">{settings?.landingStat1Value || "1.2M+"}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-apc-gold">{settings?.landingStat1Label || "Target Reach"}</p>
                 </div>
                 <div className="w-px h-10 bg-white/20" />
                 <div className="space-y-1">
                    <p className="text-3xl font-display font-black text-white tracking-tighter leading-none">{settings?.landingStat2Value || "42"}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-apc-gold">{settings?.landingStat2Label || "Key Sectors"}</p>
                 </div>
              </div>
            </div>

            {/* Overlapping Accents */}
            <div className="absolute -top-10 -right-10 w-24 h-24 apc-gradient-green rounded-[40px] flex items-center justify-center shadow-xl animate-float">
               <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -bottom-10 -left-10 p-6 bg-white rounded-[40px] shadow-2xl border border-gray-50 max-w-[200px]">
              <div className="flex items-center space-x-2 text-apc-blue mb-2">
                 <Globe className="w-4 h-4 text-apc-green" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Global Outreach</span>
              </div>
              <p className="text-[10px] font-bold text-gray-400">Verifying tactical nodes across the constituency network.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Strategic Vision Grid - Bento Style */}
      <section id="strategy" className="py-32 px-6 bg-[#F4F5F7]">
        <div id="mission" className="max-w-7xl mx-auto space-y-20 scroll-mt-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-apc-blue/40">Strategic Direction</span>
               <h2 className="text-6xl font-display font-black tracking-tighter text-apc-blue uppercase leading-none">{settings?.landingStrategyTitle || "Mission \nIntelligence"}</h2>
            </div>
            <p className="text-gray-400 font-medium max-w-sm mb-2">
              {settings?.landingStrategySubtitle || "Our approach leverages modern architectural thinking to solve grassroots coordination challenges."}
            </p>
          </div>

          <div id="tactical-data" className="grid grid-cols-1 md:grid-cols-3 gap-8 scroll-mt-32">
            {[
              { 
                icon: Database, 
                title: 'Data Integrity', 
                desc: 'Every member is verified and validated through our multi-tier tactical security protocol.', 
                color: 'bg-apc-blue' 
              },
              { 
                icon: Target, 
                title: 'Precision Targeting', 
                desc: 'Leveraging AI-driven insights to identify constituency needs down to the specific ward level.', 
                color: 'bg-apc-green' 
              },
              { 
                icon: Lock, 
                title: 'Secure Comms', 
                desc: 'Encrypted communication channels ensuring campaign directives remain classified and effective.', 
                color: 'bg-white text-apc-blue border border-gray-200' 
              },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className={`${feature.color} p-12 rounded-[56px] shadow-xl space-y-10 group transition-all duration-500`}
              >
                <div className={`w-16 h-16 ${feature.color.includes('bg-white') ? 'bg-apc-blue text-white' : 'bg-white/10 text-white'} rounded-[24px] flex items-center justify-center shadow-lg`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <div className="space-y-4">
                  <h3 className={`text-2xl font-display font-black uppercase tracking-tight ${feature.color.includes('bg-white') ? 'text-apc-blue' : 'text-white'}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm font-medium leading-relaxed ${feature.color.includes('bg-white') ? 'text-gray-500' : 'text-white/60'}`}>
                    {feature.desc}
                  </p>
                </div>
                <div className={`pt-8 border-t ${feature.color.includes('bg-white') ? 'border-gray-100' : 'border-white/10'} flex justify-end`}>
                   <div className={`w-10 h-10 rounded-full ${feature.color.includes('bg-white') ? 'bg-apc-blue text-white' : 'bg-white text-apc-blue'} flex items-center justify-center group-hover:scale-125 transition-transform`}>
                     <ArrowRight className="w-5 h-5" />
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Campaign Video Section - Tactical Theater Mode */}
      <section id="video" className="py-40 px-6 bg-[#0A0A0B] overflow-hidden scroll-mt-32 relative">
        {/* Architectural Grid Background for Video Section */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #007AFF 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="max-w-7xl mx-auto space-y-20 relative z-10">
           <div className="text-center space-y-6 max-w-3xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="inline-flex items-center space-x-3 px-6 py-2.5 bg-apc-red/10 rounded-full border border-apc-red/20 mb-4 shadow-lg shadow-apc-red/10"
              >
                 <div className="w-2 h-2 rounded-full bg-apc-red animate-pulse" />
                 <Video className="w-4 h-4 text-apc-red" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-apc-red">{settings?.landingVideoTitle || "Campaign Vision"}</span>
              </motion.div>
              
              <h2 className="text-6xl lg:text-7xl font-display font-black text-white uppercase tracking-tighter leading-[0.9] whitespace-pre-line drop-shadow-2xl">
                {settings?.landingVideoSubtitle?.split(' ').map((word: string, i: number) => (
                  <motion.span 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="inline-block mr-4"
                  >
                    {word}
                  </motion.span>
                )) || "A Strategic Blueprint \nfor Taraba Federal"}
              </h2>
              
              <div className="h-1 w-24 bg-apc-gold mx-auto rounded-full mt-8 opacity-50" />
           </div>

           <div className="relative max-w-5xl mx-auto group">
              {/* Tactical Viewfinder Elements */}
              <div className="absolute -top-6 -left-6 w-20 h-20 border-t-4 border-l-4 border-apc-gold/40 rounded-tl-[40px] z-[20] transition-all group-hover:-translate-x-2 group-hover:-translate-y-2" />
              <div className="absolute -top-6 -right-6 w-20 h-20 border-t-4 border-r-4 border-apc-gold/40 rounded-tr-[40px] z-[20] transition-all group-hover:translate-x-2 group-hover:-translate-y-2" />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 border-b-4 border-l-4 border-apc-gold/40 rounded-bl-[40px] z-[20] transition-all group-hover:-translate-x-2 group-hover:translate-y-2" />
              <div className="absolute -bottom-6 -right-6 w-20 h-20 border-b-4 border-r-4 border-apc-gold/40 rounded-br-[40px] z-[20] transition-all group-hover:translate-x-2 group-hover:translate-y-2" />

              {/* Floating Meta-Data Displays */}
              <div className="absolute top-12 -left-32 hidden xl:block space-y-4">
                 <div className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
                    <p className="text-[8px] font-black text-apc-gold uppercase tracking-widest leading-none mb-1">Signal Status</p>
                    <p className="text-[10px] font-bold text-white uppercase leading-none">Tactical Link Established</p>
                 </div>
                 <div className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
                    <p className="text-[8px] font-black text-apc-gold uppercase tracking-widest leading-none mb-1">Sector Encoding</p>
                    <p className="text-[10px] font-bold text-white uppercase leading-none truncate w-32 font-mono">AVC-774-TARABA</p>
                 </div>
              </div>

              <div className="absolute -inset-10 bg-apc-blue/20 rounded-[80px] blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
              
              <div className="aspect-video bg-[#121214] rounded-[56px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] border-[1px] border-white/10 relative group/player">
                 {settings?.landingVideoUrl ? (
                    <div className="w-full h-full relative">
                       {settings.landingVideoUrl?.startsWith('/uploads/') ? (
                         <video 
                           src={settings.landingVideoUrl}
                           className="w-full h-full object-cover"
                           controls
                           playsInline
                         />
                       ) : getTikTokId(settings.landingVideoUrl) ? (
                         <iframe
                           src={`https://www.tiktok.com/embed/v2/${getTikTokId(settings.landingVideoUrl)}`}
                           className="w-full h-full border-0"
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                           allowFullScreen
                         />
                       ) : (
                         <ReactPlayerAny 
                           url={cleanVideoUrl(settings.landingVideoUrl)}
                           width="100%"
                           height="100%"
                           controls
                           playsinline
                           playing={false}
                           onError={() => console.log("Strategic Signal: Video source has embedding restrictions (403/Forbidden) or platform limit.")}
                           config={{
                             youtube: {
                               origin: window.location.origin
                             },
                             vimeo: {
                               playerOptions: { responsive: true }
                             }
                           }}
                         />
                       )}
                       <div className="absolute bottom-4 right-4 opacity-0 group-hover/player:opacity-100 transition-opacity">
                          <a 
                            href={settings.landingVideoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest flex items-center space-x-2 hover:bg-apc-blue transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Tactical Source Link</span>
                          </a>
                       </div>
                    </div>
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center space-y-6 text-white/20">
                      <div className="relative">
                        <Video className="w-24 h-24 opacity-20 animate-pulse" />
                        <div className="absolute inset-0 bg-white/5 blur-xl rounded-full" />
                      </div>
                      <p className="font-display font-black uppercase tracking-[0.4em] text-xs">No Tactical Briefing Loaded</p>
                   </div>
                 )}
                 
                 {/* Scanline Overlay Effect */}
                 <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-[0.05]" />
              </div>
              
              {/* Narrative Caption */}
              <div className="mt-12 flex items-start justify-between gap-10 border-t border-white/5 pt-10">
                 <div className="space-y-4 max-w-lg">
                    <p className="text-apc-gold font-display font-black text-xl italic uppercase tracking-tighter">"A mandate for the future."</p>
                    <p className="text-white/40 text-xs font-medium leading-relaxed">
                       This strategic blueprint outlines our architectural approach to governance, focusing on digital integration, 
                       resource optimization, and the verified empowerment of every citizen in Jalingo, Yorro, and Zing.
                    </p>
                 </div>
                 <div className="hidden sm:flex items-center space-x-6">
                    <div className="text-right">
                       <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Mission Control</p>
                       <p className="text-xs font-black text-white uppercase tracking-widest">Live Dispatch 01</p>
                    </div>
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                       <ShieldCheck className="w-6 h-6 text-white/20" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Tactical Sector Highlight - Split Look */}
      <section id="constituency" className="py-32 px-6">
        <div className="max-w-7xl mx-auto bg-apc-blue rounded-[64px] overflow-hidden grid lg:grid-cols-2 shadow-2xl relative">
          <div className="absolute top-0 right-0 p-12 z-20">
             <div className="px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-apc-gold" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white leading-none">Operational Sectors</span>
             </div>
          </div>

          <div className="p-16 flex flex-col justify-center space-y-10 relative z-10">
            <h2 className="text-5xl font-display font-black text-white tracking-tighter uppercase leading-none whitespace-pre-line">
              {settings?.landingConstTitle || "Jalingo. \nYorro. \nZing."}
            </h2>
            <p className="text-white/60 text-lg font-medium leading-relaxed max-w-md">
              {settings?.landingConstSubtitle || "Our constituency is a network of human potential. We are building the architecture for its future, one ward at a time."}
            </p>
            <div className="flex -space-x-4">
               {(settings?.landingSupporterImages?.filter(Boolean).length > 0 
                 ? settings.landingSupporterImages.filter(Boolean) 
                 : [1,2,3,4,5]
               ).slice(0, 5).map((imgUrl: any, i: number) => (
                 <div key={i} className="w-14 h-14 rounded-2xl border-4 border-apc-blue bg-gray-200 shadow-xl overflow-hidden">
                    <img 
                      src={typeof imgUrl === 'string' ? imgUrl : `https://i.pravatar.cc/150?u=${imgUrl}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                 </div>
               ))}
               <div className="w-14 h-14 rounded-2xl border-4 border-apc-blue bg-apc-green flex items-center justify-center text-white font-black text-xs">
                 {settings?.landingSupporterCount || "+2K"}
               </div>
            </div>
          </div>
          <div className="relative h-[400px] lg:h-auto">
            <img 
              src={settings?.landingConstImage || "https://images.unsplash.com/photo-1540910419892-f39a62a15242?auto=format&fit=crop&q=80&w=2670"} 
              alt="Sector" 
              className="w-full h-full object-cover grayscale-[30%]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-apc-blue/50 to-transparent" />
          </div>
        </div>
      </section>

      {/* Footer / Final CTA */}
      <footer className="py-20 px-6 border-t border-gray-100 bg-bg-secondary">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 apc-gradient-green rounded-xl flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-black text-xl text-apc-blue uppercase">APC Taraba Federal</span>
            </div>
            <p className="text-gray-400 font-medium max-w-sm">
              The Architecture of Progress. Empowering the people of Jalingo, Yorro, and Zing through modern smart governance.
            </p>
          </div>

          <div className="bg-white p-12 rounded-[56px] border border-gray-100 shadow-xl space-y-8 flex flex-col items-center">
             <div className="text-center space-y-2">
               <h4 className="text-2xl font-display font-black text-apc-blue uppercase tracking-tight">Ready to Command?</h4>
               <p className="text-gray-400 font-medium">Access the secure tactical personnel portal.</p>
             </div>
             <button 
                onClick={() => setShowAuth(true)}
                className="w-full py-6 bg-apc-blue text-white rounded-[32px] font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
             >
               Internal Portal Setup
             </button>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">© 2026 Tactical Campaign HQ. All Rights Reserved.</p>
           <div className="flex space-x-8">
              {['Terms', 'Tactical Privacy', 'Security Protocol'].map(item => (
                <a key={item} href="#" className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-apc-blue transition-colors">{item}</a>
              ))}
           </div>
        </div>
      </footer>

      {/* Manifesto Modal */}
      <AnimatePresence>
        {showManifesto && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowManifesto(false)}
              className="absolute inset-0 bg-apc-blue/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-bg-secondary">
                <div className="flex items-center space-x-3 text-apc-blue">
                  <FileText className="w-5 h-5 text-apc-gold" />
                  <span className="font-display font-black uppercase tracking-widest text-sm">Campaign Manifesto</span>
                </div>
                <button 
                  onClick={() => setShowManifesto(false)}
                  className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all group"
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-apc-red transition-colors" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="markdown-body prose prose-slate max-w-none prose-headings:font-display prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:font-medium prose-p:text-gray-500 prose-li:font-medium prose-li:text-gray-500">
                  <Markdown>{settings?.manifesto || "# No Manifesto Loaded"}</Markdown>
                </div>
              </div>
              <div className="p-8 bg-bg-secondary border-t border-gray-100 text-center">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 italic">Signed: Tactical Campaign Directorate</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
