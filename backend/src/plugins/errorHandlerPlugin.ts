import fp from 'fastify-plugin';
import { EmailAlreadyInUseError, InvalidCredentialsError, InvalidFeedUrlError, NotFoundError, UnauthorizedError } from '../errors.js';

export default fp(async (fastify) => {
  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof EmailAlreadyInUseError) return reply.code(409).send({ message: error.message });
    if (error instanceof InvalidCredentialsError) return reply.code(401).send({ message: error.message });
    if (error instanceof NotFoundError) return reply.code(404).send({ message: error.message });
    if (error instanceof InvalidFeedUrlError) return reply.code(400).send({ message: error.message });
    if (error instanceof UnauthorizedError) return reply.code(401).send({ message: error.message });

    const statusCode = (error as { statusCode?: number }).statusCode ?? 500;
    if (statusCode >= 500) {
      request.log.error(error);
      return reply.code(500).send({ message: 'Internal Server Error' });
    }
    return reply.code(statusCode).send({ message: (error as Error).message });
  });
});