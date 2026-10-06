import fastify from 'fastify';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import autoLoad from '@fastify/autoload';
import { closeDb } from './db/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function buildApp(opts: { logger?: boolean } = {}) {
  const app = fastify({ logger: opts.logger ?? true });

  app.addHook('onClose', async () => {
    await closeDb();
  });

  app.register(autoLoad, { dir: join(__dirname, 'plugins') });
  app.register(autoLoad, {
    options: { prefix: '/api/v1' },
    dir: join(__dirname, 'routes'),
    routeParams: true,
  });

  return app;
}