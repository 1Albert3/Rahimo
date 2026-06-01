import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Gauge, XCircle } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps, PaginatedData } from '@/types';

interface AlertItem {
    id: number;
    vehicle: string;
    driver: string | null;
    speed: number;
    speed_limit: number;
    level: string;
    status: string;
    notification: string | null;
    location: string | null;
    created_at: string;
    log_count: number;
}

interface Props extends PageProps {
    alerts: PaginatedData<AlertItem>;
    stats: { active: number; danger: number; today: number };
}

export default function SpeedAlerts({ alerts, stats }: Props) {
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Alertes Excès de Vitesse</h1>
                <p className="text-admin-muted text-sm mt-0.5">Surveillance GPS en temps réel des dépassements de vitesse</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Alertes Actives', val: stats.active, icon: AlertTriangle, color: 'text-status-red-text', bg: 'bg-status-red-bg/30' },
                    { label: 'Niveau DANGER', val: stats.danger, icon: Gauge, color: 'text-status-red-text', bg: 'bg-status-red-bg/30' },
                    { label: 'Aujourd\'hui', val: stats.today, icon: AlertTriangle, color: 'text-status-yellow-text', bg: 'bg-status-yellow-bg/30' },
                ].map(s => (
                    <div key={s.label} className="bg-admin-card rounded-xl border border-white/5 p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                            <s.icon size={18} className={s.color} />
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-xs text-admin-muted">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['Véhicule', 'Chauffeur', 'Vitesse', 'Limite', 'Niveau', 'Notification', 'Date', 'Logs', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.data.map(a => (
                                <tr key={a.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-white font-mono">{a.vehicle}</td>
                                    <td className="px-4 py-3 text-admin-muted">{a.driver ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`font-mono font-bold ${a.speed > 105 ? 'text-status-red-text' : 'text-status-yellow-text'}`}>
                                            {a.speed} km/h
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-admin-muted font-mono">{a.speed_limit}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                            a.level === 'danger'
                                                ? 'bg-status-red-bg text-status-red-text animate-pulse'
                                                : 'bg-status-yellow-bg text-status-yellow-text'
                                        }`}>
                                            {a.level === 'danger' ? 'DANGER' : 'AVERTISSEMENT'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-admin-muted text-xs max-w-[200px] truncate">{a.notification ?? '—'}</td>
                                    <td className="px-4 py-3 text-admin-muted text-xs font-mono">{a.created_at}</td>
                                    <td className="px-4 py-3 text-admin-muted">{a.log_count}</td>
                                    <td className="px-4 py-3">
                                        {a.status === 'active' && (
                                            <div className="flex gap-1">
                                                <button onClick={() => router.post(route('admin.speed-alerts.acknowledge', a.id))}
                                                    className="text-status-blue-text hover:underline text-xs font-semibold"
                                                ><CheckCircle size={12} className="inline" /> Acquitter</button>
                                                <button onClick={() => router.post(route('admin.speed-alerts.resolve', a.id))}
                                                    className="text-status-green-text hover:underline text-xs font-semibold"
                                                ><CheckCircle size={12} className="inline" /> Résoudre</button>
                                            </div>
                                        )}
                                        {a.status === 'acknowledged' && (
                                            <span className="text-xs text-admin-muted">Acquitté</span>
                                        )}
                                        {a.status === 'resolved' && (
                                            <span className="text-xs text-status-green-text">Résolu</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {alerts.data.length === 0 && (
                                <tr><td colSpan={9} className="text-center py-8 text-admin-muted text-sm">Aucune alerte de vitesse.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

import { router } from '@inertiajs/react';

SpeedAlerts.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Alertes de Vitesse" breadcrumbs={[{ label: 'Flotte' }, { label: 'Alertes Vitesse' }]}>
        {page}
    </BackOfficeLayout>
);