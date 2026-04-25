import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, Zap, Target, ArrowRight, TrendingUp, ShieldCheck } from 'lucide-react';

interface StrategicIntelligenceProps {
  stats: {
    totalUsers: number;
    delegates: number;
    supporters: number;
  };
  wardData: any[];
  settings?: any;
}

export const StrategicIntelligence: React.FC<StrategicIntelligenceProps> = ({ stats, wardData, settings }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const generateIntelligence = async () => {
    // If there is an override in settings, use it instead of generating AI insight
    if (settings?.strategicInsightOverride) {
      setInsight(settings.strategicInsightOverride);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        You are a Top-level Political Campaign Strategist for an All Progressives Congress (APC) candidate in Taraba State, Nigeria.
        LGAs: Jalingo, Yorro, Zing.
        
        Campaign Context:
        - Total Registered Members: ${stats.totalUsers}
        - Verified Delegates: ${stats.delegates}
        - Supporters: ${stats.supporters}
        - Ward Concentration: ${wardData.map(w => `${w.name}: ${w.value}`).join(', ')}
        
        Task: Provide a concise, highly strategic, and energetic executive summary of the current campaign status.
        Include:
        1. A "Current Momentum" score (0-100%).
        2. A "Strategic Critical Objective" (one prioritized action).
        3. A "Tactical Insight" specifically for the ward with the lowest engagement or a general outreach tip.
        
        Tone: Authoritative, elite, political professional, visionary.
        Format: Markdown. Use bullet points for the 3 items above. Keep it under 200 words.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setInsight(response.text || 'Unable to generate intelligence at this moment.');
    } catch (err) {
      console.error(err);
      setError(true);
      setInsight('Operational Intel Unavailable. Check connection or API credentials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (settings?.strategicInsightOverride) {
      setInsight(settings.strategicInsightOverride);
    } else if (stats.totalUsers > 0) {
      generateIntelligence();
    }
  }, [stats.totalUsers, settings?.strategicInsightOverride]);

  return (
    <div className="h-full bg-white rounded-[56px] border border-gray-100 shadow-xl shadow-black/[0.02] relative overflow-hidden flex flex-col group min-h-[440px]">
      {/* Structural Accents */}
      <div className="absolute top-0 right-0 w-full h-2 bg-apc-gold" />
      <div className="absolute left-0 bottom-0 py-8 px-2 flex flex-col justify-end h-full border-r border-gray-50">
         <span className="vertical-text">Strategic Intelligence Unit</span>
      </div>

      <div className="flex-1 p-10 pl-16 flex flex-col">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-apc-blue rounded-3xl flex items-center justify-center shadow-lg shadow-apc-blue/10">
               <Brain className="w-7 h-7 text-apc-gold animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-black text-apc-blue tracking-tighter uppercase leading-none mb-1">Strategic <br />Intelligence</h3>
              <p className="text-[9px] font-black text-apc-green uppercase tracking-[0.2em] leading-none">{settings?.strategicInsightOverride ? 'Executive Directive Active' : 'Campaign AI Analyst Engaged'}</p>
            </div>
          </div>
          {!settings?.strategicInsightOverride && (
            <button 
              onClick={generateIntelligence}
              disabled={loading}
              className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center hover:bg-apc-blue hover:text-white transition-all border border-gray-100"
            >
              <Zap className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </header>

        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 pt-4"
              >
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-3 bg-gray-100 rounded-full animate-pulse w-full" style={{ width: `${100 - i * 15}%` }} />
                ))}
                <div className="flex items-center space-x-2">
                   <div className="w-2 h-2 rounded-full bg-apc-green animate-bounce" />
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Processing Field Intelligence...</span>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full overflow-y-auto custom-scrollbar pr-4"
              >
                <div className="text-[13px] font-bold leading-relaxed text-gray-500 strategic-output font-sans">
                  {insight.split('\n').map((line, i) => (
                     <p key={i} className={`${line.includes('Momentum') || line.includes('Objective') ? 'text-apc-blue font-black uppercase text-[11px] mb-2 mt-4 flex items-center' : 'mb-3'}`}>
                        {line.includes('Momentum') && <TrendingUp className="w-3 h-3 mr-2" />}
                        {line.includes('Objective') && <Target className="w-3 h-3 mr-2" />}
                        {line.includes('Insight') && <Zap className="w-3 h-3 mr-2 text-apc-gold" />}
                        {line.replace(/^[*-]\s*/, '')}
                     </p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
           <div className="flex items-center space-x-3">
              <ShieldCheck className="w-4 h-4 text-apc-green" />
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Classified Stream</span>
           </div>
           <button className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-apc-blue group-hover:translate-x-1 transition-transform">
            <span>Execute Directives</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </footer>
      </div>
    </div>
  );
};
