import { beforeAll, afterAll, beforeEach } from 'vitest';
import { buildApp } from '../../src/app.js';
import { resetDb } from './db.js';
import '@fastify/jwt';

export function useTestApp() {
  const app = buildApp({ logger: false });

  beforeAll(async () => { await app.ready(); });
  afterAll(async () => { await app.close(); });
  beforeEach(async () => { await resetDb(); });

  return app;
}