import { request } from './client';
import type { LoginUser, LoginResponse, RegisterUser, User } from '../models/types';

export function login(loginUser: LoginUser): Promise<LoginResponse> {
    return request<LoginResponse>('/auth/login', { method: 'POST', body: loginUser });
}

export function register(registerUser: RegisterUser): Promise<User> {
    return request<User>('/auth/register', { method: 'POST', body: registerUser })
}

export function me(): Promise<User> {
    return request<User>('/auth/me');
}