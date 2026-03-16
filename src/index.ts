// Re-export the Hono app for Vercel's framework detection
export { app } from './server/src/index';
import { app } from './server/src/index';
export default app;
