import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Send, 
  Users, 
  MapPin, 
  AlertCircle,
  Smartphone,
  UserCheck
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { WARDS } from '../constants';

export const Messaging: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'All' | 'Ward' | 'Delegates' | 'LGA'>('All');
  const [targetWard, setTargetWard] = useState('');
  const [targetLga, setTargetLga] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await api.get('/api/messages');
        setRecentMessages(res.data.slice(-5).reverse());
      } catch (err) { console.error(err); }
    };
    fetchRecent();
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() || !isAdmin) return;
    setLoading(true);
    try {
      await api.post('/api/messages', {
        content: message,
        targetType,
        targetWard: targetType === 'Ward' ? targetWard : null,
        targetLga: targetType === 'LGA' ? targetLga : null
      });
      setSuccess(true);
      setMessage('');
      setTimeout(() => setSuccess(false), 3000);
      
      const res = await api.get('/api/messages');
      setRecentMessages(res.data.slice(-5).reverse());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Campaign Dispatch</h2>
          <p className="text-[#86868B] text-lg">Send instructions and updates to the base.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Compose Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-[32px] shadow-sm border border-[#D2D2D7] relative z-0"
        >
          {!isAdmin ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-[#FF9500]" />
              <p className="text-[#86868B]">Only campaign admins can send broadcasts.</p>
              <p className="text-sm font-medium">You will receive messages from the candidate here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1D1D1F]">Recipient Group</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'All', icon: Users },
                    { id: 'LGA', icon: Smartphone },
                    { id: 'Ward', icon: MapPin },
                    { id: 'Delegates', icon: UserCheck }
                  ].map(target => (
                    <button
                      key={target.id}
                      onClick={() => setTargetType(target.id as any)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                        targetType === target.id 
                        ? 'border-[#007AFF] bg-[#F5F9FF] text-[#007AFF]' 
                        : 'border-[#F5F5F7] bg-[#F5F5F7] text-[#86868B] hover:bg-[#E8E8ED]'
                      }`}
                    >
                      <target.icon className="w-5 h-5 mb-1" />
                      <span className="text-xs font-semibold">{target.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {targetType === 'LGA' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-bold text-[#1D1D1F]">Select Target LGA</label>
                  <select 
                    className="w-full px-4 py-3 bg-[#F5F5F7] border-none rounded-xl focus:ring-2 focus:ring-[#007AFF] outline-none"
                    value={targetLga}
                    onChange={e => setTargetLga(e.target.value)}
                  >
                    <option value="">Select LGA</option>
                    {Object.keys(WARDS).map(lga => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                </motion.div>
              )}

              {targetType === 'Ward' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-bold text-[#1D1D1F]">Select Target Ward</label>
                  <select 
                    className="w-full px-4 py-3 bg-[#F5F5F7] border-none rounded-xl focus:ring-2 focus:ring-[#007AFF] outline-none"
                    value={targetWard}
                    onChange={e => setTargetWard(e.target.value)}
                  >
                    <option value="">All LGAs / Wards</option>
                    {Object.entries(WARDS).map(([lga, wards]) => (
                      <optgroup key={lga} label={lga}>
                        {wards.map(w => <option key={w} value={w}>{w}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1D1D1F]">Message Body</label>
                <textarea
                  className="w-full h-40 px-4 py-4 bg-[#F5F5F7] border-none rounded-[24px] focus:ring-2 focus:ring-[#007AFF] outline-none resize-none placeholder:text-[#86868B]"
                  placeholder="Draft your message to the grassroots..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>

              <button
                disabled={loading || !message.trim()}
                onClick={handleSendMessage}
                className={`w-full py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 transition-all shadow-lg ${
                  success 
                    ? 'bg-[#34C759] text-white shadow-green-200' 
                    : 'bg-[#007AFF] text-white shadow-blue-200 hover:bg-[#0071E3]'
                } disabled:opacity-50`}
              >
                {loading ? <Smartphone className="animate-bounce" /> : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>{success ? 'Message Sent!' : 'Broadcast Now'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>

        {/* History Area */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center space-x-2">
            <span>Sent Messages</span>
            <span className="text-xs bg-[#F5F5F7] px-2 py-1 rounded-full text-[#86868B]">Recent</span>
          </h3>
          <div className="space-y-4">
            {recentMessages.length === 0 ? (
              <div className="text-center py-12 text-[#86868B] italic">No messages sent yet.</div>
            ) : recentMessages.map((msg, i) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={msg.id} 
                className="bg-white p-6 rounded-[24px] border border-[#D2D2D7] shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#007AFF]">To: {msg.targetType}</span>
                    {msg.targetWard && <span className="text-xs text-[#86868B]">• {msg.targetWard}</span>}
                    {msg.targetLga && <span className="text-xs text-[#86868B]">• {msg.targetLga}</span>}
                  </div>
                  <span className="text-[10px] text-[#86868B] font-medium">{msg.sentAt ? new Date(msg.sentAt).toLocaleString() : 'N/A'}</span>
                </div>
                <p className="text-sm text-[#1D1D1F] line-clamp-3 leading-relaxed">{msg.content}</p>
                <div className="pt-2 flex items-center space-x-2 border-t border-dashed border-[#D2D2D7]">
                   <span className="text-[10px] text-[#86868B]">Sent by {msg.senderName}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
