/**
 * Vercel Serverless Function entry point (Bun runtime).
 * Bun natively supports TypeScript and ESM — no esbuild/CJS needed.
 */
import { app } from '../server/src/index';

export default {
  fetch: app.fetch,
};
