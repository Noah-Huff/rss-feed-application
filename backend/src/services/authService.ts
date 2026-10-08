import { InvalidCredentialsError, UnauthorizedError } from '../errors.js';
import argon2 from 'argon2';
import { createUser, findByEmail, findById, type PublicUser, type User } from '../db/repos/userRepo.js';

const DUMMY_HASH = await argon2.hash('dummy-pwd-for-timing');

export interface RegisterUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export async function register(regUser: RegisterUser): Promise<PublicUser> {
    const email = normalizeEmail(regUser.email);
    const passwordHash = await argon2.hash(regUser.password);
    const user = await createUser(
        { firstName: regUser.firstName, 
            lastName: regUser.lastName, 
            email, 
            passwordHash 
        });
    return toPublicUser(user);
}

export async function login(email: string, password: string): Promise<PublicUser> {
    const user = await findByEmail(normalizeEmail(email));
    if (!user) {
        await argon2.verify(DUMMY_HASH, password);
        throw new InvalidCredentialsError();
    }
    
    let valid = false;
    try {
        valid = await argon2.verify(user.passwordHash, password);
    } catch {
        valid = false;
    }

    if (!valid) throw new InvalidCredentialsError();

    return toPublicUser(user);
}

export async function getCurrentUser(userId: string): Promise<PublicUser> {
    const user = await findById(userId);
    if (!user) throw new UnauthorizedError('unauthorized');
    return user;
}

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

function toPublicUser(user: User): PublicUser {
    const { passwordHash, ...publicUser } = user;
    return publicUser;
}
