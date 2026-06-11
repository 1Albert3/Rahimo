import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Bus, ChevronRight, ChevronDown, LogOut, Mail, MapPin, Menu, Phone, User, Settings, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import FlashToast from '@/Components/FlashToast';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';

const NAV_LINKS = [
    { label: 'Accueil',  to: '/' },
    { label: 'Réserver', to: '/voyages' },
    { label: 'Colis',    to: '/colis/suivi' },
    { label: 'Services', to: '/services' },
];

interface Props {
    children: React.ReactNode;
    activeNav?: string;
    title?: string; // ignoré (document.title géré par Head)
}

function UserMenu() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    if (!user) {
        return (
            <Link to="/login"
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all backdrop-blur-sm"
            >
                <User size={16} /> Connexion
            </Link>
        );
    }

    const initials = user.name.slice(0, 2).toUpperCase();

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all backdrop-blur-sm"
            >
                <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-black">{initials}</span>
                <span className="hidden sm:inline truncate max-w-[100px]">{user.name}</span>
                <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-outline overflow-hidden z-50"
                    >
                        <div className="p-3 border-b border-outline">
                            <p className="font-bold text-slate-dark text-sm truncate">{user.name}</p>
                            <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                        </div>
                        <div className="p-1">
                            <Link to="/dashboard" onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-dark hover:bg-gris-surface transition-colors"
                            ><User size={16} /> Mon espace</Link>
                            <Link to="/profile" onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-dark hover:bg-gris-surface transition-colors"
                            ><Settings size={16} /> Paramètres</Link>
                            <button onClick={async () => { setOpen(false); await logout(); navigate('/login'); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-status-red-text hover:bg-status-red-bg transition-colors"
                            ><LogOut size={16} /> Déconnexion</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function GuestLayout({ children, activeNav }: Props) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-background text-on-background">
            <FlashToast />

            <Header activeNav={activeNav} />

            <motion.main
                className="flex-1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
                {children}
            </motion.main>

            <Footer />
        </div>
    );
}
