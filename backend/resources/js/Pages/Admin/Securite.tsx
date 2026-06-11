import { motion } from 'framer-motion';
import { Activity, CalendarDays, Shield, Users, Eye } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps } from '@/types';

interface LogItem {
    id: number;
    user_name: string;
    action: string;
    description: string | null;
    ip_address: string | null;
    created_at: string;
}

interface Props extends PageProps {
    logs: LogItem[];
    stats: { aujourdhui: number; cette_semaine: number; utilisateurs_connectes: number };
}

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function Securite({ logs, stats }: Props) {
    const ST = [
        { label: 'Actions aujourd\'hui', val: stats.aujourdhui, icon: CalendarDays, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
        { label: 'Cette semaine', val: stats.cette_semaine, icon: Activity, color: 'text-status-yellow-text', bg: 'bg-orange-900/30' },
        { label: 'Utilisateurs actifs', val: stats.utilisateurs_connectes, icon: Users, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
    ];

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-dark">Sécurité & Activité</h1>
                    <p className="text-on-surface-variant text-sm mt-0.5">Journal des actions et connexions</p>
                </div>
                <div className="flex items-center gap-2">
                    <Shield size={16} className="text-status-green-text" />
                    <span className="text-xs text-status-green-text font-semibold">Système sécurisé</span>
                </div>
            </div>

            <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-4" variants={stagger} initial="initial" animate="animate">
                {ST.map((s) => (
                    <motion.div key={s.label} variants={fadeUp}
                        className="bg-white rounded-xl border border-outline p-4 flex items-center gap-3"
                    >
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                            <s.icon size={18} className={s.color} />
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-xs text-on-surface-variant">{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="bg-white rounded-xl border border-outline overflow-hidden">
                <div className="p-5 ">
                    <h3 className="font-semibold text-slate-dark flex items-center gap-2">
                        <Activity size={16} className="text-primary" /> Journal d'activité (200 dernières actions)
                    </h3>
                </div>
                <div className="overflow-x-auto min-w-[600px] lg:min-w-0">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                            <tr>
                                {['Utilisateur', 'Action', 'Description', 'IP', 'Date'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className=" font-mono text-xs">
                            {logs.map((l) => (
                                <tr key={l.id} className="hover:bg-gris-surface transition-colors">
                                    <td className="px-4 py-3 text-slate-dark font-semibold">{l.user_name}</td>
                                    <td className="px-4 py-3">
                                        <span className="bg-gris-surface px-2 py-0.5 rounded text-on-surface-variant">{l.action}</span>
                                    </td>
                                    <td className="px-4 py-3 text-on-surface-variant max-w-[300px] truncate">{l.description ?? '—'}</td>
                                    <td className="px-4 py-3 text-on-surface-variant">{l.ip_address ?? '—'}</td>
                                    <td className="px-4 py-3 text-on-surface-variant">{l.created_at}</td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">Aucune activité enregistrée</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

Securite.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Sécurité" breadcrumbs={[{ label: 'Tableau de bord', href: route('admin.dashboard') }, { label: 'Sécurité' }]}>
        {page}
    </BackOfficeLayout>
);
