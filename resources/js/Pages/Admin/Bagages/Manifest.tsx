import { Luggage, Package } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps } from '@/types';

interface BagItem {
    tag: string; passenger: string; type: string;
    weight: number | null; status: string;
}

interface Props extends PageProps {
    trip: { id: number; route: string; date: string };
    baggages: BagItem[];
    stats: { total: number; loaded: number; delivered: number; total_weight: number };
}

export default function BagageManifest({ trip, baggages, stats }: Props) {
    return (
        <div className="w-full max-w-4xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Manifeste Bagages</h1>
                <p className="text-admin-muted text-sm mt-0.5">{trip.route} — {trip.date}</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Bagages', val: stats.total, icon: Luggage },
                    { label: 'Chargés', val: stats.loaded, icon: Package },
                    { label: 'Livrés', val: stats.delivered, icon: Package },
                    { label: 'Poids Total', val: `${stats.total_weight} kg`, icon: Package },
                ].map(s => (
                    <div key={s.label} className="bg-admin-card rounded-xl border border-white/5 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center"><s.icon size={18} className="text-admin-text" /></div>
                        <div>
                            <p className="text-xl font-bold text-white">{s.val}</p>
                            <p className="text-xs text-admin-muted">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                        <tr>
                            {['Tag', 'Passager', 'Type', 'Poids', 'Statut'].map(h => (
                                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {baggages.map(b => (
                            <tr key={b.tag} className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-status-blue-text font-bold">{b.tag}</td>
                                <td className="px-4 py-3 text-white">{b.passenger}</td>
                                <td className="px-4 py-3 text-admin-muted text-xs">{b.type}</td>
                                <td className="px-4 py-3 text-admin-muted">{b.weight ? `${b.weight} kg` : '—'}</td>
                                <td className="px-4 py-3"><span className="text-xs font-bold px-2 py-0.5 rounded bg-white/5 text-admin-muted">{b.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

BagageManifest.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Manifeste Bagages" breadcrumbs={[{ label: 'Bagages', href: route('admin.bagages') }, { label: 'Manifeste' }]}>
        {page}
    </BackOfficeLayout>
);