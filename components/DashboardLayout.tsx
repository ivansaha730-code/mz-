
import React, { useState } from 'react';
import { 
  X, 
  LogOut, 
  ChevronRight, 
  GraduationCap, 
  Crown, 
  Trophy,
  Home,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Mail,
  Target,
  Menu,
  Coins,
  Briefcase,
  Settings,
  HelpCircle
} from 'lucide-react';
import { GoldText, EliteBadge } from './UI.tsx';
import { TabId, UserProfile } from '../types.ts';
import { supabase } from '../services/supabase.ts';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isAdmin?: boolean;
  profile: UserProfile | null;
  isMenuOpen?: boolean;
  setIsMenuOpen?: (open: boolean) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  isAdmin = false, 
  profile,
  isMenuOpen = false,
  setIsMenuOpen = (_open: boolean) => {}
}) => {
  const menuItems = [
    { id: 'dashboard' as TabId, label: 'Tableau de Bord', icon: Home },
    { id: 'revenus' as TabId, label: 'Trésorerie & Gains', icon: Coins },
    { id: 'affiliation' as TabId, label: 'Affiliation', icon: Briefcase },
    { id: 'rpa' as TabId, label: 'Revenu Vidéo RPA', icon: Target },
    { id: 'team' as TabId, label: 'Parrainage', icon: Mail },
    { id: 'formation' as TabId, label: 'Académie', icon: GraduationCap },
    { id: 'recompense' as TabId, label: "L'Arène Élite", icon: Trophy },
    { id: 'luna_chat' as TabId, label: 'Luna AI', icon: Sparkles },
    { id: 'private_chat' as TabId, label: 'Cercle Privé', icon: MessageSquare },
    { id: 'guides' as TabId, label: 'Guides & Aide', icon: HelpCircle },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 flex flex-col font-sans overflow-hidden">
      {/* HEADER FIXE PRESTIGE */}
      <header className="sticky top-0 z-[100] h-20 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 bg-yellow-600 rounded-xl flex items-center justify-center text-black shadow-lg">
            <Crown size={22} fill="currentColor" />
          </div>
          <span className="text-2xl font-black italic tracking-tighter text-white">MZ+</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex">
            <EliteBadge variant={profile?.user_level}>{profile?.user_level === 'niveau_mz_plus' ? 'MEMBRE PREMIUM' : 'AMBASSADEUR'}</EliteBadge>
          </div>
          <button 
            id="menu-button"
            onClick={() => setIsMenuOpen(true)}
            className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-neutral-400 hover:text-white transition-all active:scale-90"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* OVERLAY MENU MOBILE PLEIN ÉCRAN */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] flex animate-fade-in">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-2xl" onClick={() => setIsMenuOpen(false)}></div>
          <div className="relative w-full max-w-md bg-[#080808] h-full border-r border-white/10 p-8 flex flex-col animate-slide-right shadow-2xl overflow-y-auto">
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-600 rounded-2xl flex items-center justify-center text-black">
                  <Crown size={28} fill="currentColor" />
                </div>
                <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Menu Elite</h2>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-3 text-neutral-500 hover:text-white transition-colors bg-white/5 rounded-full"><X size={28}/></button>
            </div>

            <div className="flex-1 space-y-2">
              {menuItems.map((item) => (
                <button
                  id={`nav-${item.id}`}
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }}
                  className={`w-full flex items-center justify-between gap-4 p-5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${
                    activeTab === item.id ? 'bg-yellow-600 text-black shadow-xl' : 'text-neutral-500 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <item.icon size={20} />
                    {item.label}
                  </span>
                  <ChevronRight size={14} className={activeTab === item.id ? 'opacity-100' : 'opacity-0'} />
                </button>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
              {isAdmin && (
                <button 
                  onClick={() => { setActiveTab('admin'); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${
                    activeTab === 'admin' ? 'bg-blue-600 text-white shadow-xl' : 'bg-blue-900/10 text-blue-400 border border-blue-500/20'
                  }`}
                >
                  <ShieldCheck size={20} /> ESPACE ADMINISTRATION
                </button>
              )}
              <button onClick={handleLogout} className="w-full flex items-center gap-4 p-5 rounded-2xl font-black uppercase text-[11px] tracking-widest text-red-500 hover:bg-red-500/10 transition-all">
                <LogOut size={20} /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        <div className="min-h-full">
          {children}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-right {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        .animate-slide-right { animation: slide-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-shimmer { animation: shimmer 2s infinite; }
      `}} />
    </div>
  );
};
