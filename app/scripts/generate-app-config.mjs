import { writeFileSync } from 'node:fs';

// On Vercel, the API is same-origin so /api works directly.
// For local development, the Angular dev server proxy handles /api → localhost:3000.
// API_BASE_URL can override if needed (e.g., external API server).
const apiBaseUrl = process.env.API_BASE_URL ?? '/api';

const payload = `window.__APP_CONFIG__ = ${JSON.stringify(
  {
    apiBaseUrl,
  },
  null,
  2,
)};\n`;

writeFileSync(new URL('../public/app-config.js', import.meta.url), payload, 'utf8');
console.log(`Generated public/app-config.js (apiBaseUrl: ${apiBaseUrl})`);
