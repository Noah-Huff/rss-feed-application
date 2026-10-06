import { buildApp } from './app.js';

const app = buildApp();

try {
  await app.listen({ port: 8080 });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}