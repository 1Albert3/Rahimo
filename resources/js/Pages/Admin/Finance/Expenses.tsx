import { motion } from 'framer-motion';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { CheckCircle, Plus, Receipt, X } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import StatusBadge from '@/Components/StatusBadge';
import Pagination from '@/Components/Pagination';
import { formatFCFA } from '@/lib/utils';
import type { PageProps, PaginatedData } from '@/types';

interface ExpenseItem {
    id: number;
    category: string;
    description: string;
    amount: number;
    status: string;
    user: string;
    validated_by: string | null;
    validated_at: string | null;
    expense_date: string;
    notes: string | null;
    created_at: string;
}

interface Props extends PageProps {
    expenses: PaginatedData<ExpenseItem>;
}

const CATEGORY_LABELS: Record<string, string> = {
    carburant: 'Carburant',
    salaires: 'Salaires',
    maintenance: 'Maintenance',
    peages_taxes: 'Péages & Taxes',
    fournitures: 'Fournitures',
    marketing: 'Marketing',
    assurance: 'Assurance',
    autres: 'Autres',
};

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function Expenses({ expenses }: Props) {
    const [showForm, setShowForm] = useState(false);
    const form = useForm({ category: 'carburant', description: '', amount: '', expense_date: new Date().toISOString().slice(0, 10), notes: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('admin.depenses.store'), {
            onSuccess: () => { setShowForm(false); form.reset(); },
        });
    };

    const valider = (id: number, status: string) => {
        router.patch(route('admin.depenses.valider', id), { status });
    };

    const pendingCount = expenses.data.filter(e => e.status === 'pending').length;

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-white">Dépenses</h1>
                    <p className="text-admin-muted text-sm mt-0.5">{pendingCount} en attente de validation</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all"
                ><Plus size={16} /> Nouvelle dépense</button>
            </div>

            <motion.div variants={stagger} initial="initial" animate="animate"
                className="bg-admin-card rounded-xl border border-white/5 overflow-hidden"
            >
                <div className="overflow-x-auto min-w-[700px] lg:min-w-0">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['Date', 'Catégorie', 'Description', 'Montant', 'Soumis par', 'Validé par', 'Statut', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="">
                            {expenses.data.map((d) => (
                                <tr key={d.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 text-admin-muted text-xs">{d.expense_date}</td>
                                    <td className="px-4 py-3 text-admin-text">{CATEGORY_LABELS[d.category] ?? d.category}</td>
                                    <td className="px-4 py-3 text-admin-text max-w-[200px] truncate" title={d.description}>{d.description}</td>
                                    <td className="px-4 py-3 text-status-red-text font-semibold">{formatFCFA(d.amount)}</td>
                                    <td className="px-4 py-3 text-admin-muted text-xs">{d.user}</td>
                                    <td className="px-4 py-3 text-admin-muted text-xs">{d.validated_by ?? '—'}</td>
                                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                                    <td className="px-4 py-3">
                                        {d.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => valider(d.id, 'approved')}
                                                    className="text-xs text-status-green-text hover:text-white font-semibold transition-colors"
                                                ><CheckCircle size={14} className="inline mr-0.5" />Approuver</button>
                                                <button onClick={() => valider(d.id, 'rejected')}
                                                    className="text-xs text-status-red-text hover:text-white font-semibold transition-colors"
                                                ><X size={14} className="inline mr-0.5" />Rejeter</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {expenses.data.length === 0 && (
                                <tr><td colSpan={8} className="text-center py-8 text-admin-muted text-sm">Aucune dépense</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {expenses.last_page > 1 && <Pagination data={expenses} />}
            </motion.div>

            {/* Modale */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setShowForm(false)}>
                    <div className="bg-admin-card rounded-xl border border-white/10 p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-white">Nouvelle Dépense</h3>
                            <button onClick={() => setShowForm(false)} className="text-admin-muted hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-admin-muted block mb-1">Catégorie</label>
                                <select value={form.data.category} onChange={e => form.setData('category', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                >
                                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-admin-muted block mb-1">Description</label>
                                <input type="text" value={form.data.description} onChange={e => form.setData('description', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                />
                                {form.errors.description && <p className="text-status-red-text text-xs mt-1">{form.errors.description}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-admin-muted block mb-1">Montant (FCFA)</label>
                                    <input type="number" min="0" value={form.data.amount} onChange={e => form.setData('amount', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                    />
                                    {form.errors.amount && <p className="text-status-red-text text-xs mt-1">{form.errors.amount}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-admin-muted block mb-1">Date</label>
                                    <input type="date" value={form.data.expense_date} onChange={e => form.setData('expense_date', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-admin-muted block mb-1">Notes (optionnel)</label>
                                <textarea value={form.data.notes} onChange={e => form.setData('notes', e.target.value)} rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-sm text-admin-muted hover:text-white transition-colors"
                                >Annuler</button>
                                <button type="submit" disabled={form.processing}
                                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                                >{form.processing ? 'Enregistrement...' : 'Enregistrer'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

Expenses.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Dépenses" breadcrumbs={[{ label: 'Tableau de bord', href: route('admin.dashboard') }, { label: 'Comptabilité', href: route('admin.comptabilite') }, { label: 'Dépenses' }]}>
        {page}
    </BackOfficeLayout>
);
