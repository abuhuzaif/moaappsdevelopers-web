import { createClient } from "@supabase/supabase-js";

// This is the same Supabase project used by the RedChilies Flutter Owner
// & Customer apps (fnrgsthkoackburjudsz). The anon/publishable key is safe
// to expose client-side — access is controlled by Row Level Security
// policies on the database, not by hiding this key.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://fnrgsthkoackburjudsz.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_HfiaYa-LUC4cSECUmrTiZg_0WZnyju2";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
