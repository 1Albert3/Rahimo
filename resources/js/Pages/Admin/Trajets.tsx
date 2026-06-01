import { useState } from 'react';
import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Bus, Calendar, Clock, Pencil, Plus, Trash2, X } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import StatusBadge from '@/Components/StatusBadge';
import Pagination from '@/Components/Pagination';
import { formatFCFA } from '@/lib/utils';
import type { PageProps, PaginatedData } from '@/types';

interface TripItem {
    id: number; trip_number: string;
    departure_city: string; arrival_city: string;
    departure_date: string; departure_time: string; arrival_time: string;
    price: number; available_seats: number;
    vehicle: string | null; driver: string | null;
    status: string; booked_seats: number;
}

interface VehicleOption { id: number; label: string }
interface DriverOption { id: number; name: string }

interface Props extends PageProps {
    trips: PaginatedData<TripItem>;
    vehicles: VehicleOption[];
    drivers: DriverOption[];
}

type FormMode = 'create' | 'edit';

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function Trajets({ trips, vehicles, drivers }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState<FormMode>('create');
    const [editingTrip, setEditingTrip] = useState<TripItem | null>(null);

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [data, setDataLocal] = useState({
        departure_city: '',
        arrival_city: '',
        departure_date: '',
        departure_time: '',
        arrival_time: '',
        price: 5000,
        available_seats: 50,
        vehicle_id: '' as string | number,
        driver_id: '' as string | number,
        status: 'scheduled',
    });

    const setData = (key: string | Record<string, any>, val?: any) => {
        if (typeof key === 'string') {
            setDataLocal(prev => ({ ...prev, [key]: val }));
        } else {
            setDataLocal(prev => ({ ...prev, ...key }));
        }
    };
    const reset = () => setDataLocal({
        departure_city: '', arrival_city: '', departure_date: '',
        departure_time: '', arrival_time: '', price: 5000,
        available_seats: 50, vehicle_id: '', driver_id: '', status: 'scheduled',
    });

    const openCreate = () => {
        setMode('create');
        setEditingTrip(null);
        reset();
        setShowModal(true);
    };

    const openEdit = (t: TripItem) => {
        setMode('edit');
        setEditingTrip(t);
        setData({
            departure_city: t.departure_city,
            arrival_city: t.arrival_city,
            departure_date: t.departure_date,
            departure_time: t.departure_time,
            arrival_time: t.arrival_time,
            price: t.price,
            available_seats: t.available_seats,
            vehicle_id: String(vehicles.find(v => v.label.startsWith(t.vehicle ?? ''))?.id ?? ''),
            driver_id: String(drivers.find(d => d.name === t.driver)?.id ?? ''),
            status: t.status,
        });
        setShowModal(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        const payload: Record<string, any> = {
            ...data,
            driver_id: data.driver_id ? Number(data.driver_id) : undefined,
            vehicle_id: Number(data.vehicle_id),
        };
        if (mode === 'create') {
            router.post(route('admin.trajets.store'), payload, {
                onSuccess: () => { setShowModal(false); reset(); setProcessing(false); },
                onError: (e) => { setErrors(e); setProcessing(false); },
            });
        } else if (editingTrip) {
            router.put(route('admin.trajets.update', { trip: editingTrip.id }), payload, {
                onSuccess: () => { setShowModal(false); reset(); setProcessing(false); },
                onError: (e) => { setErrors(e); setProcessing(false); },
            });
        }
    };

    const confirmDelete = (t: TripItem) => {
        if (confirm(`Supprimer le trajet ${t.trip_number} (${t.departure_city} → ${t.arrival_city}) ? Les réservations seront annulées.`)) {
            router.delete(route('admin.trajets.destroy', { trip: t.id }));
        }
    };

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-white">Gestion des Trajets</h1>
                    <p className="text-admin-muted text-sm mt-0.5">Créer, modifier et gérer les trajets de la compagnie</p>
                </div>
                <button onClick={openCreate}
                    className="flex items-center gap-2 bg-primary text-on-primary text-sm font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-all"
                >
                    <Plus size={15} /> Nouveau trajet
                </button>
            </div>

            <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['N°', 'Trajet', 'Date', 'Départ', 'Arrivée', 'Places', 'Tarif', 'Véhicule', 'Conducteur', 'Statut', ''].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <motion.tbody variants={stagger} initial="initial" animate="animate">
                            {trips.data.length === 0 ? (
                                <tr><td colSpan={11} className="text-center py-8 text-admin-muted text-sm">Aucun trajet.</td></tr>
                            ) : (
                                trips.data.map((t) => (
                                    <motion.tr key={t.id} variants={fadeUp} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 font-mono font-bold text-admin-text text-xs">{t.trip_number}</td>
                                        <td className="px-4 py-3 text-admin-text whitespace-nowrap">
                                            {t.departure_city} <span className="text-admin-muted">→</span> {t.arrival_city}
                                        </td>
                                        <td className="px-4 py-3 text-admin-muted">{t.departure_date}</td>
                                        <td className="px-4 py-3 text-admin-muted font-mono text-xs">{t.departure_time}</td>
                                        <td className="px-4 py-3 text-admin-muted font-mono text-xs">{t.arrival_time}</td>
                                        <td className="px-4 py-3 text-admin-muted">
                                            {t.booked_seats}/{t.available_seats}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-admin-text">{formatFCFA(t.price)}</td>
                                        <td className="px-4 py-3 text-admin-muted text-xs">{t.vehicle ?? '—'}</td>
                                        <td className="px-4 py-3 text-admin-muted text-xs">{t.driver ?? '—'}</td>
                                        <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => openEdit(t)}
                                                    className="p-1.5 rounded-lg text-admin-muted hover:text-white hover:bg-white/10 transition-all"
                                                    title="Modifier"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => confirmDelete(t)}
                                                    className="p-1.5 rounded-lg text-admin-muted hover:text-status-red-text hover:bg-status-red-bg/20 transition-all"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </motion.tbody>
                    </table>
                </div>
                {trips.last_page > 1 && (
                    <div className="p-4 border-t border-white/5">
                        <Pagination data={trips} />
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setShowModal(false)}>
                    <div className="bg-admin-card rounded-2xl border border-white/10 p-6 w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">
                                {mode === 'create' ? 'Nouveau trajet' : 'Modifier le trajet'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-1 text-admin-muted hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-admin-muted mb-1">Ville départ *</label>
                                    <input type="text" value={data.departure_city} onChange={e => setData('departure_city', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-admin-muted focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Ouagadougou" />
                                    {errors.departure_city && <p className="text-status-red-text text-xs mt-1">{errors.departure_city}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-admin-muted mb-1">Ville arrivée *</label>
                                    <input type="text" value={data.arrival_city} onChange={e => setData('arrival_city', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-admin-muted focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Bobo-Dioulasso" />
                                    {errors.arrival_city && <p className="text-status-red-text text-xs mt-1">{errors.arrival_city}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-admin-muted mb-1">Date de départ *</label>
                                <input type="date" value={data.departure_date} onChange={e => setData('departure_date', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                                {errors.departure_date && <p className="text-status-red-text text-xs mt-1">{errors.departure_date}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-admin-muted mb-1">Heure départ *</label>
                                    <input type="time" value={data.departure_time} onChange={e => setData('departure_time', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                                    {errors.departure_time && <p className="text-status-red-text text-xs mt-1">{errors.departure_time}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-admin-muted mb-1">Heure arrivée *</label>
                                    <input type="time" value={data.arrival_time} onChange={e => setData('arrival_time', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                                    {errors.arrival_time && <p className="text-status-red-text text-xs mt-1">{errors.arrival_time}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-admin-muted mb-1">Prix *</label>
                                    <input type="number" value={data.price} onChange={e => setData('price', Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                        min={0} step={100} />
                                    {errors.price && <p className="text-status-red-text text-xs mt-1">{errors.price}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-admin-muted mb-1">Places dispo. *</label>
                                    <input type="number" value={data.available_seats} onChange={e => setData('available_seats', Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                        min={1} />
                                    {errors.available_seats && <p className="text-status-red-text text-xs mt-1">{errors.available_seats}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-admin-muted mb-1">Véhicule *</label>
                                    <select value={data.vehicle_id} onChange={e => setData('vehicle_id', Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                    >
                                        <option value={0}>Sélectionner</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.label}</option>
                                        ))}
                                    </select>
                                    {errors.vehicle_id && <p className="text-status-red-text text-xs mt-1">{errors.vehicle_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-admin-muted mb-1">Conducteur</label>
                                    <select value={data.driver_id} onChange={e => setData('driver_id', Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                    >
                                        <option value={0}>Non assigné</option>
                                        {drivers.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-admin-muted mb-1">Statut *</label>
                                <select value={data.status} onChange={e => setData('status', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                >
                                    <option value="scheduled">Programmé</option>
                                    <option value="in_progress">En cours</option>
                                    <option value="completed">Terminé</option>
                                    <option value="cancelled">Annulé</option>
                                </select>
                                {errors.status && <p className="text-status-red-text text-xs mt-1">{errors.status}</p>}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-admin-muted hover:text-white hover:bg-white/5 text-sm font-semibold transition-all"
                                >Annuler</button>
                                <button type="submit" disabled={processing}
                                    className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
                                >{processing ? 'Enregistrement...' : mode === 'create' ? 'Créer' : 'Enregistrer'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

Trajets.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Trajets" breadcrumbs={[{ label: 'Tableau de bord', href: route('admin.dashboard') }, { label: 'Trajets' }]}>
        {page}
    </BackOfficeLayout>
);
