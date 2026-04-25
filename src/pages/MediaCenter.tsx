import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  Upload, 
  Trash2, 
  Play, 
  X, 
  Film, 
  MessageSquare, 
  Calendar,
  User,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Send
} from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';

interface VideoIntel {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  type: 'Testimonial' | 'Highlight';
  url: string;
  status: string;
  createdAt: string;
}

export const MediaCenter: React.FC = () => {
  const [videos, setVideos] = useState<VideoIntel[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [filterType, setFilterType] = useState<'All' | 'Testimonial' | 'Highlight'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    type: 'Testimonial' as 'Testimonial' | 'Highlight',
    file: null as File | null
  });

  const { showToast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeVideo, setActiveVideo] = useState<VideoIntel | null>(null);

  const fetchVideos = async () => {
    try {
      const [videosRes, settingsRes] = await Promise.all([
        api.get('/api/videos'),
        api.get('/api/settings')
      ]);
      setVideos(videosRes.data);
      setSettings(settingsRes.data);
    } catch (err) {
      showToast("Media downlink failed", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.file || !newVideo.title) {
      showToast("Title and Tactical video file required", "error");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('video', newVideo.file);
    formData.append('title', newVideo.title);
    formData.append('description', newVideo.description);
    formData.append('type', newVideo.type);

    try {
      await api.post('/api/videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsSuccess(true);
      showToast("Media intelligence uploaded", "success");
      
      // Delay closing to show the success state
      setTimeout(() => {
        setNewVideo({ title: '', description: '', type: 'Testimonial', file: null });
        setShowUpload(false);
        setIsSuccess(false);
        fetchVideos();
      }, 2000);
    } catch (err: any) {
      showToast(err.response?.data?.error || "Upload transmission failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to decommission this media intel?")) return;
    try {
      await api.delete(`/api/videos/${id}`);
      showToast("Media decommissioned", "success");
      fetchVideos();
    } catch (err) {
      showToast("Deactivation failed", "error");
    }
  };

  const filteredVideos = videos.filter(v => 
    (filterType === 'All' || v.type === filterType) &&
    (v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     v.userName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-apc-blue uppercase">Media Intelligence</h1>
          <p className="text-gray-400 font-medium italic">Tactical testimonials and constituency event highlights</p>
        </div>
        {(settings?.allowMemberUploads) && (
          <button
            onClick={() => setShowUpload(true)}
            className="apc-gradient-blue text-white px-10 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center space-x-3 shadow-xl shadow-apc-blue/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Upload className="w-5 h-5" />
            <span>Uplink Video</span>
          </button>
        )}
      </header>

      {/* Stats and Filter Bar */}
      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center gap-6">
        <div className="flex items-center space-x-2 bg-gray-100 p-1.5 rounded-[20px]">
          {['All', 'Testimonial', 'Highlight'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-6 py-2.5 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-white text-apc-blue shadow-sm' : 'text-gray-400 hover:text-apc-blue'}`}
            >
              {type}s
            </button>
          ))}
        </div>

        <div className="flex-1 relative w-full">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
           <input 
             type="text"
             placeholder="Search media intelligence..."
             className="w-full pl-14 pr-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-blue outline-none text-sm font-bold placeholder:text-gray-300"
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
           />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-apc-blue/20 border-t-apc-blue rounded-full animate-spin"></div>
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredVideos.map((video) => (
              <motion.div
                key={video.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-[40px] border border-gray-100 overflow-hidden group hover:shadow-xl hover:shadow-black/[0.04] transition-all flex flex-col"
              >
                <div className="relative aspect-video bg-black group/vid cursor-pointer overflow-hidden" onClick={() => setActiveVideo(video)}>
                  <video 
                    src={video.url} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-6 left-6">
                    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md border ${video.type === 'Testimonial' ? 'bg-apc-blue/20 text-white border-white/20' : 'bg-apc-gold/20 text-white border-apc-gold/20'}`}>
                      {video.type}
                    </span>
                  </div>
                  <div className="absolute bottom-6 left-6 text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-black text-apc-blue uppercase tracking-tight mb-2 truncate">{video.title}</h3>
                    <p className="text-gray-400 text-xs font-medium leading-relaxed line-clamp-2 mb-6">
                      {video.description || "No tactical briefing provided for this media intel."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Uploaded By</p>
                        <p className="text-[10px] font-bold text-apc-blue">{video.userName}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleDelete(video.id)}
                      className="p-3 text-gray-200 hover:text-apc-red hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[56px] border border-gray-100 text-center space-y-4">
          <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto">
            <Film className="w-10 h-10 text-gray-200" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-apc-blue uppercase tracking-tighter">No Media Intel Found</h3>
            <p className="text-gray-400 text-sm font-medium">Be the first to uplink constituency highlights or testimonials</p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="text-apc-blue font-black uppercase tracking-widest text-[10px] hover:underline pt-4"
          >
            Initiate First Uplink
          </button>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpload(false)}
              className="absolute inset-0 bg-apc-blue/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[48px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 pb-0 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-apc-blue text-white rounded-3xl">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-apc-blue uppercase tracking-tighter">Tactical Video Uplink</h2>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Multimedia Intelligence Stream</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUpload(false)}
                  className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-apc-red transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Video Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ward A Grassroots Rally"
                      className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[20px] focus:ring-2 focus:ring-apc-blue outline-none font-bold text-sm"
                      value={newVideo.title}
                      onChange={e => setNewVideo({ ...newVideo, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Intel Type</label>
                    <select
                      className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[20px] focus:ring-2 focus:ring-apc-blue outline-none font-bold text-sm"
                      value={newVideo.type}
                      onChange={e => setNewVideo({ ...newVideo, type: e.target.value as any })}
                    >
                      <option value="Testimonial">Testimonial</option>
                      <option value="Highlight">Event Highlight</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Tactical Briefing (Description)</label>
                  <textarea
                    rows={3}
                    placeholder="Provide a brief context of this media intel..."
                    className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-[24px] focus:ring-2 focus:ring-apc-blue outline-none font-bold text-sm resize-none"
                    value={newVideo.description}
                    onChange={e => setNewVideo({ ...newVideo, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Video File (Max 100MB)</label>
                  <button
                    type="button"
                    disabled={uploading || isSuccess}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full p-10 border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center space-y-4 transition-all ${newVideo.file ? 'border-apc-green bg-apc-green/5' : 'border-gray-100 hover:border-apc-blue bg-gray-50'} ${(uploading || isSuccess) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSuccess ? (
                      <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center space-y-4"
                      >
                         <div className="w-16 h-16 bg-apc-green rounded-full flex items-center justify-center shadow-lg shadow-apc-green/20">
                            <CheckCircle2 className="w-8 h-8 text-white" />
                         </div>
                         <div className="text-center">
                            <p className="text-lg font-black text-apc-green uppercase tracking-tighter">Uplink Confirmed</p>
                            <p className="text-[10px] font-black text-apc-green/60 uppercase tracking-widest">Tactical Broadcast Initialized</p>
                         </div>
                      </motion.div>
                    ) : newVideo.file ? (
                      <>
                        <div className="w-16 h-16 bg-apc-green/10 rounded-full flex items-center justify-center border border-apc-green/20">
                          <Film className="w-8 h-8 text-apc-green" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-apc-green truncate max-w-xs">{newVideo.file.name}</p>
                          <div className="flex items-center justify-center space-x-2 mt-1">
                            <span className="text-[10px] font-black uppercase text-apc-green/60 bg-apc-green/10 px-2 py-0.5 rounded-full">{formatFileSize(newVideo.file.size)}</span>
                            <span className="text-[10px] font-black uppercase text-apc-green/60">• Ready for Uplink</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-gray-300" />
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-400">Select Tactical Video</p>
                          <p className="text-[10px] font-black uppercase text-gray-200">MP4, MOV, or AVI</p>
                        </div>
                      </>
                    )}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="video/*"
                    onChange={(e) => setNewVideo({ ...newVideo, file: e.target.files?.[0] || null })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading || isSuccess || !newVideo.file}
                  className="w-full py-6 bg-apc-blue text-white rounded-[24px] font-black uppercase tracking-[0.2em] shadow-xl shadow-apc-blue/20 text-xs flex items-center justify-center space-x-3 disabled:opacity-50"
                >
                  {isSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Uplink Complete</span>
                    </>
                  ) : uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Transmitting Intel...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Initiate Strategic Uplink</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Video Player Modal */}
      <AnimatePresence>
        {activeVideo && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVideo(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-[40px] overflow-hidden shadow-2xl border border-white/10"
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              <video 
                src={activeVideo.url} 
                controls 
                autoPlay 
                className="w-full h-full"
              />
              <div className="absolute bottom-10 left-10 p-8 bg-gradient-to-t from-black via-black/80 to-transparent w-full text-white pointer-events-none">
                 <h2 className="text-3xl font-black uppercase tracking-tight mb-2">{activeVideo.title}</h2>
                 <p className="text-white/60 text-sm font-medium">{activeVideo.description}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
