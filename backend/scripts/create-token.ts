import 'dotenv/config';
import Fastify from 'fastify';
import authPlugin from '../src/plugins/authPlugin.js'

const app = Fastify();
await app.register(authPlugin);
await app.ready();
console.log(app.jwt.sign({ sub: 'test-id' }));
await app.close();