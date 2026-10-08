export class EmailAlreadyInUseError extends Error {
  constructor() {
    super('Email already in use.');
    this.name = 'EmailAlreadyInUseError';
  }
}

export class InvalidCredentialsError extends Error {
    constructor() {
        super('Invalid password or email.');
        this.name = 'InvalidCredentialsError';
    }
}

export class InvalidFeedUrlError extends Error {
  constructor(message: string = 'Not a valid url.') {
    super(message);
    this.name = 'InvalidFeedUrlError'
  }
}
export class NotFoundError extends Error {
    constructor(message = "Not found") {
        super(message);
        this.name = "NotFoundError";
    }
}

export class UnauthorizedError extends Error {
    constructor(message = "Unauthorized") {
        super(message);
        this.name = "UnauthorizedError";
    }
}