
import { Building2, MapPin, Plus, Route } from 'lucide-react';
import type { PaginatedData } from '@/types';
import { useForm } from '@/hooks/useForm';
import { useApi } from '@/hooks/useApi';
import { storeStation, storeStationRoute } from '@/api/admin';

interface StationItem {
    id: number; name: string; city: string; address: string | null;
    type: string; phone: string | null; is_active: boolean; location: string | null;
}

interface RouteItem {
    id: number; name: string; from: string; to: string;
    company: string | null; price: number; duration: number | null;
    distance: number | null; is_active: boolean;
}

interface StationsData {
    stations: PaginatedData<StationItem>;
    routes: PaginatedData<RouteItem>;
}

const TYPE_LABELS: Record<string, string> = {
    bus_stop: 'Arrêt', terminal: 'Terminus', agency: 'Agence',
};

export default function StationsIndex() {
    const { data: apiData, loading } = useApi<StationsData>('/admin/gares');

    const stations = apiData?.stations ?? {} as any;
    const routes = apiData?.routes ?? {} as any;
    const safeStations = stations && typeof stations === 'object' && Array.isArray(stations.data) ? stations : { data: [], current_page: 1, last_page: 1, per_page: 15, total: 0, links: [] };
    const safeRoutes = routes && typeof routes === 'object' && Array.isArray(routes.data) ? routes : { data: [], current_page: 1, last_page: 1, per_page: 15, total: 0, links: [] };
    const { data, setData, post, processing, reset } = useForm({
        name: '', city: '', address: '', phone: '', type: 'bus_stop',
        latitude: '', longitude: '', is_active: true,
    });

    const { data: rData, setData: rSet, post: rPost, processing: rProc, reset: rReset } = useForm({
        departure_station_id: '', arrival_station_id: '', company_id: '',
        route_name: '', base_price: '', estimated_minutes: '', distance_km: '',
    });

    const submitStation = async (e: React.FormEvent) => { e.preventDefault(); await storeStation(data as Record<string, unknown>); reset(); };
    const submitRoute = async (e: React.FormEvent) => { e.preventDefault(); await storeStationRoute(rData as Record<string, unknown>); rReset(); };

    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-dark">Gares & Routes</h1>
                <p className="text-on-surface-variant text-sm mt-0.5">Multi-gares et itinéraires</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-outline shadow-sm p-5">
                    <h2 className="text-sm font-semibold text-slate-dark mb-4 flex items-center gap-2"><MapPin size={14} /> Nouvelle Gare</h2>
                    <form onSubmit={submitStation} className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="Nom *"
                                className="bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm" />
                            <input type="text" value={data.city} onChange={e => setData('city', e.target.value)} required placeholder="Ville *"
                                className="bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm" />
                        </div>
                        <select value={data.type} onChange={e => setData('type', e.target.value)}
                            className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm">
                            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="Téléphone"
                            className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm" />
                        <button type="submit" disabled={processing}
                            className="btn-primary w-full py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                        ><Plus size={14} className="inline" /> Ajouter</button>
                    </form>
                </div>

                <div className="bg-white rounded-xl border border-outline shadow-sm p-5">
                    <h2 className="text-sm font-semibold text-slate-dark mb-4 flex items-center gap-2"><Route size={14} /> Nouvelle Route</h2>
                    <form onSubmit={submitRoute} className="space-y-3">
                        <select value={rData.departure_station_id} onChange={e => rSet('departure_station_id', e.target.value)} required
                            className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm">
                            <option value="">Départ *</option>
                            {safeStations.data.map((s: StationItem) => <option key={s.id} value={s.id}>{s.name} ({s.city})</option>)}
                        </select>
                        <select value={rData.arrival_station_id} onChange={e => rSet('arrival_station_id', e.target.value)} required
                            className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm">
                            <option value="">Arrivée *</option>
                            {safeStations.data.map((s: StationItem) => <option key={s.id} value={s.id}>{s.name} ({s.city})</option>)}
                        </select>
                        <input type="text" value={rData.route_name} onChange={e => rSet('route_name', e.target.value)} required placeholder="Nom de la route *"
                            className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm" />
                        <div className="grid grid-cols-3 gap-2">
                            <input type="number" value={rData.base_price} onChange={e => rSet('base_price', e.target.value)} required placeholder="Prix *"
                                className="bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm" />
                            <input type="number" value={rData.estimated_minutes} onChange={e => rSet('estimated_minutes', e.target.value)} placeholder="Minutes"
                                className="bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm" />
                            <input type="number" value={rData.distance_km} onChange={e => rSet('distance_km', e.target.value)} placeholder="Km"
                                className="bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm" />
                        </div>
                        <button type="submit" disabled={rProc}
                            className="btn-primary w-full py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                        ><Plus size={14} className="inline" /> Ajouter</button>
                    </form>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-outline shadow-sm p-5">
                <h2 className="text-sm font-semibold text-slate-dark mb-4">Gares</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {safeStations.data.map((s: StationItem) => (
                        <div key={s.id} className="bg-gris-surface rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin size={12} className="text-status-blue-text" />
                                <span className="font-semibold text-slate-dark text-sm">{s.name}</span>
                                <span className="text-xs text-on-surface-variant">{TYPE_LABELS[s.type] ?? s.type}</span>
                            </div>
                            <p className="text-xs text-on-surface-variant">{s.city}{s.address ? ` — ${s.address}` : ''}</p>
                            {s.phone && <p className="text-xs text-on-surface-variant mt-0.5">{s.phone}</p>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                            <tr>
                                {['Route', 'Départ', 'Arrivée', 'Compagnie', 'Prix', 'Durée', 'Km'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {safeRoutes.data.map((r: RouteItem) => (
                                <tr key={r.id} className="hover:bg-gris-surface transition-colors">
                                    <td className="px-4 py-3 font-semibold text-slate-dark">{r.name}</td>
                                    <td className="px-4 py-3 text-on-surface-variant">{r.from}</td>
                                    <td className="px-4 py-3 text-on-surface-variant">{r.to}</td>
                                    <td className="px-4 py-3 text-on-surface-variant text-xs">{r.company ?? '—'}</td>
                                    <td className="px-4 py-3 font-mono text-slate-dark">{r.price.toLocaleString()} FCFA</td>
                                    <td className="px-4 py-3 text-on-surface-variant">{r.duration ? `${r.duration} min` : '—'}</td>
                                    <td className="px-4 py-3 text-on-surface-variant">{r.distance ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
