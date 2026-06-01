import { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle, Luggage, Package, Plus, Scan, Search } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps, PaginatedData } from '@/types';

interface BaggageItem {
    id: number; tag: string; passenger: string; type: string;
    weight: number | null; status: string; trip: string | null;
    scanned_at: string | null; loaded_at: string | null;
    delivered_at: string | null; created_at: string;
}

interface Props extends PageProps {
    baggages: PaginatedData<BaggageItem>;
    stats: { total: number; registered: number; loaded: number; delivered: number };
}

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
    registered: { label: 'Enregistré', color: 'bg-status-blue-bg/30 text-status-blue-text' },
    scanned:    { label: 'Scanné',     color: 'bg-status-yellow-bg/30 text-status-yellow-text' },
    loaded:     { label: 'Chargé',     color: 'bg-status-green-bg/30 text-status-green-text' },
    in_transit: { label: 'En transit', color: 'bg-admin-muted/30 text-admin-muted' },
    unloaded:   { label: 'Déchargé',   color: 'bg-status-yellow-bg/30 text-status-yellow-text' },
    delivered:  { label: 'Livré',      color: 'bg-status-green-bg/30 text-status-green-text' },
    lost:       { label: 'Perdu',      color: 'bg-status-red-bg/30 text-status-red-text' },
};

const TYPES: Record<string, string> = {
    suitcase: 'Valise', bag: 'Sac', box: 'Carton', sport: 'Sport', other: 'Autre',
};

export default function BagagesIndex({ baggages, stats }: Props) {
    const { auth } = usePage<PageProps>().props;
    const role = auth?.user?.role ?? '';
    const isBagagiste = role === 'bagagiste';

    const { data, setData, post, processing, reset } = useForm({
        passenger_name: '', type: 'suitcase', weight_kg: '',
        description: '', booking_id: '',
    });

    const [scanTag, setScanTag] = useState('');
    const [scanAction, setScanAction] = useState('scan');
    const [scanResult, setScanResult] = useState<any>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.bagages.stocker'), { onSuccess: () => reset() });
    };

    const doScan = async () => {
        if (!scanTag.trim()) return;
        try {
            const res = await fetch(route('admin.bagages.scanner'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken },
                body: JSON.stringify({ tag_number: scanTag, action: scanAction }),
            });
            setScanResult(await res.json());
            setScanTag('');
        } catch {}
    };

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Gestion des Bagages</h1>
                    <p className="text-admin-muted text-sm mt-0.5">{isBagagiste ? 'Scanner et suivi chargement' : 'Enregistrement, scan, suivi chargement'}</p>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total', val: stats.total, icon: Luggage, color: 'text-admin-text', bg: 'bg-white/5' },
                    { label: 'Enregistrés', val: stats.registered, icon: Package, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
                    { label: 'Chargés', val: stats.loaded, icon: Package, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
                    { label: 'Livrés', val: stats.delivered, icon: Package, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
                ].map(s => (
                    <div key={s.label} className="bg-admin-card rounded-xl border border-white/5 p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}><s.icon size={18} className={s.color} /></div>
                        <div>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-xs text-admin-muted">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scan rapide */}
                <div className="bg-admin-card rounded-xl border border-white/5 p-5">
                    <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Scan size={14} /> Scan Rapide</h2>
                    <div className="flex gap-2 mb-3">
                        {['scan', 'load', 'unload', 'deliver'].map(a => (
                            <button key={a} onClick={() => setScanAction(a)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                    scanAction === a ? 'btn-primary' : 'bg-white/5 text-admin-muted hover:text-white'
                                }`}
                            >{a === 'scan' ? 'Scanner' : a === 'load' ? 'Charger' : a === 'unload' ? 'Décharger' : 'Livrer'}</button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input type="text" value={scanTag} onChange={e => setScanTag(e.target.value)}
                            placeholder="Tag du bagage"
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono" />
                        <button onClick={doScan}
                            className="btn-primary px-4 rounded-lg text-sm font-semibold"
                        ><Search size={14} /></button>
                    </div>
                    {scanResult && (
                        <div className={`mt-3 p-2 rounded-lg text-xs ${scanResult.success ? 'bg-status-green-bg/30 text-status-green-text' : 'bg-status-red-bg/30 text-status-red-text'}`}>
                            {scanResult.success ? `${scanResult.baggage.tag} → ${scanResult.baggage.status}` : 'Erreur'}
                        </div>
                    )}
                </div>

                {/* Enregistrement */}
                <div className="bg-admin-card rounded-xl border border-white/5 p-5">
                    <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Plus size={14} /> Nouveau Bagage</h2>
                    <form onSubmit={submit} className="space-y-3">
                        <input type="text" value={data.passenger_name} onChange={e => setData('passenger_name', e.target.value)} required
                            placeholder="Nom du passager *"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                        <div className="flex gap-2">
                            <select value={data.type} onChange={e => setData('type', e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                                {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                            <input type="number" step="0.1" value={data.weight_kg} onChange={e => setData('weight_kg', e.target.value)}
                                placeholder="Poids kg"
                                className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                        </div>
                        <input type="text" value={data.description} onChange={e => setData('description', e.target.value)}
                            placeholder="Description"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                        <button type="submit" disabled={processing}
                            className="btn-primary w-full py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                        >Enregistrer le bagage</button>
                    </form>
                </div>
            </div>

            <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['Tag', 'Passager', 'Type', 'Poids', 'Statut', 'Trajet', 'Scanné', 'Chargé', 'Livré'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {baggages.data.map(b => {
                                const badge = STATUS_BADGES[b.status] ?? { label: b.status, color: 'text-admin-muted' };
                                return (
                                    <tr key={b.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs text-status-blue-text font-bold">{b.tag}</td>
                                        <td className="px-4 py-3 text-white">{b.passenger}</td>
                                        <td className="px-4 py-3 text-admin-muted text-xs">{TYPES[b.type] ?? b.type}</td>
                                        <td className="px-4 py-3 text-admin-muted font-mono">{b.weight ? `${b.weight} kg` : '—'}</td>
                                        <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded ${badge.color}`}>{badge.label}</span></td>
                                        <td className="px-4 py-3 text-admin-muted text-xs">{b.trip ?? '—'}</td>
                                        <td className="px-4 py-3 text-admin-muted text-xs">{b.scanned_at ?? '—'}</td>
                                        <td className="px-4 py-3 text-admin-muted text-xs">{b.loaded_at ?? '—'}</td>
                                        <td className="px-4 py-3 text-admin-muted text-xs">{b.delivered_at ?? '—'}</td>
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

BagagesIndex.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Bagages" breadcrumbs={[{ label: 'Bagages' }]}>
        {page}
    </BackOfficeLayout>
);