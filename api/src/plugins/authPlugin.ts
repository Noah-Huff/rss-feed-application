import type { FastifyRequest, FastifyReply } from "fastify";
import '@fastify/jwt'
import fp from 'fastify-plugin';
import fastifyJwt from "@fastify/jwt";

export default fp(async (fastify) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('missing jwt secret');

    await fastify.register(fastifyJwt, {
        secret,
        sign: { expiresIn: '1hr' }
    });

    fastify.decorate(
        'authenticate',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                await request.jwtVerify();
            } catch {
                return reply.code(401).send({ message: 'unauthorized user' });
            }
        }
    );
});

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: { sub: string },
        user: { sub: string }
    }
}