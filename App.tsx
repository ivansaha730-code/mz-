
import React, { useState, useEffect, useCallback } from 'react';
import { Loader } from 'lucide-react';
import { supabase } from './services/supabase.ts';
import { UserProfile, Wallet, TabId, Product } from './types.ts';
import { LandingPage } from './components/LandingPage.tsx';
import { DashboardLayout } from './components/DashboardLayout.tsx';
import { 
  GlobalView, 
  RevenueTab, 
  TeamTab, 
  RPADashboard, 
  CoachingTab, 
  FormationTab, 
  UpgradeTab, 
  SuggestionsTab,
  GuidesTab
} from './components/DashboardTabs.tsx';
import { RewardFeature } from './components/features/programme-recompense/RewardFeature.tsx';
import { AffiliationSystem } from './components/AffiliationSystem.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { ProductSalesPage } from './components/ProductSalesPage.tsx';
import { EspacePrive } from './components/EspacePrive.tsx';
import { MZPlusFlashOfferOverlay } from './components/features/mz-plus-offer/MZPlusFlashOfferOverlay.tsx';
import { LunaChatPage } from './components/LunaChatPage.tsx';
import { PrivateMessagingMain } from './components/features/messagerie-privee/PrivateMessagingMain.tsx';
import { PushDisplay } from './components/features/admin-push-notifications/PushDisplay.tsx';
import { AnnouncementOverlay } from './components/features/marketing-announcements/AnnouncementOverlay.tsx';
import { AffiliationGuide } from './components/guides/AffiliationGuide.tsx';
import { RPAGuide } from './components/guides/RPAGuide.tsx';
import { TeamGuide } from './components/guides/TeamGuide.tsx';
import { SlideNotificationAffiliation } from './components/features/SlideNotificationAffiliation.tsx';

