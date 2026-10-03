import type { FastifyInstance } from 'fastify';
import { login } from '../../services/authService.js';
import {
  loginBodySchema,
  publicUserSchema,
} from '../../schemas/auth.js';

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: { email: string; password: string } }>(
    '/login',
    {
      schema: {
        body: loginBodySchema,
        response: {
          200: {
            type: 'object',
            properties: {
              token: { type: 'string' },
              user: publicUserSchema,
            },
          },
        },
      },
      config: { rateLimit: { max: 5, timeWindow: '1 minute' } }
    },
    async (request) => {
        const user = await login(request.body.email, request.body.password);
        const token = fastify.jwt.sign({ sub: user.id });
        return { token, user };
    },
  );
}