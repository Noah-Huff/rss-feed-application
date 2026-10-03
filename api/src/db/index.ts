import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('missing db connection string');

export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema, casing: 'snake_case' });

export async function closeDb(): Promise<void> {
  await pool.end();
}
