import { useState } from 'react';
import { CheckCircle, Plus, X, XCircle } from 'lucide-react';
import { useForm } from '@/hooks/useForm';
import { useApi } from '@/hooks/useApi';
import { storeConge, approuverConge, rejeterConge } from '@/api/admin';

interface CongeItem {
    id: number; employe: string; type: string;
    start_date: string; end_date: string; days: number;
    reason: string; status: string; approved_by: string | null;
    created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
    annual: 'Annuel', sick: 'Maladie', special: 'Spécial', unpaid: 'Sans solde', maternity: 'Maternité',
};

export default function Conges() {
    const { data, loading, refetch } = useApi<{ conges: CongeItem[]; employes: { id: number; name: string }[] }>('/admin/rh/conges');
    const [showForm, setShowForm] = useState(false);
    const form = useForm<Record<string, unknown>>({
        user_id: '',
        type: 'annual',
        start_date: '',
        end_date: '',
        reason: '',
    });

    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;

    const employes = data?.employes ?? [];
    const conges = data?.conges ?? [];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/rh/conges', {
            onSuccess: () => { setShowForm(false); form.reset(); refetch(); },
        });
    };

    const handleApprouver = async (id: number) => {
        await approuverConge(id);
        refetch();
    };

    const handleRejeter = async (id: number) => {
        if (confirm('Rejeter cette demande ?')) {
            await rejeterConge(id);
            refetch();
        }
    };

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-dark">Congés</h1>
                    <p className="text-on-surface-variant text-sm mt-0.5">Gestion des demandes de congés</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold"
                ><Plus size={16} /> Nouvelle demande</button>
            </div>

            <div className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                            <tr>
                                {['Employé', 'Type', 'Période', 'Jours', 'Motif', 'Statut', 'Créé le', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {conges.map(c => (
                                <tr key={c.id} className="hover:bg-gris-surface transition-colors">
                                    <td className="px-4 py-3 font-semibold text-slate-dark">{c.employe}</td>
                                    <td className="px-4 py-3 text-on-surface-variant">{TYPE_LABELS[c.type] ?? c.type}</td>
                                    <td className="px-4 py-3 text-on-surface-variant font-mono">{c.start_date} → {c.end_date}</td>
                                    <td className="px-4 py-3 text-on-surface-variant">{c.days}j</td>
                                    <td className="px-4 py-3 text-on-surface-variant text-xs max-w-[200px] truncate">{c.reason}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                            c.status === 'approved' ? 'bg-status-green-bg text-status-green-text' :
                                            c.status === 'rejected' ? 'bg-status-red-bg text-status-red-text' :
                                            c.status === 'cancelled' ? 'bg-on-surface-variant/20 text-on-surface-variant' :
                                            'bg-status-yellow-bg text-status-yellow-text'
                                        }`}>{c.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-on-surface-variant text-xs">{c.created_at}</td>
                                    <td className="px-4 py-3">
                                        {c.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleApprouver(c.id)}
                                                    className="text-status-green-text hover:underline text-xs font-semibold flex items-center gap-0.5"
                                                ><CheckCircle size={12} /> Approuver</button>
                                                <button onClick={() => handleRejeter(c.id)}
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
                    <div className="bg-white rounded-xl border border-outline p-6 w-full max-w-lg mx-2" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-dark">Demande de congé</h2>
                            <button onClick={() => setShowForm(false)} className="text-on-surface-variant hover:text-slate-dark"><X size={20} /></button>
                        </div>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="text-xs text-on-surface-variant mb-1 block">Employé</label>
                                <select value={form.data.user_id as string} onChange={e => form.setData('user_id', Number(e.target.value))}
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary transition-colors" required
                                >{employes.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
                            </div>
                            <div>
                                <label className="text-xs text-on-surface-variant mb-1 block">Type</label>
                                <select value={form.data.type as string} onChange={e => form.setData('type', e.target.value)}
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary transition-colors"
                                >{Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Date début</label>
                                    <input type="date" value={form.data.start_date as string} onChange={e => form.setData('start_date', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary transition-colors" required />
                                </div>
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Date fin</label>
                                    <input type="date" value={form.data.end_date as string} onChange={e => form.setData('end_date', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary transition-colors" required />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-on-surface-variant mb-1 block">Motif</label>
                                <textarea value={form.data.reason as string} onChange={e => form.setData('reason', e.target.value)} rows={2} required
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary transition-colors" />
                            </div>
                            <button type="submit" disabled={form.processing}
                                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-sm disabled:opacity-50"
                            >Soumettre la demande</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
