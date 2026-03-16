import { InjectionToken, inject } from '@angular/core';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { APP_CONFIG } from './app-config';

/**
 * Supabase client as an InjectionToken.
 *
 * Creates the client using APP_CONFIG values resolved at DI time.
 * Returns null when Supabase URL is not configured (e.g., during unit tests).
 */
export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient | null>('supabase.client', {
  providedIn: 'root',
  factory: () => {
    const config = inject(APP_CONFIG);
    return config.supabaseUrl ? createClient(config.supabaseUrl, config.supabaseAnonKey) : null;
  },
});
