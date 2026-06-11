import { AlertTriangle, CheckCircle, Search, Shield, XCircle } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { resolveFraud, dismissFraud } from '@/api/admin';

const SEVERITY: Record<string, string> = {
    low: 'text-status-blue-text bg-status-blue-bg/30',
    medium: 'text-status-yellow-text bg-status-yellow-bg/30',
    high: 'text-status-red-text bg-status-red-bg/30',
    critical: 'text-status-red-text bg-status-red-bg/30 animate-pulse',
};

const STATUS_BG: Record<string, string> = {
    open: 'text-status-red-text bg-status-red-bg/30',
    investigating: 'text-status-yellow-text bg-status-yellow-bg/30',
    resolved: 'text-status-green-text bg-status-green-bg/30',
    false_positive: 'text-on-surface-variant bg-gris-surface',
};

const TYPE_LABELS: Record<string, string> = {
    surbooking: 'Surbooking',
    sur_embarquement: 'Sur-embarquement',
    embarquement_exces: 'Excès Embarquement',
    duplicate_phone_trip: 'Doublon Téléphone',
    boarding_exceeds_confirmed: 'Embarquement > Confirmés',
};

export default function FraudeIndex() {
    const { data, loading, refetch } = useApi<{ stats: any; checks: { data: any[] }; anomalies: any[] }>('/admin/fraude');
    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;
    const safeStats: any = data?.stats && typeof data.stats === 'object' ? data.stats : {};
    const safeChecks = data?.checks && typeof data.checks === 'object' && Array.isArray(data.checks.data) ? data.checks : { data: [], current_page: 1, last_page: 1, per_page: 15, total: 0, links: [] };
    const safeAnomalies = Array.isArray(data?.anomalies) ? data.anomalies : [];

    const handleResolve = async (id: number) => {
        await resolveFraud(id);
        refetch();
    };

    const handleDismiss = async (id: number) => {
        await dismissFraud(id);
        refetch();
    };

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-dark">Anti-Fraude & Rapprochement</h1>
                <p className="text-on-surface-variant text-sm mt-0.5">Détection d'anomalies : tickets vs embarqués</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Alertes Ouvertes', val: safeStats.open ?? 0, icon: AlertTriangle, color: 'text-status-red-text', bg: 'bg-status-red-bg/30' },
                    { label: 'En Investigation', val: safeStats.investigating ?? 0, icon: Search, color: 'text-status-yellow-text', bg: 'bg-status-yellow-bg/30' },
                    { label: 'Résolues', val: safeStats.resolved ?? 0, icon: CheckCircle, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
                    { label: 'Critiques', val: safeStats.critical ?? 0, icon: XCircle, color: 'text-status-red-text', bg: 'bg-status-red-bg/30' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-outline p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon size={18} className={s.color} /></div>
                        <div>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-xs text-on-surface-variant">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {safeAnomalies.length > 0 && (
                <div className="bg-white rounded-xl border border-status-red-border/30 p-5">
                    <h2 className="text-sm font-semibold text-status-red-text mb-3 flex items-center gap-2">
                        <AlertTriangle size={14} /> Anomalies Détectées Aujourd'hui
                    </h2>
                    <div className="space-y-2">
                        {safeAnomalies.map((a, i) => (
                            <div key={i} className="flex items-center justify-between bg-status-red-bg/10 p-3 rounded-xl text-sm">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold uppercase text-status-red-text">{TYPE_LABELS[a.type] ?? a.type}</span>
                                    <span className="text-slate-dark">{a.trip}</span>
                                    <span className="text-on-surface-variant text-xs">{a.time}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-mono">
                                    <span>Capacité: {a.capacity}</span>
                                    <span>Confirmés: {a.confirmed}</span>
                                    <span>Embarqués: {a.boarded}</span>
                                    <span className={`font-bold ${(a.gap ?? 0) > 0 ? 'text-status-red-text' : 'text-status-green-text'}`}>
                                        Écart: {a.gap}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => refetch()}
                        className="mt-3 text-xs text-status-blue-text hover:underline"
                    ><Search size={12} className="inline" /> Rafraîchir la détection</button>
                </div>
            )}

            <div className="bg-white rounded-xl border border-outline overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                            <tr>
                                {['Type', 'Description', 'Sévérité', 'Statut', 'Date', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {safeChecks.data.map(c => (
                                <tr key={c.id} className="hover:bg-gris-surface transition-colors">
                                    <td className="px-4 py-3 text-on-surface-variant text-xs uppercase">{c.type.replace(/_/g, ' ')}</td>
                                    <td className="px-4 py-3 text-slate-dark max-w-[300px] truncate">{c.description}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${SEVERITY[c.severity] ?? 'text-on-surface-variant'}`}>
                                            {c.severity}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_BG[c.status] ?? 'text-on-surface-variant bg-gris-surface'}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-on-surface-variant text-xs font-mono">{c.created_at}</td>
                                    <td className="px-4 py-3">
                                        {c.status === 'open' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleResolve(c.id)}
                                                    className="text-status-green-text hover:underline text-xs"
                                                >Résoudre</button>
                                                <button onClick={() => handleDismiss(c.id)}
                                                    className="text-on-surface-variant hover:text-slate-dark text-xs"
                                                >Faux positif</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
