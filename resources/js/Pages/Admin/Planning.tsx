import { motion } from 'framer-motion';
import { useForm } from '@inertiajs/react';
import { Bus, CalendarDays, Clock, MapPin, UserCheck, Users } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import StatusBadge from '@/Components/StatusBadge';
import { formatFCFA } from '@/lib/utils';
import type { PageProps } from '@/types';

interface PlanningTrip {
    id: number;
    trip_number: string;
    departure_city: string;
    arrival_city: string;
    departure_date: string;
    departure_time: string;
    arrival_time: string;
    vehicle: string;
    driver_name: string | null;
    driver_id: number | null;
    status: string;
    booked_seats: number;
    capacity: number;
}

interface DriverItem {
    id: number;
    name: string;
    phone: string;
}

interface VehicleItem {
    id: number;
    label: string;
}

interface Props extends PageProps {
    trips: PlanningTrip[];
    drivers: DriverItem[];
    vehicles: VehicleItem[];
}

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

export default function Planning({ trips, drivers }: Props) {
    const { data, setData, post, processing } = useForm({ trip_id: 0, driver_id: 0 });

    const grouped = trips.reduce<Record<string, PlanningTrip[]>>((acc, t) => {
        const key = t.departure_date ?? 'unknown';
        (acc[key] ??= []).push(t);
        return acc;
    }, {});

    const sortedDates = Object.keys(grouped).sort();

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Planning Conducteurs</h1>
                <p className="text-admin-muted text-sm mt-0.5">Affectation des conducteurs aux trajets — 21 jours glissants</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <div className="lg:col-span-3 space-y-4">
                    {sortedDates.map(date => (
                        <motion.div key={date} variants={fadeUp} initial="initial" animate="animate"
                            className="bg-admin-card rounded-xl border border-white/5 overflow-hidden"
                        >
                            <div className="p-3 bg-white/5 flex items-center gap-2">
                                <CalendarDays size={14} className="text-primary-container" />
                                <span className="text-sm font-semibold text-white">
                                    {new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </span>
                            </div>
                            <div className="divide-y divide-white/5">
                                {grouped[date].map(trip => (
                                    <div key={trip.id} className="p-4 flex items-center gap-4 flex-wrap">
                                        <div className="flex items-center gap-2 min-w-[100px]">
                                            <Clock size={14} className="text-admin-muted" />
                                            <span className="text-sm font-mono text-white font-semibold">{trip.departure_time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                                            <MapPin size={14} className="text-admin-muted" />
                                            <span className="text-sm text-admin-text">{trip.departure_city} → {trip.arrival_city}</span>
                                        </div>
                                        <div className="flex items-center gap-2 min-w-[100px]">
                                            <Bus size={14} className="text-admin-muted" />
                                            <span className="text-xs text-admin-muted font-mono">{trip.vehicle}</span>
                                        </div>
                                        <div className="flex items-center gap-2 min-w-[120px]">
                                            <Users size={14} className="text-admin-muted" />
                                            <span className="text-xs text-admin-muted">{trip.booked_seats}/{trip.capacity}</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                            <UserCheck size={14} className={trip.driver_name ? 'text-status-green-text' : 'text-status-red-text'} />
                                            {trip.driver_name ? (
                                                <span className="text-sm text-white">{trip.driver_name}</span>
                                            ) : (
                                                <select value={data.driver_id} onChange={e => {
                                                    setData({ trip_id: trip.id, driver_id: parseInt(e.target.value) });
                                                    post(route('admin.planning.assign'));
                                                }}
                                                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-admin-muted focus:outline-none focus:border-primary"
                                                >
                                                    <option value={0}>Assigner...</option>
                                                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                </select>
                                            )}
                                        </div>
                                        <div className="min-w-[80px] text-right">
                                            <StatusBadge status={trip.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                    {sortedDates.length === 0 && (
                        <p className="text-admin-muted text-sm text-center py-8">Aucun trajet programmé sur cette période.</p>
                    )}
                </div>

                {/* Conducteurs */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                        <div className="p-4">
                            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                                <Users size={16} className="text-primary-container" /> Conducteurs ({drivers.length})
                            </h3>
                        </div>
                        <div className="divide-y divide-white/5">
                            {drivers.map(d => (
                                <div key={d.id} className="p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary-container flex items-center justify-center text-xs font-bold">{d.name.slice(0, 2).toUpperCase()}</div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{d.name}</p>
                                        <p className="text-xs text-admin-muted font-mono">{d.phone}</p>
                                    </div>
                                </div>
                            ))}
                            {drivers.length === 0 && <p className="text-admin-muted text-sm text-center py-6">Aucun conducteur actif.</p>}
                        </div>
                    </div>

                    <div className="bg-admin-card rounded-xl border border-white/5 p-4">
                        <h3 className="font-semibold text-white text-sm mb-3">Statistiques</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-admin-muted">Trajets programmés</span>
                                <span className="text-white font-bold">{trips.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-admin-muted">Avec conducteur</span>
                                <span className="text-status-green-text font-bold">{trips.filter(t => t.driver_name).length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-admin-muted">Sans conducteur</span>
                                <span className="text-status-red-text font-bold">{trips.filter(t => !t.driver_name).length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Planning.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Planning" breadcrumbs={[{ label: 'Flotte' }, { label: 'Planning' }]}>
        {page}
    </BackOfficeLayout>
);