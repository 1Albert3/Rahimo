import { useState } from 'react';
import { AlertTriangle, CheckCircle, Gauge } from 'lucide-react';
import type { PaginatedData } from '@/types';
import { useApi } from '@/hooks/useApi';
import { acknowledgeSpeedAlert, resolveSpeedAlert } from '@/api/admin';

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

interface SpeedAlertsData {
    alerts: PaginatedData<AlertItem>;
    stats: { active: number; danger: number; today: number };
}

export default function SpeedAlerts() {
    const { data, loading, refetch } = useApi<SpeedAlertsData>('/admin/alertes-vitesse');
    const [processing, setProcessing] = useState<number | null>(null);

    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;

    const alerts = data?.alerts ?? { data: [] } as any;
    const stats = data?.stats ?? {} as any;

    const handleAcknowledge = async (id: number) => {
        setProcessing(id);
        try {
            await acknowledgeSpeedAlert(id);
            refetch();
        } finally {
            setProcessing(null);
        }
    };

    const handleResolve = async (id: number) => {
        setProcessing(id);
        try {
            await resolveSpeedAlert(id);
            refetch();
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-dark">Alertes Excès de Vitesse</h1>
                <p className="text-on-surface-variant text-sm mt-0.5">Surveillance GPS en temps réel des dépassements de vitesse</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Alertes Actives', val: stats?.active ?? 0, icon: AlertTriangle, color: 'text-status-red-text', bg: 'bg-status-red-bg/30' },
                    { label: 'Niveau DANGER', val: stats?.danger ?? 0, icon: Gauge, color: 'text-status-red-text', bg: 'bg-status-red-bg/30' },
                    { label: 'Aujourd\'hui', val: stats?.today ?? 0, icon: AlertTriangle, color: 'text-status-yellow-text', bg: 'bg-status-yellow-bg/30' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-outline shadow-sm p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                            <s.icon size={18} className={s.color} />
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-xs text-on-surface-variant">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                            <tr>
                                {['Véhicule', 'Chauffeur', 'Vitesse', 'Limite', 'Niveau', 'Notification', 'Date', 'Logs', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.data.map((a: AlertItem) => (
                                <tr key={a.id} className="hover:bg-gris-surface transition-colors">
                                    <td className="px-4 py-3 font-semibold text-slate-dark font-mono">{a.vehicle}</td>
                                    <td className="px-4 py-3 text-on-surface-variant">{a.driver ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`font-mono font-bold ${a.speed > 105 ? 'text-status-red-text' : 'text-status-yellow-text'}`}>
                                            {a.speed} km/h
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-on-surface-variant font-mono">{a.speed_limit}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                            a.level === 'danger'
                                                ? 'bg-status-red-bg text-status-red-text animate-pulse'
                                                : 'bg-status-yellow-bg text-status-yellow-text'
                                        }`}>
                                            {a.level === 'danger' ? 'DANGER' : 'AVERTISSEMENT'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-on-surface-variant text-xs max-w-[200px] truncate">{a.notification ?? '—'}</td>
                                    <td className="px-4 py-3 text-on-surface-variant text-xs font-mono">{a.created_at}</td>
                                    <td className="px-4 py-3 text-on-surface-variant">{a.log_count}</td>
                                    <td className="px-4 py-3">
                                        {a.status === 'active' && (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleAcknowledge(a.id)}
                                                    disabled={processing === a.id}
                                                    className="text-status-blue-text hover:underline text-xs font-semibold disabled:opacity-50"
                                                ><CheckCircle size={12} className="inline" /> Acquitter</button>
                                                <button
                                                    onClick={() => handleResolve(a.id)}
                                                    disabled={processing === a.id}
                                                    className="text-status-green-text hover:underline text-xs font-semibold disabled:opacity-50"
                                                ><CheckCircle size={12} className="inline" /> Résoudre</button>
                                            </div>
                                        )}
                                        {a.status === 'acknowledged' && (
                                            <span className="text-xs text-on-surface-variant">Acquitté</span>
                                        )}
                                        {a.status === 'resolved' && (
                                            <span className="text-xs text-status-green-text">Résolu</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {alerts.data.length === 0 && (
                                <tr><td colSpan={9} className="text-center py-8 text-on-surface-variant text-sm">Aucune alerte de vitesse.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
