import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * True once VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set (.env.local).
 * While false, the app falls back to static content and the admin shows a
 * "backend not configured" notice instead of crashing.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export const GALLERY_BUCKET = 'gallery';

/** Public URL for an image stored in the gallery bucket. */
export function publicImageUrl(storagePath: string): string {
  if (!supabase) return '';
  return supabase.storage.from(GALLERY_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}
