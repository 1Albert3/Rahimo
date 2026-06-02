import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, BookOpen, Bus, ChevronRight, LogOut, MapPin, Menu, QrCode, Settings, X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import FlashToast from '@/Components/FlashToast';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';

const NAV_ITEMS = [
    { label: 'Mes Trajets', icon: Bus, route: 'driver.trips' },
    { label: 'Embarquement', icon: QrCode, route: 'driver.embarquement' },
    { label: 'Formations', icon: BookOpen, route: 'driver.formations' },
    { label: 'Alertes', icon: AlertTriangle, route: 'driver.alertes' },
];

interface Props {
    children: React.ReactNode;
    title?: string;
    breadcrumbs?: { label: string; href?: string }[];
}

function SidebarContent({ currentRoute, onNav }: { currentRoute: string | undefined; onNav?: () => void }) {
    const { auth } = usePage<PageProps>().props;
    return (
        <>
            <div className="px-4 sm:px-6 mb-6 sm:mb-8">
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                        <Bus size={16} className="text-white" />
                    </div>
                    <span className="text-base sm:text-lg font-black text-slate-dark">Rahimo</span>
                </div>
                {auth?.user && (
                    <div className="p-3 bg-white rounded-xl border border-outline">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0 text-sm">
                                {auth.user.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="overflow-hidden min-w-0">
                                <p className="text-slate-dark text-sm font-semibold truncate leading-tight">{auth.user.name}</p>
                                <p className="text-on-surface-variant text-[10px] truncate mt-0.5">Chauffeur</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <nav className="flex-1 px-2 sm:px-3 space-y-0.5 overflow-y-auto scrollbar-thin">
                {NAV_ITEMS.map((item) => {
                    const isActive = currentRoute === item.route;
                    const Icon = item.icon;
                    return (
                        <Link key={item.route} href={route(item.route)} onClick={onNav}
                            className={cn(
                                'flex items-center px-3 sm:px-4 py-2.5 rounded-xl font-medium text-sm transition-all',
                                isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-on-surface-variant hover:bg-white hover:text-slate-dark',
                            )}
                        >
                            <Icon size={18} className="mr-3 shrink-0" strokeWidth={isActive ? 2.5 : 1.75} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto px-3 sm:px-4 pt-4 pb-2 space-y-1">
                <Link href={route('profile.edit')} onClick={onNav}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all"
                >
                    <Settings size={16} /> Paramètres
                </Link>
                <Link href={route('logout')} method="post" as="button" onClick={onNav}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface-variant hover:text-error hover:bg-red-bg/20 transition-all w-full"
                >
                    <LogOut size={16} /> Déconnexion
                </Link>
            </div>
        </>
    );
}

export default function DriverLayout({ children, title, breadcrumbs }: Props) {
    const currentRoute = route().current();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        setSidebarOpen(false);
    }, [currentRoute]);

    return (
        <div className="min-h-screen flex bg-background text-on-background">
            <FlashToast />

            <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-surface-variant flex-col py-6 shadow-xl z-50">
                <SidebarContent currentRoute={currentRoute} />
            </aside>

            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <motion.aside
                            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="absolute left-0 top-0 h-full w-72 bg-surface-variant flex flex-col py-4 sm:py-6 shadow-xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-4 sm:px-6 mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                                        <Bus size={16} className="text-white" />
                                    </div>
                                    <span className="text-base sm:text-lg font-black text-slate-dark">Rahimo</span>
                                </div>
                                <button onClick={() => setSidebarOpen(false)} className="text-on-surface-variant hover:text-slate-dark p-1">
                                    <X size={20} />
                                </button>
                            </div>
                            <SidebarContent currentRoute={currentRoute} onNav={() => setSidebarOpen(false)} />
                        </motion.aside>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
                <header className="flex justify-between items-center px-3 sm:px-6 lg:px-8 h-14 sm:h-16 bg-white sticky top-0 z-40 shadow-sm">
                    <div className="flex items-center gap-2 text-primary min-w-0">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 -ml-1 text-slate-dark hover:bg-surface-variant rounded-xl transition-all">
                            <Menu size={20} />
                        </button>
                        <MapPin size={16} className="hidden sm:block shrink-0" />
                        <h1 className="font-bold text-sm sm:text-lg text-slate-dark truncate">
                            {breadcrumbs && breadcrumbs.length > 0 ? (
                                <nav className="flex items-center gap-1 text-xs sm:text-sm">
                                    {breadcrumbs.map((b, i) => (
                                        <span key={i} className="flex items-center gap-1 min-w-0">
                                            {i > 0 && <ChevronRight size={13} className="text-on-surface-variant shrink-0" />}
                                            {b.href
                                                ? <Link href={b.href} className="text-on-surface-variant hover:text-primary transition-colors truncate">{b.label}</Link>
                                                : <span className="font-bold text-slate-dark truncate">{b.label}</span>
                                            }
                                        </span>
                                    ))}
                                </nav>
                            ) : (
                                <span className="truncate">{title ?? 'Espace Chauffeur'}</span>
                            )}
                        </h1>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <Link href={route('welcome')} className="hidden sm:inline text-[10px] sm:text-xs text-on-surface-variant hover:text-primary transition-colors ml-1 sm:ml-2">
                            ← Site
                        </Link>
                    </div>
                </header>

                <motion.main
                    className="flex-1 p-3 sm:p-6 lg:p-8 bg-background overflow-auto"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    {children}
                </motion.main>

                <footer className="bg-surface-variant px-4 sm:px-8 py-4 sm:py-6 border-t border-outline">
                    <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-0">
                        <span className="text-slate-dark font-bold text-xs sm:text-sm">Rahimo Transport</span>
                        <span className="text-on-surface-variant text-[10px] sm:text-xs font-mono">© {new Date().getFullYear()} Rahimo Group</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
