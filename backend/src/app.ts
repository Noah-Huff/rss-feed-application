import fastify from 'fastify';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import autoLoad from '@fastify/autoload';
import { closeDb } from './db/index.js';
import fastifyStatic from '@fastify/static';
import { existsSync } from 'node:fs';

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

  const webRoot = join(__dirname, '..', '..', 'Web', 'dist');

  // add static hosting for the frontend
  if (existsSync(webRoot)) {
    app.register(fastifyStatic, { root: webRoot });

    app.setNotFoundHandler((req, reply) => {
      if (req.url.startsWith('/api')) {
        return reply.code(404).send({ error: 'Not found' });
      }
      return reply.sendFile('index.html');
    });
  }

  return app;
}