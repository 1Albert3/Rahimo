
import { Eye, Users } from 'lucide-react';
import StatusBadge from '@/Components/StatusBadge';
import { Link } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
interface Personne {
    id: number; name: string; email: string; phone: string; city: string | null;
    role: string; is_active: boolean; contract_type: string | null; contract_end: string | null;
}

export default function RhPersonnel() {
    const { data, loading } = useApi<{ personnel: Personne[] }>('/admin/rh/personnel');
    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;
    const personnel = data?.personnel ?? [];
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-dark">Personnel</h1>
                <p className="text-on-surface-variant text-sm mt-0.5">{personnel.length} employé(s)</p>
            </div>

            <div className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                            <tr>
                                {['Nom', 'Contact', 'Ville', 'Rôle', 'Contrat', 'Fin Contrat', 'Statut', ''].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {personnel.map(p => (
                                <tr key={p.id} className="hover:bg-gris-surface transition-colors">
                                    <td className="px-4 py-3 font-semibold text-slate-dark">{p.name}</td>
                                    <td className="px-4 py-3">
                                        <p className="text-on-surface-variant text-xs">{p.email}</p>
                                        <p className="text-on-surface-variant text-xs font-mono">{p.phone}</p>
                                    </td>
                                    <td className="px-4 py-3 text-on-surface-variant">{p.city ?? '—'}</td>
                                    <td className="px-4 py-3 text-on-surface-variant capitalize">{p.role}</td>
                                    <td className="px-4 py-3 text-on-surface-variant capitalize">{p.contract_type ?? '—'}</td>
                                    <td className="px-4 py-3 text-on-surface-variant font-mono">{p.contract_end ?? '—'}</td>
                                    <td className="px-4 py-3"><StatusBadge status={p.is_active ? 'actif' : 'inactif'} /></td>
                                    <td className="px-4 py-3">
                                        <Link to={`/admin/rh/personnel/${p.id}`}
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
