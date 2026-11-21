import { createClient } from '@supabase/supabase-js';

let client;
export function getSupabase() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Falta configurar SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.');
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}
