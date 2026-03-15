import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { appConfig } from './app-config';

export const supabase: SupabaseClient | null =
  appConfig.supabaseUrl
    ? createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey)
    : null;
