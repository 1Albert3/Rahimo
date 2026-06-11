import { motion } from 'framer-motion';
import { Bus, Clock, MapPin, Users } from 'lucide-react';
import DriverLayout from '@/Layouts/DriverLayout';
import StatusBadge from '@/Components/StatusBadge';
import type { PageProps } from '@/types';

interface TripItem {
    id: number;
    trip_number: string;
    departure_city: string;
    arrival_city: string;
    departure_time: string;
    arrival_time: string;
    departure_date: string;
    vehicle: string;
    booked_seats: number;
    total_seats: number;
    fill_rate: number;
    status: string;
}

interface Props extends PageProps {
    trips: TripItem[];
    currentTrip: TripItem | null;
}

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function DriverTrips({ trips, currentTrip }: Props) {
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-dark">Mes Trajets</h1>
                <p className="text-on-surface-variant text-sm mt-0.5">Vos trajets assignés</p>
            </div>

            {currentTrip && (
                <motion.div variants={fadeUp} initial="initial" animate="animate"
                    className="bg-white rounded-xl border border-status-green-ring/30 p-5 shadow-sm"
                >
                    <div className="flex items-center gap-2 text-status-green-text text-xs font-semibold uppercase tracking-wider mb-3">
                        <Clock size={14} /> Trajet en cours
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <p className="text-lg font-bold text-slate-dark">{currentTrip.trip_number}</p>
                            <p className="text-slate-dark flex items-center gap-1 mt-1">
                                <MapPin size={14} /> {currentTrip.departure_city} → {currentTrip.arrival_city}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-on-surface-variant text-xs">{currentTrip.departure_date}</p>
                            <p className="text-slate-dark font-semibold">{currentTrip.departure_time} - {currentTrip.arrival_time}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm">
                        <span className="text-on-surface-variant"><Bus size={14} className="inline mr-1" />{currentTrip.vehicle}</span>
                        <span className="text-on-surface-variant"><Users size={14} className="inline mr-1" />{currentTrip.booked_seats}/{currentTrip.total_seats} places</span>
                    </div>
                </motion.div>
            )}

            <motion.div variants={stagger} initial="initial" animate="animate"
                className="bg-white rounded-xl border border-outline overflow-hidden shadow-sm"
            >
                <div className="overflow-x-auto min-w-[600px] lg:min-w-0">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                            <tr>
                                {['N° Trajet', 'Date', 'Trajet', 'Horaire', 'Véhicule', 'Occupation', 'Statut'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="">
                            {trips.map((t) => {
                                const s = t.status;
                                const isGreen = s === 'en_cours' || s === 'completed' || s === 'termine';
                                const isYellow = s === 'scheduled' || s === 'pending';
                                const borderCls = isGreen ? 'border-l-status-green-ring' : isYellow ? 'border-l-status-yellow-ring' : s === 'cancelled' || s === 'annule' ? 'border-l-status-red-ring' : 'border-l-outline';
                                return (
                                <tr key={t.id} className={`hover:bg-gris-surface transition-colors border-l-4 ${borderCls}`}>
                                    <td className="px-4 py-3 font-semibold text-slate-dark">{t.trip_number}</td>
                                    <td className="px-4 py-3 text-on-surface-variant text-xs">{t.departure_date}</td>
                                    <td className="px-4 py-3 text-slate-dark">{t.departure_city} → {t.arrival_city}</td>
                                    <td className="px-4 py-3 text-on-surface-variant text-xs">{t.departure_time} - {t.arrival_time}</td>
                                    <td className="px-4 py-3 text-on-surface-variant text-xs">{t.vehicle}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-gris-surface rounded-full max-w-[80px]">
                                                <div className="h-full bg-primary/10 rounded-full" style={{ width: `${t.fill_rate}%` }} />
                                            </div>
                                            <span className="text-xs text-on-surface-variant">{t.booked_seats}/{t.total_seats}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                                </tr>
                                );
                            })}
                            {trips.length === 0 && (
                                <tr><td colSpan={7} className="text-center py-8 text-on-surface-variant text-sm">Aucun trajet assigné</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}

DriverTrips.layout = (page: React.ReactNode) => (
    <DriverLayout title="Mes Trajets" breadcrumbs={[{ label: 'Mes Trajets' }]}>
        {page}
    </DriverLayout>
);
