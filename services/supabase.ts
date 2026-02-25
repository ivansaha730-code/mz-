
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ydkicdhcylpdffuzgdvm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_E_rpgEr5_Vf1_1wkLBGKNQ_hxvfdeED';

// Create a singleton client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
