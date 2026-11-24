import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://freonzpuhgrevebvprfa.supabase.co';
const supabaseKey = 'sb_publishable_Jaj_l61ZHwrAhS0B1WGwVQ_obpPc9Jf';

export const supabase = createClient(supabaseUrl, supabaseKey);