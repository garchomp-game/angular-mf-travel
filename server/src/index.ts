import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { jwt } from 'hono/jwt';
import authRoutes from './routes/auth';
import expenseRoutes from './routes/expenses';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: ['http://localhost:4200', 'http://localhost:5173'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok' }));

// Auth routes (no JWT required)
app.route('/api/auth', authRoutes);

// Protected routes (JWT required)
app.use('/api/expenses/*', jwt({ secret: JWT_SECRET, alg: 'HS256' }));
app.use('/api/expenses', jwt({ secret: JWT_SECRET, alg: 'HS256' }));
app.route('/api/expenses', expenseRoutes);

// Start server
const port = Number(process.env.PORT ?? 3000);
console.log(`🔥 Hono server running on http://localhost:${port} (PID: ${process.pid})`);

export default {
  port,
  fetch: app.fetch,
  reusePort: true,
};
