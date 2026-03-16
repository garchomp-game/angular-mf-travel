import { handle } from 'hono/vercel';
import { Hono } from 'hono';

const testApp = new Hono().basePath('/api');
testApp.get('/health', (c) => c.json({ status: 'ok', runtime: 'vercel' }));

export const GET = handle(testApp);
export const POST = handle(testApp);
export const PUT = handle(testApp);
export const DELETE = handle(testApp);
export const PATCH = handle(testApp);
