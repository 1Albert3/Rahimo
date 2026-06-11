import { BookOpen } from 'lucide-react';
import { formatFCFA } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import api from '@/api/client';
interface EntryItem {
    id: number; reference: string; entry_date: string;
    account_code: string; account_label: string;
    debit: number; credit: number; description: string;
    journal_type: string;
}

interface BalanceItem {
    account_code: string; account_label: string;
    debit: number; credit: number; balance: number;
}

interface GrandLivreData {
    entries: EntryItem[];
    totalDebit: number;
    totalCredit: number;
    balances: BalanceItem[];
}

export default function GrandLivre() {
    const { data, loading } = useApi<GrandLivreData>('/admin/finance/grand-livre');
    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;
    const entries = data?.entries ?? [];
    const totalDebit = data?.totalDebit ?? 0;
    const totalCredit = data?.totalCredit ?? 0;
    const balances = data?.balances ?? [];
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-dark">Grand-Livre</h1>
                <p className="text-on-surface-variant text-sm mt-0.5">Toutes les écritures comptables</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-outline shadow-sm p-4">
                    <p className="text-xs text-on-surface-variant">Total Débit</p>
                    <p className="text-2xl font-bold font-mono text-status-red-text">{formatFCFA(totalDebit)}</p>
                </div>
                <div className="bg-white rounded-xl border border-outline shadow-sm p-4">
                    <p className="text-xs text-on-surface-variant">Total Crédit</p>
                    <p className="text-2xl font-bold font-mono text-status-green-text">{formatFCFA(totalCredit)}</p>
                </div>
            </div>

            {balances.length > 0 && (
                <div className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden">
                    <div className="p-4"><h3 className="font-semibold text-slate-dark text-sm">Soldes par Compte</h3></div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                                <tr>
                                    {['Code', 'Compte', 'Débit', 'Crédit', 'Solde'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {balances.map((b: any) => (
                                    <tr key={b.account_code} className="hover:bg-gris-surface transition-colors">
                                        <td className="px-4 py-3 font-mono text-slate-dark">{b.account_code}</td>
                                        <td className="px-4 py-3 text-on-surface-variant">{b.account_label}</td>
                                        <td className="px-4 py-3 font-mono text-on-surface-variant">{formatFCFA(b.debit)}</td>
                                        <td className="px-4 py-3 font-mono text-on-surface-variant">{formatFCFA(b.credit)}</td>
                                        <td className={`px-4 py-3 font-mono font-bold ${b.balance >= 0 ? 'text-status-green-text' : 'text-status-red-text'}`}>{formatFCFA(b.balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden">
                <div className="p-4"><h3 className="font-semibold text-slate-dark text-sm">Écritures (200 dernières)</h3></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                            <tr>
                                {['Date', 'Réf.', 'Compte', 'Libellé', 'Débit', 'Crédit', 'Journal'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((e: any) => (
                                <tr key={e.id} className="hover:bg-gris-surface transition-colors">
                                    <td className="px-4 py-3 font-mono text-on-surface-variant">{e.entry_date}</td>
                                    <td className="px-4 py-3 font-mono text-on-surface-variant">{e.reference ?? '—'}</td>
                                    <td className="px-4 py-3 font-mono text-slate-dark">{e.account_code}</td>
                                    <td className="px-4 py-3 text-on-surface-variant max-w-[200px] truncate">{e.account_label}</td>
                                    <td className="px-4 py-3 font-mono text-status-red-text">{e.debit > 0 ? formatFCFA(e.debit) : '—'}</td>
                                    <td className="px-4 py-3 font-mono text-status-green-text">{e.credit > 0 ? formatFCFA(e.credit) : '—'}</td>
                                    <td className="px-4 py-3 text-on-surface-variant text-xs">{e.journal_type}</td>
                                </tr>
                            ))}
                            {entries.length === 0 && (
                                <tr><td colSpan={7} className="text-center py-8 text-on-surface-variant text-sm">Aucune écriture.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
