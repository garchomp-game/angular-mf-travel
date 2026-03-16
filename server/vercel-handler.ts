/**
 * Vercel Serverless Function entry point.
 * This file is bundled by esbuild into api/index.js as a self-contained CJS module.
 */
import { app } from './src/index';

// Bridge Vercel's Node.js req/res to Hono's Web Standard Request/Response
export default async function handler(req: any, res: any) {
  const url = new URL(req.url ?? '/', `https://${req.headers.host}`);

  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) headers[key] = Array.isArray(value) ? value.join(', ') : String(value);
  }

  let body: Buffer | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    if (chunks.length > 0) {
      body = Buffer.concat(chunks);
    }
  }

  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body,
  });

  const response = await app.fetch(request);
  const responseBody = await response.arrayBuffer();

  res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
  res.end(Buffer.from(responseBody));
}
