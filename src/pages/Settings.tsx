import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Save, 
  Image as ImageIcon, 
  Layout as LayoutIcon, 
  Type, 
  Home, 
  LogIn, 
  MapPin, 
  Send, 
  Users, 
  FileText, 
  Video,
  BarChart3,
  PlusCircle,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Target,
  Upload,
  Loader2
} from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'portal' | 'landing' | 'polls' | 'system'>('portal');
  const [settings, setSettings] = useState<any>({
    authPageImage: '',
    campaignTitle: '',
    campaignSubtitle: '',
    logoUrl: '',
    landingHeroImage: '',
    landingHeroTagline: '',
    landingHeroTitle: '',
    landingHeroSubtitle: '',
    landingStat1Value: '',
    landingStat1Label: '',
    landingStat2Value: '',
    landingStat2Label: '',
    landingStrategyTitle: '',
    landingStrategySubtitle: '',
    landingConstTitle: '',
    landingConstSubtitle: '',
    landingConstImage: '',
    landingSupporterImages: [],
    landingSupporterCount: '',
    manifesto: '',
    landingVideoUrl: '',
    landingVideoTitle: '',
    landingVideoSubtitle: '',
    strategicInsightOverride: '',
    allowMemberUploads: true
  });
  const [loading, setLoading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [polls, setPolls] = useState<any[]>([]);
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''] });
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [dbUrl, setDbUrl] = useState('');
  const [testingDb, setTestingDb] = useState(false);
  const [applyingDb, setApplyingDb] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [settingsRes, pollsRes] = await Promise.all([
          api.get('/api/settings'),
          api.get('/api/polls')
        ]);
        setSettings(settingsRes.data);
        setPolls(pollsRes.data);
      } catch (err) {
        showToast("Strategy systems offline", "error");
      }
    };
    fetchSettings();
  }, []);

  const handleTestDb = async () => {
    if (!dbUrl) return showToast("Enter a tactical link first", "error");
    setTestingDb(true);
    try {
      const res = await api.post('/api/system/db/test', { url: dbUrl });
      showToast(`Tactical Uplink Verified: ${res.data.time}`, "success");
    } catch (err: any) {
      showToast(err.response?.data?.error || "Connection failure", "error");
    } finally {
      setTestingDb(false);
    }
  };

  const handleApplyDb = async () => {
    if (!dbUrl) return showToast("Enter a tactical link first", "error");
    if (!confirm("Caution: Applying a new strategic link will re-provision the database nodes. Existing local data will not be migrated. Continue?")) return;
    
    setApplyingDb(true);
    try {
      await api.post('/api/system/db/apply', { url: dbUrl });
      showToast("Strategic link synchronized", "success");
      // Refresh status
      testConnection();
    } catch (err: any) {
      showToast(err.response?.data?.error || "Migration failure", "error");
    } finally {
      setApplyingDb(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch('/api/settings', settings);
      showToast("Tactical parameters updated", "success");
    } catch (err) {
      showToast("Sync failure", "error");
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/health');
      setSystemStatus(res.data);
      showToast("Database Uplink Confirmed", "success");
    } catch (err) {
      setSystemStatus({ status: "Offline", database: "Disconnected" });
      showToast("Connection Failure", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('video', file);

    setUploadingVideo(true);
    try {
      const res = await api.post('/api/settings/landing-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSettings(res.data);
      showToast("Offline Video Uplink Successful", "success");
    } catch (err) {
      showToast("Video Upload Failed", "error");
    } finally {
      setUploadingVideo(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-apc-blue uppercase">Command Center Config</h1>
          <p className="text-gray-400 font-medium italic mt-1">Refine the public and internal identity of the APC campaign</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="apc-gradient-blue text-white px-10 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center space-x-3 shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{loading ? "Syncing..." : "Publish Changes"}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 p-1 bg-gray-100 rounded-[24px] w-fit">
        <button
          onClick={() => setActiveTab('portal')}
          className={`flex items-center space-x-2 px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'portal' ? 'bg-white text-apc-blue shadow-sm' : 'text-gray-400 hover:text-apc-blue'}`}
        >
          <LogIn className="w-4 h-4" />
          <span>Internal Portal</span>
        </button>
        <button
          onClick={() => setActiveTab('landing')}
          className={`flex items-center space-x-2 px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'landing' ? 'bg-white text-apc-blue shadow-sm' : 'text-gray-400 hover:text-apc-blue'}`}
        >
          <Home className="w-4 h-4" />
          <span>Public Landing</span>
        </button>
        <button
          onClick={() => setActiveTab('polls')}
          className={`flex items-center space-x-2 px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'polls' ? 'bg-white text-apc-blue shadow-sm' : 'text-gray-400 hover:text-apc-blue'}`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Supporter Polls</span>
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center space-x-2 px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'system' ? 'bg-white text-apc-blue shadow-sm' : 'text-gray-400 hover:text-apc-blue'}`}
        >
          <Target className="w-4 h-4" />
          <span>System & Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {activeTab === 'portal' ? (
            <>
              <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-8">
                <div className="flex items-center space-x-4 mb-8">
                   <div className="p-3 bg-apc-blue/5 rounded-2xl">
                     <ImageIcon className="w-6 h-6 text-apc-blue" />
                   </div>
                   <h3 className="text-xl font-black text-apc-blue uppercase tracking-tight">Portal Landing Image</h3>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Image Source URL</label>
                     <input
                       type="text"
                       className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-blue outline-none font-bold text-sm"
                       placeholder="Enter high-resolution image URL..."
                       value={settings.authPageImage}
                       onChange={e => setSettings({...settings, authPageImage: e.target.value})}
                     />
                   </div>

                   <div className="relative aspect-video rounded-[32px] overflow-hidden border border-gray-100 group shadow-lg">
                      {settings.authPageImage ? (
                        <img src={settings.authPageImage} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                          <ImageIcon className="w-12 h-12" />
                        </div>
                      )}
                   </div>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-8">
                <div className="flex items-center space-x-4">
                   <div className="p-3 bg-apc-green/5 rounded-2xl">
                     <Type className="w-6 h-6 text-apc-green" />
                   </div>
                   <h3 className="text-xl font-black text-apc-blue uppercase tracking-tight">Campaign Branding</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Portal Main Title</label>
                     <input
                       type="text"
                       className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-green outline-none font-bold text-sm"
                       value={settings.campaignTitle}
                       onChange={e => setSettings({...settings, campaignTitle: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Portal Subtitle</label>
                     <input
                       type="text"
                       className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-green outline-none font-bold text-sm"
                       value={settings.campaignSubtitle}
                       onChange={e => setSettings({...settings, campaignSubtitle: e.target.value})}
                     />
                   </div>
                   <div className="md:col-span-2 space-y-4 pt-6 border-t border-gray-50">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Campaign Logo URL</label>
                     <div className="flex items-center gap-6">
                       <input
                         type="text"
                         placeholder="Logo URL (.png recommended)..."
                         className="flex-1 px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-green outline-none font-bold text-sm"
                         value={settings.logoUrl || ''}
                         onChange={e => setSettings({...settings, logoUrl: e.target.value})}
                       />
                       <div className="w-16 h-16 apc-gradient-green rounded-2xl flex items-center justify-center shadow-lg border border-white overflow-hidden shrink-0">
                         {settings.logoUrl ? (
                           <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                         ) : (
                           <Send className="w-8 h-8 text-white" />
                         )}
                       </div>
                     </div>
                   </div>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-8">
                <div className="flex items-center space-x-4">
                   <div className="p-3 bg-apc-blue/10 rounded-2xl">
                     <LayoutIcon className="w-6 h-6 text-apc-blue" />
                   </div>
                   <h3 className="text-xl font-black text-apc-blue uppercase tracking-tight">Strategic Intelligence Override</h3>
                </div>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Executive Directive (Leave blank to use AI analysis)</label>
                     <textarea 
                       className="w-full h-40 px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[32px] focus:ring-2 focus:ring-apc-blue outline-none text-sm font-bold placeholder:text-gray-300 resize-none"
                       placeholder="Enter manual directives here to override the AI strategic output..."
                       value={settings.strategicInsightOverride}
                       onChange={e => setSettings({...settings, strategicInsightOverride: e.target.value})}
                     />
                   </div>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-8">
                <div className="flex items-center space-x-4">
                   <div className="p-3 bg-apc-blue/10 rounded-2xl">
                     <Users className="w-6 h-6 text-apc-blue" />
                   </div>
                   <h3 className="text-xl font-black text-apc-blue uppercase tracking-tight">Tactical Permissions</h3>
                </div>
                
                <div className="flex items-center justify-between p-6 bg-bg-secondary rounded-[32px] border border-gray-100">
                   <div className="space-y-1">
                      <h4 className="text-sm font-black text-apc-blue uppercase tracking-tight">Enable Member Video Uplink</h4>
                      <p className="text-xs text-gray-400 font-medium">When active, members can share field reports and testimonials in the Media Center.</p>
                   </div>
                   <button 
                     onClick={() => setSettings({...settings, allowMemberUploads: !settings.allowMemberUploads})}
                     className={`w-16 h-8 rounded-full transition-all relative ${settings.allowMemberUploads ? 'bg-apc-green shadow-lg shadow-apc-green/20' : 'bg-gray-200'}`}
                   >
                     <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.allowMemberUploads ? 'left-9' : 'left-1'}`} />
                   </button>
                </div>
              </div>
            </>
          ) : activeTab === 'landing' ? (
            <>
              {/* Hero Section Config */}
              <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-8">
                <div className="flex items-center space-x-4">
                   <div className="p-3 bg-apc-gold/10 rounded-2xl">
                     <LayoutIcon className="w-6 h-6 text-apc-gold" />
                   </div>
                   <h3 className="text-xl font-black text-apc-blue uppercase tracking-tight">Hero Section</h3>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Hero Tagline</label>
                     <input
                       type="text"
                       className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-gold outline-none font-bold text-sm"
                       value={settings.landingHeroTagline}
                       onChange={e => setSettings({...settings, landingHeroTagline: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Main Heading (Use \n for new lines)</label>
                     <textarea
                       className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-gold outline-none font-bold text-sm min-h-[100px]"
                       value={settings.landingHeroTitle}
                       onChange={e => setSettings({...settings, landingHeroTitle: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Hero Subtitle</label>
                     <textarea
                       className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-gold outline-none font-bold text-sm min-h-[100px]"
                       value={settings.landingHeroSubtitle}
                       onChange={e => setSettings({...settings, landingHeroSubtitle: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Hero Image URL</label>
                     <input
                       type="text"
                       className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-gold outline-none font-bold text-sm"
                       value={settings.landingHeroImage}
                       onChange={e => setSettings({...settings, landingHeroImage: e.target.value})}
                     />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Stat 1 Value</label>
                        <input
                          type="text"
                          className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-gold outline-none font-bold text-sm"
                          value={settings.landingStat1Value}
                          onChange={e => setSettings({...settings, landingStat1Value: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Stat 1 Label</label>
                        <input
                          type="text"
                          className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-gold outline-none font-bold text-sm"
                          value={settings.landingStat1Label}
                          onChange={e => setSettings({...settings, landingStat1Label: e.target.value})}
                        />
                      </div>
                   </div>
                </div>
              </div>

              {/* Constituency Config */}
              <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-8">
                <div className="flex items-center space-x-4">
                   <div className="p-3 bg-apc-green/10 rounded-2xl">
                     <MapPin className="w-6 h-6 text-apc-green" />
                   </div>
                   <h3 className="text-xl font-black text-apc-blue uppercase tracking-tight">Constituency Section</h3>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Section Title</label>
                     <input
                       type="text"
                       className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-green outline-none font-bold text-sm"
                       value={settings.landingConstTitle}
                       onChange={e => setSettings({...settings, landingConstTitle: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Section Subtitle</label>
                     <textarea
                       className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-green outline-none font-bold text-sm min-h-[100px]"
                       value={settings.landingConstSubtitle}
                       onChange={e => setSettings({...settings, landingConstSubtitle: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Section Image URL</label>
                     <input
                       type="text"
                       className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-green outline-none font-bold text-sm"
                       value={settings.landingConstImage}
                       onChange={e => setSettings({...settings, landingConstImage: e.target.value})}
                     />
                   </div>
                </div>
              </div>

              {/* Supporter Avatars Config */}
              <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-8">
                <div className="flex items-center space-x-4">
                   <div className="p-3 bg-apc-blue/10 rounded-2xl">
                     <Users className="w-6 h-6 text-apc-blue" />
                   </div>
                   <h3 className="text-xl font-black text-apc-blue uppercase tracking-tight">Supporter Avatars</h3>
                </div>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Badge Text (e.g. +2K)</label>
                     <input
                       type="text"
                       className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-blue outline-none font-bold text-sm"
                       value={settings.landingSupporterCount}
                       onChange={e => setSettings({...settings, landingSupporterCount: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Avatar Image URLs (One per line)</label>
                     <textarea
                       className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-blue outline-none font-bold text-sm min-h-[120px]"
                       value={settings.landingSupporterImages?.join('\n')}
                       onChange={e => setSettings({...settings, landingSupporterImages: e.target.value.split('\n')})}
                       placeholder="Enter image URLs..."
                     />
                   </div>
                   
                   <div className="flex -space-x-3 pt-2">
                      {settings.landingSupporterImages?.filter(Boolean).slice(0, 5).map((url: string, i: number) => (
                        <div key={i} className="w-12 h-12 rounded-xl border-2 border-white bg-gray-100 shadow-md overflow-hidden relative group">
                           <img src={url} alt="Preview" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[8px] font-bold">
                             #{i+1}
                           </div>
                        </div>
                      ))}
                      <div className="w-12 h-12 rounded-xl border-2 border-white bg-apc-green flex items-center justify-center text-white font-black text-[10px] shadow-md">
                        {settings.landingSupporterCount}
                      </div>
                   </div>
                </div>
              </div>

              {/* Manifesto Config */}
              <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-8">
                <div className="flex items-center space-x-4">
                   <div className="p-3 bg-apc-gold/10 rounded-2xl">
                     <FileText className="w-6 h-6 text-apc-gold" />
                   </div>
                   <h3 className="text-xl font-black text-apc-blue uppercase tracking-tight">Campaign Manifesto</h3>
                </div>
                
                <div className="space-y-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Manifesto Content (Markdown Supported)</label>
                     <textarea
                       className="w-full px-6 py-8 bg-bg-secondary border border-gray-100 rounded-[32px] focus:ring-2 focus:ring-apc-gold outline-none font-medium text-sm min-h-[300px] leading-relaxed"
                       value={settings.manifesto}
                       onChange={e => setSettings({...settings, manifesto: e.target.value})}
                       placeholder="# Our Manifesto..."
                     />
                   </div>
                </div>
              </div>
              {/* Video Config */}
              <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-8">
                <div className="flex items-center space-x-4">
                   <div className="p-3 bg-apc-red/10 rounded-2xl">
                     <Video className="w-6 h-6 text-apc-red" />
                   </div>
                   <h3 className="text-xl font-black text-apc-blue uppercase tracking-tight">Campaign Video</h3>
                </div>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Video URL (Supports YouTube, Facebook, Vimeo, and more...)</label>
                     <input
                       type="text"
                       className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-red outline-none font-bold text-sm"
                       value={settings.landingVideoUrl}
                       onChange={e => setSettings({...settings, landingVideoUrl: e.target.value})}
                       placeholder="Paste any social media video link..."
                     />
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">OR: Upload Offline Campaign Video (MP4)</label>
                      <div className="flex items-center gap-4">
                         <label className="flex-1 cursor-pointer">
                            <div className="w-full px-6 py-4 bg-bg-secondary border-2 border-dashed border-gray-200 rounded-[24px] hover:border-apc-red transition-all flex items-center justify-center space-x-3 text-gray-400 font-bold text-sm">
                               {uploadingVideo ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                               ) : (
                                  <Upload className="w-5 h-5" />
                               )}
                               <span>{uploadingVideo ? "Uploading Signal..." : "Select MP4 File"}</span>
                            </div>
                            <input 
                              type="file" 
                              accept="video/mp4" 
                              className="hidden" 
                              onChange={handleVideoUpload}
                              disabled={uploadingVideo}
                            />
                         </label>
                         {settings.landingVideoUrl?.startsWith('/uploads/') && (
                            <div className="px-4 py-2 bg-apc-green/10 text-apc-green rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2">
                               <Video className="w-3 h-3" />
                               <span>Local File Active</span>
                            </div>
                         )}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Video Title</label>
                       <input
                         type="text"
                         className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-red outline-none font-bold text-sm"
                         value={settings.landingVideoTitle}
                         onChange={e => setSettings({...settings, landingVideoTitle: e.target.value})}
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Video Subtitle</label>
                       <input
                         type="text"
                         className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-red outline-none font-bold text-sm"
                         value={settings.landingVideoSubtitle}
                         onChange={e => setSettings({...settings, landingVideoSubtitle: e.target.value})}
                       />
                     </div>
                   </div>
                </div>
              </div>
            </>
          ) : activeTab === 'polls' ? (
            <PollManagement 
              polls={polls} 
              setPolls={setPolls} 
              newPoll={newPoll} 
              setNewPoll={setNewPoll} 
              showToast={showToast} 
            />
          ) : (
            <>
              <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-8">
                 <div className="flex items-center space-x-4">
                    <div className="p-3 bg-apc-blue/10 rounded-2xl">
                      <Target className="w-6 h-6 text-apc-blue" />
                    </div>
                    <h3 className="text-xl font-black text-apc-blue uppercase tracking-tight">Database Intelligence Uplink</h3>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Tactical Database Link (PostgreSQL)</label>
                       <input
                         type="password"
                         className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-blue outline-none font-mono text-xs"
                         value={dbUrl}
                         onChange={e => setDbUrl(e.target.value)}
                         placeholder="postgresql://user:pass@host:port/db"
                       />
                       {systemStatus?.db_url && (
                         <p className="px-4 text-[10px] font-medium text-gray-400">
                            Active Grid Node: <span className="font-mono text-apc-blue">{systemStatus.db_url}</span>
                         </p>
                       )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <button 
                         onClick={handleTestDb}
                         disabled={testingDb}
                         className="py-5 bg-white border-2 border-apc-blue text-apc-blue rounded-[24px] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center space-x-3 hover:bg-apc-blue/5 transition-all disabled:opacity-50"
                       >
                         {testingDb ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart3 className="w-5 h-5" />}
                         <span>{testingDb ? "Testing..." : "Test Uplink"}</span>
                       </button>
                       <button 
                         onClick={handleApplyDb}
                         disabled={applyingDb}
                         className="py-5 apc-gradient-blue text-white rounded-[24px] font-black uppercase tracking-[0.2em] shadow-xl shadow-apc-blue/20 text-xs flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                       >
                         {applyingDb ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                         <span>{applyingDb ? "Syncing..." : "Apply Strategic Link"}</span>
                       </button>
                    </div>

                    <div className="p-8 bg-bg-secondary rounded-[32px] border border-gray-100 space-y-4">
                       <h4 className="text-sm font-black text-apc-blue uppercase tracking-tight">Active Infrastructure</h4>
                       <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500">Database Engine:</span>
                          <span className="text-xs font-black text-apc-green uppercase tracking-widest">{systemStatus?.database || "Strategic PostgreSQL Cluster"}</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500">Storage Cluster:</span>
                          <span className="text-xs font-black text-apc-blue uppercase tracking-widest">{systemStatus?.firebaseConfigured ? "Cloud Firestore (NoSQL)" : "Persistent Neon Data Arch"}</span>
                       </div>
                    </div>

                    {systemStatus && (
                       <motion.div 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className={`p-6 rounded-[24px] border border-dashed flex items-center justify-between ${systemStatus.status === 'Online' ? 'bg-apc-green/5 border-apc-green/30' : 'bg-red-50 border-red-200'}`}
                       >
                          <div className="space-y-1">
                             <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${systemStatus.status === 'Online' ? 'bg-apc-green animate-pulse' : 'bg-apc-red'}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tactical Status</span>
                             </div>
                             <p className={`text-sm font-black uppercase ${systemStatus.status === 'Online' ? 'text-apc-green' : 'text-apc-red'}`}>
                                System {systemStatus.status}
                             </p>
                          </div>
                          <div className="text-right space-y-1">
                             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Last Latency Sync</span>
                             <p className="text-[10px] font-mono text-gray-500">
                                {new Date(systemStatus.timestamp).toLocaleTimeString()}
                             </p>
                          </div>
                       </motion.div>
                    )}
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-8">
                 <div className="flex items-center space-x-4">
                    <div className="p-3 bg-apc-gold/10 rounded-2xl">
                      <Globe className="w-6 h-6 text-apc-gold" />
                    </div>
                    <h3 className="text-xl font-black text-apc-blue uppercase tracking-tight">External Provisioning</h3>
                 </div>
                 
                 <div className="p-8 bg-bg-secondary rounded-[32px] border border-gray-100 space-y-6">
                    <p className="text-sm text-gray-400 font-medium leading-relaxed">
                      {systemStatus?.firebaseConfigured 
                        ? "Enterprise Firebase Intelligence is currently active. Your application is scaling across distributed nodes with real-time relational streaming."
                        : "To scale beyond current parameters, deploy to Enterprise Firebase Intelligence. This allows for real-time relational streaming and high-concurrency access across the constituency."
                      }
                    </p>
                    {!systemStatus?.firebaseConfigured && (
                      <div className="p-4 bg-apc-gold/10 rounded-2xl border border-apc-gold/20 flex items-center space-x-4">
                         <FileText className="w-5 h-5 text-apc-gold" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-apc-gold">Scaling Blueprint Recommended</span>
                      </div>
                    )}
                 </div>
              </div>
            </>
          )}
        </div>

        <div className="space-y-10">
          <div className="apc-gradient-blue p-10 rounded-[48px] text-white shadow-xl shadow-apc-blue/20 relative overflow-hidden">
            <Globe className="absolute -right-10 -top-10 w-48 h-48 opacity-10 animate-spin-slow" />
            <h4 className="text-lg font-black uppercase tracking-tight mb-4">Strategic Tip</h4>
            <p className="text-sm text-white/80 font-medium leading-relaxed">
              Use images that reflect the local community of Jalingo/Yorro/Zing to increase trust and resonance with supporters.
            </p>
          </div>

          <div className="apc-gradient-green p-10 rounded-[48px] text-white shadow-xl shadow-apc-green/20 relative overflow-hidden">
            <Video className="absolute -right-10 -top-10 w-48 h-48 opacity-10 animate-pulse" />
            <h4 className="text-lg font-black uppercase tracking-tight mb-4">Video Briefing</h4>
            <p className="text-sm text-white/80 font-medium leading-relaxed">
              Video messages from leadership establish an emotional connection. Ensure your video embed link is from a reliable source like YouTube or Vimeo.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
             <div className="flex items-center space-x-3">
                <LayoutIcon className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">System Logs</span>
             </div>
             <div className="space-y-4">
                <div className="p-4 bg-bg-secondary rounded-2xl text-[10px] font-mono text-gray-500">
                   [SYS] Config Uplink Connected...
                </div>
                <div className="p-4 bg-bg-secondary rounded-2xl text-[10px] font-mono text-gray-500">
                   [DB] Assets Indexed at /api/settings
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PollManagement: React.FC<any> = ({ polls, setPolls, newPoll, setNewPoll, showToast }) => {
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newPoll.question || newPoll.options.some((o: string) => !o.trim())) {
      showToast("Poll requires a question and all options filled", "error");
      return;
    }
    try {
      const res = await api.post('/api/polls', newPoll);
      setPolls([...polls, res.data]);
      setNewPoll({ question: '', options: ['', ''] });
      setCreating(false);
      showToast("Poll intelligence active", "success");
    } catch (err) {
      showToast("Failed to launch poll", "error");
    }
  };

  const togglePoll = async (id: string, active: boolean) => {
    try {
      const res = await api.patch(`/api/polls/${id}`, { active });
      setPolls(polls.map((p: any) => p.id === id ? res.data : p));
      showToast("Poll state updated", "success");
    } catch (err) {
      showToast("Update failed", "error");
    }
  };

  const deletePoll = async (id: string) => {
    if (!confirm("Are you sure you want to delete this intelligence gathering mission?")) return;
    try {
      await api.delete(`/api/polls/${id}`);
      setPolls(polls.filter((p: any) => p.id !== id));
      showToast("Poll decommissioned", "success");
    } catch (err) {
      showToast("Deletion failed", "error");
    }
  };

  const addOption = () => {
    setNewPoll({...newPoll, options: [...newPoll.options, '']});
  };

  return (
    <div className="space-y-10">
      {/* Create New Poll Section */}
      <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-8">
        <div className="flex items-center justify-between">
           <div className="flex items-center space-x-4">
              <div className="p-3 bg-apc-blue/5 rounded-2xl">
                <PlusCircle className="w-6 h-6 text-apc-blue" />
              </div>
              <h3 className="text-xl font-black text-apc-blue uppercase tracking-tight">Create Intelligence Poll</h3>
           </div>
           {!creating && (
             <button 
               onClick={() => setCreating(true)}
               className="px-6 py-3 bg-bg-secondary text-apc-blue border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-apc-blue hover:text-white transition-all shadow-sm"
             >
               Launch New Mission
             </button>
           )}
        </div>

        {creating && (
           <div className="space-y-8 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Poll Question</label>
                <input 
                  type="text"
                  placeholder="e.g. Which sector needs immediate tactical focus?"
                  className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-blue outline-none font-bold text-sm"
                  value={newPoll.question}
                  onChange={e => setNewPoll({...newPoll, question: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Tactical Options</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {newPoll.options.map((opt: string, i: number) => (
                    <input 
                      key={i}
                      type="text"
                      placeholder={`Option ${i+1}`}
                      className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[20px] focus:ring-2 focus:ring-apc-blue outline-none font-bold text-sm"
                      value={opt}
                      onChange={e => {
                        const newOps = [...newPoll.options];
                        newOps[i] = e.target.value;
                        setNewPoll({...newPoll, options: newOps});
                      }}
                    />
                  ))}
                  {newPoll.options.length < 5 && (
                    <button 
                      onClick={addOption}
                      className="w-full border-2 border-dashed border-gray-100 rounded-[20px] flex items-center justify-center space-x-2 text-gray-400 hover:text-apc-blue hover:border-apc-blue transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Add Variable</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button 
                  onClick={handleCreate}
                  className="flex-1 py-5 bg-apc-blue text-white rounded-[24px] font-black uppercase tracking-[0.2em] shadow-xl shadow-apc-blue/20 text-xs"
                >
                  Confirm & Launch Poll
                </button>
                <button 
                  onClick={() => setCreating(false)}
                  className="px-10 py-5 bg-bg-secondary text-gray-400 rounded-[24px] font-black uppercase tracking-widest text-xs hover:text-apc-red transition-colors"
                >
                  Abort
                </button>
              </div>
           </div>
        )}
      </div>

      {/* Polls List */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 px-4">
           <BarChart3 className="w-5 h-5 text-apc-blue" />
           <h3 className="text-sm font-black text-apc-blue uppercase tracking-widest">Historical Intelligence Missions</h3>
        </div>

        <div className="space-y-4">
           {polls.map((poll: any) => (
             <div key={poll.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all">
                <div className="space-y-2">
                   <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-black text-apc-blue uppercase tracking-tight">{poll.question}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${poll.active ? 'bg-apc-green/10 text-apc-green' : 'bg-red-50 text-apc-red'}`}>
                         {poll.active ? 'Active' : 'Archived'}
                      </span>
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {poll.options.map((opt: string) => (
                        <span key={opt} className="px-3 py-1 bg-bg-secondary rounded-lg text-[9px] font-bold text-gray-500 border border-gray-50">
                           {opt}: {poll.results[opt] || 0}
                        </span>
                      ))}
                   </div>
                </div>

                <div className="flex items-center space-x-2">
                   <button 
                     onClick={() => togglePoll(poll.id, !poll.active)}
                     className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${poll.active ? 'bg-apc-green/10 text-apc-green hover:bg-apc-green hover:text-white' : 'bg-gray-50 text-gray-300 hover:bg-apc-green hover:text-white'}`}
                     title={poll.active ? 'Archive Poll' : 'Activate Poll'}
                   >
                     {poll.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                   </button>
                   <button 
                     onClick={() => deletePoll(poll.id)}
                     className="w-12 h-12 bg-red-50 text-apc-red rounded-2xl flex items-center justify-center hover:bg-apc-red hover:text-white transition-all"
                     title="Delete Poll"
                   >
                     <Trash2 className="w-5 h-5" />
                   </button>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
