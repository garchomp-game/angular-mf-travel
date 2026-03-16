import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envLocalPath = resolve(__dirname, '..', '.env.local');

// Load .env.local if it exists (local development)
if (existsSync(envLocalPath)) {
  const content = readFileSync(envLocalPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    // Don't override existing env vars (CI/Vercel sets them)
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
  console.log('Loaded .env.local for local development.');
}

const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? '';

const payload = `window.__APP_CONFIG__ = ${JSON.stringify(
  {
    supabaseUrl,
    supabaseAnonKey,
  },
  null,
  2,
)};\n`;

writeFileSync(new URL('../public/app-config.js', import.meta.url), payload, 'utf8');
console.log(`Generated public/app-config.js (URL: ${supabaseUrl ? '✓' : '✗'})`);
