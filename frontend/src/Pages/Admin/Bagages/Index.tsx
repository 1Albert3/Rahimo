import { useState } from 'react';

import { CheckCircle, Luggage, Package, Plus, Scan, Search } from 'lucide-react';
import type { PaginatedData } from '@/types';
import { useForm } from '@/hooks/useForm';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import { storeBagage, scanBagage } from '@/api/admin';
interface BaggageItem {
    id: number; tag: string; passenger: string; type: string;
    weight: number | null; status: string; trip: string | null;
    scanned_at: string | null; loaded_at: string | null;
    delivered_at: string | null; created_at: string;
}

interface BagagesIndexData {
    baggages: PaginatedData<BaggageItem>;
    stats: { total: number; registered: number; loaded: number; delivered: number };
}

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
    registered: { label: 'Enregistré', color: 'bg-status-blue-bg/30 text-status-blue-text' },
    scanned:    { label: 'Scanné',     color: 'bg-status-yellow-bg/30 text-status-yellow-text' },
    loaded:     { label: 'Chargé',     color: 'bg-status-green-bg/30 text-status-green-text' },
    in_transit: { label: 'En transit', color: 'bg-admin-muted/30 text-on-surface-variant' },
    unloaded:   { label: 'Déchargé',   color: 'bg-status-yellow-bg/30 text-status-yellow-text' },
    delivered:  { label: 'Livré',      color: 'bg-status-green-bg/30 text-status-green-text' },
    lost:       { label: 'Perdu',      color: 'bg-status-red-bg/30 text-status-red-text' },
};

const TYPES: Record<string, string> = {
    suitcase: 'Valise', bag: 'Sac', box: 'Carton', sport: 'Sport', other: 'Autre',
};

export default function BagagesIndex() {
    const { data, loading } = useApi<BagagesIndexData>('/admin/bagages');

    const baggages = data?.baggages ?? ({} as any);
    const safeStats: any = data?.stats ?? {};
    const { user } = useAuth();
    const role = user?.role ?? '';
    const isBagagiste = role === 'bagagiste';

    const safeBaggages = baggages && typeof baggages === 'object' && Array.isArray(baggages.data) ? baggages : { data: [], current_page: 1, last_page: 1, per_page: 15, total: 0, links: [] };

    const { data: inputData, setData, processing, reset } = useForm({
        passenger_name: '', type: 'suitcase', weight_kg: '',
        description: '', booking_id: '',
    });

    const [scanTag, setScanTag] = useState('');
    const [scanAction, setScanAction] = useState('scan');
    const [scanResult, setScanResult] = useState<any>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await storeBagage(inputData);
            reset();
        } catch {}
    };

    const doScan = async () => {
        if (!scanTag.trim()) return;
        try {
            const result = await scanBagage({ tag_number: scanTag, action: scanAction });
            setScanResult(result);
            setScanTag('');
        } catch {}
    };

    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-dark">Gestion des Bagages</h1>
                    <p className="text-on-surface-variant text-sm mt-0.5">{isBagagiste ? 'Scanner et suivi chargement' : 'Enregistrement, scan, suivi chargement'}</p>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total', val: safeStats.total, icon: Luggage, color: 'text-slate-dark', bg: 'bg-gris-surface' },
                    { label: 'Enregistrés', val: safeStats.registered, icon: Package, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
                    { label: 'Chargés', val: safeStats.loaded, icon: Package, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
                    { label: 'Livrés', val: safeStats.delivered, icon: Package, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-outline shadow-sm p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon size={18} className={s.color} /></div>
                        <div>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-xs text-on-surface-variant">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scan rapide */}
                <div className="bg-white rounded-xl border border-outline shadow-sm p-5">
                    <h2 className="text-sm font-semibold text-slate-dark mb-4 flex items-center gap-2"><Scan size={14} /> Scan Rapide</h2>
                    <div className="flex gap-2 mb-3">
                        {['scan', 'load', 'unload', 'deliver'].map(a => (
                            <button key={a} onClick={() => setScanAction(a)}
                                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                                    scanAction === a ? 'btn-primary' : 'bg-gris-surface text-on-surface-variant hover:text-slate-dark'
                                }`}
                            >{a === 'scan' ? 'Scanner' : a === 'load' ? 'Charger' : a === 'unload' ? 'Décharger' : 'Livrer'}</button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input type="text" value={scanTag} onChange={e => setScanTag(e.target.value)}
                            placeholder="Tag du bagage"
                            className="flex-1 bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm font-mono" />
                        <button onClick={doScan}
                            className="btn-primary px-4 rounded-xl text-sm font-semibold"
                        ><Search size={14} /></button>
                    </div>
                    {scanResult && (
                        <div className={`mt-3 p-2 rounded-xl text-xs ${scanResult.success ? 'bg-status-green-bg/30 text-status-green-text' : 'bg-status-red-bg/30 text-status-red-text'}`}>
                            {scanResult.success ? `${scanResult.baggage.tag} → ${scanResult.baggage.status}` : 'Erreur'}
                        </div>
                    )}
                </div>

                {/* Enregistrement */}
                <div className="bg-white rounded-xl border border-outline shadow-sm p-5">
                    <h2 className="text-sm font-semibold text-slate-dark mb-4 flex items-center gap-2"><Plus size={14} /> Nouveau Bagage</h2>
                    <form onSubmit={submit} className="space-y-3">
                        <input type="text" value={inputData.passenger_name} onChange={e => setData('passenger_name', e.target.value)} required
                            placeholder="Nom du passager *"
                            className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm" />
                        <div className="flex gap-2">
                            <select value={inputData.type} onChange={e => setData('type', e.target.value)}
                                className="flex-1 bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm">
                                {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                            <input type="number" step="0.1" value={inputData.weight_kg} onChange={e => setData('weight_kg', e.target.value)}
                                placeholder="Poids kg"
                                className="w-24 bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm" />
                        </div>
                        <input type="text" value={inputData.description} onChange={e => setData('description', e.target.value)}
                            placeholder="Description"
                            className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm" />
                        <button type="submit" disabled={processing}
                            className="btn-primary w-full py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                        >Enregistrer le bagage</button>
                    </form>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                            <tr>
                                {['Tag', 'Passager', 'Type', 'Poids', 'Statut', 'Trajet', 'Scanné', 'Chargé', 'Livré'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {safeBaggages.data.map((b: BaggageItem) => {
                                const badge = STATUS_BADGES[b.status] ?? { label: b.status, color: 'text-on-surface-variant' };
                                return (
                                    <tr key={b.id} className="hover:bg-gris-surface transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs text-status-blue-text font-bold">{b.tag}</td>
                                        <td className="px-4 py-3 text-slate-dark">{b.passenger}</td>
                                        <td className="px-4 py-3 text-on-surface-variant text-xs">{TYPES[b.type] ?? b.type}</td>
                                        <td className="px-4 py-3 text-on-surface-variant font-mono">{b.weight ? `${b.weight} kg` : '—'}</td>
                                        <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded ${badge.color}`}>{badge.label}</span></td>
                                        <td className="px-4 py-3 text-on-surface-variant text-xs">{b.trip ?? '—'}</td>
                                        <td className="px-4 py-3 text-on-surface-variant text-xs">{b.scanned_at ?? '—'}</td>
                                        <td className="px-4 py-3 text-on-surface-variant text-xs">{b.loaded_at ?? '—'}</td>
                                        <td className="px-4 py-3 text-on-surface-variant text-xs">{b.delivered_at ?? '—'}</td>
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
