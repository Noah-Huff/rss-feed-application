import { createContext } from "react";
import type { LoginUser, User, RegisterUser } from "../models/types";

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
    user: User | null;
    status: AuthStatus;
    login: (input: LoginUser) => Promise<void>;
    register: (input: RegisterUser) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);