import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogIn, UserPlus, Send, CheckCircle2, Lock, Smartphone, AlertCircle, ShieldCheck, ChevronRight, Globe, ArrowLeft } from 'lucide-react';
import { WARDS, LGA, UserRole } from '../constants';
import api from '../lib/api';

interface AuthPageProps {
  onBack?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    lga: 'Jalingo' as LGA,
    ward: '',
    role: 'Supporter' as UserRole,
    isApcMember: true,
    gender: 'Male',
    dob: '',
    vin: '',
  });
  const [loginData, setLoginData] = useState({
    phoneNumber: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/api/settings');
        if (res.data) setSettings(res.data);
      } catch (err) {
        // Silently use defaults if network fails to avoid blocking user
        console.warn("Using default campaign settings due to network latency");
      }
    };
    fetchSettings();
  }, []);

  const validatePhone = (phone: string) => /^\d{10,11}$/.test(phone);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isRegistering) {
        if (formData.fullName.length < 3) throw new Error("Full Name must be at least 3 characters");
        if (!validatePhone(formData.phoneNumber)) throw new Error("Please enter a valid Nigerian phone number");
        if (formData.password.length < 6) throw new Error("Password must be at least 6 characters for tactical security");
        if (!formData.ward) throw new Error("Tactical sector (Ward) selection required");

        await register(formData);
        showToast("Access Request Logged. Status: Pending Vetting", "success");
        setIsRegistering(false);
      } else {
        if (!validatePhone(loginData.phoneNumber)) throw new Error("Enter a valid phone number");
        await login(loginData.phoneNumber, loginData.password);
        showToast("Intelligence Uplink Successful", "success");
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Operation Failed";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white font-sans selection:bg-apc-blue/10 overflow-hidden">
      {/* Mega Hero Section: Magazine Style */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-apc-blue">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          <img 
            src={settings?.authPageImage || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2670"} 
            alt="Campaign" 
            className="w-full h-full object-cover grayscale-[20%] brightness-75"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-apc-blue/80 via-transparent to-black/60" />
        </motion.div>

        {/* Brand Overlay */}
        <div className="absolute top-12 left-12 flex items-center space-x-3 z-50">
           <div className="w-14 h-14 apc-gradient-green rounded-3xl flex items-center justify-center shadow-xl shadow-black/20 overflow-hidden">
             {settings?.logoUrl ? (
               <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
             ) : (
               <Send className="w-7 h-7 text-white" />
             )}
           </div>
           <div className="flex flex-col">
             <span className="font-display font-black text-2xl tracking-tighter text-white leading-none">{settings?.campaignTitle || "APC"}</span>
             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-apc-gold/80">{settings?.campaignSubtitle || "Command Portal"}</span>
           </div>
        </div>

        <div className="relative z-10 p-20 flex flex-col justify-end h-full text-white w-full">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="max-w-4xl"
          >
            <div className="flex items-center space-x-4 mb-6">
               <div className="h-0.5 w-12 bg-apc-gold" />
               <span className="text-xs font-black uppercase tracking-[0.4em] text-apc-gold">{settings?.campaignTitle || "SYSTEMS ACTIVE"}</span>
            </div>
            
            <h2 className="text-[7vw] lg:text-[6vw] font-display font-black tracking-tighter leading-[0.85] uppercase">
              SMART <br />
              <span className="text-apc-green inline-block hover:scale-105 transition-transform cursor-default">GOVERNANCE</span> <br />
              <span className="text-[3vw] lg:text-[2vw] font-light tracking-[0.1em] text-white/60">FOR TARABA FEDERAL</span>
            </h2>

            <div className="mt-12 flex flex-wrap gap-10 border-t border-white/10 pt-12">
               <div className="space-y-1">
                 <p className="text-4xl font-display font-black tracking-tighter">100%</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Data Driven</p>
               </div>
               <div className="space-y-1">
                 <p className="text-4xl font-display font-black tracking-tighter text-apc-gold underline decoration-apc-green decoration-4 underline-offset-8">Wards</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Verified Coverage</p>
               </div>
               <div className="space-y-1">
                 <p className="text-4xl font-display font-black tracking-tighter">Secure</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Tactical Comms</p>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Architectural Badge */}
        <div className="absolute top-12 right-12 p-6 bg-white/5 backdrop-blur-2xl rounded-4xl border border-white/10 flex flex-col space-y-4 shadow-2xl">
           <div className="flex items-center space-x-3">
             <ShieldCheck className="w-5 h-5 text-apc-green" />
             <span className="text-[10px] font-black uppercase tracking-widest">Auth v2.10</span>
           </div>
           <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: "85%" }}
               transition={{ delay: 1, duration: 2 }}
               className="h-full bg-apc-green" 
             />
           </div>
        </div>
      </div>

      {/* Form Section: Polished & Clean */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F4F5F7] lg:bg-white relative">
        {/* Abstract Architectural Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-apc-blue/5 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-apc-green/5 rounded-full blur-[120px] -ml-48 -mb-48" />

        <div className="md:hidden flex flex-col items-center mb-10 space-y-3">
           <div className="w-14 h-14 apc-gradient-green rounded-[24px] flex items-center justify-center shadow-xl">
             <Send className="w-7 h-7 text-white" />
           </div>
           <h1 className="text-2xl font-display font-black tracking-tighter text-apc-blue uppercase">{settings?.campaignTitle || "APC PORTAL"}</h1>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-[460px] space-y-10 relative z-10"
        >
          <div className="space-y-1">
            <h2 className="text-5xl font-display font-black tracking-tighter text-apc-blue leading-none">
              {isRegistering ? "ENLIST" : "IDENTITY"}
            </h2>
            <div className="text-gray-400 font-medium tracking-tight flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-apc-gold" />
              <span>{isRegistering ? "Strategic member registration" : "Authorized personnel entrance"}</span>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[64px] shadow-[0_48px_80px_-20px_rgba(0,0,0,0.08)] border border-gray-100 space-y-8">
            {onBack && (
              <button 
                onClick={onBack}
                className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-apc-blue transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Public Site</span>
              </button>
            )}
            <div className="grid grid-cols-2 bg-gray-50/50 p-2 rounded-[32px] border border-gray-100">
               <button 
                onClick={() => setIsRegistering(false)}
                className={`py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${!isRegistering ? 'bg-white text-apc-blue shadow-lg scale-105' : 'text-gray-400 hover:text-apc-blue'}`}
               >
                  Sign In
               </button>
               <button 
                onClick={() => setIsRegistering(true)}
                className={`py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${isRegistering ? 'bg-white text-apc-blue shadow-lg scale-105' : 'text-gray-400 hover:text-apc-blue'}`}
               >
                  Register
               </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-8">
              <AnimatePresence mode="wait">
                {isRegistering ? (
                  <motion.div 
                    key="register"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Legal Full Name"
                        required
                        className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-3xl focus:ring-2 focus:ring-apc-green focus:bg-white transition-all outline-none text-sm font-bold placeholder:text-gray-300"
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number (Access ID)"
                        required
                        className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-3xl focus:ring-2 focus:ring-apc-green focus:bg-white transition-all outline-none text-sm font-bold placeholder:text-gray-300"
                        value={formData.phoneNumber}
                        onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                      />
                      <input
                        type="password"
                        placeholder="Create Password"
                        required
                        className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-3xl focus:ring-2 focus:ring-apc-green focus:bg-white transition-all outline-none text-sm font-bold placeholder:text-gray-300"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          className="px-6 py-4 bg-bg-secondary border border-gray-100 rounded-3xl focus:ring-2 focus:ring-apc-green focus:bg-white transition-all outline-none text-sm font-bold appearance-none"
                          value={formData.lga}
                          onChange={e => setFormData({...formData, lga: e.target.value as LGA, ward: ''})}
                        >
                          {Object.keys(WARDS).map(lga => (
                            <option key={lga} value={lga}>{lga}</option>
                          ))}
                        </select>
                        <select
                          required
                          className="px-6 py-4 bg-bg-secondary border border-gray-100 rounded-3xl focus:ring-2 focus:ring-apc-green focus:bg-white transition-all outline-none text-sm font-bold appearance-none"
                          value={formData.ward}
                          onChange={e => setFormData({...formData, ward: e.target.value})}
                        >
                          <option value="">Select Ward</option>
                          {WARDS[formData.lga].map(ward => (
                            <option key={ward} value={ward}>{ward}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          required
                          className="px-6 py-4 bg-bg-secondary border border-gray-100 rounded-3xl focus:ring-2 focus:ring-apc-green focus:bg-white transition-all outline-none text-sm font-bold appearance-none"
                          value={formData.gender}
                          onChange={e => setFormData({...formData, gender: e.target.value})}
                        >
                          <option value="Male">Gender: Male</option>
                          <option value="Female">Gender: Female</option>
                          <option value="Other">Gender: Other</option>
                        </select>
                        <input
                          type="date"
                          placeholder="Date of Birth"
                          required
                          className="px-6 py-4 bg-bg-secondary border border-gray-100 rounded-3xl focus:ring-2 focus:ring-apc-green focus:bg-white transition-all outline-none text-sm font-bold placeholder:text-gray-300"
                          value={formData.dob}
                          onChange={e => setFormData({...formData, dob: e.target.value})}
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="Voter's Identification Number (VIN)"
                        required
                        className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-3xl focus:ring-2 focus:ring-apc-green focus:bg-white transition-all outline-none text-sm font-bold placeholder:text-gray-300 uppercase"
                        value={formData.vin}
                        onChange={e => setFormData({...formData, vin: e.target.value.toUpperCase()})}
                      />

                      <select
                        className="w-full px-6 py-4 bg-bg-secondary border border-gray-100 rounded-3xl focus:ring-2 focus:ring-apc-green focus:bg-white transition-all outline-none text-sm font-bold appearance-none"
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                      >
                        <option value="Supporter">Role: Supporter</option>
                        <option value="Delegate">Role: Delegate</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-5 apc-gradient-green text-white rounded-[28px] font-black uppercase tracking-[0.2em] shadow-xl shadow-apc-green/20 hover:scale-[1.02] active:scale-95 transition-all text-xs flex items-center justify-center space-x-3"
                    >
                      {loading ? <span className="animate-pulse">Processing...</span> : (
                        <>
                          <ShieldCheck className="w-5 h-5" />
                          <span>Complete Enlistment</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="login"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="relative group">
                        <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-apc-blue transition-colors" />
                        <input
                          type="tel"
                          placeholder="Phone Identifier"
                          required
                          className="w-full pl-14 pr-6 py-5 bg-bg-secondary border border-gray-100 rounded-[28px] focus:ring-2 focus:ring-apc-blue focus:bg-white transition-all outline-none font-bold text-sm"
                          value={loginData.phoneNumber}
                          onChange={e => setLoginData({...loginData, phoneNumber: e.target.value})}
                        />
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-apc-blue transition-colors" />
                        <input
                          type="password"
                          placeholder="Tactical Password"
                          required
                          className="w-full pl-14 pr-6 py-5 bg-bg-secondary border border-gray-100 rounded-[28px] focus:ring-2 focus:ring-apc-blue focus:bg-white transition-all outline-none font-bold text-sm"
                          value={loginData.password}
                          onChange={e => setLoginData({...loginData, password: e.target.value})}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-5 apc-gradient-blue text-white rounded-[28px] font-black uppercase tracking-[0.2em] shadow-xl shadow-apc-blue/20 hover:scale-[1.02] active:scale-95 transition-all text-xs flex items-center justify-center space-x-3"
                    >
                      {loading ? <span className="animate-pulse">Authorizing...</span> : (
                        <>
                          <LogIn className="w-5 h-5" />
                          <span>Secure Access Entry</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          <div className="text-center">
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em] italic">
               Official APC Campaign Platform
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
