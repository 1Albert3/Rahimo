import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Bus, ChevronRight, ChevronDown, LogOut, Mail, MapPin, Menu, Phone, User, Settings, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import FlashToast from '@/Components/FlashToast';
import type { PageProps } from '@/types';

const NAV_LINKS = [
    { label: 'Accueil',  route: 'welcome', icon: Bus },
    { label: 'Réserver', route: 'trips.search', icon: Bus },
    { label: 'Colis',    route: 'colis.track', icon: Bus },
    { label: 'Services', route: 'services.index', icon: Bus },
];

interface Props {
    children: React.ReactNode;
    title?: string;
    activeNav?: string;
}

function UserMenu() {
    const { auth } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    if (!auth?.user) {
        return (
            <Link href={route('login')}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all backdrop-blur-sm"
            >
                <User size={16} /> Connexion
            </Link>
        );
    }

    const initials = auth.user.name.slice(0, 2).toUpperCase();

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all backdrop-blur-sm"
            >
                <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-black">{initials}</span>
                <span className="hidden sm:inline truncate max-w-[100px]">{auth.user.name}</span>
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
                            <p className="font-bold text-slate-dark text-sm truncate">{auth.user.name}</p>
                            <p className="text-xs text-on-surface-variant truncate">{auth.user.email}</p>
                        </div>
                        <div className="p-1">
                            <Link href={route('dashboard')}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-dark hover:bg-gris-surface transition-colors"
                            ><User size={16} /> Mon espace</Link>
                            <Link href={route('profile.edit')}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-dark hover:bg-gris-surface transition-colors"
                            ><Settings size={16} /> Paramètres</Link>
                            <button onClick={() => { setOpen(false); router.post(route('logout')); }}
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
    const { auth } = usePage<PageProps>().props;
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-background text-on-background">
            <FlashToast />

            {/* Navbar */}
            <nav className="bg-primary text-white font-semibold sticky top-0 z-50 shadow-xl">
                <div className="flex justify-between items-center px-4 sm:px-8 h-16 sm:h-20 w-full max-w-7xl mx-auto">
                    {/* Brand */}
                    <Link href={route('welcome')} className="flex items-center gap-2 group">
                        <span className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                            <Bus size={18} className="text-white" />
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            Rahimo
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <Link key={link.label} href={route(link.route)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                    activeNav === link.label
                                        ? 'bg-white/20 text-white shadow-sm'
                                        : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Link href={route('trips.search')}
                            className="hidden md:flex items-center gap-2 bg-white text-primary px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gris-surface hover:shadow-xl transition-all shadow-sm"
                        >
                            <Bus size={16} /> Acheter un ticket
                        </Link>
                        <button className="relative hover:bg-white/10 rounded-lg p-2.5 transition-colors">
                            <Bell size={18} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-status-red-text rounded-full border border-white" />
                        </button>
                        <UserMenu />
                        <button className="md:hidden p-2.5 hover:bg-white/10 rounded-lg transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
                            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                            className="md:hidden overflow-hidden"
                        >
                            <div className="px-4 py-4 flex flex-col gap-1.5 bg-gradient-to-b from-transparent to-black/10">
                                {NAV_LINKS.map((link) => (
                                    <Link key={link.label} href={route(link.route)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <Bus size={16} />
                                        {link.label}
                                    </Link>
                                ))}
                                <div className="border-t border-white/10 my-2" />
                                <Link href={route('trips.search')}
                                    className="flex items-center justify-center gap-2 bg-white text-primary px-4 py-3 rounded-xl text-sm font-bold"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <Bus size={16} /> Acheter un ticket
                                </Link>
                                {auth?.user && (
                                    <button onClick={() => { setMobileOpen(false); router.post(route('logout')); }}
                                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white/80 hover:bg-white/10 transition-all"
                                    ><LogOut size={16} /> Déconnexion</button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Page content */}
            <motion.main
                className="flex-1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
                {children}
            </motion.main>

            {/* Footer — Tonal tier shift (no-line rule), DESIGN.md */}
            <footer className="bg-slate-dark w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 px-4 sm:px-8 py-10 sm:py-16 w-full max-w-7xl mx-auto text-white">
                    <div>
                        <span className="text-2xl font-black mb-6 block">Rahimo Transport</span>
                        <p className="text-white/70 leading-relaxed text-sm">
                            Leader du transport routier de personnes et de marchandises au Burkina Faso. Connectons nos régions en toute sécurité.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-6">Liens Utiles</h4>
                        <ul className="space-y-4 text-white/70 text-sm">
                            {['À propos', 'Agences', 'Contact', 'FAQ'].map((l) => (
                                <li key={l}>
                                    <a href="#" className="hover:text-white transition-colors flex items-center gap-2 group">
                                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        {l}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-6">Services</h4>
                        <ul className="space-y-4 text-white/70 text-sm">
                            {['Acheter un ticket', 'Suivi de colis', 'Location de bus', 'Transport de motos'].map((l) => (
                                <li key={l}>
                                    <a href="#" className="hover:text-white transition-colors flex items-center gap-2 group">
                                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        {l}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-6">Contact</h4>
                        <ul className="space-y-5 text-white/70 text-sm">
                            <li className="flex items-start gap-4">
                                <MapPin size={18} className="text-white/60 shrink-0 mt-0.5" />
                                <span>Gare de Ouagadougou, Secteur 10</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Phone size={18} className="text-white/60 shrink-0" />
                                <span className="font-mono">+226 25 00 00 00</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Mail size={18} className="text-white/60 shrink-0" />
                                <span>contact@rahimo.bf</span>
                            </li>
                        </ul>
                        {/* Lien discret back-office */}
                        <Link href={route('login')} className="mt-8 inline-block text-xs text-white/30 hover:text-white/60 transition-colors">
                            Accès personnel →
                        </Link>
                    </div>
                </div>
                <div className="border-t border-white/5 text-center py-6 sm:py-8 px-4 text-white/40 text-xs sm:text-sm font-mono">
                    © {new Date().getFullYear()} Rahimo Transport. Tous droits réservés.
                </div>
            </footer>
        </div>
    );
}
