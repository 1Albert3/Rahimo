import { Link } from '@inertiajs/react';
import { ArrowLeft, FileText } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import StatusBadge from '@/Components/StatusBadge';
import { formatFCFA } from '@/lib/utils';
import type { PageProps } from '@/types';

interface ContratItem {
    id: number; type: string; start_date: string;
    end_date: string | null; salary_base: number; is_active: boolean;
}

interface DocumentItem {
    id: number; name: string; type: string; file_url: string;
    created_at: string;
}

interface Props extends PageProps {
    employe: {
        id: number; name: string; email: string; phone: string | null;
        city: string | null; role: string; is_active: boolean;
        driver_license_number: string | null; license_expiry_date: string | null;
    };
    contrats: ContratItem[];
    documents: DocumentItem[];
    stats: { total_leave_days: number; total_absences: number; monthly_salary: number };
}

export default function EmployeShow({ employe, contrats, documents, stats }: Props) {
    return (
        <div className="w-full max-w-5xl space-y-6">
            <Link href={route('admin.rh.personnel')} className="text-primary hover:underline text-sm flex items-center gap-1">
                <ArrowLeft size={14} /> Retour au personnel
            </Link>

            <div className="bg-white rounded-xl border border-outline shadow-sm p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xl font-bold">
                        {employe.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-dark">{employe.name}</h1>
                        <p className="text-on-surface-variant text-sm capitalize">{employe.role} · {employe.city ?? 'N/A'}</p>
                    </div>
                    <div className="ml-auto"><StatusBadge status={employe.is_active ? 'actif' : 'inactif'} /></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Email', val: employe.email },
                        { label: 'Téléphone', val: employe.phone },
                        { label: 'Permis', val: employe.driver_license_number ?? '—' },
                        { label: 'Exp. Permis', val: employe.license_expiry_date ?? '—' },
                    ].map(d => (
                        <div key={d.label}>
                            <p className="text-xs text-on-surface-variant">{d.label}</p>
                            <p className="text-sm text-slate-dark font-semibold">{d.val}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Jours de congé', val: stats.total_leave_days, color: 'text-status-blue-text' },
                        { label: 'Absences', val: stats.total_absences, color: 'text-status-red-text' },
                        { label: 'Salaire mensuel', val: formatFCFA(stats.monthly_salary), color: 'text-status-green-text' },
                    ].map(s => (
                        <div key={s.label} className="bg-gris-surface rounded-xl p-3 text-center">
                            <p className="text-lg font-bold font-mono" style={{ color: s.color.includes('text-') ? undefined : s.color }}>{s.val}</p>
                            <p className="text-xs text-on-surface-variant">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {contrats.length > 0 && (
                <div className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden">
                    <div className="p-4"><h3 className="font-semibold text-slate-dark text-sm">Contrats</h3></div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                                <tr>
                                    {['Type', 'Début', 'Fin', 'Salaire', 'Statut'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {contrats.map(c => (
                                    <tr key={c.id}>
                                        <td className="px-4 py-3 capitalize text-slate-dark">{c.type}</td>
                                        <td className="px-4 py-3 text-on-surface-variant">{c.start_date}</td>
                                        <td className="px-4 py-3 text-on-surface-variant">{c.end_date ?? 'Indéterminée'}</td>
                                        <td className="px-4 py-3 font-mono text-slate-dark font-semibold">{formatFCFA(c.salary_base)}</td>
                                        <td className="px-4 py-3"><StatusBadge status={c.is_active ? 'actif' : 'inactif'} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {documents.length > 0 && (
                <div className="bg-white rounded-xl border border-outline shadow-sm p-4">
                    <h3 className="font-semibold text-slate-dark text-sm mb-4">Documents</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {documents.map((d: any) => (
                            <div key={d.id} className="bg-gris-surface rounded-xl p-3 flex items-center gap-2">
                                <FileText size={16} className="text-primary" />
                                <span className="text-xs text-slate-dark truncate">{d.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

EmployeShow.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Employé" breadcrumbs={[{ label: 'RH' }, { label: 'Personnel', href: '/admin/rh/personnel' }, { label: 'Détail' }]}>
        {page}
    </BackOfficeLayout>
);