import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, BarChart3, Bell, BookOpen, Building2, Bus, Calendar, Car, ChevronDown, ChevronRight,
    CreditCard, DollarSign, FileText, LayoutDashboard, LogOut, Luggage, MapPin, Menu, Package, QrCode, Settings,
    Ticket, Users, Shield, Wrench, X,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import FlashToast from '@/Components/FlashToast';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';

interface NavItem {
    label: string;
    icon: LucideIcon;
    route?: string;
    roles?: string[];
    children?: { label: string; route: string; roles?: string[] }[];
}

const DG = ['directeur_general'];
const FLOTTE = ['directeur_general', 'responsable_flotte'];
const COMPTA = ['directeur_general', 'comptable'];
const GESTION = ['directeur_general', 'responsable_flotte', 'comptable', 'chef_garde'];
const GUICHET = ['directeur_general', 'chef_garde', 'guichetiere'];
const BAGAGE = ['directeur_general', 'chef_garde', 'guichetiere', 'bagagiste'];
const POLICE = ['directeur_general', 'agent_police'];
const ALERTES = ['directeur_general', 'responsable_flotte', 'chef_garde', 'guichetiere', 'agent_police', 'bagagiste'];
const NOTIF = ['directeur_general', 'responsable_flotte', 'comptable', 'chef_garde', 'guichetiere', 'agent_police', 'bagagiste'];

const NAV_ITEMS: NavItem[] = [
    { label: 'Tableau de bord', icon: LayoutDashboard, route: 'admin.dashboard', roles: GESTION },
    { label: 'Billetterie',     icon: Ticket,          route: 'admin.guichet', roles: GUICHET },
    { label: 'Colis',           icon: Package,         route: 'admin.colis', roles: GUICHET },
    { label: 'Départs',         icon: Bus,             route: 'admin.manifeste', roles: GUICHET },
    { label: 'Flotte',          icon: Bus,             route: 'admin.flotte', roles: FLOTTE },
    { label: 'Embarquement',    icon: QrCode,          route: 'admin.embarquement', roles: GUICHET },
    {
        label: 'Formations', icon: BookOpen, roles: DG,
        children: [
            { label: 'Gérer',           route: 'admin.formations.cours', roles: DG },
            { label: 'Certificats',     route: 'admin.certificats', roles: DG },
        ],
    },
    {
        label: 'RH', icon: Users, roles: FLOTTE,
        children: [
            { label: 'Tableau de bord', route: 'admin.rh.dashboard', roles: FLOTTE },
            { label: 'Personnel',       route: 'admin.rh.personnel', roles: FLOTTE },
            { label: 'Contrats',        route: 'admin.rh.contrats', roles: FLOTTE },
            { label: 'Congés',          route: 'admin.rh.conges', roles: FLOTTE },
            { label: 'Pointage',        route: 'admin.rh.pointage', roles: FLOTTE },
            { label: 'Paie',            route: 'admin.rh.paie', roles: FLOTTE },
        ],
    },
    {
        label: 'Services', icon: Car, roles: GESTION,
        children: [
            { label: 'Parking',        route: 'admin.services.parking', roles: GESTION },
            { label: 'Location',       route: 'admin.services.location', roles: GESTION },
            { label: 'Hébergement',    route: 'admin.services.hebergement', roles: GESTION },
            { label: 'Transport motos', route: 'admin.services.moto', roles: GESTION },
        ],
    },
    {
        label: 'Comptabilité', icon: CreditCard, roles: COMPTA,
        children: [
            { label: 'Synthèse',        route: 'admin.comptabilite', roles: COMPTA },
            { label: 'Dépenses',        route: 'admin.depenses', roles: COMPTA },
            { label: 'Factures',        route: 'admin.finance.factures', roles: COMPTA },
            { label: 'Grand-Livre',     route: 'admin.finance.grand-livre', roles: COMPTA },
            { label: 'Bilan / P&L',     route: 'admin.finance.bilan', roles: COMPTA },
            { label: 'Budgets',         route: 'admin.finance.budgets', roles: COMPTA },
        ],
    },
    { label: 'Carte GPS',       icon: MapPin,          route: 'admin.gps-map', roles: FLOTTE },
    { label: 'Alertes Vitesse', icon: AlertTriangle,   route: 'admin.speed-alerts', roles: FLOTTE },
    { label: 'Maintenance',     icon: Wrench,          route: 'admin.maintenance', roles: FLOTTE },
    { label: 'Trajets',         icon: Bus,             route: 'admin.trajets', roles: FLOTTE },
    { label: 'Planning',        icon: Calendar,        route: 'admin.planning', roles: FLOTTE },
    {
        label: 'Rapports', icon: BarChart3, roles: COMPTA,
        children: [
            { label: 'Synthèse', route: 'admin.rapports', roles: COMPTA },
            { label: 'Avancés',  route: 'admin.rapports.avances', roles: DG },
        ],
    },
    { label: 'Anti-Fraude',     icon: Shield,          route: 'admin.fraude', roles: DG },
    { label: 'Réclamations',    icon: FileText,        route: 'admin.reclamations', roles: GUICHET },
    { label: 'Objets Trouvés',  icon: Package,         route: 'admin.lost-items', roles: GUICHET },
    { label: 'Bagages',         icon: Luggage,         route: 'admin.bagages', roles: BAGAGE },
    { label: 'Alertes',         icon: AlertTriangle,   route: 'admin.alertes', roles: ALERTES },
    {
        label: 'Sécurité', icon: Shield, roles: POLICE,
        children: [
            { label: 'Dashboard',       route: 'admin.securite', roles: DG },
            { label: 'Police',          route: 'admin.police', roles: POLICE },
            { label: 'Surveillance',    route: 'admin.police.watchlist', roles: POLICE },
            { label: 'Vérifications',   route: 'admin.police.verifications', roles: POLICE },
        ],
    },
    { label: 'Paiements',       icon: DollarSign,      route: 'admin.paiements', roles: COMPTA },
    { label: 'Utilisateurs',    icon: Users,           route: 'admin.utilisateurs', roles: DG },
    { label: 'Compagnies',      icon: Building2,       route: 'admin.compagnies', roles: DG },
    { label: 'Gares & Routes',  icon: MapPin,          route: 'admin.gares', roles: DG },
    { label: 'Notifications',   icon: Bell,            route: 'admin.notifications', roles: NOTIF },
];

