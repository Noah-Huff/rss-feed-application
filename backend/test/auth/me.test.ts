import { describe, it, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { useTestApp } from '../helpers/app.js';
import { createAuthedUser, AUTH } from '../helpers/auth.js';
import { db } from '../../src/db/index.js';
import { usersTable } from '../../src/db/schema.js';

const app = useTestApp();
const ME = `${AUTH}/me`;

describe('GET /api/v1/auth/me', () => {
  it('returns 200 with the current user and no hash', async () => {
    const { headers, user } = await createAuthedUser(app);
    const res = await app.inject({ method: 'GET', url: ME, headers });
    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body.id).toBe(user.id);
    expect(body.email).toBe(user.email);
    expect(body).not.toHaveProperty('passwordHash');
  });

  it('returns 401 without an Authorization header', async () => {
    const res = await app.inject({ method: 'GET', url: ME });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 when the header is not a Bearer token', async () => {
    const { token } = await createAuthedUser(app);
    const res = await app.inject({
      method: 'GET',
      url: ME,
      headers: { authorization: token }, // missing the "Bearer " prefix
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 for a garbage token', async () => {
    const res = await app.inject({
      method: 'GET',
      url: ME,
      headers: { authorization: 'Bearer not.a.token' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 when the token signature has been tampered with', async () => {
    const { token } = await createAuthedUser(app);
    const [header, payload, signature] = token.split('.');
    // Change the first signature character (the last one has unused bits and can be a no-op).
    const flipped = (signature![0] === 'A' ? 'B' : 'A') + signature!.slice(1);
    const tampered = [header, payload, flipped].join('.');

    const res = await app.inject({
      method: 'GET',
      url: ME,
      headers: { authorization: `Bearer ${tampered}` },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 for an expired token', async () => {
    const { user } = await createAuthedUser(app);
    // Issued two hours ago with a one-hour lifetime.
    const expired = app.jwt.sign(
      { sub: user.id, iat: Math.floor(Date.now() / 1000) - 7200 },
      { expiresIn: '1h' },
    );

    const res = await app.inject({
      method: 'GET',
      url: ME,
      headers: { authorization: `Bearer ${expired}` },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 when the token is valid but the user no longer exists', async () => {
    const { headers, user } = await createAuthedUser(app);
    await db.delete(usersTable).where(eq(usersTable.id, user.id));

    const res = await app.inject({ method: 'GET', url: ME, headers });
    expect(res.statusCode).toBe(401);
  });
});