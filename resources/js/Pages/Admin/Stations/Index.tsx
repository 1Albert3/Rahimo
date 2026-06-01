import { useForm } from '@inertiajs/react';
import { Building2, MapPin, Plus, Route } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps, PaginatedData } from '@/types';

interface StationItem {
    id: number; name: string; city: string; address: string | null;
    type: string; phone: string | null; is_active: boolean; location: string | null;
}

interface RouteItem {
    id: number; name: string; from: string; to: string;
    company: string | null; price: number; duration: number | null;
    distance: number | null; is_active: boolean;
}

interface Props extends PageProps {
    stations: PaginatedData<StationItem>;
    routes: PaginatedData<RouteItem>;
}

const TYPE_LABELS: Record<string, string> = {
    bus_stop: 'Arrêt', terminal: 'Terminus', agency: 'Agence',
};

export default function StationsIndex({ stations, routes }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        name: '', city: '', address: '', phone: '', type: 'bus_stop',
        latitude: '', longitude: '', is_active: true,
    });

    const { data: rData, setData: rSet, post: rPost, processing: rProc, reset: rReset } = useForm({
        departure_station_id: '', arrival_station_id: '', company_id: '',
        route_name: '', base_price: '', estimated_minutes: '', distance_km: '',
    });

    const submitStation = (e: React.FormEvent) => { e.preventDefault(); post(route('admin.gares.stocker'), { onSuccess: () => reset() }); };
    const submitRoute = (e: React.FormEvent) => { e.preventDefault(); rPost(route('admin.gares.routes.stocker'), { onSuccess: () => rReset() }); };

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Gares & Routes</h1>
                <p className="text-admin-muted text-sm mt-0.5">Multi-gares et itinéraires</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-admin-card rounded-xl border border-white/5 p-5">
                    <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><MapPin size={14} /> Nouvelle Gare</h2>
                    <form onSubmit={submitStation} className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="Nom *"
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                            <input type="text" value={data.city} onChange={e => setData('city', e.target.value)} required placeholder="Ville *"
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                        </div>
                        <select value={data.type} onChange={e => setData('type', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="Téléphone"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                        <button type="submit" disabled={processing}
                            className="btn-primary w-full py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                        ><Plus size={14} className="inline" /> Ajouter</button>
                    </form>
                </div>

                <div className="bg-admin-card rounded-xl border border-white/5 p-5">
                    <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Route size={14} /> Nouvelle Route</h2>
                    <form onSubmit={submitRoute} className="space-y-3">
                        <select value={rData.departure_station_id} onChange={e => rSet('departure_station_id', e.target.value)} required
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                            <option value="">Départ *</option>
                            {stations.data.map(s => <option key={s.id} value={s.id}>{s.name} ({s.city})</option>)}
                        </select>
                        <select value={rData.arrival_station_id} onChange={e => rSet('arrival_station_id', e.target.value)} required
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                            <option value="">Arrivée *</option>
                            {stations.data.map(s => <option key={s.id} value={s.id}>{s.name} ({s.city})</option>)}
                        </select>
                        <input type="text" value={rData.route_name} onChange={e => rSet('route_name', e.target.value)} required placeholder="Nom de la route *"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                        <div className="grid grid-cols-3 gap-2">
                            <input type="number" value={rData.base_price} onChange={e => rSet('base_price', e.target.value)} required placeholder="Prix *"
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                            <input type="number" value={rData.estimated_minutes} onChange={e => rSet('estimated_minutes', e.target.value)} placeholder="Minutes"
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                            <input type="number" value={rData.distance_km} onChange={e => rSet('distance_km', e.target.value)} placeholder="Km"
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                        </div>
                        <button type="submit" disabled={rProc}
                            className="btn-primary w-full py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                        ><Plus size={14} className="inline" /> Ajouter</button>
                    </form>
                </div>
            </div>

            <div className="bg-admin-card rounded-xl border border-white/5 p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Gares</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {stations.data.map(s => (
                        <div key={s.id} className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin size={12} className="text-status-blue-text" />
                                <span className="font-semibold text-white text-sm">{s.name}</span>
                                <span className="text-xs text-admin-muted">{TYPE_LABELS[s.type] ?? s.type}</span>
                            </div>
                            <p className="text-xs text-admin-muted">{s.city}{s.address ? ` — ${s.address}` : ''}</p>
                            {s.phone && <p className="text-xs text-admin-muted mt-0.5">{s.phone}</p>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['Route', 'Départ', 'Arrivée', 'Compagnie', 'Prix', 'Durée', 'Km'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {routes.data.map(r => (
                                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-white">{r.name}</td>
                                    <td className="px-4 py-3 text-admin-muted">{r.from}</td>
                                    <td className="px-4 py-3 text-admin-muted">{r.to}</td>
                                    <td className="px-4 py-3 text-admin-muted text-xs">{r.company ?? '—'}</td>
                                    <td className="px-4 py-3 font-mono text-white">{r.price.toLocaleString()} FCFA</td>
                                    <td className="px-4 py-3 text-admin-muted">{r.duration ? `${r.duration} min` : '—'}</td>
                                    <td className="px-4 py-3 text-admin-muted">{r.distance ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

StationsIndex.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Gares & Routes" breadcrumbs={[{ label: 'Gares' }]}>
        {page}
    </BackOfficeLayout>
);