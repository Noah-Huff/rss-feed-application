import type { FastifyInstance } from 'fastify';
import { makeUserInput } from './fixtures.js';
import type { RegisterUser } from '../../src/services/authService.js';

export const AUTH = '/api/v1/auth';

export async function registerUser(app: FastifyInstance, overrides: Partial<RegisterUser> = {}) {
  const input = makeUserInput(overrides);
  const res = await app.inject({ method: 'POST', url: `${AUTH}/register`, payload: input });
  return { res, input };
}

export function loginUser(app: FastifyInstance, email: string, password: string) {
  return app.inject({ method: 'POST', url: `${AUTH}/login`, payload: { email, password } });
}

export async function createAuthedUser(app: FastifyInstance) {
  const { input } = await registerUser(app);
  const res = await loginUser(app, input.email, input.password);
  const { token, user } = res.json();
  return { input, token, user, headers: { authorization: `Bearer ${token}` } };
}