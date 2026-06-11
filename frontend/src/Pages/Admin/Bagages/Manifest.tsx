import { Luggage, Package } from 'lucide-react';

import { useParams } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';

interface BagItem {
    tag: string; passenger: string; type: string;
    weight: number | null; status: string;
}

interface ManifestData {
    trip: { id: number; route: string; date: string };
    baggages: BagItem[];
    stats: { total: number; loaded: number; delivered: number; total_weight: number };
}

export default function BagageManifest() {
    const { id } = useParams<{ id: string }>();
    const { data, loading } = useApi<ManifestData>(`/admin/bagages/manifeste/${id}`);
    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;
    const trip = data?.trip ?? ({} as any);
    const baggages = data?.baggages ?? [];
    const stats = data?.stats ?? ({} as any);
    return (
        <div className="w-full max-w-4xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-dark">Manifeste Bagages</h1>
                <p className="text-on-surface-variant text-sm mt-0.5">{trip.route} — {trip.date}</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Bagages', val: stats?.total ?? 0, icon: Luggage },
                    { label: 'Chargés', val: stats?.loaded ?? 0, icon: Package },
                    { label: 'Livrés', val: stats?.delivered ?? 0, icon: Package },
                    { label: 'Poids Total', val: `${stats.total_weight} kg`, icon: Package },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-outline shadow-sm p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gris-surface flex items-center justify-center"><s.icon size={18} className="text-slate-dark" /></div>
                        <div>
                            <p className="text-xl font-bold text-slate-dark">{s.val}</p>
                            <p className="text-xs text-on-surface-variant">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                        <tr>
                            {['Tag', 'Passager', 'Type', 'Poids', 'Statut'].map(h => (
                                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {baggages.map(b => (
                            <tr key={b.tag} className="hover:bg-gris-surface transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-status-blue-text font-bold">{b.tag}</td>
                                <td className="px-4 py-3 text-slate-dark">{b.passenger}</td>
                                <td className="px-4 py-3 text-on-surface-variant text-xs">{b.type}</td>
                                <td className="px-4 py-3 text-on-surface-variant">{b.weight ? `${b.weight} kg` : '—'}</td>
                                <td className="px-4 py-3"><span className="text-xs font-bold px-2 py-0.5 rounded bg-gris-surface text-on-surface-variant">{b.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
