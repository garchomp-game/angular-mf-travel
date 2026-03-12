import { writeFileSync } from 'node:fs';

const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? '';

const payload = `window.__APP_CONFIG__ = ${JSON.stringify(
  {
    supabaseUrl,
    supabaseAnonKey
  },
  null,
  2
)};\n`;

writeFileSync(new URL('../public/app-config.js', import.meta.url), payload, 'utf8');
console.log('Generated public/app-config.js from environment variables.');
