import { useEffect, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth';
import type { LoginUser, RegisterUser, User } from '../models/userModel';
import { clearToken, getToken, setToken } from '../api/tokenStorage';
import { type AuthStatus, AuthContext } from './AuthContext';
import { ApiError } from '../models/errors';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [status, setStatus] = useState<AuthStatus>(() =>
        getToken() ? 'loading' : 'unauthenticated');

    useEffect(() => {
        if (!getToken()) return;
        let cancelled = false;
        authApi
            .me()
            .then((me) => {
                if (cancelled) return;
                setUser(me);
                setStatus('authenticated');
            })
            .catch((err) => {
                if (cancelled) return;
                if (err instanceof ApiError && err.status === 401) {
                    clearToken(); // token was rejected, discard it
                    setUser(null);
                }
                // for any other error, don't get rid of the token. ie. so a server down doesn't require a login
                setStatus('unauthenticated'); 
            })
        return () => {
            cancelled = true;
        }
    }, []);

    async function login(loginUser: LoginUser) {
        const res = await authApi.login(loginUser);
        setToken(res.token);
        setUser(res.user);
        setStatus('authenticated');
    }

    async function register(registerUser: RegisterUser) {
        await authApi.register(registerUser);
        await login({ email: registerUser.email, password: registerUser.password });
    }

    function logout() {
        setUser(null);
        setStatus('unauthenticated');
        clearToken();
    }

    return (
        <AuthContext.Provider value={{ user, status, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}