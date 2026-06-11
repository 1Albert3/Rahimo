import { AlertTriangle, CheckCircle, Search, Shield, UserX } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps, PaginatedData } from '@/types';

interface LogItem {
    id: number; name: string; phone: string | null;
    match_status: string; check_type: string; trip: string | null; created_at: string;
}

interface Props extends PageProps {
    logs: PaginatedData<LogItem>;
    stats: { total: number; today: number; matches: number };
}

const BADGES: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    no_match:       { label: 'Aucune correspondance', color: 'text-status-green-text bg-status-green-bg/30', icon: CheckCircle },
    possible_match: { label: 'Correspondance possible', color: 'text-status-yellow-text bg-status-yellow-bg/30', icon: AlertTriangle },
    confirmed_match:{ label: 'Correspondance confirmée', color: 'text-status-red-text bg-status-red-bg/30', icon: UserX },
};

export default function CheckLogs({ logs, stats }: Props) {
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-dark">Journal des Vérifications Police</h1>
                <p className="text-on-surface-variant text-sm mt-0.5">Historique de toutes les vérifications silencieuses</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Vérifications', val: stats.total, icon: Shield, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
                    { label: 'Aujourd\'hui', val: stats.today, icon: Search, color: 'text-status-yellow-text', bg: 'bg-status-yellow-bg/30' },
                    { label: 'Correspondances', val: stats.matches, icon: UserX, color: 'text-status-red-text', bg: 'bg-status-red-bg/30' },
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

            <div className="bg-white rounded-xl border border-outline overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                            <tr>
                                {['Nom', 'Téléphone', 'Statut', 'Type', 'Trajet', 'Date'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {logs.data.map(l => {
                                const badge = BADGES[l.match_status] ?? BADGES.no_match;
                                return (
                                    <tr key={l.id} className="hover:bg-gris-surface transition-colors">
                                        <td className="px-4 py-3 font-semibold text-slate-dark">{l.name}</td>
                                        <td className="px-4 py-3 text-on-surface-variant font-mono">{l.phone ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${badge.color}`}>
                                                <badge.icon size={10} /> {badge.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-on-surface-variant text-xs">{l.check_type}</td>
                                        <td className="px-4 py-3 text-on-surface-variant text-xs">{l.trip ?? '—'}</td>
                                        <td className="px-4 py-3 text-on-surface-variant text-xs font-mono">{l.created_at}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

CheckLogs.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Journal Police" breadcrumbs={[{ label: 'Police', href: route('admin.police') }, { label: 'Journal' }]}>
        {page}
    </BackOfficeLayout>
);