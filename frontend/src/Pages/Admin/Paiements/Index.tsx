
import { DollarSign, RefreshCw, RotateCcw, TrendingUp } from 'lucide-react';
import type { PaginatedData } from '@/types';
import { rembourserPaiement, verifierPaiement } from '@/api/admin';
import { useApi } from '@/hooks/useApi';
import api from '@/api/client';

interface PaymentItem {
    id: number; reference: string; amount: number; method: string;
    status: string; transaction_id: string | null; client: string;
    booking_ref: string; route: string; date: string; payment_date: string | null;
}

interface PaiementsData {
    payments: PaginatedData<PaymentItem>;
    stats: { total: number; completed: number; pending: number; failed: number; refunded: number };
    filters: { status?: string; method?: string; from?: string; to?: string };
}

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
    pending:   { label: 'En attente',  color: 'bg-status-yellow-bg/30 text-status-yellow-text' },
    completed: { label: 'Complété',    color: 'bg-status-green-bg/30 text-status-green-text' },
    failed:    { label: 'Échoué',      color: 'bg-status-red-bg/30 text-status-red-text' },
    refunded:  { label: 'Remboursé',   color: 'bg-status-blue-bg/30 text-status-blue-text' },
};

export default function PaiementsIndex() {
    const { data, loading, refetch } = useApi<PaiementsData>('/admin/paiements');
    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;
    const payments = data?.payments ?? {} as any;
    const stats = data?.stats ?? {} as any;
    const filters = data?.filters ?? {} as any;
    const safeStats: any = stats && typeof stats === 'object' ? stats : {};
    const safePayments = payments && typeof payments === 'object' && Array.isArray(payments.data) ? payments : { data: [], current_page: 1, last_page: 1, per_page: 15, total: 0, links: [] };
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-dark">Paiements & Transactions</h1>
                <p className="text-on-surface-variant text-sm mt-0.5">Gestion des paiements Orange Money, Moov Money, CB</p>
            </div>

            <div className="grid grid-cols-5 gap-4">
                {[
                    { label: 'Total Transactions', val: safeStats.total ?? 0, icon: DollarSign, color: 'text-slate-dark', bg: 'bg-gris-surface' },
                    { label: 'Complétés', val: `${(safeStats.completed ?? 0).toLocaleString()} FCFA`, icon: TrendingUp, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
                    { label: 'En attente', val: safeStats.pending ?? 0, icon: RotateCcw, color: 'text-status-yellow-text', bg: 'bg-status-yellow-bg/30' },
                    { label: 'Échoués', val: safeStats.failed ?? 0, icon: RefreshCw, color: 'text-status-red-text', bg: 'bg-status-red-bg/30' },
                    { label: 'Remboursés', val: `${(safeStats.refunded ?? 0).toLocaleString()} FCFA`, icon: DollarSign, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-outline shadow-sm p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon size={18} className={s.color} /></div>
                        <div>
                            <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-xs text-on-surface-variant">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                            <tr>
                                {['Référence', 'Client', 'Trajet', 'Montant', 'Méthode', 'Statut', 'Transaction', 'Date', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {safePayments.data.map((p: PaymentItem) => {
                                const badge = STATUS_BADGES[p.status] ?? { label: p.status, color: 'text-on-surface-variant' };
                                return (
                                    <tr key={p.id} className="hover:bg-gris-surface transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs text-slate-dark">{p.reference}</td>
                                        <td className="px-4 py-3 text-slate-dark">{p.client}</td>
                                        <td className="px-4 py-3 text-on-surface-variant text-xs">{p.route}</td>
                                        <td className="px-4 py-3 font-mono font-bold text-slate-dark">{p.amount.toLocaleString()} FCFA</td>
                                        <td className="px-4 py-3 text-on-surface-variant text-xs capitalize">{p.method}</td>
                                        <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded ${badge.color}`}>{badge.label}</span></td>
                                        <td className="px-4 py-3 text-on-surface-variant text-xs font-mono max-w-[120px] truncate">{p.transaction_id ?? '—'}</td>
                                        <td className="px-4 py-3 text-on-surface-variant text-xs">{p.date}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                {p.status === 'completed' && (
                                                    <button onClick={() => { if (confirm('Rembourser ce paiement ?')) rembourserPaiement(p.id).then(() => refetch()); }}
                                                        className="text-status-blue-text hover:underline text-xs"
                                                    >Rembourser</button>
                                                )}
                                                {p.transaction_id && (
                                                    <button onClick={() => verifierPaiement(p.id).then(() => refetch())}
                                                        className="text-on-surface-variant hover:text-slate-dark text-xs"
                                                    >Vérifier</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
