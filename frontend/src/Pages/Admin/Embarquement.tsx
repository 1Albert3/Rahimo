
import { motion } from 'framer-motion';
import { CheckCircle, QrCode, Scan, XCircle, Bus, User, MapPin } from 'lucide-react';
import { useState } from 'react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { formatFCFA } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import api from '@/api/client';



interface BoardingResult {
    valid: boolean;
    message: string;
    booking?: {
        id: number;
        booking_number: string;
        passenger_name: string;
        passenger_phone: string;
        seat_numbers: number[];
        status: string;
        trip: { departure_city: string; arrival_city: string; departure_time: string; vehicle: string } | null;
    };
}

export default function Embarquement({ }: PageProps) {
    const { user } = useAuth();
    const isDriver = user?.role === 'chauffeur';
    const prefix = isDriver ? 'driver' : 'admin';
    const [qrInput, setQrInput] = useState('');
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState<BoardingResult | null>(null);
    const [confirming, setConfirming] = useState(false);

    const verify = async () => {
        if (!qrInput.trim()) return;
        setChecking(true);
        setResult(null);
        try {
            const { data } = await api.post(`/${prefix}/embarquement/verifier`, { qr_data: qrInput.trim() });
            setResult(data);
        } catch {
            setResult({ valid: false, message: 'Erreur de vérification.' });
        }
        setChecking(false);
    };

    const confirmBoardingAction = async () => {
        if (!result?.booking) return;
        setConfirming(true);
        try {
            await api.post(`/${prefix}/embarquement/confirmer`, { booking_id: result.booking.id });
            setResult({ valid: true, message: 'Embarquement confirmé !' });
        } catch { /* ignore */ }
        setConfirming(false);
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-dark">Scan QR Embarquement</h1>
                <p className="text-on-surface-variant text-sm mt-0.5">Vérifier les billets des passagers à l'embarquement</p>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-outline shadow-xl p-6 space-y-4"
            >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gris-surface rounded-xl flex items-center justify-center">
                        <Scan size={22} className="text-primary" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-slate-dark text-sm">Scanner un billet</h2>
                        <p className="text-xs text-on-surface-variant">Saisissez le numéro de réservation ou scannez le QR code</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <input type="text" value={qrInput} onChange={(e) => setQrInput(e.target.value)}
                        placeholder="BK202505250001 ou scan QR..."
                        className="flex-1 px-4 py-3 bg-gris-surface border border-outline rounded-xl text-sm text-slate-dark placeholder-on-surface-variant focus:border-primary outline-none transition-all font-mono"
                        onKeyDown={(e) => e.key === 'Enter' && verify()}
                    />
                    <button onClick={verify} disabled={checking || !qrInput.trim()}
                        className="bg-primary text-on-primary px-5 py-3 rounded-xl font-semibold text-sm hover:bg-kinetic-red-hover transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <QrCode size={16} /> {checking ? 'Vérification...' : 'Vérifier'}
                    </button>
                </div>
            </motion.div>

            {result && (
                <motion.div initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`rounded-xl border shadow-sm ${
                        result.valid
                            ? 'bg-status-green-bg border-status-green-ring'
                            : 'bg-status-red-bg border-status-red-ring'
                    }`}
                >
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                result.valid ? 'bg-status-green-bg' : 'bg-status-red-bg'
                            }`}>
                                {result.valid ? (
                                    <CheckCircle size={26} className="text-status-green-text" />
                                ) : (
                                    <XCircle size={26} className="text-status-red-text" />
                                )}
                            </div>
                            <div>
                                <p className={`font-bold text-base ${result.valid ? 'text-status-green-text' : 'text-status-red-text'}`}>
                                    {result.valid ? 'Billet valide' : 'Billet invalide'}
                                </p>
                                <p className="text-xs text-on-surface-variant mt-0.5">{result.message}</p>
                            </div>
                        </div>

                        {result.booking && (
                            <div className="space-y-3.5 bg-white/80 rounded-xl p-4 border border-white/60">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gris-surface flex items-center justify-center">
                                        <User size={14} className="text-on-surface-variant" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-slate-dark">{result.booking.passenger_name}</p>
                                        <p className="text-xs text-on-surface-variant">{result.booking.passenger_phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 text-xs text-on-surface-variant">
                                    <Bus size={12} className="mt-0.5 shrink-0" />
                                    {result.booking.trip && (
                                        <span>
                                            {result.booking.trip.departure_city} → {result.booking.trip.arrival_city}
                                            <span className="mx-1.5">·</span>
                                            {result.booking.trip.departure_time}
                                            <span className="mx-1.5">·</span>
                                            Bus {result.booking.trip.vehicle}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-start gap-2 text-xs text-on-surface-variant">
                                    <MapPin size={12} className="mt-0.5 shrink-0" />
                                    <span>
                                        Sièges: {result.booking.seat_numbers.join(', ')}
                                        <span className="mx-1.5">·</span>
                                        N° {result.booking.booking_number}
                                    </span>
                                </div>

                                {result.valid && result.booking.status === 'confirmed' && (
                                    <button onClick={confirmBoardingAction} disabled={confirming}
                                        className="w-full bg-status-green-text text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all active:scale-[0.98] mt-2 disabled:opacity-50"
                                    >
                                        {confirming ? 'Confirmation...' : 'Confirmer l\'embarquement'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

function EmbarquementLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const isDriver = user?.role === 'chauffeur';
    const homeRoute = isDriver ? '/driver/trips' : '/admin/dashboard';
    return (
        <BackOfficeLayout title="Embarquement" breadcrumbs={[{ label: 'Tableau de bord', href: homeRoute }, { label: 'Embarquement' }]}>
            {children}
        </BackOfficeLayout>
    );
}
