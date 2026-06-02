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
                <h1 className="text-xl font-bold text-slate-dark">Planning Conducteurs</h1>
                <p className="text-on-surface-variant text-sm mt-0.5">Affectation des conducteurs aux trajets — 21 jours glissants</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <div className="lg:col-span-3 space-y-4">
                    {sortedDates.map(date => (
                        <motion.div key={date} variants={fadeUp} initial="initial" animate="animate"
                            className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden"
                        >
                            <div className="p-3 bg-gris-surface flex items-center gap-2">
                                <CalendarDays size={14} className="text-primary" />
                                <span className="text-sm font-semibold text-slate-dark">
                                    {new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </span>
                            </div>
                            <div className="space-y-3 p-4">
                                {grouped[date].map(trip => {
                                    const s = trip.status;
                                    const isGreen = s === 'en_cours' || s === 'in_progress' || s === 'en_route';
                                    const isGray  = s === 'completed' || s === 'termine' || s === 'closed';
                                    const isRed   = s === 'cancelled' || s === 'annule' || s === 'retarde';
                                    const borderCls = isGreen ? 'border-l-status-green-ring' : isGray ? 'border-l-outline' : isRed ? 'border-l-status-red-ring' : 'border-l-primary';
                                    const iconCls   = isGreen ? 'bg-status-green-bg/30 text-status-green-text' : isGray ? 'bg-gris-surface text-on-surface-variant' : isRed ? 'bg-status-red-bg/30 text-status-red-text' : 'bg-primary/10 text-primary';
                                    return (
                                        <div key={trip.id}
                                            className={`bg-white rounded-xl border border-outline shadow-sm transition-all hover:shadow-md border-l-4 ${borderCls}`}
                                        >
                                            <div className="p-5 flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                                    <div className={`w-12 h-12 rounded-xl ${iconCls} flex items-center justify-center shrink-0`}>
                                                        <Clock size={22} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-slate-dark text-sm flex items-center gap-2 flex-wrap">
                                                            <span className="text-base">{trip.departure_time}</span>
                                                            <span className="text-on-surface-variant font-normal">→</span>
                                                            <span className="text-on-surface-variant text-xs font-normal">{trip.arrival_time}</span>
                                                        </h3>
                                                        <p className="text-sm text-slate-dark mt-1.5 truncate font-medium">
                                                            {trip.departure_city} → {trip.arrival_city}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-2.5 text-xs text-on-surface-variant">
                                                            <span className="flex items-center gap-1.5"><Bus size={13} /> {trip.vehicle}</span>
                                                            <span className="flex items-center gap-1.5"><Users size={13} /> {trip.booked_seats}/{trip.capacity}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 flex flex-col items-end gap-2.5">
                                                    <StatusBadge status={trip.status} />
                                                    <div className="flex items-center gap-2">
                                                        <UserCheck size={14} className={trip.driver_name ? 'text-status-green-text' : 'text-status-red-text'} />
                                                        {trip.driver_name ? (
                                                            <span className="text-xs text-slate-dark font-semibold">{trip.driver_name}</span>
                                                        ) : (
                                                            <select value={data.driver_id} onChange={e => {
                                                                setData({ trip_id: trip.id, driver_id: parseInt(e.target.value) });
                                                                post(route('admin.planning.assign'));
                                                            }}
                                                                className="bg-gris-surface border border-outline rounded-lg px-2 py-1 text-xs text-on-surface-variant focus:outline-none focus:border-primary"
                                                            >
                                                                <option value={0}>Assigner...</option>
                                                                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                            </select>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}
                    {sortedDates.length === 0 && (
                        <p className="text-on-surface-variant text-sm text-center py-8">Aucun trajet programmé sur cette période.</p>
                    )}
                </div>

                {/* Conducteurs */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden">
                        <div className="p-4">
                            <h3 className="font-semibold text-slate-dark text-sm flex items-center gap-2">
                                <Users size={16} className="text-primary" /> Conducteurs ({drivers.length})
                            </h3>
                        </div>
                        <div className="divide-y divide-outline">
                            {drivers.map(d => (
                                <div key={d.id} className="p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">{d.name.slice(0, 2).toUpperCase()}</div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-dark">{d.name}</p>
                                        <p className="text-xs text-on-surface-variant font-mono">{d.phone}</p>
                                    </div>
                                </div>
                            ))}
                            {drivers.length === 0 && <p className="text-on-surface-variant text-sm text-center py-6">Aucun conducteur actif.</p>}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-outline shadow-sm p-4">
                        <h3 className="font-semibold text-slate-dark text-sm mb-3">Statistiques</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-on-surface-variant">Trajets programmés</span>
                                <span className="text-slate-dark font-bold">{trips.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-on-surface-variant">Avec conducteur</span>
                                <span className="text-status-green-text font-bold">{trips.filter(t => t.driver_name).length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-on-surface-variant">Sans conducteur</span>
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