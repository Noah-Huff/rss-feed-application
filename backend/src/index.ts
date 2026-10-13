import { buildApp } from './app.js';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './db/index.js';

const app = buildApp();
const port = Number(process.env.PORT) || 8080;

try {
  await migrate(db, { migrationsFolder: './drizzle' });
  await app.listen({ port, host: '0.0.0.0' });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}