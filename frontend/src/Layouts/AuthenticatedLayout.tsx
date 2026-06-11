import { Link, useNavigate } from 'react-router-dom';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import FlashToast from '@/Components/FlashToast';

export default function AuthenticatedLayout({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showNav, setShowNav] = useState(false);

    return (
        <div className="min-h-screen bg-gris-surface">
            <FlashToast />
            <nav className="bg-white sticky top-0 z-50 shadow-xl">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center gap-8">
                            <Link to="/" className="text-lg font-black text-primary">Rahimo</Link>
                            <Link to="/dashboard" className="text-sm font-medium text-on-surface-variant hover:text-slate-dark">Dashboard</Link>
                        </div>
                        <div className="flex items-center gap-3">
                            {user && (
                                <>
                                    <span className="text-sm text-on-surface-variant hidden sm:block">{user.name}</span>
                                    <Link to="/profile" className="text-sm text-on-surface-variant hover:text-primary px-3 py-1.5 rounded-lg hover:bg-gris-surface transition">Profil</Link>
                                    <button
                                        onClick={async () => { await logout(); navigate('/login'); }}
                                        className="text-sm text-on-surface-variant hover:text-status-red-text px-3 py-1.5 rounded-lg hover:bg-status-red-bg/20 transition"
                                    >Déconnexion</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            {header && (
                <header className="bg-white shadow-xl">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}
            <main>{children}</main>
        </div>
    );
}
