import { router } from '@inertiajs/react';
import { DollarSign, RefreshCw, RotateCcw, TrendingUp } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps, PaginatedData } from '@/types';

interface PaymentItem {
    id: number; reference: string; amount: number; method: string;
    status: string; transaction_id: string | null; client: string;
    booking_ref: string; route: string; date: string; payment_date: string | null;
}

interface Props extends PageProps {
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

export default function PaiementsIndex({ payments, stats, filters }: Props) {
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Paiements & Transactions</h1>
                <p className="text-admin-muted text-sm mt-0.5">Gestion des paiements Orange Money, Moov Money, CB</p>
            </div>

            <div className="grid grid-cols-5 gap-4">
                {[
                    { label: 'Total Transactions', val: stats.total, icon: DollarSign, color: 'text-admin-text', bg: 'bg-white/5' },
                    { label: 'Complétés', val: `${stats.completed.toLocaleString()} FCFA`, icon: TrendingUp, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
                    { label: 'En attente', val: stats.pending, icon: RotateCcw, color: 'text-status-yellow-text', bg: 'bg-status-yellow-bg/30' },
                    { label: 'Échoués', val: stats.failed, icon: RefreshCw, color: 'text-status-red-text', bg: 'bg-status-red-bg/30' },
                    { label: 'Remboursés', val: `${stats.refunded.toLocaleString()} FCFA`, icon: DollarSign, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
                ].map(s => (
                    <div key={s.label} className="bg-admin-card rounded-xl border border-white/5 p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}><s.icon size={18} className={s.color} /></div>
                        <div>
                            <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-xs text-admin-muted">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['Référence', 'Client', 'Trajet', 'Montant', 'Méthode', 'Statut', 'Transaction', 'Date', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {payments.data.map(p => {
                                const badge = STATUS_BADGES[p.status] ?? { label: p.status, color: 'text-admin-muted' };
                                return (
                                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs text-white">{p.reference}</td>
                                        <td className="px-4 py-3 text-white">{p.client}</td>
                                        <td className="px-4 py-3 text-admin-muted text-xs">{p.route}</td>
                                        <td className="px-4 py-3 font-mono font-bold text-white">{p.amount.toLocaleString()} FCFA</td>
                                        <td className="px-4 py-3 text-admin-muted text-xs capitalize">{p.method}</td>
                                        <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded ${badge.color}`}>{badge.label}</span></td>
                                        <td className="px-4 py-3 text-admin-muted text-xs font-mono max-w-[120px] truncate">{p.transaction_id ?? '—'}</td>
                                        <td className="px-4 py-3 text-admin-muted text-xs">{p.date}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                {p.status === 'completed' && (
                                                    <button onClick={() => { if (confirm('Rembourser ce paiement ?')) router.post(route('admin.paiements.rembourser', p.id)); }}
                                                        className="text-status-blue-text hover:underline text-xs"
                                                    >Rembourser</button>
                                                )}
                                                {p.transaction_id && (
                                                    <button onClick={() => router.post(route('admin.paiements.verifier', p.id))}
                                                        className="text-admin-muted hover:text-white text-xs"
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

PaiementsIndex.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Paiements" breadcrumbs={[{ label: 'Paiements' }]}>
        {page}
    </BackOfficeLayout>
);