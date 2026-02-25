
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Zap } from 'lucide-react';

interface AffiliationPremiumNagProps {
  onUpgrade: () => void;
}

export const AffiliationPremiumNag: React.FC<AffiliationPremiumNagProps> = ({ onUpgrade }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-black border-b border-yellow-600/50 p-4 text-center">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
        <p className="text-white text-sm font-bold">
          🚀 Certains ambassadeurs ont généré plus de 100 000 FCFA simplement en appliquant la bonne méthode.
        </p>
        <button 
          onClick={() => onUpgrade()}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-black uppercase"
        >
          Passe au niveau supérieur
        </button>
        <button onClick={() => setIsVisible(false)} className="text-neutral-500">
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
