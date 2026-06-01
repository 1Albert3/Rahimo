import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { DollarSign } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { formatFCFA } from '@/lib/utils';
import type { PageProps } from '@/types';

interface BulletinItem {
    id: number; employe: string;
    base_salary: number; total_allowances: number;
    gross_salary: number; deductions: number;
    tax: number; cnss: number; net_salary: number;
    status: string; paid_at: string | null;
}

interface Props extends PageProps {
    bulletins: BulletinItem[];
    period: string;
    totalBrut: number;
    totalNet: number;
    nbEmployes: number;
    employes: { id: number; name: string }[];
}

export default function Paie({ bulletins, period, totalBrut, totalNet, nbEmployes, employes }: Props) {
    const [isGenerating, setIsGenerating] = useState(false);

    const generate = () => {
        setIsGenerating(true);
        router.post(route('admin.rh.paie.generer'), { period }, {
            onFinish: () => setIsGenerating(false),
        });
    };

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Paie</h1>
                    <p className="text-admin-muted text-sm mt-0.5">Période : {period}</p>
                </div>
                <div className="flex items-center gap-3">
                    <input type="month" value={period} onChange={e => router.get(route('admin.rh.paie', { period: e.target.value }))}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                    <button onClick={generate} disabled={isGenerating}
                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                    >{isGenerating ? 'Génération...' : 'Générer les bulletins'}</button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Employés', val: nbEmployes, icon: DollarSign, color: 'text-status-blue-text' },
                    { label: 'Masse brute', val: formatFCFA(totalBrut), color: 'text-status-yellow-text' },
                    { label: 'Masse nette', val: formatFCFA(totalNet), color: 'text-status-green-text' },
                ].map(s => (
                    <div key={s.label} className="bg-admin-card rounded-xl border border-white/5 p-4">
                        <p className="text-xs text-admin-muted">{s.label}</p>
                        <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.val}</p>
                    </div>
                ))}
            </div>

            <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['Employé', 'Salaire Base', 'Indemnités', 'Brut', 'Déductions', 'Taxe', 'CNSS', 'Net', 'Statut', ''].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {bulletins.map((b: any) => (
                                <tr key={b.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-white">{b.employe}</td>
                                    <td className="px-4 py-3 font-mono text-admin-muted">{formatFCFA(b.base_salary)}</td>
                                    <td className="px-4 py-3 font-mono text-admin-muted">{formatFCFA(b.total_allowances ?? 0)}</td>
                                    <td className="px-4 py-3 font-mono text-white">{formatFCFA(b.gross_salary ?? b.base_salary)}</td>
                                    <td className="px-4 py-3 font-mono text-admin-muted">{formatFCFA(b.deductions ?? 0)}</td>
                                    <td className="px-4 py-3 font-mono text-admin-muted">{formatFCFA(b.tax ?? 0)}</td>
                                    <td className="px-4 py-3 font-mono text-admin-muted">{formatFCFA(b.cnss ?? 0)}</td>
                                    <td className="px-4 py-3 font-mono text-white font-bold">{formatFCFA(b.net_salary)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${b.status === 'paid' ? 'bg-status-green-bg text-status-green-text' : 'bg-status-yellow-bg text-status-yellow-text'}`}>
                                            {b.status === 'paid' ? 'Payé' : 'Brouillon'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {b.status === 'draft' && (
                                            <button onClick={() => router.patch(route('admin.rh.paie.payer', b.id))}
                                                className="text-primary hover:underline text-xs font-semibold"
                                            >Marquer payé</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {bulletins.length === 0 && (
                                <tr><td colSpan={10} className="text-center py-8 text-admin-muted text-sm">Aucun bulletin pour cette période. Cliquez sur "Générer les bulletins".</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

Paie.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Paie" breadcrumbs={[{ label: 'RH' }, { label: 'Paie' }]}>
        {page}
    </BackOfficeLayout>
);