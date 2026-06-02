import { Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    AlertTriangle, Award, Calendar, Clock, Download, History, Package,
    QrCode, RefreshCw, Share2, Ticket, X,
} from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import StatusBadge from '@/Components/StatusBadge';
import { formatFCFA } from '@/lib/utils';
import type { Billet, Fidelite, PageProps } from '@/types';

interface ColisItem {
    id: number;
    tracking_number: string;
    departure_city: string;
    arrival_city: string;
    weight: number | null;
    status: string;
    price: number;
    description: string | null;
    expedition_date: string | null;
}

interface ActivityItem {
    action: string;
    description: string | null;
    created_at: string;
}

interface Props extends PageProps {
    billets?: Billet[];
    colis?: ColisItem[];
    points_fidelite?: number;
    fidelite?: Fidelite;
    recent_activity?: ActivityItem[];
}

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const COLIS_STATUS_MAP: Record<string, string> = {
    en_attente: 'En attente', en_cours: 'En transit', livre: 'Livré', annule: 'Annulé',
};
const FILTERS = [
    { key: 'all', label: 'Tous' },
    { key: 'upcoming', label: 'À venir' },
    { key: 'past', label: 'Passés' },
    { key: 'cancelled', label: 'Annulés' },
] as const;
type FilterKey = (typeof FILTERS)[number]['key'];

interface TripOption {
    id: number;
    departure_time: string;
    departure_date: string;
    arrival_time: string;
    departure_city: string;
    arrival_city: string;
    price: number;
    available_seats: number;
}

function StatCard({ icon: Icon, label, val, accent }: { icon: React.ElementType; label: string; val: string | number; accent: string }) {
    return (
        <motion.div variants={fadeUp}
            className="bg-white rounded-xl shadow-xl p-5 flex items-center gap-4"
        >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-2xl font-black text-slate-dark">{val}</p>
                <p className="text-xs text-on-surface-variant">{label}</p>
            </div>
        </motion.div>
    );
}

function CancelModal({ billet, onClose }: { billet: Billet; onClose: () => void }) {
    const { post, processing } = useForm();

    const pct = billet.refund_percentage ?? 0;
    const amount = billet.refund_amount ?? 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-slate-dark">Annuler la réservation</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gris-surface rounded-lg"><X size={18} /></button>
                </div>
                <div className="bg-status-red-bg rounded-xl p-4 mb-4 flex items-start gap-3">
                    <AlertTriangle size={20} className="text-status-red-text shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-sm text-status-red-text mb-1">Politique d'annulation</p>
                        <ul className="text-xs text-status-red-text/80 space-y-1">
                            <li>• {'>'}24h avant départ → remboursement intégral (100%)</li>
                            <li>• 6-24h avant départ → remboursement 50%</li>
                            <li>• {'<'}6h avant départ → non remboursable</li>
                        </ul>
                    </div>
                </div>
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Billet</span><span className="font-bold">{billet.booking_number}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Total payé</span><span className="font-bold">{formatFCFA(billet.total_price)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Remboursement</span><span className="font-bold text-status-red-text">{pct}% — {formatFCFA(amount)}</span></div>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-outline text-slate-dark font-semibold text-sm hover:bg-gris-surface transition-colors"
                    >Conserver</button>
                    <button onClick={() => post(route('booking.cancel', { booking: billet.id }))} disabled={processing}
                        className="flex-1 py-2.5 rounded-xl bg-status-red-text text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >Confirmer l'annulation</button>
                </div>
            </div>
        </div>
    );
}

