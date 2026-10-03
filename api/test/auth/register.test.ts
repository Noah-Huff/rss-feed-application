import { describe, it, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { useTestApp } from '../helpers/app.js';
import { registerUser, AUTH } from '../helpers/auth.js';
import { makeUserInput } from '../helpers/fixtures.js';
import { db } from '../../src/db/index.js';
import { usersTable } from '../../src/db/schema.js';

const app = useTestApp();

describe('POST /api/v1/auth/register', () => {
  it('returns 201, normalizes the email, and omits the password hash', async () => {
    const { res, input } = await registerUser(app, { email: 'New@Example.com' });
    expect(res.statusCode).toBe(201);

    const body = res.json();
    expect(body.email).toBe('new@example.com');
    expect(body.firstName).toBe(input.firstName);
    expect(body.lastName).toBe(input.lastName);
    expect(body.id).toBeTypeOf('string');
    expect(body.createdAt).toBeTypeOf('string');
    expect(body).not.toHaveProperty('passwordHash');
    expect(body).not.toHaveProperty('password');
  });

  it('stores an argon2id hash, never the plaintext password', async () => {
    const { input } = await registerUser(app, { email: 'hash@example.com' });

    const [row] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, 'hash@example.com'));

    expect(row?.passwordHash).toMatch(/^\$argon2id\$/);
    expect(row?.passwordHash).not.toContain(input.password);
  });

  it('returns 409 when the email already exists, regardless of casing', async () => {
    await registerUser(app, { email: 'dupe@example.com' });
    const { res } = await registerUser(app, { email: 'DUPE@Example.com' });
    expect(res.statusCode).toBe(409);
  });

  it('returns 400 when the password is shorter than 8 characters', async () => {
    const { res } = await registerUser(app, { password: 'short' });
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when the password is longer than 128 characters', async () => {
    const { res } = await registerUser(app, { password: 'a'.repeat(129) });
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when a required field is missing', async () => {
    const { lastName, ...withoutLastName } = makeUserInput();
    const res = await app.inject({
      method: 'POST',
      url: `${AUTH}/register`,
      payload: withoutLastName,
    });
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 for a malformed email', async () => {
    const { res } = await registerUser(app, { email: 'not-an-email' });
    expect(res.statusCode).toBe(400);
  });

  it('ignores unexpected fields instead of persisting them', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `${AUTH}/register`,
      payload: {
        ...makeUserInput(),
        id: '00000000-0000-0000-0000-000000000000',
      },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().id).not.toBe('00000000-0000-0000-0000-000000000000');
  });
});