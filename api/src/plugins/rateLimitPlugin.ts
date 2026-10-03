import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';

export default fp(async (fastify) => {
  if (process.env.NODE_ENV === 'test') return;

  await fastify.register(rateLimit, {
    global: false
  });
});