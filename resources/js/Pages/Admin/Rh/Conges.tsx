import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { CheckCircle, Plus, X, XCircle } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps } from '@/types';

interface CongeItem {
    id: number; employe: string; type: string;
    start_date: string; end_date: string; days: number;
    reason: string; status: string; approved_by: string | null;
    created_at: string;
}

interface Props extends PageProps {
    conges: CongeItem[];
    employes: { id: number; name: string }[];
}

const TYPE_LABELS: Record<string, string> = {
    annual: 'Annuel', sick: 'Maladie', special: 'Spécial', unpaid: 'Sans solde', maternity: 'Maternité',
};

export default function Conges({ conges, employes }: Props) {
    const [showForm, setShowForm] = useState(false);
    const form = useForm({
        user_id: employes[0]?.id ?? '',
        type: 'annual',
        start_date: '',
        end_date: '',
        reason: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('admin.rh.conges.store'), {
            onSuccess: () => { setShowForm(false); form.reset(); },
        });
    };

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Congés</h1>
                    <p className="text-admin-muted text-sm mt-0.5">Gestion des demandes de congés</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold"
                ><Plus size={16} /> Nouvelle demande</button>
            </div>

            <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['Employé', 'Type', 'Période', 'Jours', 'Motif', 'Statut', 'Créé le', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {conges.map(c => (
                                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-white">{c.employe}</td>
                                    <td className="px-4 py-3 text-admin-muted">{TYPE_LABELS[c.type] ?? c.type}</td>
                                    <td className="px-4 py-3 text-admin-muted font-mono">{c.start_date} → {c.end_date}</td>
                                    <td className="px-4 py-3 text-admin-muted">{c.days}j</td>
                                    <td className="px-4 py-3 text-admin-muted text-xs max-w-[200px] truncate">{c.reason}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                            c.status === 'approved' ? 'bg-status-green-bg text-status-green-text' :
                                            c.status === 'rejected' ? 'bg-status-red-bg text-status-red-text' :
                                            c.status === 'cancelled' ? 'bg-admin-muted/20 text-admin-muted' :
                                            'bg-status-yellow-bg text-status-yellow-text'
                                        }`}>{c.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-admin-muted text-xs">{c.created_at}</td>
                                    <td className="px-4 py-3">
                                        {c.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => router.post(route('admin.rh.conges.approuver', c.id))}
                                                    className="text-status-green-text hover:underline text-xs font-semibold flex items-center gap-0.5"
                                                ><CheckCircle size={12} /> Approuver</button>
                                                <button onClick={() => { if (confirm('Rejeter cette demande ?')) router.post(route('admin.rh.conges.rejeter', c.id)); }}
                                                    className="text-status-red-text hover:underline text-xs font-semibold flex items-center gap-0.5"
                                                ><XCircle size={12} /> Rejeter</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
                    <div className="bg-admin-card rounded-2xl border border-white/10 p-6 w-full max-w-lg mx-2" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">Demande de congé</h2>
                            <button onClick={() => setShowForm(false)} className="text-admin-muted hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="text-xs text-admin-muted mb-1 block">Employé</label>
                                <select value={form.data.user_id} onChange={e => form.setData('user_id', Number(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" required
                                >{employes.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
                            </div>
                            <div>
                                <label className="text-xs text-admin-muted mb-1 block">Type</label>
                                <select value={form.data.type} onChange={e => form.setData('type', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                                >{Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Date début</label>
                                    <input type="date" value={form.data.start_date} onChange={e => form.setData('start_date', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" required />
                                </div>
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Date fin</label>
                                    <input type="date" value={form.data.end_date} onChange={e => form.setData('end_date', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" required />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-admin-muted mb-1 block">Motif</label>
                                <textarea value={form.data.reason} onChange={e => form.setData('reason', e.target.value)} rows={2} required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                            </div>
                            <button type="submit" disabled={form.processing}
                                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold text-sm disabled:opacity-50"
                            >Soumettre la demande</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

Conges.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Congés" breadcrumbs={[{ label: 'RH' }, { label: 'Congés' }]}>
        {page}
    </BackOfficeLayout>
);