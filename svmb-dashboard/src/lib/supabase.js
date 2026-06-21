import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isMissing = !supabaseUrl || !supabaseUrl.startsWith('http');

if (isMissing) {
  console.warn(
    '⚠️ Supabase credentials not configured. Update your .env file with:\n' +
    '  VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=your-anon-key\n' +
    'Then restart the dev server.'
  );
}

// Use a dummy URL if not configured so the app doesn't crash on startup
export const supabase = createClient(
  isMissing ? 'https://placeholder.supabase.co' : supabaseUrl,
  isMissing ? 'placeholder-key' : supabaseAnonKey
);

export const isSupabaseConfigured = !isMissing;
