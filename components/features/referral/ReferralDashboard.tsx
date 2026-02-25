
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../services/supabase.ts';
import { UserProfile } from '../../../types.ts';
import { ReferralLayout } from './ReferralLayout.tsx';
import { ReferralStats } from './ReferralStats.tsx';
import { ReferralTools } from './ReferralTools.tsx';
import { ReferralList } from './ReferralList.tsx';

interface Props {
  profile: UserProfile | null;
  teamCount: number;
}

export const ReferralDashboard: React.FC<Props> = ({ profile, teamCount }) => {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeam = useCallback(async () => {
    if (!profile?.referral_code) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, user_level, created_at')
        .eq('referral_code_used', profile.referral_code)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTeam(data || []);
    } catch (e) {
      console.error("Referral Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  }, [profile?.referral_code]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return (
    <ReferralLayout 
      title="Parrainage" 
      subtitle="Gérez vos parrainages et suivez vos gains."
    >
      <div className="space-y-10">
        <ReferralStats teamCount={teamCount} />
        
        <ReferralTools referralCode={profile?.referral_code || ''} />
        
        <div className="pt-6">
           <ReferralList members={team} />
        </div>

        <div className="p-8 border border-dashed border-white/10 rounded-[3rem] text-center opacity-40">
           <p className="text-[8px] text-neutral-500 font-bold uppercase tracking-[0.5em] leading-relaxed">
             Propulsé par le Protocole de Mentorat MZ+ v4.2
           </p>
        </div>
      </div>
    </ReferralLayout>
  );
};
