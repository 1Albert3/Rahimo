import { motion } from 'framer-motion';
import { usePage } from '@inertiajs/react';
import { AlertTriangle, Bell, CheckCheck, Clock, Shield } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps } from '@/types';

interface AlerteItem {
    id: number;
    type: 'danger' | 'warning' | 'info';
    categorie: string;
    titre: string;
    description: string;
    bus?: string;
    lieu?: string;
    temps: string;
    traitee: boolean;
}

interface Props extends PageProps {
    actives: AlerteItem[];
    traitees: AlerteItem[];
    stats: { critiques: number; avertissements: number; infos: number; traitees: number };
}

const TYPE_CONFIG: Record<string, { bg: string; border: string; badge: string; icon: string }> = {
    danger:  { bg: 'bg-red-950/50',    border: 'border-status-red-ring',    badge: 'bg-red-900/50 text-status-red-text',    icon: 'text-status-red-text' },
    warning: { bg: 'bg-orange-950/50', border: 'border-status-yellow-ring', badge: 'bg-orange-900/50 text-status-yellow-text', icon: 'text-status-yellow-text' },
    info:    { bg: 'bg-status-blue-bg/50',   border: 'border-status-blue-ring',   badge: 'bg-status-blue-bg/50 text-status-blue-text',  icon: 'text-status-blue-text' },
};

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function Alertes({ actives, traitees, stats }: Props) {
    const STATS = [
        { label: 'Critiques',       val: stats.critiques,       color: 'text-status-red-text',    bg: 'bg-red-900/30' },
        { label: 'Avertissements',  val: stats.avertissements,  color: 'text-status-yellow-text', bg: 'bg-orange-900/30' },
        { label: 'Informations',    val: stats.infos,           color: 'text-status-blue-text',   bg: 'bg-status-blue-bg/30' },
        { label: 'Traitées',        val: stats.traitees,        color: 'text-status-green-text',  bg: 'bg-status-green-bg/30' },
    ];

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Alertes & Sécurité</h1>
                    <p className="text-admin-muted text-sm mt-0.5">Surveillance en temps réel du réseau</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-status-green-text rounded-full animate-pulse" />
                    <span className="text-xs text-status-green-text font-semibold">Surveillance active</span>
                </div>
            </div>

            <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger} initial="initial" animate="animate">
                {STATS.map((s) => (
                    <motion.div key={s.label} variants={fadeUp}
                        className="bg-admin-card rounded-xl border border-white/5 p-4 flex items-center gap-3"
                    >
                        <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                            <Shield size={18} className={s.color} />
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-xs text-admin-muted">{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-admin-muted mb-3 flex items-center gap-2">
                    <Bell size={14} /> Alertes Actives ({actives.length})
                </h2>
                <motion.div className="space-y-3" variants={stagger} initial="initial" animate="animate">
                    {actives.map((a) => {
                        const cfg = TYPE_CONFIG[a.type] ?? TYPE_CONFIG.info;
                        return (
                            <motion.div key={a.id} variants={fadeUp}
                                className={`${cfg.bg} border-l-4 ${cfg.border} rounded-r-xl p-5 flex gap-4`}
                            >
                                <div className="shrink-0 mt-0.5">
                                    <AlertTriangle size={20} className={cfg.icon} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${cfg.badge}`}>
                                            {a.categorie}
                                        </span>
                                        {a.bus && <span className="font-mono text-xs font-bold text-admin-muted">{a.bus}</span>}
                                        {a.lieu && <span className="text-xs text-admin-muted">{a.lieu}</span>}
                                        <span className="text-xs text-admin-muted ml-auto flex items-center gap-1">
                                            <Clock size={11} /> {a.temps}
                                        </span>
                                    </div>
                                    <p className="font-semibold text-white text-sm mb-1">{a.titre}</p>
                                    <p className="text-xs text-admin-muted leading-relaxed">{a.description}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                    {actives.length === 0 && (
                        <div className="bg-admin-card rounded-xl border border-white/5 p-8 text-center">
                            <CheckCheck size={32} className="text-status-green-text mx-auto mb-2" />
                            <p className="text-admin-muted text-sm">Aucune alerte active. Tout est sous contrôle.</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {traitees.length > 0 && (
                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-admin-muted mb-3 flex items-center gap-2">
                        <CheckCheck size={14} /> Historique ({traitees.length})
                    </h2>
                    <motion.div className="space-y-2" variants={stagger} initial="initial" animate="animate">
                        {traitees.map((a) => {
                            const cfg = TYPE_CONFIG[a.type] ?? TYPE_CONFIG.info;
                            return (
                                <motion.div key={a.id} variants={fadeUp}
                                    className="bg-white/5 border border-white/5 rounded-xl p-4 flex gap-3 opacity-60"
                                >
                                    <div className="shrink-0 mt-0.5">
                                        <CheckCheck size={16} className="text-admin-muted" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${cfg.badge}`}>
                                                {a.categorie}
                                            </span>
                                            <span className="text-xs text-admin-muted">{a.temps}</span>
                                        </div>
                                        <p className="text-xs text-admin-muted">{a.titre}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            )}
        </div>
    );
}

function AlertesLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage<PageProps>().props;
    const isDriver = auth?.user?.role === 'chauffeur';
    const homeRoute = isDriver ? route('driver.trips') : route('admin.dashboard');
    return (
        <BackOfficeLayout title="Alertes" breadcrumbs={[{ label: 'Tableau de bord', href: homeRoute }, { label: 'Alertes' }]}>
            {children}
        </BackOfficeLayout>
    );
}

Alertes.layout = (page: React.ReactNode) => <AlertesLayout>{page}</AlertesLayout>;
