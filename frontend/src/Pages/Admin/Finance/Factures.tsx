import { useState } from 'react';
import { CheckCircle, FileText, Plus, X, XCircle } from 'lucide-react';
import { formatFCFA } from '@/lib/utils';
import { useForm } from '@/hooks/useForm';
import { useApi } from '@/hooks/useApi';
import { payerFacture, annulerFacture } from '@/api/admin';

interface FactureItem {
    id: number; invoice_number: string; type: string;
    client_name: string; issue_date: string; due_date: string;
    subtotal: number; tax_amount: number; total: number;
    status: string; paid_at: string | null;
}

interface FacturesData {
    factures: FactureItem[];
    stats: { total_impaye: number; total_encaisse: number; nb_impayees: number };
}

const STATUS_LABELS: Record<string, string> = {
    draft: 'Brouillon', sent: 'Envoyée', paid: 'Payée', overdue: 'Imp ayée', cancelled: 'Annulée',
};

export default function Factures() {
    const { data, loading, refetch } = useApi<FacturesData>('/admin/factures');
    const [showForm, setShowForm] = useState(false);
    const form = useForm({
        type: 'sale', client_name: '', client_phone: '', client_address: '',
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: '', subtotal: '', tax_rate: '0', notes: '',
    });

    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;

    const factures = data?.factures ?? [];
    const stats = data?.stats ?? {} as any;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/factures', {
            onSuccess: () => { setShowForm(false); form.reset(); refetch(); },
        });
    };

    const handlePayer = async (id: number) => {
        await payerFacture(id);
        refetch();
    };

    const handleAnnuler = async (id: number) => {
        if (confirm('Annuler cette facture ?')) {
            await annulerFacture(id);
            refetch();
        }
    };

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-dark">Factures</h1>
                    <p className="text-on-surface-variant text-sm mt-0.5">Gestion des factures clients et fournisseurs</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold"
                ><Plus size={16} /> Nouvelle facture</button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Impayé total', val: formatFCFA(stats.total_impaye), color: 'text-status-red-text' },
                    { label: 'Encaissé total', val: formatFCFA(stats.total_encaisse), color: 'text-status-green-text' },
                    { label: 'Factures impayées', val: stats?.nb_impayees ?? 0, color: 'text-status-yellow-text' },
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
                                {['N° Facture', 'Client', 'Date', 'Échéance', 'Montant', 'Statut', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {factures.map((f: any) => (
                                <tr key={f.id} className="hover:bg-gris-surface transition-colors">
                                    <td className="px-4 py-3 font-mono text-slate-dark font-semibold">{f.invoice_number}</td>
                                    <td className="px-4 py-3 text-on-surface-variant">{f.client_name}</td>
                                    <td className="px-4 py-3 text-on-surface-variant font-mono">{f.issue_date}</td>
                                    <td className="px-4 py-3 text-on-surface-variant font-mono">{f.due_date}</td>
                                    <td className="px-4 py-3 font-mono text-slate-dark font-bold">{formatFCFA(f.total)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                            f.status === 'paid' ? 'bg-status-green-bg text-status-green-text' :
                                            f.status === 'overdue' ? 'bg-status-red-bg text-status-red-text' :
                                            f.status === 'cancelled' ? 'bg-on-surface-variant/20 text-on-surface-variant' :
                                            f.status === 'sent' ? 'bg-status-blue-bg text-status-blue-text' :
                                            'bg-status-yellow-bg text-status-yellow-text'
                                        }`}>{STATUS_LABELS[f.status] ?? f.status}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            {(f.status === 'draft' || f.status === 'sent') && (
                                                <button onClick={() => handlePayer(f.id)}
                                                    className="text-status-green-text hover:underline text-xs font-semibold"
                                                ><CheckCircle size={12} className="inline" /> Payer</button>
                                            )}
                                            {f.status !== 'cancelled' && (
                                                <button onClick={() => handleAnnuler(f.id)}
                                                    className="text-status-red-text hover:underline text-xs font-semibold"
                                                ><XCircle size={12} className="inline" /> Annuler</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {factures.length === 0 && (
                                <tr><td colSpan={7} className="text-center py-8 text-on-surface-variant text-sm">Aucune facture.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
                    <div className="bg-white rounded-xl border border-outline shadow-sm p-6 w-full max-w-lg mx-2" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-dark">Nouvelle facture</h2>
                            <button onClick={() => setShowForm(false)} className="text-on-surface-variant hover:text-slate-dark"><X size={20} /></button>
                        </div>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Type</label>
                                    <select value={form.data.type as string} onChange={e => form.setData('type', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary"
                                    >
                                        <option value="sale">Vente</option>
                                        <option value="purchase">Achat</option>
                                        <option value="expense">Dépense</option>
                                        <option value="credit_note">Avoir</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Client</label>
                                    <input type="text" value={form.data.client_name as string} onChange={e => form.setData('client_name', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Téléphone</label>
                                    <input type="text" value={form.data.client_phone as string} onChange={e => form.setData('client_phone', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Taux TVA (%)</label>
                                    <input type="number" value={form.data.tax_rate as string} onChange={e => form.setData('tax_rate', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Date d'émission</label>
                                    <input type="date" value={form.data.issue_date as string} onChange={e => form.setData('issue_date', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" required />
                                </div>
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Date d'échéance</label>
                                    <input type="date" value={form.data.due_date as string} onChange={e => form.setData('due_date', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" required />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-on-surface-variant mb-1 block">Montant HT (FCFA)</label>
                                <input type="number" value={form.data.subtotal as string} onChange={e => form.setData('subtotal', e.target.value)}
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" required />
                            </div>
                            <div>
                                <label className="text-xs text-on-surface-variant mb-1 block">Notes</label>
                                <textarea value={form.data.notes as string} onChange={e => form.setData('notes', e.target.value)} rows={2}
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                            </div>
                            <button type="submit" disabled={form.processing}
                                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-sm disabled:opacity-50"
                            >{form.processing ? 'Création...' : 'Créer la facture'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
