import type { FastifyInstance } from 'fastify';
import {
  publicUserSchema,
  errorSchema,
} from '../../schemas/auth.js';
import { getCurrentUser } from '../../services/authService.js';

export default async function (fastify: FastifyInstance) {
  fastify.get(
    '/me',
    {
      preHandler: [fastify.authenticate],
      schema: { response: { 200: publicUserSchema, 401: errorSchema } },
      config: { rateLimit: { max: 5, timeWindow: '1 minute' } }
    },
    async (request, reply) => {
        const user = await getCurrentUser(request.user.sub);
        if (!user) return reply.code(401).send({ message: 'unauthorized' });
        return user;
    },
  );
}