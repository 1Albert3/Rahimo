import { motion } from 'framer-motion';
import { CheckCircle, Download, Home, QrCode, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GuestLayout from '@/Layouts/GuestLayout';
import { formatFCFA } from '@/lib/utils';
import { getBooking, pdfUrl, type Booking } from '@/api/bookings';
import { Link } from 'react-router-dom';

function cityCode(city: string): string { return city.slice(0, 3).toUpperCase(); }

function formatDate(dateStr?: string): string {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    const months = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Confirmation() {
    const { id } = useParams<{ id: string }>();
    const [billet, setBillet] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        getBooking(parseInt(id)).then(setBillet).catch(() => {}).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <GuestLayout title="Confirmation" activeNav="Réservation"><div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div></GuestLayout>;

    if (!billet) return (
        <div className="w-full max-w-lg mx-auto px-4 py-8 sm:py-12 text-center">
            <p className="text-on-surface-variant">Aucune réservation trouvée.</p>
            <Link to="/voyages" className="text-primary hover:underline mt-4 inline-block">Rechercher un voyage</Link>
        </div>
    );

    const b = billet;
    const trip = b.trip;

    const shareWhatsApp = () => {
        const msg = `*Rahimo Transport* 🚌\nN°: ${b.booking_number}\n${trip?.departure_city} → ${trip?.arrival_city}\n${trip?.departure_date} à ${trip?.departure_time}\nSiège: ${b.seat_numbers?.join(', ')}\nTotal: ${formatFCFA(b.total_price)}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-16">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 100, damping: 20 }} className="text-center mb-8">
                <div className="w-16 h-16 bg-gris-surface rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-dark mb-2">Réservation Confirmée !</h1>
                <p className="text-on-surface-variant font-medium">E-ticket envoyé par SMS au {b.passenger_phone}.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, type: 'spring', stiffness: 100, damping: 20 }}
                className="relative bg-white rounded-xl shadow-xl overflow-hidden flex flex-col md:flex-row group transition-all duration-300"
            >
                <div className="flex-1 p-6 md:p-8 relative">
                    <div className="flex justify-between items-start mb-8">
                        <div className="text-xl font-black text-primary italic tracking-tighter">Rahimo</div>
                        <div className="bg-secondary-container text-on-secondary-container text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Standard</div>
                    </div>
                    <div className="flex items-center justify-between mb-10">
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-dark">{trip ? cityCode(trip.departure_city) : '---'}</div>
                            <div className="text-sm text-on-surface-variant uppercase tracking-widest font-bold mt-1">{trip?.departure_city}</div>
                        </div>
                        <div className="flex-1 flex flex-col items-center px-4">
                            <div className="w-full h-px bg-gris-surface relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-dark">{trip ? cityCode(trip.arrival_city) : '---'}</div>
                            <div className="text-sm text-on-surface-variant uppercase tracking-widest font-bold mt-1">{trip?.arrival_city}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        {[
                            { label: 'Passager', val: b.passenger_name },
                            { label: 'Date', val: formatDate(b.booking_date) },
                            { label: 'Départ', val: trip?.departure_time },
                            { label: 'Siège', val: b.seat_numbers?.join(', ') },
                        ].map(({ label, val }) => (
                            <div key={label}>
                                <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">{label}</div>
                                <div className="font-bold text-slate-dark">{val}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="hidden md:flex flex-col justify-center items-center relative w-8">
                    <div className="w-4 h-4 bg-surface rounded-full absolute -top-2" />
                    <div className="h-full w-px border-l-2 border-dashed border-on-surface-variant opacity-30" />
                    <div className="w-4 h-4 bg-surface rounded-full absolute -bottom-2" />
                </div>

                <div className="w-full md:w-72 bg-white p-8 flex flex-col items-center justify-center relative">
                    <div className="text-center mb-6 w-full">
                        <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">Billet N°</div>
                        <div className="font-mono font-bold text-lg text-slate-dark bg-gris-surface py-2 px-4 rounded-md">{b.booking_number}</div>
                    </div>
                    <div className="w-48 h-48 bg-white border border-outline rounded-xl p-2 flex items-center justify-center shadow-sm">
                        {b.qr_code && b.qr_code.startsWith('http') ? (
                            <img src={b.qr_code} alt="QR Code" className="w-full h-full object-contain" />
                        ) : (
                            <div className="w-full h-full bg-gris-surface rounded-lg flex items-center justify-center">
                                <QrCode size={40} className="text-primary" />
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-on-surface-variant text-center mt-6">Scannez à l'entrée du véhicule.</p>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
                <a href={pdfUrl(b.id)} className="flex items-center gap-2 px-6 py-3 bg-secondary-container text-on-secondary-container rounded-lg font-bold text-sm hover:brightness-95 transition-all shadow-sm">
                    <Download size={14} /> Télécharger PDF
                </a>
                <button onClick={shareWhatsApp} className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-bold text-sm hover:opacity-90 transition-all shadow-xl">
                    <Share2 size={14} /> Partager WhatsApp
                </button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-3 mt-5 justify-center">
                <Link to="/mon-espace" className="flex-1 max-w-xs text-center bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-sm shadow-xl">
                    Mes Tickets
                </Link>
                <Link to="/" className="flex-1 max-w-xs text-center text-slate-dark font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gris-surface transition-colors text-sm">
                    <Home size={15} /> Accueil
                </Link>
            </motion.div>
        </div>
    );
}
