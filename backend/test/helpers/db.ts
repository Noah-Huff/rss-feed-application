import { db } from '../../src/db/index.js';
import { usersTable } from '../../src/db/schema.js';

export async function resetDb() {
  await db.delete(usersTable);
}