const ADMIN_EMAILS = [
  'equipemzplus@gmail.com',
  'millionairezoneplus@gmail.com',
  'admin@mz.plus'
];

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [teamCount, setTeamCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isProductChecked, setIsProductChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [activeCategory, setActiveCategory] = useState<string>('main');
  const [lastUpdateSignal, setLastUpdateSignal] = useState<number>(Date.now());
  const [customerProduct, setCustomerProduct] = useState<Product | null>(null);
  const [purchaseStep, setPurchaseStep] = useState<'view' | 'processing' | 'success'>('view');
  const [isGuideActive, setIsGuideActive] = useState(false);
  const [isRPAGuideActive, setIsRPAGuideActive] = useState(false);
  const [isTeamGuideActive, setIsTeamGuideActive] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (session && userProfile && !localStorage.getItem('mz_guide_completed')) {
      const timer = setTimeout(() => {
        setIsGuideActive(true);
        localStorage.setItem('mz_guide_completed', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [session, userProfile]);

  const fetchUserData = useCallback(async (userId: string, email?: string) => {
    try {
      const userEmail = email?.toLowerCase().trim() || "";
      const isHardcodedAdmin = ADMIN_EMAILS.includes(userEmail);
      
      let { data: profile } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
      
      if (!profile && session?.user) {
        const newRefCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newProfileData = { 
          id: userId, 
          full_name: session.user.user_metadata?.full_name || 'Ambassadeur', 
          email: session.user.email, 
          referral_code: newRefCode, 
          rank_id: 1, 
          is_admin: isHardcodedAdmin, 
          user_level: 'standard'
        };
        const { data: upsertedProfile } = await supabase.from('users').upsert(newProfileData, { onConflict: 'id' }).select('*').single();
        profile = upsertedProfile || (newProfileData as any);
      }

      const isAdminValue = isHardcodedAdmin || profile?.is_admin === true || !!profile?.admin_role;
      const enrichedProfile: UserProfile = { 
        id: profile?.id || userId, 
        full_name: profile?.full_name || 'Ambassadeur', 
        referral_code: profile?.referral_code || '---', 
        rank_id: profile?.rank_id || 1, 
        email: profile?.email || userEmail, 
        is_admin: isAdminValue, 
        admin_role: profile?.admin_role || (isHardcodedAdmin ? 'super_admin' : null),
        rpa_balance: Number(profile?.rpa_balance || 0), 
        rpa_points: Number(profile?.rpa_points || 0), 
        user_level: (profile?.user_level as 'standard' | 'niveau_mz_plus') || 'standard', 
        created_at: profile?.created_at 
      };
      setUserProfile(enrichedProfile);

      const [walletRes, teamRes] = await Promise.all([
        supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('referral_code_used', enrichedProfile.referral_code)
      ]);

      setWallet(walletRes.data || { id: 'initial', user_id: userId, balance: 0 });
      setTeamCount(teamRes?.count || 0);
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => { 
      setSession(s); 
      if (s) fetchUserData(s.user.id, s.user.email); 
      else if (isProductChecked) setLoading(false); 
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => { 
      setSession(s); 
      if (s) fetchUserData(s.user.id, s.user.email); 
      else { setUserProfile(null); if (isProductChecked) setLoading(false); } 
    });
    return () => subscription.unsubscribe();
  }, [fetchUserData, isProductChecked]);

  useEffect(() => {
    const checkProduct = async () => {
      const params = new URLSearchParams(window.location.search);
      const prodId = params.get('prod');
      if (prodId) {
        const { data: product } = await supabase.from('products').select('*').eq('id', prodId).maybeSingle();
        if (product) setCustomerProduct(product);
      }
      setIsProductChecked(true);
    };
    checkProduct();
  }, []);

  useEffect(() => {
    if (activeTab === 'rpa' && !localStorage.getItem('mz_rpa_guide_completed')) {
      const timer = setTimeout(() => {
        setIsRPAGuideActive(true);
      }, 800);
      return () => clearTimeout(timer);
    }
    if (activeTab === 'team' && !localStorage.getItem('mz_team_guide_completed')) {
      const timer = setTimeout(() => {
        setIsTeamGuideActive(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const triggerRefresh = () => { if (session?.user?.id) fetchUserData(session.user.id, session.user.email); };

  if (loading || !isProductChecked) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-yellow-500 font-black gap-4">
      <Loader className="animate-spin" size={48} />
      <span className="text-[10px] tracking-[0.3em] uppercase animate-pulse">MZ+ SYSTEM : CHARGEMENT...</span>
    </div>
  );
  
  if (customerProduct) return (<ProductSalesPage product={customerProduct} onPurchase={() => {}} purchaseStep={purchaseStep} countdown={900} isLoggedIn={!!session} />);
  if (!session) return <LandingPage />;

  const isAdmin = userProfile?.is_admin === true || !!userProfile?.admin_role;

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      isAdmin={isAdmin} 
      profile={userProfile}
      isMenuOpen={isMenuOpen}
      setIsMenuOpen={setIsMenuOpen}
    >
      
      <PushDisplay profile={userProfile} />
      <AnnouncementOverlay profile={userProfile} onNavigate={(tab) => setActiveTab(tab as TabId)} />
      <SlideNotificationAffiliation activeTab={activeTab} onUpgrade={() => setActiveTab('flash_offer')} />

      {activeTab === 'flash_offer' && <MZPlusFlashOfferOverlay profile={userProfile} onUpgrade={() => setActiveTab('upgrade')} isFullPage={true} />}
      {activeTab === 'dashboard' && (
        <GlobalView 
          profile={userProfile} 
          onSwitchTab={setActiveTab} 
          onStartGuide={() => {
            if (!localStorage.getItem('mz_guide_completed')) {
              setIsGuideActive(true);
              localStorage.setItem('mz_guide_completed', 'true');
            }
          }}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      )}
      <AffiliationGuide 
        isActive={isGuideActive} 
        onComplete={() => setIsGuideActive(false)} 
        activeCategory={activeCategory}
        activeTab={activeTab}
      />
      <RPAGuide 
        isActive={isRPAGuideActive} 
        onComplete={() => setIsRPAGuideActive(false)} 
      />
      <TeamGuide 
        isActive={isTeamGuideActive} 
        onComplete={() => setIsTeamGuideActive(false)} 
      />
      {activeTab === 'recompense' && <RewardFeature profile={userProfile} />}
      {activeTab === 'private_chat' && <EspacePrive profile={userProfile} />}
      {activeTab === 'private_messaging' && <PrivateMessagingMain profile={userProfile} />}
      {activeTab === 'revenus' && <RevenueTab profile={userProfile} wallet={wallet} />}
      {activeTab === 'affiliation' && <AffiliationSystem profile={userProfile} lastUpdateSignal={lastUpdateSignal} onSwitchTab={setActiveTab} />}
      {activeTab === 'team' && <TeamTab profile={userProfile} teamCount={teamCount} onSwitchTab={setActiveTab} />}
      {activeTab === 'coaching' && <CoachingTab profile={userProfile} onSwitchTab={setActiveTab} />}
      {activeTab === 'formation' && <FormationTab profile={userProfile} onSwitchTab={setActiveTab} />}
      {activeTab === 'rpa' && (
        <RPADashboard 
          profile={userProfile} 
          onRefresh={triggerRefresh} 
          onSwitchTab={setActiveTab} 
          onStartGuide={() => {
            localStorage.removeItem('mz_rpa_guide_completed');
            setIsRPAGuideActive(true);
          }}
        />
      )}
      {activeTab === 'suggestions' && <SuggestionsTab profile={userProfile} />}
      {activeTab === 'guides' && (
        <GuidesTab 
          onStartAffiliationGuide={() => {
            localStorage.removeItem('mz_guide_completed');
            setActiveTab('dashboard');
            setIsGuideActive(true);
          }}
          onStartRPAGuide={() => {
            localStorage.removeItem('mz_rpa_guide_completed');
            setActiveTab('rpa');
            setIsRPAGuideActive(true);
          }}
          onStartTeamGuide={() => {
            localStorage.removeItem('mz_team_guide_completed');
            setActiveTab('team');
            setIsTeamGuideActive(true);
          }}
        />
      )}
      {activeTab === 'upgrade' && <UpgradeTab />}
      {activeTab === 'luna_chat' && <LunaChatPage profile={userProfile} onUpgrade={() => setActiveTab('flash_offer')} />}
      {activeTab === 'admin' && isAdmin && <AdminPanel adminProfile={userProfile} lastUpdateSignal={lastUpdateSignal} onRefresh={triggerRefresh} />}
    </DashboardLayout>
  );
};

export default App;
