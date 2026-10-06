export class EmailAlreadyInUseError extends Error {
  constructor() {
    super('Email already in use');
    this.name = 'EmailAlreadyInUseError';
  }
}

export class InvalidCredentialsError extends Error {
    constructor() {
        super('Invalid password or email');
        this.name = 'InvalidCredentialsError';
    }
}