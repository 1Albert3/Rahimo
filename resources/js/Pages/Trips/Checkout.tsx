import { useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CreditCard, Gift, Info, Loader2, Mail, MessageSquare, Percent, Phone, Smartphone, User } from 'lucide-react';
import { useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { formatFCFA } from '@/lib/utils';
import type { Fidelite, PageProps, Trajet } from '@/types';

interface Props extends PageProps { trajet?: Trajet; sieges?: number[]; fidelite?: Fidelite | null; }

const inputCls = 'w-full px-3 py-3 bg-surface-container-low rounded-lg text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/15 outline-none transition-all';
const labelCls = 'text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant';

const CHANNELS = [
    { val: 'sms', label: 'SMS', icon: MessageSquare, sub: 'Recevez le QR par SMS' },
    { val: 'email', label: 'Email', icon: Mail, sub: 'Recevez le QR par email' },
    { val: 'whatsapp', label: 'WhatsApp', icon: Smartphone, sub: 'Recevez le QR via WhatsApp' },
];

export default function Checkout({ trajet, sieges, fidelite }: Props) {
    const t = trajet;
    const seats = sieges ?? [];
    const { auth } = usePage<PageProps>().props;
    const isLoggedIn = !!auth.user?.id;

    const [forOther, setForOther] = useState(false);
    const [mmPhone, setMmPhone] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [promoMsg, setPromoMsg] = useState<{ ok: boolean; msg: string; discount?: number } | null>(null);

    const basePrice = seats.length * (t?.price ?? 0);
    const serviceFee = 500;
    const loyaltyDiscount = fidelite?.tier?.discount ?? 0;
    const loyaltyAmount = loyaltyDiscount > 0 ? basePrice * loyaltyDiscount / 100 : 0;
    const promoDiscount = promoMsg?.discount ?? 0;
    const total = basePrice + serviceFee - loyaltyAmount - promoDiscount;

    const { data, setData, post, processing, errors } = useForm({
        passenger_name: isLoggedIn ? auth.user.name : '',
        passenger_phone: isLoggedIn ? (auth.user.phone ?? '') : '',
        passenger_email: '',
        payment_method: 'mobile_money',
        notification_channel: 'sms',
        promo_code: '',
        trip_id: t?.id ?? null,
        seat_numbers: seats,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.payment_method === 'mobile_money' && mmPhone) {
            setData('passenger_phone', mmPhone);
        }
        setData('promo_code', promoCode);
        post(route('trips.confirm'));
    };

    const applyPromo = async () => {
        if (!promoCode.trim()) return;
        try {
            const res = await fetch('/api/promotions/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.getAttribute('content') ?? '' },
                body: JSON.stringify({ code: promoCode, amount: basePrice }),
            });
            const json = await res.json();
            if (json.valid) {
                setPromoMsg({ ok: true, msg: json.label, discount: json.discount });
                setData('promo_code', promoCode);
            } else {
                setPromoMsg({ ok: false, msg: json.message ?? 'Code invalide' });
            }
        } catch {
            setPromoMsg({ ok: false, msg: 'Erreur de validation' });
        }
    };

    if (!t) {
        return (
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
                <div className="text-center py-12">
                    <p className="text-on-surface-variant">Trajet non trouvé. Veuillez refaire une recherche.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-black text-on-surface tracking-tight mb-1">Informations & Paiement</h1>
                <p className="text-on-surface-variant text-sm">Complétez vos informations pour finaliser la réservation</p>
            </div>

            <form onSubmit={submit}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 space-y-5">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-ambient p-6"
                        >
                            <h2 className="font-bold text-on-surface mb-5 flex items-center gap-2 text-sm">
                                <div className="w-6 h-6 bg-primary-fixed rounded-md flex items-center justify-center">
                                    <User size={13} className="text-primary" />
                                </div>
                                Informations Passager
                            </h2>

                            {isLoggedIn && (
                                <label className="flex items-center gap-3 mb-5 p-4 bg-surface-container-low rounded-xl cursor-pointer">
                                    <input type="checkbox" checked={forOther} onChange={(e) => setForOther(e.target.checked)}
                                        className="text-primary focus:ring-primary/20 rounded"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-on-surface">Acheter pour une autre personne</p>
                                        <p className="text-xs text-on-surface-variant">Le billet sera nominatif pour le passager renseigné ci-dessous</p>
                                    </div>
                                </label>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Nom complet</label>
                                    <input type="text" value={data.passenger_name} onChange={(e) => setData('passenger_name', e.target.value)} placeholder="Amadou Traoré" className={inputCls} />
                                    {errors.passenger_name && <p className="text-xs text-status-red-text mt-1">{errors.passenger_name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Téléphone</label>
                                    <input type="tel" value={data.passenger_phone} onChange={(e) => setData('passenger_phone', e.target.value)} placeholder="+226 70 00 00 00" className={inputCls} />
                                    {errors.passenger_phone && <p className="text-xs text-status-red-text mt-1">{errors.passenger_phone}</p>}
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className={labelCls}>Email (optionnel)</label>
                                    <input type="email" value={data.passenger_email} onChange={(e) => setData('passenger_email', e.target.value)} placeholder="amadou@email.com" className={inputCls} />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="bg-white rounded-xl shadow-ambient p-6"
                        >
                            <h2 className="font-bold text-on-surface mb-5 flex items-center gap-2 text-sm">
                                <div className="w-6 h-6 bg-primary-fixed rounded-md flex items-center justify-center">
                                    <CreditCard size={13} className="text-primary" />
                                </div>
                                Mode de Paiement
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                {[
                                    { val: 'mobile_money', label: 'Mobile Money',  sub: 'Orange Money, Moov Money' },
                                    { val: 'cash', label: 'Espèces', sub: 'Paiement au guichet' },
                                    { val: 'card', label: 'Carte Bancaire', sub: 'Visa, Mastercard' },
                                ].map((opt) => (
                                    <label key={opt.val}
                                        className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                                            data.payment_method === opt.val
                                                ? 'bg-primary-fixed ring-2 ring-primary'
                                                : 'bg-surface-container-low hover:bg-surface-container'
                                        }`}
                                    >
                                        <input type="radio" name="payment_method" value={opt.val}
                                            checked={data.payment_method === opt.val}
                                            onChange={() => setData('payment_method', opt.val as 'mobile_money' | 'cash' | 'card')}
                                            className="mt-0.5 text-primary focus:ring-primary/20"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-on-surface">{opt.label}</p>
                                            <p className="text-xs text-on-surface-variant">{opt.sub}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {data.payment_method === 'mobile_money' && (
                                <div className="space-y-1.5">
                                    <label className={labelCls + ' flex items-center gap-1'}><Phone size={11} /> Téléphone Mobile Money</label>
                                    <input type="tel" value={mmPhone} onChange={(e) => setMmPhone(e.target.value)} placeholder="+226 70 00 00 00" className={inputCls} />
                                    <p className="text-[10px] text-on-surface-variant">Le paiement sera effectué via ce numéro</p>
                                </div>
                            )}
                            {data.payment_method === 'cash' && (
                                <p className="text-xs text-on-surface-variant bg-surface-container-low p-3 rounded-lg">
                                    Présentez-vous au guichet avec votre numéro de réservation pour effectuer le paiement.
                                </p>
                            )}
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                            className="bg-white rounded-xl shadow-ambient p-6"
                        >
                            <h2 className="font-bold text-on-surface mb-5 flex items-center gap-2 text-sm">
                                <div className="w-6 h-6 bg-primary-fixed rounded-md flex items-center justify-center">
                                    <MessageSquare size={13} className="text-primary" />
                                </div>
                                Réception du Ticket
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {CHANNELS.map((ch) => {
                                    const Icon = ch.icon;
                                    return (
                                        <label key={ch.val}
                                            className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                                                data.notification_channel === ch.val
                                                    ? 'bg-primary-fixed ring-2 ring-primary'
                                                    : 'bg-surface-container-low hover:bg-surface-container'
                                            }`}
                                        >
                                            <input type="radio" name="notification_channel" value={ch.val}
                                                checked={data.notification_channel === ch.val}
                                                onChange={() => setData('notification_channel', ch.val as 'sms' | 'email' | 'whatsapp')}
                                                className="mt-0.5 text-primary focus:ring-primary/20"
                                            />
                                            <div>
                                                <Icon size={16} className="text-primary mb-1" />
                                                <p className="text-sm font-semibold text-on-surface">{ch.label}</p>
                                                <p className="text-xs text-on-surface-variant">{ch.sub}</p>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {isLoggedIn && forOther && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-primary-fixed rounded-xl p-5 text-primary flex items-start gap-3"
                            >
                                <Info size={18} className="shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm mb-0.5">Achat pour un tiers</p>
                                    <p className="text-xs opacity-80">Le billet sera émis au nom de <strong>{data.passenger_name || 'passager'}</strong>. Vous recevrez la confirmation sur <strong>{data.passenger_phone || 'ce numéro'}</strong>.</p>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div className="lg:col-span-5">
                        <div className="sticky top-20 bg-white rounded-xl shadow-ambient p-6 space-y-5">
                            <h3 className="font-bold text-on-surface">Récapitulatif</h3>

                            <div className="space-y-2.5 text-sm">
                                {[
                                    { label: 'Trajet',  val: `${t.departure_city} → ${t.arrival_city}` },
                                    { label: 'Départ',  val: `${t.departure_time} · ${t.departure_date}` },
                                    { label: 'Durée',   val: t.duration },
                                    { label: 'Sièges',  val: seats.join(', '), mono: true },
                                ].map(({ label, val, mono }) => (
                                    <div key={label} className="flex justify-between">
                                        <span className="text-on-surface-variant">{label}</span>
                                        <span className={`font-medium text-on-surface ${mono ? 'font-mono text-xs' : ''}`}>{val}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-on-surface-variant">
                                    <span>Tickets (×{seats.length})</span>
                                    <span>{formatFCFA(basePrice)}</span>
                                </div>
                                <div className="flex justify-between text-on-surface-variant">
                                    <span>Frais de service</span>
                                    <span>{formatFCFA(serviceFee)}</span>
                                </div>
                                {loyaltyAmount > 0 && (
                                    <div className="flex justify-between text-status-green-text">
                                        <span className="flex items-center gap-1"><Gift size={14} /> Fidélité ({loyaltyDiscount}%)</span>
                                        <span>-{formatFCFA(loyaltyAmount)}</span>
                                    </div>
                                )}
                                {promoDiscount > 0 && (
                                    <div className="flex justify-between text-status-green-text">
                                        <span className="flex items-center gap-1"><Percent size={14} /> Code promo</span>
                                        <span>-{formatFCFA(promoDiscount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-black text-lg text-on-surface pt-2">
                                    <span>Total</span>
                                    <span>{formatFCFA(total)}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className={labelCls}>Code promo</label>
                                <div className="flex gap-2">
                                    <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                                        placeholder="EX: RAHIMO10" className={inputCls + ' flex-1 uppercase'}
                                    />
                                    <button type="button" onClick={applyPromo}
                                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
                                    >Appliquer</button>
                                </div>
                                {promoMsg && (
                                    <p className={`text-xs flex items-center gap-1 ${promoMsg.ok ? 'text-status-green-text' : 'text-status-red-text'}`}>
                                        {promoMsg.ok ? <Gift size={12} /> : null}
                                        {promoMsg.msg}
                                    </p>
                                )}
                            </div>

                            <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={processing}
                                className="w-full bg-gradient-to-br from-primary to-primary-container hover:from-primary hover:to-primary text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-ambient disabled:opacity-70"
                            >
                                {processing && <Loader2 size={16} className="animate-spin" />}
                                Confirmer & Payer {formatFCFA(total)}
                            </motion.button>

                            <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant">
                                <MessageSquare size={12} />
                                Ticket envoyé par {CHANNELS.find(c => c.val === data.notification_channel)?.label ?? 'SMS'}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

Checkout.layout = (page: React.ReactNode) => (
    <GuestLayout title="Paiement" activeNav="Réserver">{page}</GuestLayout>
);
