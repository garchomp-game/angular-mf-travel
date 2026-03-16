import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Hono } from 'hono';

const app = new Hono().basePath('/api');
app.get('/health', (c) => c.json({ status: 'ok', runtime: 'vercel' }));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url ?? '/', `https://${req.headers.host}`);
  const request = new Request(url.toString(), {
    method: req.method,
    headers: req.headers as HeadersInit,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
  });

  const response = await app.fetch(request);
  const body = await response.text();

  res.status(response.status);
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  res.end(body);
}
