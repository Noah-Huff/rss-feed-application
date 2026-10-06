import type { RegisterUser } from '../../src/services/authService.js';

let counter = 0;

export function makeUserInput(overrides: Partial<RegisterUser> = {}): RegisterUser {
  counter += 1;
  return {
    firstName: 'Test',
    lastName: 'User',
    email: `user${counter}@example.com`,
    password: 'check-out-my-test-password!',
    ...overrides,
  };
}