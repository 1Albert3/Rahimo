import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FileText, Plus, X } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { formatFCFA } from '@/lib/utils';
import type { PageProps } from '@/types';

interface ContratItem {
    id: number; employe: string; type: string;
    start_date: string; end_date: string | null;
    salary_base: number; transport_allowance: number;
    housing_allowance: number; other_allowances: number;
    is_active: boolean;
}

interface Props extends PageProps {
    contrats: ContratItem[];
    employes: { id: number; name: string }[];
}

const TYPE_LABELS: Record<string, string> = {
    cdi: 'CDI', cdd: 'CDD', stage: 'Stage', prestation: 'Prestation', saisonnier: 'Saisonnier',
};

export default function Contrats({ contrats, employes }: Props) {
    const [showForm, setShowForm] = useState(false);
    const form = useForm({
        user_id: employes[0]?.id ?? '',
        type: 'cdi',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: '',
        salary_base: '',
        transport_allowance: '0',
        housing_allowance: '0',
        other_allowances: '0',
        duties: '',
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('admin.rh.contrats.store'), {
            onSuccess: () => { setShowForm(false); form.reset(); },
        });
    };

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Contrats</h1>
                    <p className="text-admin-muted text-sm mt-0.5">{contrats.length} contrat(s)</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold"
                ><Plus size={16} /> Nouveau contrat</button>
            </div>

            <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['Employé', 'Type', 'Début', 'Fin', 'Salaire de base', 'Indemnités', 'Statut'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {contrats.map(c => (
                                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-white">{c.employe}</td>
                                    <td className="px-4 py-3 text-admin-muted capitalize">{TYPE_LABELS[c.type] ?? c.type}</td>
                                    <td className="px-4 py-3 text-admin-muted font-mono">{c.start_date}</td>
                                    <td className="px-4 py-3 text-admin-muted font-mono">{c.end_date ?? 'Indéterminée'}</td>
                                    <td className="px-4 py-3 font-mono text-white font-semibold">{formatFCFA(c.salary_base)}</td>
                                    <td className="px-4 py-3 text-admin-muted">
                                        {['transport_allowance', 'housing_allowance', 'other_allowances'].map(k => (c as any)[k] > 0 ? 1 : 0).reduce((a: number, b: number) => a + b, 0)} prime(s)
                                    </td>
                                    <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-lg ${c.is_active ? 'bg-status-green-bg text-status-green-text' : 'bg-status-red-bg text-status-red-text'}`}>{c.is_active ? 'Actif' : 'Inactif'}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
                    <div className="bg-admin-card rounded-2xl border border-white/10 p-6 w-full max-w-lg mx-2 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">Nouveau contrat</h2>
                            <button onClick={() => setShowForm(false)} className="text-admin-muted hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="text-xs text-admin-muted mb-1 block">Employé</label>
                                <select value={form.data.user_id} onChange={e => form.setData('user_id', Number(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" required
                                >
                                    {employes.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Type</label>
                                    <select value={form.data.type} onChange={e => form.setData('type', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                                    >{Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                                </div>
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Date début</label>
                                    <input type="date" value={form.data.start_date} onChange={e => form.setData('start_date', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Date fin (optionnelle)</label>
                                    <input type="date" value={form.data.end_date} onChange={e => form.setData('end_date', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Salaire de base (FCFA)</label>
                                    <input type="number" value={form.data.salary_base} onChange={e => form.setData('salary_base', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { k: 'transport_allowance', label: 'Transport' },
                                    { k: 'housing_allowance', label: 'Logement' },
                                    { k: 'other_allowances', label: 'Autres' },
                                ].map(p => (
                                    <div key={p.k}>
                                        <label className="text-xs text-admin-muted mb-1 block">{p.label}</label>
                                        <input type="number" value={(form.data as any)[p.k]} onChange={e => form.setData(p.k as any, e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label className="text-xs text-admin-muted mb-1 block">Attributions</label>
                                <textarea value={form.data.duties} onChange={e => form.setData('duties', e.target.value)} rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                            </div>
                            <button type="submit" disabled={form.processing}
                                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold text-sm disabled:opacity-50"
                            >{form.processing ? 'Enregistrement...' : 'Créer le contrat'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

Contrats.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Contrats" breadcrumbs={[{ label: 'RH' }, { label: 'Contrats' }]}>
        {page}
    </BackOfficeLayout>
);