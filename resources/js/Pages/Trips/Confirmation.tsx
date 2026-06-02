import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Home, QrCode, Share2 } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { formatFCFA } from '@/lib/utils';
import type { Billet, PageProps } from '@/types';

interface Props extends PageProps { billet?: Billet; }

function cityCode(city: string): string {
    return city.slice(0, 3).toUpperCase();
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Confirmation({ billet }: Props) {
    const b = billet;

    const shareWhatsApp = () => {
        if (!b) return;
        const trip = b.trip;
        const msg = `*Rahimo Transport* 🚌\nN°: ${b.booking_number}\n${trip?.departure_city} → ${trip?.arrival_city}\n${trip?.departure_date} à ${trip?.departure_time}\nSiège: ${b.seat_numbers?.join(', ')}\nTotal: ${formatFCFA(b.total_price)}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    };

    if (!b) {
        return (
            <div className="w-full max-w-lg mx-auto px-4 py-8 sm:py-12 text-center">
                <p className="text-on-surface-variant">Aucune réservation trouvée.</p>
                <Link href={route('trips.search')} className="text-primary hover:underline mt-4 inline-block">Rechercher un voyage</Link>
            </div>
        );
    }

    const trip = b.trip;

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-16">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                className="text-center mb-8"
            >
                <div className="w-16 h-16 bg-gris-surface rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-bold text-slate-dark mb-2 tracking-tight">Réservation Confirmée !</h1>
                <p className="text-on-surface-variant font-medium">E-ticket envoyé par SMS au {b.passenger_phone}.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 100, damping: 20 }}
                className="relative bg-white rounded-xl shadow-[0px_12px_32px_rgba(183,1,0,0.08)] overflow-hidden flex flex-col md:flex-row group transition-all duration-300"
            >
                <div className="absolute inset-0 border border-outline opacity-15 rounded-xl pointer-events-none" />

                <div className="flex-1 p-6 md:p-8 relative">
                    <div className="flex justify-between items-start mb-8">
                        <div className="text-xl font-black text-primary italic tracking-tighter">Rahimo</div>
                        <div className="bg-secondary-container text-on-secondary-container text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                            Standard
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-10">
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold font-bold tracking-tight text-slate-dark tracking-tighter -ml-1">
                                {trip ? cityCode(trip.departure_city) : '---'}
                            </div>
                            <div className="text-sm text-on-surface-variant uppercase tracking-widest font-bold mt-1">{trip?.departure_city}</div>
                        </div>

                        <div className="flex-1 flex flex-col items-center px-4 relative">
                            <span className="material-symbols-outlined text-primary mb-1 transform rotate-90 md:rotate-0">directions_bus</span>
                            <div className="w-full h-px bg-gris-surface relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                            </div>
                            <div className="text-xs text-on-surface-variant mt-2 font-medium">Direct &bull; {trip?.duration}</div>
                        </div>

                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold font-bold tracking-tight text-slate-dark tracking-tighter -mr-1">
                                {trip ? cityCode(trip.arrival_city) : '---'}
                            </div>
                            <div className="text-sm text-on-surface-variant uppercase tracking-widest font-bold mt-1">{trip?.arrival_city}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        <div>
                            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">Passager</div>
                            <div className="font-bold text-slate-dark">{b.passenger_name}</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">Date</div>
                            <div className="font-bold text-slate-dark">{formatDate(b.booking_date)}</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">Départ</div>
                            <div className="font-bold text-slate-dark">{trip?.departure_time}</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">Siège</div>
                            <div className="font-bold text-slate-dark text-primary">{b.seat_numbers?.join(', ')}</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gris-surface rounded-lg">
                        <span className="material-symbols-outlined text-primary">security</span>
                        <div className="text-sm text-on-surface-variant">
                            <p className="font-bold text-slate-dark mb-1">Contrôle de sécurité</p>
                            <p>Veuillez vous présenter 30 minutes avant le départ muni d'une pièce d'identité valide.</p>
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex flex-col justify-center items-center relative w-8">
                    <div className="w-4 h-4 bg-surface rounded-full absolute -top-2" />
                    <div className="h-full w-px border-l-2 border-dashed border-on-surface-variant opacity-30" />
                    <div className="w-4 h-4 bg-surface rounded-full absolute -bottom-2" />
                </div>

                <div className="md:hidden flex justify-center items-center relative h-8 w-full">
                    <div className="w-4 h-4 bg-surface rounded-full absolute -left-2" />
                    <div className="w-full h-px border-t-2 border-dashed border-on-surface-variant opacity-30" />
                    <div className="w-4 h-4 bg-surface rounded-full absolute -right-2" />
                </div>

                <div className="w-full md:w-72 bg-white p-8 flex flex-col items-center justify-center relative">
                    <div className="text-center mb-6 w-full">
                        <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">Billet N&deg;</div>
                        <div className="font-mono font-bold text-lg text-slate-dark bg-gris-surface py-2 px-4 rounded-md">{b.booking_number}</div>
                    </div>

                    <div className="w-48 h-48 bg-white border border-outline rounded-xl p-2 flex items-center justify-center shadow-sm relative group-hover:scale-105 transition-transform duration-300">
                        {b.qr_code && b.qr_code.startsWith('http') ? (
                            <img src={b.qr_code} alt="QR Code" className="w-full h-full object-contain" />
                        ) : (
                            <div className="w-full h-full bg-[radial-gradient(#1a1c1c_2px,transparent_2px)] [background-size:8px_8px] opacity-80 rounded-lg flex items-center justify-center">
                                <div className="bg-white p-2 rounded-md shadow-sm">
                                    <QrCode size={32} className="text-primary" />
                                </div>
                            </div>
                        )}
                    </div>
                    {b.qr_code && !b.qr_code.startsWith('http') && (
                        <p className="text-[10px] font-mono text-on-surface-variant mt-3 text-center tracking-widest">{b.qr_code}</p>
                    )}
                    <p className="text-xs text-on-surface-variant text-center mt-6">Scannez à l'entrée du véhicule.</p>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-end"
            >
                <a href={route('booking.pdf', { booking: b.id })}
                    className="flex items-center gap-2 px-6 py-3 bg-secondary-container text-on-secondary-container rounded-lg font-bold text-sm hover:brightness-95 transition-all shadow-sm"
                ><Download size={14} /> Télécharger PDF</a>
                <button onClick={shareWhatsApp}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-bold text-sm hover:opacity-90 transition-all shadow-[0px_12px_32px_rgba(183,1,0,0.08)]"
                ><Share2 size={14} /> Partager WhatsApp</button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 mt-5 justify-center"
            >
                <Link href={route('client.dashboard')}
                    className="flex-1 max-w-xs text-center bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-sm shadow-xl"
                >
                    Mes Tickets
                </Link>
                <Link href={route('welcome')}
                    className="flex-1 max-w-xs text-center text-slate-dark font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gris-surface transition-colors text-sm"
                >
                    <Home size={15} /> Accueil
                </Link>
            </motion.div>
        </div>
    );
}

Confirmation.layout = (page: React.ReactNode) => (
    <GuestLayout title="Confirmation" activeNav="Réservation">{page}</GuestLayout>
);
