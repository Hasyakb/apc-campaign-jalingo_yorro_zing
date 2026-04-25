import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[200] flex flex-col space-y-4 items-end">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`flex items-center space-x-4 p-4 pr-12 rounded-2xl shadow-2xl border min-w-[320px] relative overflow-hidden backdrop-blur-md ${
                toast.type === 'success' ? 'bg-apc-green/10 border-apc-green/20 text-apc-green' :
                toast.type === 'error' ? 'bg-apc-red/10 border-apc-red/20 text-apc-red' :
                toast.type === 'warning' ? 'bg-apc-gold/10 border-apc-gold/20 text-apc-gold' :
                'bg-apc-blue/10 border-apc-blue/20 text-apc-blue'
              }`}
            >
              {/* Background gradient for toast */}
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 -mr-12 -mt-12 ${
                 toast.type === 'success' ? 'bg-apc-green' :
                 toast.type === 'error' ? 'bg-apc-red' :
                 toast.type === 'warning' ? 'bg-apc-gold' :
                 'bg-apc-blue'
              }`} />

              <div className="flex-shrink-0">
                {toast.type === 'success' && <CheckCircle2 className="w-6 h-6" />}
                {toast.type === 'error' && <XCircle className="w-6 h-6" />}
                {toast.type === 'warning' && <AlertCircle className="w-6 h-6" />}
                {toast.type === 'info' && <Info className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">{toast.type}</p>
                <p className="font-bold text-sm leading-tight">{toast.message}</p>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
