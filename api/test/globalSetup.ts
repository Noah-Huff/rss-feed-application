import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

export default async function () {
  const url = process.env.TEST_DATABASE_URL;
  if (!url || url === process.env.DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL must be set and differ from DATABASE_URL');
  }
  const pool = new Pool({ connectionString: url });
  await migrate(drizzle({ client: pool }), { migrationsFolder: './drizzle' });
  await pool.end();
}