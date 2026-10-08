import { eq } from "drizzle-orm";
import { EmailAlreadyInUseError } from "../../errors.js";
import { db } from "../index.js";
import { usersTable } from "../schema.js";

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type PublicUser = Omit<User, 'passwordHash'>;

const UNIQUE_VIOLATION = '23505';

function isUniqueViolationError(e: any) {
    return e?.code === UNIQUE_VIOLATION || e?.cause?.code === UNIQUE_VIOLATION;
}

export async function createUser(newUser: NewUser) {
    try {
        const [created] = await db.insert(usersTable).values(newUser).returning();
        if (!created) throw new Error('User not created');

        return created;
    } catch(err) {
        if (isUniqueViolationError(err)) throw new EmailAlreadyInUseError();
        throw err;
    }
}

export async function findByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

    return user;
}

export async function findById(id: string): Promise<PublicUser | undefined> {
    const [user] = await db
        .select({
            id: usersTable.id,
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
            email: usersTable.email,
            createdAt: usersTable.createdAt
        })
        .from(usersTable)
        .where(eq(usersTable.id, id))
        .limit(1)

    return user;
}