
import { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { formatFCFA } from '@/lib/utils';
import { genererPaie, payerPaie } from '@/api/admin';
import { useApi } from '@/hooks/useApi';
interface BulletinItem {
    id: number; employe: string;
    base_salary: number; total_allowances: number;
    gross_salary: number; deductions: number;
    tax: number; cnss: number; net_salary: number;
    status: string; paid_at: string | null;
}

export default function Paie() {
    const { data, loading, refetch } = useApi<{ bulletins: BulletinItem[]; period: string; totalBrut: number; totalNet: number; nbEmployes: number; employes: { id: number; name: string }[] }>('/admin/rh/paie');

    const bulletins = data?.bulletins ?? [];
    const period = data?.period ?? '';
    const totalBrut = data?.totalBrut ?? 0;
    const totalNet = data?.totalNet ?? 0;
    const nbEmployes = data?.nbEmployes ?? 0;
    const employes = data?.employes ?? [];
    const [isGenerating, setIsGenerating] = useState(false);

    const generate = () => {
        setIsGenerating(true);
        genererPaie({ period }).then(() => refetch()).finally(() => setIsGenerating(false));
    };

    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-dark">Paie</h1>
                    <p className="text-on-surface-variant text-sm mt-0.5">Période : {period}</p>
                </div>
                <div className="flex items-center gap-3">
                    <input type="month" value={period} onChange={e => { window.location.href = '/admin/rh/paie?period=' + e.target.value; }}
                        className="bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary transition-colors" />
                    <button onClick={generate} disabled={isGenerating}
                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold disabled:opacity-50"
                    >{isGenerating ? 'Génération...' : 'Générer les bulletins'}</button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Employés', val: nbEmployes, icon: DollarSign, color: 'text-status-blue-text' },
                    { label: 'Masse brute', val: formatFCFA(totalBrut), color: 'text-status-yellow-text' },
                    { label: 'Masse nette', val: formatFCFA(totalNet), color: 'text-status-green-text' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-outline shadow-sm p-4">
                        <p className="text-xs text-on-surface-variant">{s.label}</p>
                        <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.val}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                            <tr>
                                {['Employé', 'Salaire Base', 'Indemnités', 'Brut', 'Déductions', 'Taxe', 'CNSS', 'Net', 'Statut', ''].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {bulletins.map((b: any) => (
                                <tr key={b.id} className="hover:bg-gris-surface transition-colors">
                                    <td className="px-4 py-3 font-semibold text-slate-dark">{b.employe}</td>
                                    <td className="px-4 py-3 font-mono text-on-surface-variant">{formatFCFA(b.base_salary)}</td>
                                    <td className="px-4 py-3 font-mono text-on-surface-variant">{formatFCFA(b.total_allowances ?? 0)}</td>
                                    <td className="px-4 py-3 font-mono text-slate-dark">{formatFCFA(b.gross_salary ?? b.base_salary)}</td>
                                    <td className="px-4 py-3 font-mono text-on-surface-variant">{formatFCFA(b.deductions ?? 0)}</td>
                                    <td className="px-4 py-3 font-mono text-on-surface-variant">{formatFCFA(b.tax ?? 0)}</td>
                                    <td className="px-4 py-3 font-mono text-on-surface-variant">{formatFCFA(b.cnss ?? 0)}</td>
                                    <td className="px-4 py-3 font-mono text-slate-dark font-bold">{formatFCFA(b.net_salary)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${b.status === 'paid' ? 'bg-status-green-bg text-status-green-text' : 'bg-status-yellow-bg text-status-yellow-text'}`}>
                                            {b.status === 'paid' ? 'Payé' : 'Brouillon'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {b.status === 'draft' && (
                                            <button onClick={() => payerPaie(b.id).then(() => refetch())}
                                                className="text-primary hover:underline text-xs font-semibold"
                                            >Marquer payé</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {bulletins.length === 0 && (
                                <tr><td colSpan={10} className="text-center py-8 text-on-surface-variant text-sm">Aucun bulletin pour cette période. Cliquez sur "Générer les bulletins".</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
