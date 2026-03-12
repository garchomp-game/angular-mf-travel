declare global {
  interface Window {
    __APP_CONFIG__?: {
      supabaseUrl?: string;
      supabaseAnonKey?: string;
    };
  }
}

const runtimeConfig = window.__APP_CONFIG__ ?? {};

export const appConfig = {
  supabaseUrl: runtimeConfig.supabaseUrl ?? '',
  supabaseAnonKey: runtimeConfig.supabaseAnonKey ?? ''
};
