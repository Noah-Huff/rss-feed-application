import 'dotenv/config';

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl || testUrl === process.env.DATABASE_URL) {
  throw new Error('Refusing to run tests against the dev database');
}

process.env.DATABASE_URL = testUrl;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-not-for-production';