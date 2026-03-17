import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sbjxnwakufmfzpnkcmwz.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNianhud2FrdWZtZnpwbmtjbXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MDYxMzEsImV4cCI6MjA4OTI4MjEzMX0.IzKhlKbnqeyT63pLp_xd5cp3QCJkcVWpSR6uGQlmCYw';

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
    this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
}
