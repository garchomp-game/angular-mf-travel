import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { jwt } from 'hono/jwt';
import authRoutes from './routes/auth';
import expenseRoutes from './routes/expenses';

const JWT_SECRET = (process.env.JWT_SECRET ?? 'dev-secret-change-me').trim();

// Build allowed origins list
const allowedOrigins = ['http://localhost:4200', 'http://localhost:5173'];
if (process.env.ALLOWED_ORIGIN) {
  allowedOrigins.push(process.env.ALLOWED_ORIGIN);
}
if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

const app = new Hono().basePath('/api');

// Global middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: allowedOrigins,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

// Auth routes (no JWT required)
app.route('/auth', authRoutes);

// Protected routes (JWT required)
app.use('/expenses/*', jwt({ secret: JWT_SECRET, alg: 'HS256' }));
app.use('/expenses', jwt({ secret: JWT_SECRET, alg: 'HS256' }));
app.route('/expenses', expenseRoutes);

// Named export for Vercel serverless adapter
export { app };

// Bun local server (only when not on Vercel)
if (!process.env.VERCEL) {
  const port = Number(process.env.PORT ?? 3000);
  console.log(`🔥 Hono server running on http://localhost:${port} (PID: ${process.pid})`);
}

export default {
  port: Number(process.env.PORT ?? 3000),
  fetch: app.fetch,
  reusePort: true,
};
