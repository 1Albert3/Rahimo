import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps } from '@/types';

interface Vehicule {
    id: number;
    registration_number: string;
    brand: string;
    model: string;
    latitude: number;
    longitude: number;
    speed: number;
    status: string;
    last_update: string | null;
}

interface Props extends PageProps {
    vehicules: Vehicule[];
}

export default function GpsMap({ vehicules: initial }: Props) {
    const [vehicules, setVehicules] = useState<Vehicule[]>(initial);
    const [selected, setSelected] = useState<Vehicule | null>(null);
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        import('leaflet').then((L) => {
            const container = document.getElementById('gps-map');
            if (!container || container.hasChildNodes()) return;

            const map = L.map('gps-map', { zoomControl: false }).setView([12.3714, -1.5197], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
            }).addTo(map);
            L.control.zoom({ position: 'bottomright' }).addTo(map);

            const greenIcon = L.divIcon({
                className: '',
                html: `<div style="width:24px;height:24px;background:#22c55e;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.3);"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
            });

            const yellowIcon = L.divIcon({
                className: '',
                html: `<div style="width:24px;height:24px;background:#eab308;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.3);"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
            });

            const markers: Record<number, L.Marker> = {};

            const updateMarkers = (data: Vehicule[]) => {
                data.forEach((v) => {
                    const icon = v.status === 'active' ? greenIcon : yellowIcon;
                    if (markers[v.id]) {
                        markers[v.id].setLatLng([v.latitude, v.longitude]);
                        markers[v.id].setIcon(icon);
                    } else {
                        const m = L.marker([v.latitude, v.longitude], { icon }).addTo(map);
                        m.bindPopup(`
                            <div style="font-family:sans-serif;font-size:13px;min-width:150px;">
                                <b style="font-size:15px;">${v.registration_number}</b><br/>
                                ${v.brand} ${v.model}<br/>
                                <span style="color:#6b7280;">${v.status === 'active' ? 'En ligne' : 'Arrêté'}</span>
                                ${v.last_update ? `<br/><span style="color:#9ca3af;font-size:11px;">${v.last_update}</span>` : ''}
                            </div>
                        `);
                        m.on('click', () => setSelected(v));
                        markers[v.id] = m;
                    }
                });
                setMapReady(true);
            };

            updateMarkers(vehicules);

            const interval = setInterval(async () => {
                try {
                    const res = await fetch(route('admin.flotte.gps'));
                    const json = await res.json();
                    if (json.vehicules) {
                        setVehicules(json.vehicules);
                        updateMarkers(json.vehicules);
                    }
                } catch { /* ignore */ }
            }, 15_000);

            return () => {
                clearInterval(interval);
                map.remove();
            };
        });
    }, []);

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <Head title="Carte GPS" />

            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-xl font-bold text-slate-dark">Carte GPS Temps Réel</h1>
                    <p className="text-on-surface-variant text-sm mt-0.5">
                        {vehicules.length} véhicule{vehicules.length > 1 ? 's' : ''} suivi{vehicules.length > 1 ? 's' : ''}
                        {mapReady && <span className="text-status-green-text ml-2">● Connecté</span>}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-xs text-on-surface-variant">En ligne</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-xs text-on-surface-variant">Arrêté</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 relative rounded-xl overflow-hidden border border-outline">
                <div id="gps-map" className="absolute inset-0" style={{ zIndex: 1 }} />
                {!mapReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                        <p className="text-on-surface-variant text-sm">Chargement de la carte...</p>
                    </div>
                )}
            </div>

            {selected && (
                <div className="bg-white rounded-xl border border-outline shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-slate-dark">
                            {selected.registration_number} — {selected.brand} {selected.model}
                        </h3>
                        <button onClick={() => setSelected(null)} className="text-on-surface-variant hover:text-slate-dark text-sm">Fermer</button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-on-surface-variant text-xs">Latitude</span>
                            <p className="text-slate-dark font-mono">{selected.latitude.toFixed(6)}</p>
                        </div>
                        <div>
                            <span className="text-on-surface-variant text-xs">Longitude</span>
                            <p className="text-slate-dark font-mono">{selected.longitude.toFixed(6)}</p>
                        </div>
                        <div>
                            <span className="text-on-surface-variant text-xs">Statut</span>
                            <p className={selected.status === 'active' ? 'text-status-green-text' : 'text-status-yellow-text'}>
                                {selected.status === 'active' ? 'En ligne' : 'Arrêté'}
                            </p>
                        </div>
                        <div>
                            <span className="text-on-surface-variant text-xs">Dernière mise à jour</span>
                            <p className="text-slate-dark">{selected.last_update ?? '—'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

GpsMap.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Carte GPS" breadcrumbs={[{ label: 'Flotte' }, { label: 'Carte GPS' }]}>
        {page}
    </BackOfficeLayout>
);