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
                <h1 className="text-xl font-bold text-white">Mes Trajets</h1>
                <p className="text-admin-muted text-sm mt-0.5">Vos trajets assignés</p>
            </div>

            {currentTrip && (
                <motion.div variants={fadeUp} initial="initial" animate="animate"
                    className="bg-admin-card rounded-xl border border-status-green-ring/30 p-5"
                >
                    <div className="flex items-center gap-2 text-status-green-text text-xs font-semibold uppercase tracking-wider mb-3">
                        <Clock size={14} /> Trajet en cours
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <p className="text-lg font-bold text-white">{currentTrip.trip_number}</p>
                            <p className="text-admin-text flex items-center gap-1 mt-1">
                                <MapPin size={14} /> {currentTrip.departure_city} → {currentTrip.arrival_city}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-admin-muted text-xs">{currentTrip.departure_date}</p>
                            <p className="text-white font-semibold">{currentTrip.departure_time} - {currentTrip.arrival_time}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm">
                        <span className="text-admin-muted"><Bus size={14} className="inline mr-1" />{currentTrip.vehicle}</span>
                        <span className="text-admin-muted"><Users size={14} className="inline mr-1" />{currentTrip.booked_seats}/{currentTrip.total_seats} places</span>
                    </div>
                </motion.div>
            )}

            <motion.div variants={stagger} initial="initial" animate="animate"
                className="bg-admin-card rounded-xl border border-white/5 overflow-hidden"
            >
                <div className="overflow-x-auto min-w-[600px] lg:min-w-0">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['N° Trajet', 'Date', 'Trajet', 'Horaire', 'Véhicule', 'Occupation', 'Statut'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="">
                            {trips.map((t) => (
                                <tr key={t.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-white">{t.trip_number}</td>
                                    <td className="px-4 py-3 text-admin-muted text-xs">{t.departure_date}</td>
                                    <td className="px-4 py-3 text-admin-text">{t.departure_city} → {t.arrival_city}</td>
                                    <td className="px-4 py-3 text-admin-muted text-xs">{t.departure_time} - {t.arrival_time}</td>
                                    <td className="px-4 py-3 text-admin-muted text-xs">{t.vehicle}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-white/5 rounded-full max-w-[80px]">
                                                <div className="h-full bg-primary-container rounded-full" style={{ width: `${t.fill_rate}%` }} />
                                            </div>
                                            <span className="text-xs text-admin-muted">{t.booked_seats}/{t.total_seats}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                                </tr>
                            ))}
                            {trips.length === 0 && (
                                <tr><td colSpan={7} className="text-center py-8 text-admin-muted text-sm">Aucun trajet assigné</td></tr>
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
