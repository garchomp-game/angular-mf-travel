import { handle } from '@hono/node-server/vercel';
import { app } from '../server/src/index';

export default handle(app);
