export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
}

export interface RegisterUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginUser {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}