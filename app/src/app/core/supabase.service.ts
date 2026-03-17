import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

/**
 * Singleton Supabase client for the entire Angular application.
 *
 * The anon key is safe to expose in the frontend — it's a publishable key
 * that relies on RLS (Row Level Security) for data protection.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient;

  constructor() {
    this.client = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }
}
