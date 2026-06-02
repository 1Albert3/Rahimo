import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { formatFCFA } from '@/lib/utils';
import type { PageProps } from '@/types';

interface BudgetItem {
    id: number; label: string; period_type: string;
    period: string; total_amount: number; spent_amount: number;
    remaining: number; utilization: number; status: string;
}

interface Props extends PageProps {
    budgets: BudgetItem[];
}

const PERIOD_TYPES: Record<string, string> = { monthly: 'Mensuel', quarterly: 'Trimestriel', yearly: 'Annuel' };

export default function Budgets({ budgets }: Props) {
    const [showForm, setShowForm] = useState(false);
    const form = useForm({
        label: '', period_type: 'yearly', period: new Date().getFullYear().toString(),
        total_amount: '', notes: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('admin.finance.budgets.store'), {
            onSuccess: () => { setShowForm(false); form.reset(); },
        });
    };

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-dark">Budgets</h1>
                    <p className="text-on-surface-variant text-sm mt-0.5">Planification et suivi budgétaire</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold"
                ><Plus size={16} /> Nouveau budget</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgets.map((b: any) => (
                    <div key={b.id} className="bg-white rounded-xl border border-outline shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-slate-dark text-sm">{b.label}</h3>
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                b.status === 'active' ? 'bg-status-green-bg text-status-green-text' :
                                b.status === 'closed' ? 'bg-on-surface-variant/20 text-on-surface-variant' :
                                'bg-status-yellow-bg text-status-yellow-text'
                            }`}>{b.status}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mb-3">{PERIOD_TYPES[b.period_type] ?? b.period_type} · {b.period}</p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-on-surface-variant">Prévu</span>
                                <span className="font-mono text-slate-dark font-semibold">{formatFCFA(b.total_amount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-on-surface-variant">Dépensé</span>
                                <span className="font-mono text-status-red-text">{formatFCFA(b.spent_amount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-on-surface-variant">Restant</span>
                                <span className="font-mono text-status-green-text">{formatFCFA(b.remaining)}</span>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="w-full bg-gris-surface rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${Math.min(b.utilization, 100)}%` }} />
                            </div>
                            <p className="text-xs text-right text-on-surface-variant mt-1">{b.utilization}% utilisé</p>
                        </div>
                    </div>
                ))}
                {budgets.length === 0 && (
                    <div className="col-span-full text-center py-12 text-on-surface-variant text-sm">Aucun budget défini.</div>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
                    <div className="bg-white rounded-xl border border-outline shadow-sm p-6 w-full max-w-lg mx-2" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-dark">Nouveau budget</h2>
                            <button onClick={() => setShowForm(false)} className="text-on-surface-variant hover:text-slate-dark"><X size={20} /></button>
                        </div>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="text-xs text-on-surface-variant mb-1 block">Libellé</label>
                                <input type="text" value={form.data.label} onChange={e => form.setData('label', e.target.value)}
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Période</label>
                                    <select value={form.data.period_type} onChange={e => form.setData('period_type', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary"
                                    >{Object.entries(PERIOD_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                                </div>
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Période (ex: 2026, 2026-05)</label>
                                    <input type="text" value={form.data.period} onChange={e => form.setData('period', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" required />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-on-surface-variant mb-1 block">Montant (FCFA)</label>
                                <input type="number" value={form.data.total_amount} onChange={e => form.setData('total_amount', e.target.value)}
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" required />
                            </div>
                            <div>
                                <label className="text-xs text-on-surface-variant mb-1 block">Notes</label>
                                <textarea value={form.data.notes} onChange={e => form.setData('notes', e.target.value)} rows={2}
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                            </div>
                            <button type="submit" disabled={form.processing}
                                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-sm disabled:opacity-50"
                            >Créer le budget</button>
                        </form>
                    </div>
    </div>
            )}
        </div>
    );
}

Budgets.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Budgets" breadcrumbs={[{ label: 'Finance' }, { label: 'Budgets' }]}>
        {page}
    </BackOfficeLayout>
);