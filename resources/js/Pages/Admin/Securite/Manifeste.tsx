import { Link } from '@inertiajs/react';
import { ArrowLeft, Download, Users } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps } from '@/types';

interface PassagerItem {
    nom: string; telephone: string | null;
    siege: string; reference: string;
}

interface TrajetItem {
    trip_number: string; route: string;
    date: string | null; heure: string | null;
    bus: string | null; chauffeur: string | null;
}

interface Props extends PageProps {
    passagers: PassagerItem[];
    trajet: TrajetItem;
}

export default function Manifeste({ passagers, trajet }: Props) {
    return (
        <div className="w-full max-w-5xl space-y-6">
            <Link href={route('admin.securite')} className="text-primary hover:underline text-sm flex items-center gap-1">
                <ArrowLeft size={14} /> Retour
            </Link>

            <div className="bg-admin-card rounded-xl border border-white/5 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-white">Manifeste des Passagers</h1>
                        <p className="text-admin-muted text-sm mt-0.5">{trajet.route}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-white font-mono">{trajet.trip_number}</p>
                        <p className="text-xs text-admin-muted">{trajet.date} à {trajet.heure}</p>
                        <p className="text-xs text-admin-muted">{trajet.bus} · {trajet.chauffeur}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <Users size={16} className="text-primary-container" />
                    <span className="text-sm text-white font-semibold">{passagers.length} passager(s) confirmé(s)</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['N°', 'Nom', 'Téléphone', 'Siège', 'Référence'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {passagers.map((p: any, i: number) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 text-admin-muted">{i + 1}</td>
                                    <td className="px-4 py-3 font-semibold text-white">{p.nom}</td>
                                    <td className="px-4 py-3 font-mono text-admin-muted">{p.telephone}</td>
                                    <td className="px-4 py-3 font-mono text-admin-muted">{p.siege ?? '—'}</td>
                                    <td className="px-4 py-3 font-mono text-admin-muted">{p.reference}</td>
                                </tr>
                            ))}
                            {passagers.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-8 text-admin-muted text-sm">Aucun passager confirmé.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

Manifeste.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Manifeste" breadcrumbs={[{ label: 'Sécurité' }, { label: 'Manifeste' }]}>
        {page}
    </BackOfficeLayout>
);