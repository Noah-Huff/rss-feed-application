import { ApiError } from "../models/errors";
import { getToken } from "./tokenStorage";

const BASE_URL = import.meta.env.VITE_API_URL;

interface RequestOptions {
    method?: string;
    body?: unknown
}

export async function request<T>(
    path: string,
    options: RequestOptions = {}
): Promise<T>{
    const headers: Record<string, string> = {};
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res: Response;
    try {
        res = await fetch(`${BASE_URL}${path}`, {
            method: options.method ?? 'GET',
            headers,
            body: options.body !== undefined ? JSON.stringify(options.body) : undefined
        });
    } catch {
        throw new ApiError(0, 'Unable to reach the server');
    }

    const text = await res.text();
    let data: unknown = null;
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = null;
        }
    }
    if (!res.ok) {
        const message = 
            (data as { message?: string } | null)?.message ?? 'Something went wrong.'
        throw new ApiError(res.status, message);
    }

    return data as T;
}