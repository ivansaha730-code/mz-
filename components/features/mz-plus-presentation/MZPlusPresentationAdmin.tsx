
import React, { useState, useEffect } from 'react';
import { Settings, Play, Save, Power, RefreshCw, AlertTriangle, Eye } from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';
import { GoldBorderCard, PrimaryButton, GoldText } from '../../UI.tsx';

export const MZPlusPresentationAdmin: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [youtubeId, setYoutubeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase.from('mz_plus_offer_config').select('*').maybeSingle();
      if (data) {
        setIsActive(data.is_active);
        setYoutubeId(data.youtube_id);
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleSave = async (resetCounter: boolean = false) => {
    setIsSaving(true);
    try {
      const endsAt = resetCounter 
        ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      const updateData: any = { 
        is_active: isActive, 
        youtube_id: youtubeId,
        updated_at: new Date().toISOString()
      };
      
      if (endsAt) updateData.ends_at = endsAt;

      const { error } = await supabase
        .from('mz_plus_offer_config')
        .upsert({ id: 'global-config', ...updateData });

      if (error) throw error;
      alert("Configuration mise à jour !");
    } catch (e: any) {
      alert("Erreur: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center opacity-50 uppercase text-[10px] font-black">Chargement configuration...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <GoldBorderCard className="p-8 border-yellow-600/20 bg-black/40">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-600/10 rounded-2xl text-yellow-600">
              <Settings size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Configuration <GoldText>Offre MZ+</GoldText></h3>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Gérez la visibilité et le contenu du tunnel Élite</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
              isActive ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-red-600/20 text-red-500'
            }`}
          >
            <Power size={14} /> {isActive ? 'PAGE ACTIVE' : 'PAGE DÉSACTIVÉE'}
          </button>
        </div>

        <div className="space-y-8">
          {/* YouTube Config */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest flex items-center gap-2">
              <Play size={12} className="text-yellow-600" /> ID Vidéo YouTube (ex: dQw4w9WgXcQ)
            </label>
            <div className="relative">
              <input 
                type="text" 
                className="w-full bg-black border border-white/10 rounded-xl p-5 text-white font-mono text-sm outline-none focus:border-yellow-600 transition-all shadow-inner"
                placeholder="Entrez l'ID de la vidéo YouTube..."
                value={youtubeId}
                onChange={e => setYoutubeId(e.target.value)}
              />
              {youtubeId && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 flex items-center gap-2">
                   <Eye size={16} /> <span className="text-[9px] font-black uppercase">Prêt</span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Info (Static for now as per prompt) */}
          <div className="grid grid-cols-2 gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
             <div className="text-center">
                <p className="text-[8px] font-black uppercase text-neutral-600 mb-1">Prix Normal</p>
                <p className="text-xl font-black text-white">150 000 CFA</p>
             </div>
             <div className="text-center">
                <p className="text-[8px] font-black uppercase text-neutral-600 mb-1">Prix Promo</p>
                <p className="text-xl font-black text-yellow-500">20 000 CFA</p>
             </div>
          </div>

          <div className="p-5 bg-yellow-600/5 border border-yellow-600/20 rounded-2xl flex items-start gap-4">
            <AlertTriangle className="text-yellow-600 shrink-0" size={20} />
            <p className="text-[10px] text-neutral-400 font-medium leading-relaxed italic">
              L'activation de cette page interrompt la navigation normale de l'ambassadeur (non MZ+) pour lui présenter cette offre exclusive avec un compte à rebours de 72h.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <PrimaryButton 
              onClick={() => handleSave(false)} 
              isLoading={isSaving}
              fullWidth
            >
              Mettre à jour le contenu
            </PrimaryButton>
            
            <button 
              onClick={() => handleSave(true)}
              className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"
            >
              <RefreshCw size={14} /> Relancer le compteur (3 jours)
            </button>
          </div>
        </div>
      </GoldBorderCard>
    </div>
  );
};
