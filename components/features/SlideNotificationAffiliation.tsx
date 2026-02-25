import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Lock, TrendingUp } from 'lucide-react';

/**
 * SlideNotificationAffiliation
 * A premium notification for the Affiliation section.
 * Appears only from the 2nd visit onwards.
 */
export const SlideNotificationAffiliation: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenClosed, setHasBeenClosed] = useState(false);

  useEffect(() => {
    // Logic for tracking visits to the Affiliation section
    const visitsKey = 'mz_affiliation_visits';
    const closedKey = 'mz_affiliation_notif_closed';
    
    const currentVisits = parseInt(localStorage.getItem(visitsKey) || '0');
    const isClosed = localStorage.getItem(closedKey) === 'true';
    
    // Increment visit count
    const newVisits = currentVisits + 1;
    localStorage.setItem(visitsKey, newVisits.toString());
    
    // Condition: 2nd visit or more AND not closed before
    if (newVisits >= 2 && !isClosed) {
      // Delay for better visual impact (10 seconds as requested)
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Persist the closed state so it doesn't reappear immediately
    localStorage.setItem('mz_affiliation_notif_closed', 'true');
    setHasBeenClosed(true);
  };

  return (
    <AnimatePresence>
      {isVisible && !hasBeenClosed && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 20,
            duration: 0.8 
          }}
          className="fixed top-24 left-4 md:left-8 z-[100] max-w-[420px] w-[calc(100%-2rem)]"
        >
          <div className="relative overflow-hidden rounded-[2rem] bg-[#050505] border border-yellow-600/30 shadow-[0_30px_60px_rgba(0,0,0,0.8)] p-8 group">
            {/* Premium Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-600/10 blur-[80px] rounded-full pointer-events-none"></div>
            
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors z-20"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>

            <div className="relative z-10 space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 border border-violet-400/30 flex items-center justify-center text-white shadow-lg shadow-violet-900/40">
                  <Sparkles size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-600">Exclusivité MZ+</span>
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Opportunité Détectée</span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <p className="text-base text-white font-bold leading-relaxed">
                  💡 Tu fais peut-être déjà de l’affiliation… mais sans vrais résultats.
                </p>
                
                <p className="text-sm text-neutral-300 leading-relaxed font-medium">
                  Certains ambassadeurs ont généré plus de <span className="text-yellow-500 font-black">100 000 FCFA</span> simplement en appliquant la bonne méthode.
                </p>
                
                <div className="flex items-center gap-3 py-2 px-4 bg-violet-600/10 rounded-xl border border-violet-500/20 w-fit">
                  <p className="text-[11px] font-black uppercase tracking-wider text-violet-300">
                    🔓 Passe au niveau supérieur pour découvrir la stratégie.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button className="group/btn relative w-full py-5 bg-violet-700 hover:bg-violet-600 text-white rounded-2xl font-black uppercase text-[12px] tracking-[0.25em] transition-all duration-300 border border-yellow-600/40 shadow-[0_15px_30px_rgba(124,58,237,0.4)] active:scale-[0.98] flex items-center justify-center gap-4 overflow-hidden">
                {/* Shimmer effect on button */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer pointer-events-none"></div>
                
                <span className="relative z-10">Passez au niveau supérieur</span>
                <TrendingUp size={18} className="relative z-10 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </button>
            </div>
            
            {/* Metallic Gold Bottom Border */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-600/60 to-transparent"></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
