import { useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CheckCircle, QrCode, Scan, XCircle, Bus, User, MapPin } from 'lucide-react';
import { useState } from 'react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { formatFCFA } from '@/lib/utils';
import type { PageProps } from '@/types';

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
    const { auth } = usePage<PageProps>().props;
    const isDriver = auth?.user?.role === 'chauffeur';
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
            const res = await fetch(route(`${prefix}.embarquement.verifier`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name=csrf-token]') as any)?.content ?? '' },
                body: JSON.stringify({ qr_data: qrInput.trim() }),
            });
            const data = await res.json();
            setResult(data);
        } catch {
            setResult({ valid: false, message: 'Erreur de vérification.' });
        }
        setChecking(false);
    };

    const confirmBoarding = async () => {
        if (!result?.booking) return;
        setConfirming(true);
        try {
            const formData = new FormData();
            formData.append('booking_id', result.booking.id.toString());
            const res = await fetch(route(`${prefix}.embarquement.confirmer`), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': (document.querySelector('meta[name=csrf-token]') as any)?.content ?? '' },
                body: formData,
            });
            if (res.ok) {
                setResult({ valid: true, message: 'Embarquement confirmé !' });
            }
        } catch { /* ignore */ }
        setConfirming(false);
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Scan QR Embarquement</h1>
                <p className="text-admin-muted text-sm mt-0.5">Vérifier les billets des passagers à l'embarquement</p>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-admin-card rounded-xl border border-white/5 p-6 space-y-4"
            >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                        <Scan size={22} className="text-primary-container" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-white text-sm">Scanner un billet</h2>
                        <p className="text-xs text-admin-muted">Saisissez le numéro de réservation ou scannez le QR code</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <input type="text" value={qrInput} onChange={(e) => setQrInput(e.target.value)}
                        placeholder="BK202505250001 ou scan QR..."
                        className="flex-1 px-4 py-3 bg-[#0F172A] border border-white/10 rounded-lg text-sm text-white placeholder-admin-muted focus:border-primary-container outline-none transition-all font-mono"
                        onKeyDown={(e) => e.key === 'Enter' && verify()}
                    />
                    <button onClick={verify} disabled={checking || !qrInput.trim()}
                        className="bg-primary-container text-white px-5 py-3 rounded-lg font-semibold text-sm hover:bg-primary transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <QrCode size={16} /> {checking ? 'Vérification...' : 'Vérifier'}
                    </button>
                </div>
            </motion.div>

            {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl border p-6 ${
                        result.valid
                            ? 'bg-status-green-bg/10 border-status-green-ring'
                            : 'bg-status-red-bg/10 border-status-red-ring'
                    }`}
                >
                    <div className="flex items-center gap-3 mb-4">
                        {result.valid ? (
                            <CheckCircle size={24} className="text-status-green-text" />
                        ) : (
                            <XCircle size={24} className="text-status-red-text" />
                        )}
                        <div>
                            <p className={`font-bold text-sm ${result.valid ? 'text-status-green-text' : 'text-status-red-text'}`}>
                                {result.valid ? 'Billet Valide' : 'Billet Invalide'}
                            </p>
                            <p className="text-xs text-admin-muted">{result.message}</p>
                        </div>
                    </div>

                    {result.booking && (
                        <div className="space-y-3 bg-white/5 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-white">
                                <User size={14} className="text-admin-muted" />
                                <span className="font-semibold text-sm">{result.booking.passenger_name}</span>
                                <span className="text-admin-muted text-xs">{result.booking.passenger_phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-admin-muted">
                                <Bus size={12} />
                                {result.booking.trip && (
                                    <span>
                                        {result.booking.trip.departure_city} → {result.booking.trip.arrival_city} · {result.booking.trip.departure_time}
                                        · Bus {result.booking.trip.vehicle}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-admin-muted">
                                <MapPin size={12} />
                                <span>Sièges: {result.booking.seat_numbers.join(', ')} · N° {result.booking.booking_number}</span>
                            </div>

                            {result.valid && result.booking.status === 'confirmed' && (
                                <button onClick={confirmBoarding} disabled={confirming}
                                    className="w-full bg-status-green-text text-white py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity mt-2 disabled:opacity-50"
                                >
                                    {confirming ? 'Confirmation...' : 'Confirmer l\'Embarquement'}
                                </button>
                            )}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}

function EmbarquementLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage<PageProps>().props;
    const isDriver = auth?.user?.role === 'chauffeur';
    const homeRoute = isDriver ? route('driver.trips') : route('admin.dashboard');
    return (
        <BackOfficeLayout title="Embarquement" breadcrumbs={[{ label: 'Tableau de bord', href: homeRoute }, { label: 'Embarquement' }]}>
            {children}
        </BackOfficeLayout>
    );
}

Embarquement.layout = (page: React.ReactNode) => <EmbarquementLayout>{page}</EmbarquementLayout>;
