import api from './client';

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    phone?: string;
    city?: string;
    loyalty_points?: number;
    company_id?: number;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem('auth_token', data.token);
    return data;
}

export async function register(payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    localStorage.setItem('auth_token', data.token);
    return data;
}

export async function logout(): Promise<void> {
    await api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('auth_token');
}

export async function me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
}
