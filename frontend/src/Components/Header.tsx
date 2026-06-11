import { Link, useNavigate } from 'react-router-dom';
import { Bell, Bus, ChevronDown, Menu, X, User as UserIcon, LogOut, Settings, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/Components/Button';

const NAV_LINKS = [
    { label: 'Accueil',  to: '/' },
    { label: 'Réserver', to: '/voyages' },
    { label: 'Colis',    to: '/colis/suivi' },
    { label: 'Services', to: '/services' },
];

function UserMenuInline() {
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
            <Link to="/login" className="hidden md:inline-flex">
                <Button className="px-4 py-2" variant="ghost">Connexion</Button>
            </Link>
        );
    }

    const initials = user.name.slice(0, 2).toUpperCase();

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen(!open)} className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all backdrop-blur-sm">
                <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-black">{initials}</span>
                <span className="hidden sm:inline truncate max-w-[100px]">{user.name}</span>
                <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-outline overflow-hidden z-50">
                        <div className="p-3 border-b border-outline">
                            <p className="font-bold text-slate-dark text-sm truncate">{user.name}</p>
                            <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                        </div>
                        <div className="p-1">
                            <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-dark hover:bg-gris-surface transition-colors"><UserIcon size={16} /> Mon espace</Link>
                            <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-dark hover:bg-gris-surface transition-colors"><Settings size={16} /> Paramètres</Link>
                            <button onClick={async () => { setOpen(false); await logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-status-red-text hover:bg-status-red-bg transition-colors"><LogOut size={16} /> Déconnexion</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function Header({ activeNav }: { activeNav?: string }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="bg-primary text-white font-semibold sticky top-0 z-50 shadow-xl">
            <div className="flex justify-between items-center px-4 sm:px-8 h-16 sm:h-20 w-full max-w-7xl mx-auto">
                <Link to="/" className="flex items-center gap-2 group">
                    <span className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <Bus size={18} className="text-white" />
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-white tracking-tight">Rahimo</span>
                </Link>

                <div className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map((link) => (
                        <Link key={link.label} to={link.to} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            activeNav === link.label
                                ? 'bg-white/20 text-white shadow-sm'
                                : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}>
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <Link to="/voyages" className="hidden md:inline-flex">
                        <Button className="px-5 py-2.5" variant="secondary"><Bus size={16} /> Acheter un ticket</Button>
                    </Link>
                    <button className="relative hover:bg-white/10 rounded-lg p-2.5 transition-colors">
                        <Bell size={18} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-status-red-text rounded-full border border-white" />
                    </button>
                    <UserMenuInline />
                    <button className="md:hidden p-2.5 hover:bg-white/10 rounded-lg transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {mobileOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }} className="md:hidden overflow-hidden">
                        <div className="px-4 py-4 flex flex-col gap-1.5 bg-gradient-to-b from-transparent to-black/10">
                            {NAV_LINKS.map((link) => (
                                <Link key={link.label} to={link.to} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all" onClick={() => setMobileOpen(false)}>
                                    <Bus size={16} /> {link.label}
                                </Link>
                            ))}
                            <div className="border-t border-white/10 my-2" />
                            <Link to="/voyages" className="flex items-center justify-center gap-2 bg-white text-primary px-4 py-3 rounded-xl text-sm font-bold" onClick={() => setMobileOpen(false)}>
                                <Bus size={16} /> Acheter un ticket
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
