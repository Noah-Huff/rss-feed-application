import { describe, it, expect } from 'vitest';
import { useTestApp } from '../helpers/app.js';
import { registerUser, loginUser, AUTH } from '../helpers/auth.js';

const app = useTestApp();

describe('POST /api/v1/auth/login', () => {
    it('returns 200 with a token and the user, without the hash', async () => {
        const { input } = await registerUser(app);
        const res = await loginUser(app, input.email, input.password);
        expect(res.statusCode).toBe(200);

        const body = res.json();
        expect(body.token).toBeTypeOf('string');
        expect(body.user.email).toBe(input.email);
        expect(body.user).not.toHaveProperty('passwordHash');
    });

    it('issues a token whose subject is the user id', async () => {
        const { input } = await registerUser(app);
        const { token, user } = (await loginUser(app, input.email, input.password)).json();

        const payload = app.jwt.verify<{ sub: string }>(token);
        expect(payload.sub).toBe(user.id);
    });

    it('accepts the email in any casing', async () => {
        const { input } = await registerUser(app, { email: 'case@example.com' });
        const res = await loginUser(app, 'CASE@Example.com', input.password);
        expect(res.statusCode).toBe(200);
    });

    it('returns 400 for an email with surrounding whitespace', async () => {
        const res = await loginUser(app, ' someone@example.com ', 'whatever-password');
        expect(res.statusCode).toBe(400);
    });

    it('returns 401 for a wrong password', async () => {
        const { input } = await registerUser(app);
        const res = await loginUser(app, input.email, 'not-the-password');
        expect(res.statusCode).toBe(401);
    });

    it('returns 401 for an unknown email', async () => {
        const res = await loginUser(app, 'nobody@example.com', 'whatever-password');
        expect(res.statusCode).toBe(401);
    });

    it('gives identical responses for a wrong password and an unknown email', async () => {
        const { input } = await registerUser(app);
        const wrongPassword = await loginUser(app, input.email, 'not-the-password');
        const unknownEmail = await loginUser(app, 'nobody@example.com', 'not-the-password');

        expect(wrongPassword.statusCode).toBe(unknownEmail.statusCode);
        expect(wrongPassword.json()).toEqual(unknownEmail.json());
    });

    it('returns 400 when the password is missing or empty', async () => {
        const { input } = await registerUser(app);

        const missing = await app.inject({
            method: 'POST',
            url: `${AUTH}/login`,
            payload: { email: input.email },
        });
        expect(missing.statusCode).toBe(400);

        const empty = await loginUser(app, input.email, '');
        expect(empty.statusCode).toBe(400);
    });

    it('returns 400 when the password exceeds the length cap', async () => {
        const res = await loginUser(app, 'someone@example.com', 'a'.repeat(129));
        expect(res.statusCode).toBe(400);
    });
});