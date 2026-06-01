import { router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Search, Shield, XCircle } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps, PaginatedData } from '@/types';

interface AnomalyItem {
    id?: number; type: string; trip: string; time?: string;
    capacity?: number; confirmed?: number; boarded?: number; gap?: number;
}

interface CheckItem {
    id: number; type: string; severity: string; status: string;
    description: string; created_at: string;
}

interface Props extends PageProps {
    stats: { open: number; investigating: number; resolved: number; critical: number };
    checks: PaginatedData<CheckItem>;
    anomalies: AnomalyItem[];
}

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
    false_positive: 'text-admin-muted bg-white/5',
};

const TYPE_LABELS: Record<string, string> = {
    surbooking: 'Surbooking',
    sur_embarquement: 'Sur-embarquement',
    embarquement_exces: 'Excès Embarquement',
    duplicate_phone_trip: 'Doublon Téléphone',
    boarding_exceeds_confirmed: 'Embarquement > Confirmés',
};

export default function FraudeIndex({ stats, checks, anomalies }: Props) {
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Anti-Fraude & Rapprochement</h1>
                <p className="text-admin-muted text-sm mt-0.5">Détection d'anomalies : tickets vs embarqués</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Alertes Ouvertes', val: stats.open, icon: AlertTriangle, color: 'text-status-red-text', bg: 'bg-status-red-bg/30' },
                    { label: 'En Investigation', val: stats.investigating, icon: Search, color: 'text-status-yellow-text', bg: 'bg-status-yellow-bg/30' },
                    { label: 'Résolues', val: stats.resolved, icon: CheckCircle, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
                    { label: 'Critiques', val: stats.critical, icon: XCircle, color: 'text-status-red-text', bg: 'bg-status-red-bg/30' },
                ].map(s => (
                    <div key={s.label} className="bg-admin-card rounded-xl border border-white/5 p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}><s.icon size={18} className={s.color} /></div>
                        <div>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-xs text-admin-muted">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {anomalies.length > 0 && (
                <div className="bg-admin-card rounded-xl border border-status-red-border/30 p-5">
                    <h2 className="text-sm font-semibold text-status-red-text mb-3 flex items-center gap-2">
                        <AlertTriangle size={14} /> Anomalies Détectées Aujourd'hui
                    </h2>
                    <div className="space-y-2">
                        {anomalies.map((a, i) => (
                            <div key={i} className="flex items-center justify-between bg-status-red-bg/10 p-3 rounded-lg text-sm">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold uppercase text-status-red-text">{TYPE_LABELS[a.type] ?? a.type}</span>
                                    <span className="text-white">{a.trip}</span>
                                    <span className="text-admin-muted text-xs">{a.time}</span>
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
                    <button onClick={() => router.get(route('admin.fraude'))}
                        className="mt-3 text-xs text-status-blue-text hover:underline"
                    ><Search size={12} className="inline" /> Rafraîchir la détection</button>
                </div>
            )}

            <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['Type', 'Description', 'Sévérité', 'Statut', 'Date', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {checks.data.map(c => (
                                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 text-admin-muted text-xs uppercase">{c.type.replace(/_/g, ' ')}</td>
                                    <td className="px-4 py-3 text-white max-w-[300px] truncate">{c.description}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${SEVERITY[c.severity] ?? 'text-admin-muted'}`}>
                                            {c.severity}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_BG[c.status] ?? 'text-admin-muted bg-white/5'}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-admin-muted text-xs font-mono">{c.created_at}</td>
                                    <td className="px-4 py-3">
                                        {c.status === 'open' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => router.post(route('admin.fraude.resoudre', c.id))}
                                                    className="text-status-green-text hover:underline text-xs"
                                                >Résoudre</button>
                                                <button onClick={() => router.post(route('admin.fraude.classer', c.id))}
                                                    className="text-admin-muted hover:text-white text-xs"
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

FraudeIndex.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Anti-Fraude" breadcrumbs={[{ label: 'Anti-Fraude' }]}>
        {page}
    </BackOfficeLayout>
);