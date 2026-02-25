import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, Users, Clock, Timer, Eye, Filter, RefreshCw, 
  ChevronRight, Calendar, User, Search, TrendingUp, AlertCircle,
  Activity, MousePointer2, Info, ArrowUpRight, Flame
} from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';
import { GoldBorderCard, GoldText, EliteBadge } from '../../UI.tsx';

export const UserBehaviorAdmin: React.FC = () => {
  const [trackingData, setTrackingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'all'>('today');

  const fetchTracking = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mz_offer_page_tracking')
        .select(`
          *,
          users:user_id(full_name, email, user_level)
        `)
        .order('started_at', { ascending: false });

      if (error) throw error;
      setTrackingData(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 30000); // Rafraîchir toutes les 30s
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const uniqueVisitors = new Set(trackingData.map(t => t.user_id)).size;
    const totalVisits = trackingData.length;
    const avgSeconds = trackingData.length > 0 
      ? trackingData.reduce((acc, t) => acc + t.duration_seconds, 0) / trackingData.length 
      : 0;
    
    // Visites > 2 minutes (Engagés)
    const hotLeads = trackingData.filter(t => t.duration_seconds >= 120).length;

    return { uniqueVisitors, totalVisits, avgSeconds, hotLeads };
  }, [trackingData]);

  const filteredList = useMemo(() => {
    return trackingData.filter(item => 
      item.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [trackingData, searchTerm]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* HEADER & GLOBAL STATS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
             <MousePointer2 className="text-emerald-500" /> Analyse <GoldText>Comportement Offre</GoldText>
          </h3>
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Audit du tunnel de conversion en temps réel</p>
        </div>
        <button onClick={fetchTracking} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-yellow-600 border border-white/5 transition-all">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BehaviorStatCard label="Visiteurs Uniques" value={stats.uniqueVisitors} icon={Users} color="text-blue-400" />
        <BehaviorStatCard label="Sessions Totales" value={stats.totalVisits} icon={Activity} color="text-purple-400" />
        <BehaviorStatCard label="Temps Moyen" value={formatDuration(Math.round(stats.avgSeconds))} icon={Timer} color="text-yellow-500" />
        <BehaviorStatCard label="Prospects Chauds" value={stats.hotLeads} icon={Flame} color="text-orange-500" subtitle="> 2 mins d'attention" />
      </div>

      {/* FILTERS & LOG */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
            <input 
              placeholder="Rechercher un prospect..." 
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs text-white outline-none focus:border-emerald-500/40"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-[#0a0a0a] border border-white/5 p-1 rounded-2xl">
             <button onClick={() => setFilterPeriod('today')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${filterPeriod === 'today' ? 'bg-emerald-600 text-white shadow-lg' : 'text-neutral-500'}`}>Aujourd'hui</button>
             <button onClick={() => setFilterPeriod('all')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${filterPeriod === 'all' ? 'bg-emerald-600 text-white shadow-lg' : 'text-neutral-500'}`}>Tout</button>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/40 text-[9px] font-black uppercase text-neutral-500 border-b border-neutral-800">
                <tr>
                  <th className="p-6">Ambassadeur</th>
                  <th className="p-6">Heure de Visite</th>
                  <th className="p-6">Durée Passée</th>
                  <th className="p-6">Attention</th>
                  <th className="p-6 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {loading && trackingData.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center opacity-30 uppercase font-black">Chargement des données...</td></tr>
                ) : filteredList.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center opacity-30 uppercase font-black">Aucune visite enregistrée</td></tr>
                ) : (
                  filteredList.map((track) => {
                    const isHot = track.duration_seconds >= 120;
                    const isLive = (Date.now() - new Date(track.last_ping).getTime()) < 30000;
                    
                    return (
                      <tr key={track.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="p-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white font-black uppercase text-xs border border-white/5">
                                {track.users?.full_name?.charAt(0) || '?'}
                              </div>
                              <div>
                                 <p className="font-black uppercase text-white tracking-tight">{track.users?.full_name || 'Inconnu'}</p>
                                 <p className="text-[8px] text-neutral-600 font-mono">{track.users?.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="flex flex-col">
                              <span className="text-white font-bold">{new Date(track.started_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              <span className="text-[8px] text-neutral-600 uppercase mt-0.5">{new Date(track.started_at).toLocaleDateString()}</span>
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="flex items-center gap-3">
                              <Clock size={12} className="text-emerald-500" />
                              <span className="font-mono font-black text-white text-sm">{formatDuration(track.duration_seconds)}</span>
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ${isHot ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min((track.duration_seconds / 300) * 100, 100)}%` }}
                              />
                           </div>
                        </td>
                        <td className="p-6 text-right">
                           <div className="flex justify-end items-center gap-2">
                              {isLive ? (
                                <div className="px-2 py-0.5 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 text-[7px] font-black uppercase rounded animate-pulse">EN DIRECT</div>
                              ) : isHot ? (
                                <div className="px-2 py-0.5 bg-orange-600/10 border border-orange-500/20 text-orange-500 text-[7px] font-black uppercase rounded">CHAUD</div>
                              ) : (
                                <div className="px-2 py-0.5 bg-neutral-800 text-neutral-600 text-[7px] font-black uppercase rounded">Passé</div>
                              )}
                           </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-8 bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem] flex items-start gap-4">
           <Info className="text-blue-400 shrink-0" size={24} />
           <p className="text-[10px] text-neutral-400 font-medium leading-relaxed italic uppercase">
             <strong>Note stratégique :</strong> Les utilisateurs restant plus de 2 minutes sur la page offre sont considérés comme des "Prospects Chauds". 
             Vous pouvez les contacter via la messagerie privée pour les aider à finaliser leur upgrade.
           </p>
        </div>
      </div>
    </div>
  );
};

const BehaviorStatCard = ({ label, value, icon: Icon, color, subtitle }: any) => (
  <GoldBorderCard className="p-6 bg-[#0c0c0c] border-white/5 hover:border-emerald-500/20 transition-all flex flex-col gap-4">
     <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl bg-white/5 ${color} shadow-lg`}>
           <Icon size={24} />
        </div>
        <p className="text-[8px] font-black uppercase text-neutral-600 tracking-[0.3em]">{label}</p>
     </div>
     <div>
        <p className="text-2xl font-black font-mono text-white tracking-tighter leading-none">{value}</p>
        {subtitle && <p className="text-[7px] font-bold text-neutral-600 uppercase mt-2 tracking-widest">{subtitle}</p>}
     </div>
  </GoldBorderCard>
);