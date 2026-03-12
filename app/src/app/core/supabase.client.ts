import { createClient } from '@supabase/supabase-js';
import { appConfig } from './app-config';

export const supabase = createClient(
  appConfig.supabaseUrl,
  appConfig.supabaseAnonKey
);
