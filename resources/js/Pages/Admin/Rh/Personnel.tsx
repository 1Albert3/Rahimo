import { Link } from '@inertiajs/react';
import { Eye, Users } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import StatusBadge from '@/Components/StatusBadge';
import type { PageProps } from '@/types';

interface Personne {
    id: number; name: string; email: string; phone: string; city: string | null;
    role: string; is_active: boolean; contract_type: string | null; contract_end: string | null;
}

interface Props extends PageProps {
    personnel: Personne[];
}

export default function RhPersonnel({ personnel }: Props) {
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Personnel</h1>
                <p className="text-admin-muted text-sm mt-0.5">{personnel.length} employé(s)</p>
            </div>

            <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['Nom', 'Contact', 'Ville', 'Rôle', 'Contrat', 'Fin Contrat', 'Statut', ''].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {personnel.map(p => (
                                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-white">{p.name}</td>
                                    <td className="px-4 py-3">
                                        <p className="text-admin-muted text-xs">{p.email}</p>
                                        <p className="text-admin-muted text-xs font-mono">{p.phone}</p>
                                    </td>
                                    <td className="px-4 py-3 text-admin-muted">{p.city ?? '—'}</td>
                                    <td className="px-4 py-3 text-admin-muted capitalize">{p.role}</td>
                                    <td className="px-4 py-3 text-admin-muted capitalize">{p.contract_type ?? '—'}</td>
                                    <td className="px-4 py-3 text-admin-muted font-mono">{p.contract_end ?? '—'}</td>
                                    <td className="px-4 py-3"><StatusBadge status={p.is_active ? 'actif' : 'inactif'} /></td>
                                    <td className="px-4 py-3">
                                        <Link href={route('admin.rh.personnel.show', p.id)}
                                            className="text-primary hover:underline text-xs font-semibold flex items-center gap-1"
                                        ><Eye size={14} /> Voir</Link>
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

RhPersonnel.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Personnel" breadcrumbs={[{ label: 'RH' }, { label: 'Personnel' }]}>
        {page}
    </BackOfficeLayout>
);