import 'dotenv/config';
import { register, login } from '../src/services/authService.js';
import { closeDb } from '../src/db/index.js';
import { EmailAlreadyInUseError, InvalidCredentialsError } from '../src/errors.js';

const PASSWORD = 'correct-horse-battery';

async function expectError(
  label: string,
  ErrorClass: new (...args: any[]) => Error,
  fn: () => Promise<unknown>,
) {
  try {
    await fn();
    console.log(`FAIL  ${label}: no error thrown`);
  } catch (err) {
    console.log(
      err instanceof ErrorClass ? `PASS  ${label}` : `FAIL  ${label}:`,
      err instanceof ErrorClass ? '' : err,
    );
  }
}

async function main() {
  const stamp = Date.now();
  const email = `Svc+${stamp}@Example.com`;

  // 1. register returns no hash
  const user = await register({
    firstName: 'Svc',
    lastName: 'Test',
    email,
    password: PASSWORD,
  });
  console.log(!('passwordHash' in user) ? 'PASS  register omits hash' : 'FAIL  hash leaked');
  console.log('      email stored as:', user.email); // expect lowercase

  // 2. login works with different casing
  const loggedIn = await login(email.toUpperCase(), PASSWORD);
  console.log(loggedIn.id === user.id ? 'PASS  login ok' : 'FAIL  login id mismatch');
  console.log(!('passwordHash' in loggedIn) ? 'PASS  login omits hash' : 'FAIL  hash leaked');

  // 3. wrong password
  await expectError('wrong password', InvalidCredentialsError, () =>
    login(email, 'not-the-password'),
  );

  // 4. unknown email
  await expectError('unknown email', InvalidCredentialsError, () =>
    login(`nobody+${stamp}@example.com`, PASSWORD),
  );

  // 5. duplicate with different casing
  await expectError('duplicate email (different case)', EmailAlreadyInUseError, () =>
    register({
      firstName: 'Svc',
      lastName: 'Dupe',
      email: email.toLowerCase(),
      password: PASSWORD,
    }),
  );
}

main()
  .catch((err) => console.error('script crashed:', err))
  .finally(closeDb);