import { createClient } from '@supabase/supabase-js';

function getUrl() { return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''; }
function getAnon() { return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''; }
function getService() { return process.env.SUPABASE_SERVICE_ROLE_KEY || ''; }

export function getSupabaseClient() {
  const url = getUrl();
  const key = getAnon();
  if (!url || !key) throw new Error('Supabase env vars missing');
  return createClient(url, key);
}

export function getSupabaseAdmin() {
  const url = getUrl();
  const key = getService();
  if (!url || !key) throw new Error('Supabase service role env vars missing');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