interface Props {
    children: React.ReactNode;
    title?: string;
    breadcrumbs?: { label: string; href?: string }[];
}

function filterNavItems(items: NavItem[], role: string): NavItem[] {
    return items
        .filter(item => !item.roles || item.roles.includes(role))
        .map(item => {
            if (item.children) {
                const filteredChildren = item.children.filter(c => !c.roles || c.roles.includes(role));
                return { ...item, children: filteredChildren.length > 0 ? filteredChildren : undefined };
            }
            return item;
        });
}

function NavGroup({ item, currentRoute, onNav }: { item: NavItem; currentRoute: string | undefined; onNav?: () => void }) {
    const [open, setOpen] = useState(
        item.children?.some((c) => currentRoute === c.route) ?? false,
    );
    const Icon = item.icon;
    const isAnyChildActive = item.children?.some((c) => currentRoute === c.route) ?? false;

    return (
        <div>
            <button onClick={() => setOpen(!open)}
                className={cn(
                    'flex items-center w-full px-4 py-3 rounded-xl font-medium text-sm transition-all',
                    isAnyChildActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-on-surface-variant hover:bg-white hover:text-slate-dark',
                )}
            >
                <Icon size={18} className="mr-3 shrink-0" strokeWidth={isAnyChildActive ? 2.5 : 1.75} />
                <span className="flex-1 text-left">{item.label}</span>
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {open && (
                <div className="ml-6 mt-1 space-y-1 border-l border-outline pl-3">
                    {item.children!.map((child) => {
                        const isActive = currentRoute === child.route;
                        return (
                            <Link key={child.route} href={route(child.route)} onClick={onNav}
                                className={cn(
                                    'flex items-center px-3 py-2 rounded-xl text-sm transition-all',
                                    isActive
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : 'text-on-surface-variant hover:bg-white hover:text-slate-dark',
                                )}
                            >
                                {child.label}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function SidebarContent({ currentRoute, onNav }: { currentRoute: string | undefined; onNav?: () => void }) {
    const { auth } = usePage<PageProps>().props;
    const role = auth?.user?.role ?? 'agent';
    const filteredItems = filterNavItems(NAV_ITEMS, role);

    const ROLE_LABELS: Record<string, string> = {
        directeur_general: 'Directeur Général',
        responsable_flotte: 'Resp. Flotte',
        comptable: 'Comptable',
        chef_garde: 'Chef de Gare',
        guichetiere: 'Guichetière',
        agent_police: 'Agent Police',
        bagagiste: 'Bagagiste',
        chauffeur: 'Chauffeur',
        client: 'Client',
    };

    return (
        <>
            <div className="px-4 sm:px-6 mb-6 sm:mb-8">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                        <Bus size={16} className="text-white" />
                    </div>
                    <span className="text-base sm:text-lg font-black text-slate-dark">Rahimo</span>
                </div>
                {auth?.user && (
                    <div className="mt-5 p-3 bg-white rounded-xl border border-outline">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0 text-sm">
                                {auth.user.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="overflow-hidden min-w-0">
                                <p className="text-slate-dark text-sm font-semibold truncate leading-tight">{auth.user.name}</p>
                                <p className="text-on-surface-variant text-[10px] truncate mt-0.5">{ROLE_LABELS[role] ?? role}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <nav className="flex-1 px-2 sm:px-3 space-y-0.5 overflow-y-auto scrollbar-thin">
                {filteredItems.map((item) => {
                    if (item.children) {
                        return <NavGroup key={item.label} item={item} currentRoute={currentRoute} onNav={onNav} />;
                    }
                    const isActive = currentRoute === item.route;
                    const Icon = item.icon;
                    return (
                        <Link key={item.route} href={route(item.route!)} onClick={onNav}
                            className={cn(
                                'flex items-center px-3 sm:px-4 py-2.5 rounded-xl font-medium text-sm transition-all',
                                isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-on-surface-variant hover:bg-white hover:text-slate-dark',
                            )}
                        >
                            <Icon size={18} className="mr-3 shrink-0" strokeWidth={isActive ? 2.5 : 1.75} />
                            <span className="truncate">{item.label}</span>
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

export default function BackOfficeLayout({ children, title, breadcrumbs }: Props) {
    const { auth } = usePage<PageProps>().props;
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
                                <span className="text-base sm:text-lg font-black text-slate-dark">Rahimo Admin</span>
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
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 -ml-1 text-slate-dark hover:bg-gris-surface rounded-lg transition-all">
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
                                <span className="truncate">{title ?? 'Gare Centrale Ouagadougou'}</span>
                            )}
                        </h1>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <div className="relative">
                            <button className="p-1.5 sm:p-2 text-on-surface-variant hover:bg-gris-surface rounded-full transition-all">
                                <Bell size={16} className="sm:size-[18px]" />
                            </button>
                            <span className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full border-2 border-white" />
                        </div>
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

                <footer className="bg-gris-surface px-4 sm:px-8 py-4 sm:py-6 border-t border-outline">
                    <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-0">
                        <span className="text-slate-dark font-bold text-xs sm:text-sm">Rahimo Transport</span>
                        <span className="text-on-surface-variant text-[10px] sm:text-xs font-mono">© {new Date().getFullYear()} Rahimo Group</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
