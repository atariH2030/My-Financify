/**
 * Supabase Configuration
 * Cliente configurado para My-Financify
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Supabase credentials not found!');
  console.log('Please configure your .env file with:');
  console.log('VITE_SUPABASE_URL=your_project_url');
  console.log('VITE_SUPABASE_ANON_KEY=your_anon_key');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Helper para verificar se está configurado
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'placeholder-key');
};

// Log de status
if (isSupabaseConfigured()) {
  console.log('✅ Supabase client initialized');
} else {
  console.warn('⚠️ Supabase not configured - using local storage mode');
}

export default supabase;
