import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  User,
  Reply,
  ShieldCheck
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export const Feedback: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [content, setContent] = useState('');
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const fetchFeedback = async () => {
    try {
      const res = await api.get('/api/feedback');
      setFeedbacks(res.data.reverse());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchFeedback(); }, [user, isAdmin]);

  const handleSubmitFeedback = async () => {
    if (!content.trim()) return;
    try {
      await api.post('/api/feedback', { content });
      setContent('');
      fetchFeedback();
    } catch (err) { console.error(err); }
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim() || !isAdmin) return;
    try {
      await api.patch(`/api/feedback/${id}/reply`, { adminReply: replyText });
      setReplyText('');
      setActiveReplyId(null);
      fetchFeedback();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Citizen Engagement</h2>
        <p className="text-[#86868B] text-lg">Your direct line to the campaign office.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submit Form */}
        {!isAdmin && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[32px] shadow-sm border border-[#D2D2D7] h-fit sticky top-8"
          >
            <h3 className="text-xl font-bold mb-6">Submit Feedback</h3>
            <div className="space-y-4">
              <textarea 
                placeholder="Questions, complaints or suggestions regarding the campaign..."
                className="w-full h-40 px-4 py-4 bg-[#F5F5F7] border-none rounded-[24px] focus:ring-2 focus:ring-[#007AFF] outline-none resize-none"
                value={content}
                onChange={e => setContent(e.target.value)}
              />
              <button 
                onClick={handleSubmitFeedback}
                disabled={!content.trim()}
                className="w-full py-4 bg-[#1D1D1F] text-white rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:bg-black transition-all disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                <span>Send to HQ</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Feedback List */}
        <div className={`space-y-6 ${isAdmin ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{isAdmin ? 'Aggregated Feedback' : 'Your History'}</h3>
          </div>

          <div className="space-y-4">
            {feedbacks.map((item) => (
              <motion.div 
                key={item.id} 
                className="bg-white p-6 rounded-[32px] border border-[#D2D2D7] shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#F5F5F7] flex items-center justify-center">
                      <User className="w-4 h-4 text-[#86868B]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.userName}</p>
                      <p className="text-[10px] text-[#86868B]">{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded ${
                    item.status === 'Replied' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500'
                  }`}>
                    {item.status}
                  </span>
                </div>
                
                <div className="bg-[#FBFBFD] p-4 rounded-2xl border border-[#F5F5F7]">
                  <p className="text-sm text-[#1D1D1F] italic leading-relaxed">"{item.content}"</p>
                </div>

                {item.adminReply && (
                  <div className="pl-6 border-l-2 border-[#007AFF]/20 space-y-2">
                    <div className="flex items-center space-x-2 text-[#007AFF]">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Office Reply</span>
                    </div>
                    <p className="text-sm text-[#424245] leading-relaxed">{item.adminReply}</p>
                  </div>
                )}

                {isAdmin && !item.adminReply && (
                  <div className="pt-2">
                    {activeReplyId === item.id ? (
                      <div className="space-y-3">
                        <textarea 
                          className="w-full p-3 bg-[#F5F5F7] rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#007AFF]"
                          placeholder="Type your reply..."
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                        />
                        <div className="flex space-x-2">
                          <button onClick={() => handleReply(item.id)} className="px-4 py-2 bg-[#007AFF] text-white text-xs font-bold rounded-lg">Send Reply</button>
                          <button onClick={() => setActiveReplyId(null)} className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setActiveReplyId(item.id)}
                        className="flex items-center space-x-2 text-[#007AFF] text-xs font-bold hover:underline"
                      >
                        <Reply className="w-4 h-4" />
                        <span>Reply to this feedback</span>
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}

            {feedbacks.length === 0 && !loading && (
              <div className="py-20 text-center text-[#86868B] italic">No feedback entries found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
