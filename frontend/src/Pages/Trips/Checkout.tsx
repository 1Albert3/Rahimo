import { motion } from 'framer-motion';
import { CreditCard, Gift, Loader2, Mail, MessageSquare, Percent, Phone, Smartphone, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GuestLayout from '@/Layouts/GuestLayout';
import { formatFCFA } from '@/lib/utils';
import type { Fidelite } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { getTripSeats } from '@/api/trips';
import { createBooking, getMyBookings } from '@/api/bookings';
import api from '@/api/client';


const inputCls = 'w-full px-3 py-3 bg-gris-surface rounded-lg text-sm text-slate-dark placeholder:text-on-surface-variant/60 focus:bg-white focus:ring-2 focus:ring-primary/15 outline-none transition-all';
const labelCls = 'text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant';

const CHANNELS = [
    { val: 'sms', label: 'SMS', icon: MessageSquare, sub: 'Recevez le QR par SMS' },
    { val: 'email', label: 'Email', icon: Mail, sub: 'Recevez le QR par email' },
    { val: 'whatsapp', label: 'WhatsApp', icon: Smartphone, sub: 'Recevez le QR via WhatsApp' },
];

export default function Checkout() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();

    const tripId = parseInt(searchParams.get('trajet') ?? '0');
    const siegeIds = (searchParams.get('sieges') ?? '').split(',').filter(Boolean).map(Number);

    const [trajet, setTrajet] = useState<{ id: number; departure_city: string; arrival_city: string; departure_time: string; departure_date: string; price: number; duration?: string } | null>(null);
    const [fidelite, setFidelite] = useState<Fidelite | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        passenger_name: user?.name ?? '',
        passenger_phone: user?.phone ?? '',
        passenger_email: '',
        payment_method: 'mobile_money',
        notification_channel: 'sms',
        promo_code: '',
    });
    const [mmPhone, setMmPhone] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [promoMsg, setPromoMsg] = useState<{ ok: boolean; msg: string; discount?: number } | null>(null);

    useEffect(() => {
        if (!tripId) { navigate('/voyages'); return; }
        const load = async () => {
            try {
                const { trip } = await getTripSeats(tripId, siegeIds.length || 1);
                setTrajet(trip as unknown as typeof trajet);
                if (user) {
                    const data = await getMyBookings();
                    setFidelite((data as { fidelite?: Fidelite }).fidelite ?? null);
                }
            } catch { navigate('/voyages'); }
            setLoading(false);
        };
        load();
    }, [tripId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setForm(f => ({ ...f, passenger_name: user?.name ?? '', passenger_phone: user?.phone ?? '' }));
    }, [user]);

    const basePrice = siegeIds.length * (trajet?.price ?? 0);
    const serviceFee = 500;
    const loyaltyDiscount = fidelite?.tier?.discount ?? 0;
    const loyaltyAmount = loyaltyDiscount > 0 ? basePrice * loyaltyDiscount / 100 : 0;
    const promoDiscount = promoMsg?.discount ?? 0;
    const total = basePrice + serviceFee - loyaltyAmount - promoDiscount;

    const applyPromo = async () => {
        if (!promoCode.trim()) return;
        try {
            const { data } = await api.post('/promotions/validate', { code: promoCode, amount: basePrice });
            if (data.valid) setPromoMsg({ ok: true, msg: data.label, discount: data.discount });
            else setPromoMsg({ ok: false, msg: data.message ?? 'Code invalide' });
        } catch { setPromoMsg({ ok: false, msg: 'Erreur de validation' }); }
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        try {
            const booking = await createBooking({
                trip_id: tripId,
                seat_numbers: siegeIds,
                passenger_name: form.passenger_name,
                passenger_phone: form.payment_method === 'mobile_money' && mmPhone ? mmPhone : form.passenger_phone,
                passenger_email: form.passenger_email || undefined,
                payment_method: form.payment_method,
                notification_channel: form.notification_channel,
                promo_code: promoCode || undefined,
            });
            navigate(`/reservation/${booking.id}`);
        } catch (err: unknown) {
            const resp = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } }).response?.data;
            if (resp?.errors) setErrors(Object.fromEntries(Object.entries(resp.errors).map(([k, v]) => [k, v[0]])));
            else setErrors({ general: resp?.message ?? 'Erreur lors de la réservation' });
        } finally { setProcessing(false); }
    };

    if (loading) return <GuestLayout title="Paiement" activeNav="Réserver"><div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div></GuestLayout>;

    if (!trajet) return (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-12 text-center">
            <p className="text-on-surface-variant">Trajet non trouvé.</p>
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-dark tracking-tight mb-1">Informations & Paiement</h1>
                <p className="text-on-surface-variant text-sm">Complétez vos informations pour finaliser la réservation</p>
            </div>
            {errors.general && <div className="mb-4 p-3 bg-status-red-bg text-status-red-text rounded-xl text-sm font-medium">{errors.general}</div>}

            <form onSubmit={submit}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 space-y-5">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-xl p-6">
                            <h2 className="font-bold text-slate-dark mb-5 flex items-center gap-2 text-sm"><User size={13} className="text-primary" /> Informations Passager</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Nom complet</label>
                                    <input type="text" value={form.passenger_name} onChange={(e) => setForm(f => ({ ...f, passenger_name: e.target.value }))} placeholder="Amadou Traoré" className={inputCls} required />
                                    {errors.passenger_name && <p className="text-xs text-status-red-text mt-1">{errors.passenger_name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Téléphone</label>
                                    <input type="tel" value={form.passenger_phone} onChange={(e) => setForm(f => ({ ...f, passenger_phone: e.target.value }))} placeholder="+226 70 00 00 00" className={inputCls} required />
                                    {errors.passenger_phone && <p className="text-xs text-status-red-text mt-1">{errors.passenger_phone}</p>}
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className={labelCls}>Email (optionnel)</label>
                                    <input type="email" value={form.passenger_email} onChange={(e) => setForm(f => ({ ...f, passenger_email: e.target.value }))} placeholder="amadou@email.com" className={inputCls} />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-xl p-6">
                            <h2 className="font-bold text-slate-dark mb-5 flex items-center gap-2 text-sm"><CreditCard size={13} className="text-primary" /> Mode de Paiement</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                {[
                                    { val: 'mobile_money', label: 'Mobile Money', sub: 'Orange Money, Moov Money' },
                                    { val: 'cash', label: 'Espèces', sub: 'Paiement au guichet' },
                                ].map((opt) => (
                                    <label key={opt.val} className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${form.payment_method === opt.val ? 'bg-white ring-2 ring-primary' : 'bg-gris-surface'}`}>
                                        <input type="radio" name="payment_method" value={opt.val} checked={form.payment_method === opt.val} onChange={() => setForm(f => ({ ...f, payment_method: opt.val }))} className="mt-0.5 text-primary" />
                                        <div><p className="text-sm font-semibold text-slate-dark">{opt.label}</p><p className="text-xs text-on-surface-variant">{opt.sub}</p></div>
                                    </label>
                                ))}
                            </div>
                            {form.payment_method === 'mobile_money' && (
                                <div className="space-y-1.5">
                                    <label className={labelCls + ' flex items-center gap-1'}><Phone size={11} /> Téléphone Mobile Money</label>
                                    <input type="tel" value={mmPhone} onChange={(e) => setMmPhone(e.target.value)} placeholder="+226 70 00 00 00" className={inputCls} />
                                </div>
                            )}
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-xl shadow-xl p-6">
                            <h2 className="font-bold text-slate-dark mb-5 flex items-center gap-2 text-sm"><MessageSquare size={13} className="text-primary" /> Réception du Ticket</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {CHANNELS.map((ch) => {
                                    const Icon = ch.icon;
                                    return (
                                        <label key={ch.val} className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${form.notification_channel === ch.val ? 'bg-white ring-2 ring-primary' : 'bg-gris-surface'}`}>
                                            <input type="radio" name="notification_channel" value={ch.val} checked={form.notification_channel === ch.val} onChange={() => setForm(f => ({ ...f, notification_channel: ch.val }))} className="mt-0.5 text-primary" />
                                            <div><Icon size={16} className="text-primary mb-1" /><p className="text-sm font-semibold text-slate-dark">{ch.label}</p><p className="text-xs text-on-surface-variant">{ch.sub}</p></div>
                                        </label>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="sticky top-20 bg-white rounded-xl shadow-xl p-6 space-y-5">
                            <h3 className="font-bold text-slate-dark">Récapitulatif</h3>
                            <div className="space-y-2.5 text-sm">
                                {[
                                    { label: 'Trajet', val: `${trajet.departure_city} → ${trajet.arrival_city}` },
                                    { label: 'Départ', val: `${trajet.departure_time} · ${trajet.departure_date}` },
                                    { label: 'Sièges', val: siegeIds.join(', '), mono: true },
                                ].map(({ label, val, mono }) => (
                                    <div key={label} className="flex justify-between">
                                        <span className="text-on-surface-variant">{label}</span>
                                        <span className={`font-medium text-slate-dark ${mono ? 'font-mono text-xs' : ''}`}>{val}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-on-surface-variant"><span>Tickets (×{siegeIds.length})</span><span>{formatFCFA(basePrice)}</span></div>
                                <div className="flex justify-between text-on-surface-variant"><span>Frais de service</span><span>{formatFCFA(serviceFee)}</span></div>
                                {loyaltyAmount > 0 && <div className="flex justify-between text-status-green-text"><span className="flex items-center gap-1"><Gift size={14} /> Fidélité ({loyaltyDiscount}%)</span><span>-{formatFCFA(loyaltyAmount)}</span></div>}
                                {promoDiscount > 0 && <div className="flex justify-between text-status-green-text"><span className="flex items-center gap-1"><Percent size={14} /> Code promo</span><span>-{formatFCFA(promoDiscount)}</span></div>}
                                <div className="flex justify-between font-black text-lg text-slate-dark pt-2"><span>Total</span><span>{formatFCFA(total)}</span></div>
                            </div>
                            <div className="space-y-2">
                                <label className={labelCls}>Code promo</label>
                                <div className="flex gap-2">
                                    <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="EX: RAHIMO10" className={inputCls + ' flex-1'} />
                                    <button type="button" onClick={applyPromo} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all">Appliquer</button>
                                </div>
                                {promoMsg && <p className={`text-xs flex items-center gap-1 ${promoMsg.ok ? 'text-status-green-text' : 'text-status-red-text'}`}>{promoMsg.ok && <Gift size={12} />}{promoMsg.msg}</p>}
                            </div>
                            <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={processing}
                                className="w-full bg-primary hover:bg-kinetic-red-hover text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xl disabled:opacity-70"
                            >
                                {processing && <Loader2 size={16} className="animate-spin" />}
                                Confirmer & Payer {formatFCFA(total)}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
