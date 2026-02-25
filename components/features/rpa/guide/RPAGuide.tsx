
import React, { useState, useEffect } from 'react';
import { GuideOverlay } from '../../../guides/GuideOverlay.tsx';
import { GuideStep } from '../../../guides/GuideStep.tsx';
import { useGuidePosition } from '../../../guides/useGuidePosition.ts';

interface RPAGuideProps {
  isActive: boolean;
  onComplete: () => void;
}

export const RPAGuide: React.FC<RPAGuideProps> = ({ isActive, onComplete }) => {
  const [step, setStep] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const getTargetId = () => {
    switch (step) {
      case 0: return null; // Welcome panel
      case 1: return null; // Intro panel
      case 2: return 'rpa-input-link';
      case 3: return 'rpa-submit-btn';
      case 4: return 'rpa-quota-badge';
      case 5: return 'rpa-balance-card';
      case 6: return 'rpa-cashout-btn';
      case 7: return 'rpa-history-log';
      default: return null;
    }
  };

  const targetId = getTargetId();
  const targetRect = useGuidePosition(targetId);

  const isTooltipStep = (step >= 2);

  useEffect(() => {
    let activeTimer: number | null = null;
    let activeInterval: number | null = null;

    const cleanup = () => {
      if (activeTimer) clearTimeout(activeTimer);
      if (activeInterval) clearInterval(activeInterval);
    };

    if (isActive) {
      // Reset isReady when step changes
      setIsReady(false);

      if (targetId) {
        const checkElement = () => {
          const element = document.getElementById(targetId);
          if (element) {
            // Smooth scroll with offset for better visibility
            const yOffset = -250; // Increased offset for better mobile visibility
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
            
            activeTimer = window.setTimeout(() => {
              setIsReady(true);
            }, 900);
            return true;
          }
          return false;
        };

        if (!checkElement()) {
          activeInterval = window.setInterval(() => {
            if (checkElement()) {
              if (activeInterval) clearInterval(activeInterval);
            }
          }, 150);
        }
      } else {
        activeTimer = window.setTimeout(() => {
          setIsReady(true);
        }, 900);
      }
    } else {
      setIsReady(false);
      setStep(0);
    }

    return cleanup;
  }, [isActive, targetId, step]);

  if (!isActive || !isReady) return null;

  const messages = [
    "Tu es maintenant dans la section RPA (Revenu Par Vidéo).\n\nIci, tu gagnes de l’argent grâce aux vidéos que tu crées et publies sur les réseaux sociaux.",
    "Comment gagner de l’argent avec le RPA ?\n\nC’est simple.\n\nCopiez le lien de la vidéo que vous voulez utiliser pour être rémunéré.",
    "Copiez le lien de la vidéo dans cette section.",
    "Une fois le lien collé, clique sur 'Valider ma vidéo' pour soumettre ta demande.",
    "Tu as une limite de 3 vidéos par jour. Assure-toi qu'elles respectent les règles pour être validées.",
    "Ici, tu peux suivre tes points accumulés et tes vidéos en attente de validation.",
    "Dès que tu as assez de points, tu peux retirer tes gains directement ici.",
    "Retrouve ici l'historique de toutes tes soumissions et leur statut."
  ];

  return (
    <>
      <GuideOverlay targetRect={targetRect} isVisible={isActive && isReady} />
      <GuideStep 
        isVisible={isActive && isReady} 
        message={messages[step]} 
        targetRect={targetRect}
        variant={(step === 0 || step === 1) ? 'panel' : 'tooltip'}
        onNext={step < messages.length - 1 ? () => {
          setStep(step + 1);
          setIsReady(false);
        } : undefined}
        onClose={() => {
          localStorage.setItem('mz_rpa_guide_v1_completed', 'true');
          onComplete();
        }}
        nextLabel="Suivant"
      />
    </>
  );
};
