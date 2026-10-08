import type { FastifyInstance } from 'fastify';
import { register, type RegisterUser } from '../../services/authService.js';
import {
  registerBodySchema,
  publicUserSchema,
} from '../../schemas/auth.js';

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: RegisterUser }>(
    '/register',
    {
      schema: {
        body: registerBodySchema,
        response: { 201: publicUserSchema },
      },
      config: { rateLimit: { max: 5, timeWindow: '1 hour' } }
    },
    async (request, reply) => {
        const user = await register(request.body);
        return reply.code(201).send(user);
    },
  );
}