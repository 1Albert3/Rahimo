import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { me, logout as apiLogout, type User } from '@/api/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    setUser: (u: User | null) => void;
    logout: () => Promise<void>;
    isRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) { setLoading(false); return; }
        me()
            .then(setUser)
            .catch(() => localStorage.removeItem('auth_token'))
            .finally(() => setLoading(false));
    }, []);

    const logout = async () => {
        await apiLogout();
        setUser(null);
    };

    const isRole = (...roles: string[]) => !!user && roles.includes(user.role);

    return (
        <AuthContext.Provider value={{ user, loading, setUser, logout, isRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
