export const registerBodySchema = {
    type: 'object',
    required: ['firstName', 'lastName', 'email', 'password'],
    additionalProperties: false,
    properties: {
        firstName: { type: 'string', minLength: 1, maxLength: 100 },
        lastName: { type: 'string', minLength: 1, maxLength: 100 },
        email: { type: 'string', format: 'email', maxLength: 254 },
        password: { type: 'string', minLength: 8, maxLength: 128 }
    }
} as const;

export const loginBodySchema = {
  type: 'object',
  required: ['email', 'password'],
  additionalProperties: false,
  properties: {
    email:    { type: 'string', format: 'email', maxLength: 254 },
    password: { type: 'string', minLength: 1, maxLength: 128 },
  },
} as const;

export const publicUserSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const errorSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
  },
} as const;