function RescheduleModal({ billet, onClose }: { billet: Billet; onClose: () => void }) {
    const { post, data, setData, processing, errors } = useForm({ new_trip_id: 0 });
    const [trips, setTrips] = useState<TripOption[]>([]);
    const [searching, setSearching] = useState(false);
    const [searched, setSearched] = useState(false);

    const searchTrips = async () => {
        setSearching(true);
        try {
            const res = await fetch(`/voyages?departure=${billet.trip?.departure_city}&arrival=${billet.trip?.arrival_city}`);
            const json = await res.json();
            setTrips(json.trips ?? []);
        } catch { }
        setSearching(false);
        setSearched(true);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-slate-dark">Reporter le voyage</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gris-surface rounded-lg"><X size={18} /></button>
                </div>
                <p className="text-sm text-on-surface-variant mb-4">
                    {billet.trip?.departure_city} → {billet.trip?.arrival_city} · {billet.seats_count} place{billet.seats_count > 1 ? 's' : ''}
                </p>
                {!searched ? (
                    <button onClick={searchTrips} disabled={searching || processing}
                        className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >{searching ? 'Recherche...' : 'Chercher les disponibilités'}</button>
                ) : (
                    <div className="space-y-2">
                        {trips.length === 0 && <p className="text-sm text-on-surface-variant text-center py-4">Aucun trajet disponible.</p>}
                        {trips.map((t: TripOption) => (
                            <label key={t.id}
                                className={`block p-3 rounded-xl border-2 cursor-pointer transition-all ${data.new_trip_id === t.id ? 'border-primary bg-white' : 'border-outline hover:border-primary/50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <input type="radio" name="new_trip" value={t.id}
                                        checked={data.new_trip_id === t.id}
                                        onChange={() => setData('new_trip_id', t.id)}
                                        className="accent-primary"
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-slate-dark">{t.departure_city} → {t.arrival_city}</p>
                                        <p className="text-xs text-on-surface-variant">{t.departure_date} · {t.departure_time} · {t.available_seats} places</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-sm text-slate-dark">{formatFCFA(t.price)}</p>
                                    </div>
                                </div>
                            </label>
                        ))}
                        {trips.length > 0 && (
                            <button onClick={() => post(route('booking.reschedule', { booking: billet.id }))} disabled={!data.new_trip_id || processing}
                                className="w-full mt-3 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                            >Confirmer le report</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function ChangeSeatModal({ billet, onClose }: { billet: Billet; onClose: () => void }) {
    const { post, data, setData, processing } = useForm({ seat_numbers: [] as number[] });
    const [seats, setSeats] = useState<{ numero: number; libre: boolean }[]>([]);
    const [loading, setLoading] = useState(false);

    const loadSeats = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/voyages/${billet.trip?.id}/sieges`);
            const json = await res.json();
            setSeats(json.sieges ?? []);
        } catch { }
        setLoading(false);
    };

    const toggleSeat = (num: number) => {
        if (data.seat_numbers.includes(num)) {
            setData('seat_numbers', data.seat_numbers.filter(s => s !== num));
        } else {
            if (data.seat_numbers.length < (billet.seats_count ?? 1)) {
                setData('seat_numbers', [...data.seat_numbers, num]);
            }
        }
    };

    const cols = Math.ceil(Math.sqrt(seats.length || 40));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-slate-dark">Changer de siège</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gris-surface rounded-lg"><X size={18} /></button>
                </div>
                <p className="text-xs text-on-surface-variant mb-3">Sélectionnez {billet.seats_count} place{billet.seats_count > 1 ? 's' : ''}</p>
                {seats.length === 0 && !loading && (
                    <button onClick={loadSeats}
                        className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-opacity"
                    >Afficher le plan du bus</button>
                )}
                {loading && <p className="text-center text-sm text-on-surface-variant py-4">Chargement...</p>}
                {seats.length > 0 && (
                    <>
                        <div className="flex flex-wrap gap-1.5 justify-center mb-4"
                            style={{ maxWidth: `${cols * 44 + 8}px`, margin: '0 auto' }}
                        >
                            {seats.map(s => {
                                const selected = data.seat_numbers.includes(s.numero);
                                const disabled = !s.libre && !selected;
                                return (
                                    <button key={s.numero} disabled={disabled} onClick={() => toggleSeat(s.numero)}
                                        className={`w-9 h-9 rounded-lg text-[10px] font-bold transition-all ${
                                            selected ? 'bg-primary text-white scale-110 shadow-xl' :
                                            s.libre ? 'bg-gris-surface text-slate-dark hover:bg-white hover:text-primary' :
                                            'bg-gris-surface text-on-surface-variant/30 cursor-not-allowed'
                                        }`}
                                        title={`Siège ${s.numero}${s.libre ? ' - Libre' : ' - Occupé'}`}
                                    >{s.numero}</button>
                                );
                            })}
                        </div>
                        <button onClick={() => post(route('booking.change-seat', { booking: billet.id }))} disabled={data.seat_numbers.length !== (billet.seats_count ?? 1) || processing}
                            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                        >Confirmer les sièges</button>
                    </>
                )}
            </div>
        </div>
    );
}

function BilletActions({ billet, onCancel, onReschedule, onChangeSeat }: {
    billet: Billet;
    onCancel: () => void;
    onReschedule: () => void;
    onChangeSeat: () => void;
}) {
    const shareWhatsApp = () => {
        const trip = billet.trip;
        const msg = `*Rahimo Transport* 🚌\nN°: ${billet.booking_number}\n${trip?.departure_city} → ${trip?.arrival_city}\n${trip?.departure_date} à ${trip?.departure_time}\nSiège: ${billet.seat_numbers?.join(', ')}\nTotal: ${formatFCFA(billet.total_price)}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    };

    if (billet.status === 'cancelled') return null;

    return (
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            <button onClick={shareWhatsApp}
                className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-status-green-bg text-status-green-text font-semibold hover:opacity-80 transition-opacity"
            ><Share2 size={12} /> WhatsApp</button>
            <a href={route('booking.pdf', { booking: billet.id })}
                className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-gris-surface text-slate-dark font-semibold hover:bg-gris-surface transition-colors"
            ><Download size={12} /> PDF</a>
            {billet.can_cancel && (
                <>
                    <button onClick={onReschedule}
                        className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-gris-surface text-slate-dark font-semibold hover:bg-gris-surface transition-colors"
                    ><RefreshCw size={12} /> Reporter</button>
                    <button onClick={onChangeSeat}
                        className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-gris-surface text-slate-dark font-semibold hover:bg-gris-surface transition-colors"
                    ><Ticket size={12} /> Siège</button>
                    <button onClick={onCancel}
                        className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-status-red-bg text-status-red-text font-semibold hover:opacity-80 transition-opacity"
                    ><X size={12} /> Annuler</button>
                </>
            )}
        </div>
    );
}

export default function ClientDashboard({ billets, colis, points_fidelite, fidelite, recent_activity }: Props) {
    const [filter, setFilter] = useState<FilterKey>('all');
    const [cancelTarget, setCancelTarget] = useState<Billet | null>(null);
    const [rescheduleTarget, setRescheduleTarget] = useState<Billet | null>(null);
    const [changeSeatTarget, setChangeSeatTarget] = useState<Billet | null>(null);

    const myBillets = billets ?? [];
    const myColis = colis ?? [];
    const points = points_fidelite ?? 0;
    const loy = fidelite;
    const activity = recent_activity ?? [];

    const now = new Date();

    const filtered = myBillets.filter(b => {
        if (filter === 'all') return true;
        if (filter === 'cancelled') return b.status === 'cancelled';
        if (filter === 'past') {
            if (b.status === 'cancelled') return false;
            return b.trip?.departure_date ? new Date(b.trip.departure_date) < now : false;
        }
        if (filter === 'upcoming') {
            if (b.status === 'cancelled') return false;
            return b.trip?.departure_date ? new Date(b.trip.departure_date) >= now : true;
        }
        return true;
    });

    const activeTickets = myBillets.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
    const activeColis = myColis.filter(c => c.status === 'en_cours' || c.status === 'en_attente').length;

    return (
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-10">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-dark tracking-tight mb-1">Mon Espace</h1>
                <p className="text-on-surface-variant text-sm">Gérez vos tickets, colis et programme de fidélité</p>
            </div>

            <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" variants={stagger} initial="initial" animate="animate">
                <StatCard icon={Ticket} label="Tickets actifs" val={activeTickets} accent="bg-white text-primary" />
                <StatCard icon={Package} label="Colis en cours" val={activeColis} accent="bg-status-blue-bg text-status-blue-text" />
                <StatCard icon={Award} label="Points fidélité" val={points.toLocaleString('fr-FR')} accent="bg-sahel-yellow/10 text-status-yellow-text" />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {/* Tickets */}
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-slate-dark flex items-center gap-2 text-sm">
                            <Ticket size={16} className="text-primary" /> Mes Tickets
                        </h2>
                        <Link href={route('trips.search')} className="text-xs text-primary hover:underline font-semibold">+ Nouveau ticket</Link>
                    </div>

                    {/* Filtres */}
                    <div className="flex gap-1.5 bg-gris-surface p-1 rounded-xl w-fit">
                        {FILTERS.map(f => (
                            <button key={f.key} onClick={() => setFilter(f.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    filter === f.key ? 'bg-white text-slate-dark shadow-sm' : 'text-on-surface-variant hover:text-slate-dark'
                                }`}
                            >{f.label}</button>
                        ))}
                    </div>

                    {/* Liste tickets */}
                    <motion.div className="space-y-3" variants={stagger} initial="initial" animate="animate">
                        {filtered.length === 0 && (
                            <div className="bg-white rounded-xl shadow-xl p-8 text-center">
                                <p className="text-on-surface-variant text-sm">Aucun ticket trouvé.</p>
                                {filter !== 'all' && <button onClick={() => setFilter('all')} className="text-primary hover:underline text-sm mt-2">Voir tous</button>}
                                {filter === 'all' && <Link href={route('trips.search')} className="text-primary hover:underline text-sm mt-2 inline-block">Réserver un voyage</Link>}
                            </div>
                        )}
                        {filtered.map((b) => {
                            const s = b.status;
                            const borderCls = s === 'confirmed' ? 'border-l-status-green-ring' : s === 'pending' ? 'border-l-status-yellow-ring' : s === 'cancelled' || s === 'annule' ? 'border-l-status-red-ring' : 'border-l-primary';
                            return (
                            <motion.div key={b.id} variants={fadeUp}
                                className={`bg-white rounded-xl shadow-xl p-5 hover:shadow-xl transition-shadow border-l-4 ${borderCls}`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="font-mono text-xs font-black text-primary">{b.booking_number}</span>
                                            <StatusBadge status={b.status === 'confirmed' ? 'confirme' : b.status} />
                                            {b.payment_status === 'paid' && (
                                                <span className="text-[10px] bg-status-green-bg text-status-green-text px-1.5 py-0.5 rounded-full font-semibold">Payé</span>
                                            )}
                                            {b.refund_policy && b.can_cancel && (
                                                <span className="text-[10px] bg-gris-surface text-on-surface-variant px-1.5 py-0.5 rounded-full font-semibold" title={b.refund_policy}>{b.refund_policy}</span>
                                            )}
                                        </div>
                                        <p className="font-semibold text-slate-dark text-sm">{b.trip?.departure_city} → {b.trip?.arrival_city}</p>
                                        <p className="text-xs text-on-surface-variant mt-0.5">
                                            {b.trip?.departure_date ? new Date(b.trip.departure_date).toLocaleDateString('fr-FR') : ''} · {b.trip?.departure_time} · {b.seats_count} place{b.seats_count > 1 ? 's' : ''}
                                        </p>
                                        <BilletActions
                                            billet={b}
                                            onCancel={() => setCancelTarget(b)}
                                            onReschedule={() => setRescheduleTarget(b)}
                                            onChangeSeat={() => setChangeSeatTarget(b)}
                                        />
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-black text-slate-dark">{formatFCFA(b.total_price)}</p>
                                        <div className="flex items-center gap-2 mt-1.5 justify-end">
                                            {b.qr_code && b.qr_code.startsWith('http') && (
                                                <img src={b.qr_code} alt="QR" className="w-6 h-6" />
                                            )}
                                            <Link href={route('trips.confirmation', { booking: b.id })}
                                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                                            >
                                                <QrCode size={11} /> Voir
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Activité récente */}
                    {activity.length > 0 && (
                        <div className="mt-6">
                            <h2 className="font-bold text-slate-dark flex items-center gap-2 text-sm mb-3">
                                <History size={16} className="text-on-surface-variant" /> Activité récente
                            </h2>
                            <div className="bg-white rounded-xl shadow-xl">
                                {activity.map((a, i) => (
                                    <div key={i} className="flex items-center gap-3 px-5 py-3">
                                        <Clock size={14} className="text-on-surface-variant shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-dark truncate">{a.description ?? a.action}</p>
                                        </div>
                                        <span className="text-xs text-on-surface-variant shrink-0">{a.created_at}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Colis + Fidélité */}
                <div className="space-y-5">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-bold text-slate-dark flex items-center gap-2 text-sm">
                                <Package size={16} className="text-status-blue-text" /> Mes Colis
                            </h2>
                            <div className="flex items-center gap-2">
                                <Link href={route('colis.send')} className="text-xs text-primary hover:underline font-semibold">+ Envoyer</Link>
                                <Link href={route('colis.track')} className="text-xs text-primary hover:underline font-semibold">Suivre</Link>
                            </div>
                        </div>
                        {myColis.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-xl p-4 text-center">
                                <p className="text-xs text-on-surface-variant">Aucun colis</p>
                            </div>
                        ) : myColis.map((c) => {
                            const cs = c.status;
                            const cBorderCls = cs === 'livre' ? 'border-l-status-green-ring' : cs === 'en_cours' || cs === 'en_transit' ? 'border-l-status-yellow-ring' : cs === 'annule' ? 'border-l-status-red-ring' : 'border-l-primary';
                            return (
                            <div key={c.id} className={`bg-white rounded-xl shadow-xl p-4 mb-3 hover:shadow-xl transition-shadow border-l-4 ${cBorderCls}`}>
                                <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                                    <span className="font-mono text-xs font-black text-status-blue-text">{c.tracking_number}</span>
                                    <StatusBadge status={COLIS_STATUS_MAP[c.status] ?? c.status} />
                                </div>
                                <p className="text-sm text-slate-dark">{c.departure_city} → {c.arrival_city}</p>
                                {c.weight && <p className="text-xs text-on-surface-variant mt-0.5">{c.weight} kg · {formatFCFA(c.price)}</p>}
                                {c.expedition_date && <p className="text-xs text-on-surface-variant">Expédié le {c.expedition_date}</p>}
                            </div>
                            );
                        })}
                    </div>

                    {/* Fidélité */}
                    <div className="bg-primary rounded-xl p-5 text-white relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-10"><Award size={72} /></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <Award size={16} className="text-sahel-yellow" />
                                <span className="text-sm font-semibold">Programme Fidélité</span>
                            </div>
                            {loy && (
                                <div className="text-xs text-white/70 mb-3 flex items-center gap-2 flex-wrap">
                                    <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase">{loy.tier.label}</span>
                                    <span>— {loy.tier.discount}% de réduction</span>
                                </div>
                            )}
                            <p className="text-3xl font-black mb-0.5">{points.toLocaleString('fr-FR')}</p>
                            <p className="text-xs text-white/70 mb-4">points accumulés</p>
                            {loy?.next ? (
                                <>
                                    <div className="w-full bg-white/20 rounded-full h-1.5 mb-2">
                                        <div className="bg-sahel-yellow h-1.5 rounded-full transition-all" style={{ width: `${loy.progress}%` }} />
                                    </div>
                                    <p className="text-xs text-white/70">{loy.next.needed} points avant le palier {loy.next.label}</p>
                                </>
                            ) : (
                                <p className="text-xs text-white/70"><span className="text-sahel-yellow font-bold">Platine</span> — palier maximum atteint !</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {cancelTarget && <CancelModal billet={cancelTarget} onClose={() => setCancelTarget(null)} />}
            {rescheduleTarget && <RescheduleModal billet={rescheduleTarget} onClose={() => setRescheduleTarget(null)} />}
            {changeSeatTarget && <ChangeSeatModal billet={changeSeatTarget} onClose={() => setChangeSeatTarget(null)} />}
        </div>
    );
}

ClientDashboard.layout = (page: React.ReactNode) => (
    <GuestLayout title="Mon Espace" activeNav="Mon Espace">{page}</GuestLayout>
);