import 'dotenv/config';
import { closeDb } from '../src/db/index.js';
import { EmailAlreadyInUseError } from '../src/errors.js';
import { createUser, findByEmail, findById } from '../src/db/userRepo.js';


async function main() {
  const email = `test+${Date.now()}@example.com`;
  const input = {
    firstName: 'Test',
    lastName: 'User',
    email,
    passwordHash: 'not-a-real-hash',
  };

  const created = await createUser(input);
  console.log('created:', created);
  console.log('by email:', await findByEmail(email));
  console.log('by id (should have no passwordHash):', await findById(created.id));

  try {
    await createUser(input);
    console.log('PROBLEM: duplicate email was allowed');
  } catch (err) {
    if (err instanceof EmailAlreadyInUseError) {
      console.log('duplicate correctly rejected');
    } else {
      console.error('unexpected error shape:', err);
    }
  }
}

main().finally(closeDb);