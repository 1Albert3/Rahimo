import { router, useForm } from '@inertiajs/react';
import { Eye, Plus, Trash2, UserX } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps, PaginatedData } from '@/types';

interface EntryItem {
    id: number; full_name: string; phone: string | null;
    id_card_number: string | null; reason: string; status: string; created_at: string;
}

interface Props extends PageProps { entries: PaginatedData<EntryItem> }

export default function Watchlist({ entries }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        full_name: '', phone: '', id_card_number: '', reason: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.police.watchlist.stocker'), { onSuccess: () => reset() });
    };

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-dark">Liste de Surveillance</h1>
                <p className="text-on-surface-variant text-sm mt-0.5">Personnes recherchées ou sous surveillance</p>
            </div>

            <form onSubmit={submit} className="bg-white rounded-xl border border-outline p-5 grid grid-cols-4 gap-3">
                <input type="text" value={data.full_name} onChange={e => setData('full_name', e.target.value)} required
                    placeholder="Nom complet *"
                    className="bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm" />
                <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)}
                    placeholder="Téléphone"
                    className="bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm" />
                <input type="text" value={data.id_card_number} onChange={e => setData('id_card_number', e.target.value)}
                    placeholder="N° Carte d'identité"
                    className="bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm" />
                <div className="flex gap-2">
                    <input type="text" value={data.reason} onChange={e => setData('reason', e.target.value)} required
                        placeholder="Motif *"
                        className="flex-1 bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm" />
                    <button type="submit" disabled={processing}
                        className="btn-primary px-4 rounded-xl text-sm font-semibold disabled:opacity-50"
                    ><Plus size={14} /></button>
                </div>
            </form>

            <div className="bg-white rounded-xl border border-outline overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                            <tr>
                                {['Nom', 'Téléphone', 'N° ID', 'Motif', 'Ajouté le', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {entries.data.map(e => (
                                <tr key={e.id} className="hover:bg-gris-surface transition-colors">
                                    <td className="px-4 py-3 font-semibold text-status-red-text">{e.full_name}</td>
                                    <td className="px-4 py-3 text-on-surface-variant font-mono">{e.phone ?? '—'}</td>
                                    <td className="px-4 py-3 text-on-surface-variant font-mono text-xs">{e.id_card_number ?? '—'}</td>
                                    <td className="px-4 py-3 text-on-surface-variant">{e.reason}</td>
                                    <td className="px-4 py-3 text-on-surface-variant text-xs">{e.created_at}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => { if (confirm('Retirer cette entrée ?')) router.post(route('admin.police.watchlist.clear', e.id)); }}
                                            className="text-status-green-text hover:underline text-xs"
                                        ><Trash2 size={12} className="inline" /> Retirer</button>
                                    </td>
                                </tr>
                            ))}
                            {entries.data.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-8 text-on-surface-variant text-sm">Aucune entrée.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

Watchlist.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Liste de Surveillance" breadcrumbs={[{ label: 'Police', href: route('admin.police') }, { label: 'Surveillance' }]}>
        {page}
    </BackOfficeLayout>
);