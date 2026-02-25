
import React, { useState, useEffect, useRef } from 'react';
import { 
  Crown, Zap, X, Timer, ArrowRight, Flame, Play, 
  CheckCircle2, Loader2, Home, Star, Coins, Rocket, Trophy,
  XCircle, Lock, Sparkles, ShieldCheck, Unlock, ChevronRight,
  Target, GraduationCap, MessageSquare, ShieldAlert, BadgeCheck,
  ChevronDown, TrendingUp, ArrowUpRight, User, Clock, AlertCircle,
  Eye, TrendingDown, ArrowRightCircle, TrendingUp as TrendUp,
  Maximize2, ZoomIn, ChevronsDown
} from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';
import { GoldBorderCard } from '../../UI.tsx';

interface MZPlusFlashOfferOverlayProps {
  profile: any;
  onUpgrade: () => void;
  isFullPage?: boolean;
}

const CHECKOUT_LINK = "https://mzplus.mychariow.shop/prd_iwhpro/checkout";
const REQUIRED_MINUTES = 10;

const PurpleText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <span className={`inline-block ${className}`} style={{ background: 'linear-gradient(to right, #e879f9, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}>{children}</span>
);

const GoldTextLocal: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <span className={`inline-block ${className}`} style={{ background: 'linear-gradient(to right, #fef08a, #ca8a04, #fef08a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}>{children}</span>
);

export const MZPlusFlashOfferOverlay: React.FC<MZPlusFlashOfferOverlayProps> = ({ profile, onUpgrade, isFullPage = false }) => {
  const [config, setConfig] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [proofs, setProofs] = useState<any[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<{ url: string; label: string } | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0); 
  const iframeRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && profile?.id && !isDismissed) {
      const sendHeartbeat = async () => {
        try {
          await supabase.rpc('mz_track_offer_heartbeat', { p_user_id: profile.id });
        } catch (e) {}
      };
      sendHeartbeat();
      const interval = setInterval(sendHeartbeat, 10000);
      return () => clearInterval(interval);
    }
  }, [isVisible, profile?.id, isDismissed]);

  const handleUpgradeClick = () => {
    window.open(CHECKOUT_LINK, '_blank');
    if (onUpgrade) onUpgrade();
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const progress = Math.max(0, 1 - scrollTop / 300);
    setScrollProgress(progress);
  };

  const getAuthenticComment = (index: number, timeFrame: string) => {
    const comments = [
      `"J'avais un peu peur de me lancer, mais après avoir appliqué les conseils du pack Premium pendant ${timeFrame}, je ne regrette absolument rien."`,
      `"C'est la première fois que je vois des résultats aussi rapides en Afrique. Passer Premium a débloqué tout mon potentiel."`,
      `"La différence entre le mode standard et le protocole MZ+ est juste énorme. Mes chiffres parlent d'eux-mêmes."`,
      `"Enfin du concret ! En seulement ${timeFrame}, j'ai pu récupérer mon investissement et commencer à générer du profit réel."`,
      `"L'IA Luna est un vrai plus, elle m'a aidé à corriger mes erreurs de débutant. Voici mon évolution..."`,
      `"Propre, rapide et efficace. Si vous hésitez encore, regardez juste la différence sur mon tableau de bord."`
    ];
    return comments[index % comments.length];
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) return;
      const [offerRes, proofsRes] = await Promise.all([
        supabase.from('mz_flash_offer_v2').select('*').eq('id', 'flash-offer-global').maybeSingle(),
        supabase.from('mz_premium_proofs').select('*').order('created_at', { ascending: false })
      ]);
      
      if (proofsRes.data) setProofs(proofsRes.data);
      
      if (offerRes.data?.is_active) {
        setConfig(offerRes.data);
        if (isFullPage) {
          setIsVisible(true);
        } else {
           const { data: mins } = await supabase.rpc('mz_get_user_total_minutes', { p_user_id: profile.id });
           if ((mins || 0) >= REQUIRED_MINUTES && localStorage.getItem(`mz_offer_seen_${profile.id}`) !== 'true') {
              setIsVisible(true);
              localStorage.setItem(`mz_offer_seen_${profile.id}`, 'true');
           }
        }
      }
    };
    fetchData();
  }, [profile?.id, isFullPage]);

  useEffect(() => {
    if (!config?.ends_at || !config?.show_timer) return;
    const interval = setInterval(() => {
      const dist = new Date(config.ends_at).getTime() - Date.now();
      if (dist < 0) { setTimeLeft(null); return; }
      setTimeLeft({
        days: Math.floor(dist / (1000 * 60 * 60 * 24)),
        hours: Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((dist % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [config]);

  useEffect(() => {
    if (isVisible && config?.youtube_iframe && iframeRef.current) {
        iframeRef.current.innerHTML = config.youtube_iframe.replace(/width="\d+"/, 'width="100%"').replace(/height="\d+"/, 'height="100%"');
        const frame = iframeRef.current.querySelector('iframe');
        if (frame && !frame.src.includes('autoplay=1')) frame.src += (frame.src.includes('?') ? '&' : '?') + 'autoplay=1&mute=0';
    }
  }, [isVisible, config]);

  if (isDismissed || !isVisible || !config) return null;

  const promoPriceStr = parseInt(config.price_promo || '15000').toLocaleString();
  const normalPriceStr = parseInt(config.price_normal || '20000').toLocaleString();

  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="fixed inset-0 z-[9000] bg-[#050505] overflow-y-auto animate-fade-in pb-32 selection:bg-purple-600"
    >
      {/* BOUTON FLOTTANT PREUVES - MARKETING DYNAMIQUE */}
      <div 
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-3 pointer-events-none transition-all duration-300"
        style={{ opacity: scrollProgress, transform: `translateX(-50%) translateY(${(1 - scrollProgress) * 50}px)` }}
      >
         <div className="bg-yellow-600 text-black px-6 py-3 rounded-full border-2 border-yellow-400 shadow-[0_0_40px_rgba(202,138,4,0.4)] flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Voir les preuves réelles</span>
            <ChevronsDown size={18} className="animate-bounce" />
         </div>
      </div>

      {fullscreenImage && (
        <div className="fixed inset-0 z-[20000] flex flex-col items-center justify-center p-4 bg-black/98 backdrop-blur-2xl animate-fade-in" onClick={() => setFullscreenImage(null)}>
          <div className="absolute top-6 right-6 z-50">
             <button onClick={() => setFullscreenImage(null)} className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all shadow-2xl border border-white/10">
                <X size={28} />
             </button>
          </div>
          <div className="relative w-full max-w-[450px] aspect-[9/16] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_120px_rgba(139,92,246,0.3)] animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <img src={fullscreenImage.url} alt="Preuve" className="w-full h-full object-cover" />
            <div className="absolute top-6 left-6 px-4 py-1.5 bg-purple-600 rounded-full border border-purple-400/30">
               <span className="text-[10px] font-black uppercase text-white tracking-widest">{fullscreenImage.label}</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="fixed top-4 left-0 right-0 z-[100] px-4">
          <div className="max-w-md mx-auto bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-full flex justify-between items-center shadow-2xl">
            <div className="flex items-center gap-3 pl-4">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white"><Crown size={14} /></div>
              <h2 className="text-[10px] font-black tracking-widest uppercase text-white">MZ+ <PurpleText>PREMIUM</PurpleText></h2>
            </div>
            <button onClick={() => isFullPage ? window.location.href='/' : setIsDismissed(true)} className="p-2 text-neutral-500 hover:text-white transition-all"><X size={20}/></button>
          </div>
        </div>

        <section className="text-center pt-24 space-y-6">
           {/* CHRONO TOUT EN HAUT AVEC LOGIQUE DES JOURS */}
           {config.show_timer && timeLeft && (
             <div className="flex flex-col items-center gap-3 mb-8 animate-fade-in">
                <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-5 py-2 rounded-full border border-red-500/20 shadow-lg shadow-red-900/10">
                   <Timer size={14} className="animate-pulse" />
                   <span className="text-[9px] font-black uppercase tracking-[0.3em]">Offre limitée • Expire dans :</span>
                </div>
                <div className="flex gap-4 font-mono text-4xl md:text-7xl font-black text-white tracking-tighter">
                   {timeLeft.days > 0 && (
                     <>
                        <div className="flex flex-col items-center text-yellow-500">
                          <span>{timeLeft.days.toString().padStart(2, '0')}</span>
                          <span className="text-[7px] text-neutral-600 uppercase font-black tracking-widest mt-1">Jours</span>
                        </div>
                        <span className="text-neutral-800 self-center mb-4">:</span>
                     </>
                   )}
                   <div className="flex flex-col items-center">
                     <span>{timeLeft.hours.toString().padStart(2, '0')}</span>
                     <span className="text-[7px] text-neutral-600 uppercase font-black tracking-widest mt-1">Hrs</span>
                   </div>
                   <span className="text-neutral-800 self-center mb-4">:</span>
                   <div className="flex flex-col items-center">
                     <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>
                     <span className="text-[7px] text-neutral-600 uppercase font-black tracking-widest mt-1">Min</span>
                   </div>
                   <span className="text-neutral-800 self-center mb-4">:</span>
                   <div className="flex flex-col items-center">
                     <span className="text-purple-500">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                     <span className="text-[7px] text-neutral-600 uppercase font-black tracking-widest mt-1">Sec</span>
                   </div>
                </div>
             </div>
           )}

           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-600/10 border border-purple-600/20 rounded-full">
              <Zap size={14} className="text-purple-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Accès VIP Uniquement</span>
           </div>
           
           <h1 className="text-4xl md:text-8xl font-black uppercase leading-[0.85] text-white tracking-tighter pt-2">
             LANCE TON BUSINESS <br/>
             <PurpleText>SANS LIMITES AVEC MZ+</PurpleText>
           </h1>
        </section>

        <div className="space-y-10">
           {/* VIDÉO MASTERCLASS */}
           <div className="max-w-5xl mx-auto aspect-video rounded-[3rem] overflow-hidden border border-white/10 bg-black shadow-[0_0_100px_rgba(139,92,246,0.2)]" ref={iframeRef}></div>
           
           {/* CTA PRINCIPAL AVEC PRIX INTÉGRÉ ET ANCRAGE */}
           <div className="max-w-xl mx-auto text-center space-y-8">
              <div className="flex flex-col items-center gap-1 animate-fade-in">
                 <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Valeur réelle : <span className="line-through">{normalPriceStr} CFA</span></p>
                 <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-yellow-600/30"></div>
                    <p className="text-3xl font-black text-white font-mono">{promoPriceStr} CFA <span className="text-yellow-500 text-sm ml-1">UNIQUE</span></p>
                    <div className="h-px w-8 bg-yellow-600/30"></div>
                 </div>
              </div>

              <button onClick={handleUpgradeClick} className="group w-full py-7 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs md:text-sm tracking-widest shadow-[0_20px_60px_rgba(124,58,237,0.5)] hover:scale-[1.03] transition-all flex flex-col items-center justify-center gap-1">
                 <span className="flex items-center gap-3">
                   ACTIVER MON ACCÈS ÉLITE — {promoPriceStr} CFA <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                 </span>
                 <span className="text-[8px] opacity-60 font-medium tracking-[0.2em]">Paiement Mobile Money Sécurisé</span>
              </button>

              <div className="flex flex-col items-center gap-2 opacity-50 animate-pulse pt-4">
                 <p className="text-[8px] font-black uppercase text-neutral-500 tracking-[0.4em]">Découvre les preuves de l'armée MZ+</p>
                 <ChevronDown size={16} className="text-yellow-600" />
              </div>
           </div>
        </div>

        {/* SECTION PREUVES SOCIALES */}
        {proofs.length > 0 && (
          <section className="space-y-16 py-16" id="proofs-section">
            <div className="text-center space-y-4">
               <h3 className="text-3xl md:text-6xl font-black uppercase tracking-tighter text-white italic">RÉSULTATS DES <GoldTextLocal>MEMBRES</GoldTextLocal></h3>
               <div className="flex items-center justify-center gap-4 opacity-40">
                  <div className="h-px w-12 bg-white"></div>
                  <p className="text-[10px] text-white font-black uppercase tracking-[0.5em]">L'impact du protocole Premium</p>
                  <div className="h-px w-12 bg-white"></div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
               {proofs.map((proof, index) => (
                 <div key={proof.id} className="space-y-8 animate-fade-in group">
                    <div className="flex items-center justify-between px-2">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 font-black uppercase shadow-lg border border-white/5">{proof.name.charAt(0)}</div>
                          <p className="text-xs font-black uppercase text-white tracking-widest">{proof.name}</p>
                       </div>
                       <div className="px-3 py-1 bg-purple-600/10 border border-purple-600/20 text-purple-400 rounded-lg">
                          <p className="text-[8px] font-black uppercase tracking-widest">En {proof.time_frame}</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-4">
                          <div 
                            className="aspect-[9/16] rounded-[2rem] overflow-hidden border border-white/5 bg-neutral-900 relative grayscale opacity-30 cursor-zoom-in hover:opacity-100 transition-all group/zoom"
                            onClick={() => setFullscreenImage({ url: proof.before_image_url, label: "Avant (Mode Standard)" })}
                          >
                             <img src={proof.before_image_url} alt="Avant" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="px-3 py-1 bg-black/80 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                                   <span className="text-[7px] font-black text-white uppercase tracking-widest">AVANT</span>
                                   <ZoomIn size={10} className="text-neutral-500 opacity-0 group-hover/zoom:opacity-100 transition-opacity" />
                                </div>
                             </div>
                          </div>
                          <div className="text-center">
                             <p className="text-[8px] font-black text-neutral-600 uppercase mb-1">Portefeuille Initial</p>
                             <p className="text-xs font-mono font-black text-neutral-500 line-through tracking-tighter">{proof.before_amount}</p>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <div 
                            className="aspect-[9/16] rounded-[2rem] overflow-hidden border-2 border-purple-600/40 bg-neutral-900 relative shadow-[0_20px_50px_rgba(139,92,246,0.3)] group-hover:scale-[1.05] transition-transform duration-700 cursor-zoom-in group/zoom2"
                            onClick={() => setFullscreenImage({ url: proof.after_image_url, label: `Après (${proof.time_frame})` })}
                          >
                             <img src={proof.after_image_url} alt="Après" className="w-full h-full object-cover" />
                             <div className="absolute top-4 right-4">
                                <div className="p-1.5 bg-emerald-500 rounded-full shadow-lg animate-pulse">
                                   <TrendUp size={12} className="text-white" />
                                </div>
                             </div>
                             <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent pointer-events-none"></div>
                             <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                                <div className="px-3 py-1 bg-purple-600 rounded-full border border-purple-400 shadow-xl flex items-center gap-2">
                                   <span className="text-[7px] font-black text-white uppercase tracking-widest">IMPACT MZ+</span>
                                   <Maximize2 size={10} className="opacity-60 group-hover/zoom2:scale-125 transition-transform" />
                                </div>
                             </div>
                          </div>
                          <div className="text-center">
                             <p className="text-[8px] font-black text-purple-400 uppercase mb-1">Gains Générés</p>
                             <p className="text-xl font-mono font-black text-emerald-400 tracking-tighter">{proof.after_amount}</p>
                          </div>
                       </div>
                    </div>
                    <div className="p-5 bg-white/5 border border-white/5 rounded-[1.5rem] text-center min-h-[90px] flex items-center justify-center">
                       <p className="text-[11px] text-neutral-400 font-medium italic leading-relaxed">
                         {getAuthenticComment(index, proof.time_frame)}
                       </p>
                    </div>
                 </div>
               ))}
            </div>
          </section>
        )}

        {/* COMPARATIF STANDARD VS ÉLITE */}
        <section className="space-y-16 py-12 border-t border-white/5">
           <div className="text-center space-y-4">
              <h3 className="text-3xl md:text-6xl font-black uppercase tracking-tighter text-white">VOTRE NIVEAU ACTUEL VS <PurpleText>ÉLITE</PurpleText></h3>
              <p className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.4em]">Débloquez la machine à commissions</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto items-stretch">
              <div className="bg-neutral-900/30 border border-white/5 rounded-[3rem] p-10 opacity-30 grayscale flex flex-col">
                 <div className="mb-10">
                    <p className="text-[10px] font-black uppercase text-neutral-600 tracking-widest mb-2">MODE AMBASSADEUR</p>
                    <h4 className="text-4xl font-black text-neutral-500 italic uppercase">Standard</h4>
                 </div>
                 <div className="space-y-5 flex-1">
                    {[
                      "Accès Affiliation",
                      "RPA Revenu par Vidéo",
                      "Académie MZ+ (Formations)",
                      "Coaching Élite",
                      "Assistante IA Luna",
                      "Communauté VIP",
                    ].map((f, i) => (
                      <div key={i} className="flex justify-between items-center text-[10px] font-bold text-neutral-500 uppercase border-b border-white/5 pb-3">
                        <span className="max-w-[70%]">{f}</span>
                        {i === 0 ? <CheckCircle2 size={16}/> : <XCircle size={16}/>}
                      </div>
                    ))}
                 </div>
              </div>
              
              <div className="bg-gradient-to-b from-purple-900/30 to-black border-2 border-purple-600/40 rounded-[3rem] p-10 relative shadow-[0_0_80px_rgba(139,92,246,0.2)] flex flex-col scale-[1.03]">
                 <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[9px] font-black px-6 py-2 rounded-full tracking-[0.2em] shadow-2xl animate-bounce">OFFRE PRIORITAIRE</div>
                 <div className="mb-10">
                    <p className="text-[10px] font-black uppercase text-purple-400 tracking-widest mb-2">MODE AMBASSADEUR</p>
                    <h4 className="text-4xl font-black text-white italic uppercase leading-none mb-4">MZ+ <PurpleText>PREMIUM</PurpleText></h4>
                    <div className="flex flex-col items-start gap-1">
                       <p className="text-2xl font-black text-neutral-500 line-through tracking-widest ml-1">{normalPriceStr} CFA</p>
                       <div className="flex items-baseline gap-2">
                          <p className="text-6xl font-mono font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">{promoPriceStr}</p>
                          <span className="text-sm font-black text-purple-500 uppercase tracking-widest animate-pulse">CFA / À VIE</span>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-5 flex-1 mb-10">
                    {[
                      "Accès Affiliation Illimité",
                      "RPA Actif (Revenu Vidéo)",
                      "Académie MZ+ (Accès Total)",
                      "Coaching Élite Direct",
                      "Luna IA Illimitée",
                      "Communauté Privée VIP",
                    ].map((f, i) => (
                      <div key={i} className="flex justify-between items-center text-[11px] font-black text-white uppercase border-b border-purple-500/10 pb-3">
                        <span className="max-w-[75%] tracking-tight">{f}</span>
                        <CheckCircle2 size={18} className="text-purple-400 shadow-glow"/>
                      </div>
                    ))}
                 </div>
                 <button onClick={handleUpgradeClick} className="w-full py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_15px_40px_rgba(124,58,237,0.4)]">
                   REJOINDRE L'ÉLITE MAINTENANT <ArrowRight size={20}/>
                 </button>
              </div>
           </div>
        </section>

        <footer className="text-center py-20 space-y-12 border-t border-white/5">
           <div className="space-y-6">
              <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">PRÊT À REJOINDRE <br/><PurpleText>LE CERCLE DES GAGNANTS ?</PurpleText></h2>
              {config.show_timer && timeLeft && (
                <div className="flex flex-col items-center gap-6">
                   <div className="flex items-center gap-3 text-red-500 animate-pulse bg-red-500/10 px-6 py-2.5 rounded-full border border-red-500/20">
                      <Timer size={18} />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">C'est ta dernière chance d'accéder à ce prix</span>
                   </div>
                   <div className="flex gap-8 font-mono text-4xl md:text-6xl font-black text-white tracking-tighter">
                      {timeLeft.days > 0 && (
                        <>
                           <div className="flex flex-col items-center text-yellow-500">
                             <span>{timeLeft.days.toString().padStart(2, '0')}</span>
                             <p className="text-[8px] text-neutral-600 mt-2 uppercase tracking-widest">Jours</p>
                           </div>
                           <span className="text-neutral-800">:</span>
                        </>
                      )}
                      <div className="flex flex-col items-center"><span>{timeLeft.hours.toString().padStart(2, '0')}</span><p className="text-[8px] text-neutral-600 mt-2 uppercase tracking-widest">Heures</p></div>
                      <span className="text-neutral-800">:</span>
                      <div className="flex flex-col items-center"><span>{timeLeft.minutes.toString().padStart(2, '0')}</span><p className="text-[8px] text-neutral-600 mt-2 uppercase tracking-widest">Minutes</p></div>
                      <span className="text-neutral-800">:</span>
                      <div className="flex flex-col items-center"><span className="text-purple-600">{timeLeft.seconds.toString().padStart(2, '0')}</span><p className="text-[8px] text-neutral-600 mt-2 uppercase tracking-widest">Secondes</p></div>
                   </div>
                </div>
              )}
           </div>
           <div className="max-w-2xl mx-auto space-y-8">
              <button onClick={handleUpgradeClick} className="group w-full py-8 bg-white text-black rounded-[3rem] font-black uppercase text-sm md:text-xl tracking-[0.25em] shadow-[0_30px_70px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4">
                DÉVERROUILLER TOUT LE SYSTÈME — {promoPriceStr} CFA <ArrowRight size={28} strokeWidth={3} />
              </button>
              <div className="flex items-center justify-center gap-8 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white">Garantie MZ+</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white">Revenus Réels</span>
                  </div>
              </div>
           </div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .shadow-glow { filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.6)); }
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        @keyframes slide-up { from { opacity: 0; transform: translateY(50px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
};
