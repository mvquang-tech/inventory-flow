import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhjjzpzhtqebnmnvzemv.supabase.co';
const supabaseKey = 'sb_publishable_DSYQAyiMCmTULNnljhCEGg_pK1UThB5';

export const supabase = createClient(supabaseUrl, supabaseKey);
