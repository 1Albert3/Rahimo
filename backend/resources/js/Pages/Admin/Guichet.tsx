import { useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Armchair, Bus, CreditCard, Loader2, Printer, Route, UserPlus } from 'lucide-react';
import { useState } from 'react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { formatFCFA } from '@/lib/utils';
import type { PageProps, Trajet } from '@/types';

interface Props extends PageProps { trajets: Trajet[]; }

export default function Guichet({ trajets }: Props) {
    const [selectedTrajet, setSelectedTrajet] = useState(trajets[0] ?? null);
    const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
    const [received, setReceived] = useState(0);

    const { data, setData, post, processing, reset } = useForm({
        passenger_name: '',
        passenger_phone: '',
        payment_method: 'cash',
        trip_id: selectedTrajet?.id ?? null,
        seat_numbers: selectedSeat ? [selectedSeat] : [],
        amount_received: 0,
    });

    const price = selectedTrajet?.price ?? 0;
    const change = received - price;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTrajet || !selectedSeat) return;
        setData('trip_id', selectedTrajet.id);
        setData('seat_numbers', [selectedSeat]);
        setData('amount_received', received);
        post(route('admin.guichet.store'), {
            onSuccess: () => {
                reset();
                setSelectedSeat(null);
                setReceived(0);
            },
        });
    };

    const capacity = selectedTrajet?.vehicle?.capacity ?? 55;

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-4">
                <h1 className="text-xl font-bold text-slate-dark">Vente Guichet — Billetterie</h1>
                <p className="text-sm text-on-surface-variant mt-0.5">Émission de tickets en temps réel</p>
            </div>

            <form onSubmit={submit} className="flex-1 grid grid-cols-12 gap-6 overflow-hidden min-h-0">
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-5 overflow-hidden">
                    <section className="bg-white rounded-xl shadow-xl border border-outline p-5 shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-slate-dark flex items-center gap-2 text-sm">
                                <Route size={16} className="text-primary" /> Sélection du trajet
                            </h2>
                            <span className="px-3 py-1 bg-white text-[11px] font-bold tracking-wider rounded-full text-primary">AUJOURD'HUI</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {trajets.map((t) => (
                                <button key={t.id} type="button"
                                    onClick={() => { setSelectedTrajet(t); setSelectedSeat(null); }}
                                    className={`p-4 rounded-xl text-left flex flex-col transition-all active:scale-[0.98] ${
                                        selectedTrajet?.id === t.id
                                            ? 'border-2 border-primary bg-primary/5 shadow-xl'
                                            : 'border border-outline hover:border-primary/50 bg-white'
                                    }`}
                                >
                                    <span className={`text-[10px] font-bold tracking-widest uppercase font-mono ${selectedTrajet?.id === t.id ? 'text-primary' : 'text-on-surface-variant'}`}>
                                        {t.departure_time} • {t.trip_number}
                                    </span>
                                    <span className="font-semibold text-lg mt-1 text-slate-dark">
                                        {t.departure_city} → {t.arrival_city}
                                    </span>
                                    <div className="flex justify-between items-center mt-3">
                                        <span className="text-xs font-medium text-on-surface-variant">{t.available_seats} places dispo</span>
                                        <span className="font-bold font-mono text-slate-dark">
                                            {formatFCFA(t.price)}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="flex-1 bg-white rounded-xl shadow-xl border border-outline p-5 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <h2 className="font-semibold text-slate-dark flex items-center gap-2 text-sm">
                                <Armchair size={16} className="text-primary" /> Plan du bus ({capacity} Places)
                            </h2>
                            <div className="flex gap-4">
                                {[
                                    { cls: 'border border-status-green-ring bg-status-green-bg/50', label: 'Libre' },
                                    { cls: 'bg-primary',                             label: 'Sélectionné' },
                                    { cls: 'bg-on-surface-variant/30',                           label: 'Occupé' },
                                ].map((l) => (
                                    <div key={l.label} className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant">
                                        <div className={`w-3 h-3 rounded-sm ${l.cls}`} />
                                        {l.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-gris-surface/50 rounded-xl py-6">
                            <div className="max-w-xs mx-auto bg-white rounded-xl p-6 shadow-xl border ">
                                <div className="flex justify-between items-center mb-8 px-4">
                                    <div className="w-10 h-10 bg-gris-surface rounded-xl flex items-center justify-center text-on-surface-variant"><Bus size={18} /></div>
                                    <div className="w-10 h-10 bg-gris-surface rounded-full flex items-center justify-center text-on-surface-variant text-xs">→</div>
                                </div>
                                <div className="grid grid-cols-5 gap-y-3 gap-x-2">
                                    {Array.from({ length: capacity }, (_, i) => i + 1).map((n) => {
                                        if (n % 5 === 3) return <div key={`aisle-${n}`} className="w-6" />;
                                        const isSelected = selectedSeat === n;
                                        return (
                                            <motion.button key={n} type="button"
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setSelectedSeat(isSelected ? null : n)}
                                                className={`h-9 w-9 rounded-lg border flex items-center justify-center text-[11px] font-bold font-mono transition-all ${
                                                    isSelected
                                                        ? 'bg-primary border-primary text-white scale-110 shadow-xl z-10'
                                                        : 'border-status-green-ring bg-status-green-bg/50 text-status-green-text hover:border-primary hover:bg-primary/5 hover:scale-110'
                                                }`}
                                            >
                                                {isSelected ? '✓' : n}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="col-span-12 lg:col-span-4 flex flex-col gap-5 overflow-hidden">
                    <section className="bg-white rounded-xl shadow-xl border border-outline p-6 shrink-0">
                        <h2 className="font-semibold text-slate-dark text-sm mb-4 flex items-center gap-2">
                            <UserPlus size={16} className="text-primary" /> Détails du passager
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-extrabold text-on-surface-variant uppercase tracking-widest mb-1.5">NOM COMPLET</label>
                                <input type="text" value={data.passenger_name} onChange={(e) => setData('passenger_name', e.target.value)}
                                    placeholder="Entrez le nom"
                                    className="w-full  rounded-xl px-4 py-3 focus:ring-primary focus:border-primary transition-all text-sm outline-none border border-outline"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-extrabold text-on-surface-variant uppercase tracking-widest mb-1.5">TÉLÉPHONE</label>
                                <input type="tel" value={data.passenger_phone} onChange={(e) => setData('passenger_phone', e.target.value)}
                                    placeholder="00 00 00 00"
                                    className="w-full  rounded-xl px-4 py-3 focus:ring-primary focus:border-primary transition-all text-sm font-mono outline-none border border-outline"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="flex-1 bg-white rounded-xl p-6 flex flex-col shadow-sm border border-outline min-h-0">
                        <h2 className="font-semibold text-slate-dark text-sm mb-5 flex items-center gap-2">
                            <CreditCard size={16} className="text-primary" /> Paiement
                        </h2>
                        <div className="flex-1 space-y-5 overflow-y-auto">
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { val: 'cash', label: 'ESPÈCES',  icon: '💵' },
                                    { val: 'mobile_money', label: 'ORANGE',   icon: '🟠' },
                                    { val: 'mobile_money', label: 'MOOV',     icon: '🔵' },
                                ].map((opt, i) => (
                                    <button key={`${opt.val}-${i}`} type="button"
                                        onClick={() => setData('payment_method', opt.val as 'cash' | 'mobile_money')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all active:scale-[0.96] ${
                                            data.payment_method === opt.val
                                                ? 'bg-primary border-2 border-primary shadow-sm'
                                                : 'bg-white border border-outline opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        <span className="text-xl mb-1">{opt.icon}</span>
                                        <span className="text-[9px] font-bold tracking-widest uppercase text-white">{opt.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3 bg-gris-surface/50 p-4 rounded-xl border border-outline/50">
                                <div className="flex justify-between items-center text-on-surface-variant text-sm">
                                    <span>Ticket (Siège {selectedSeat ?? '—'})</span>
                                    <span className="font-bold text-slate-dark font-mono">{formatFCFA(price)}</span>
                                </div>
                                <div className="border-t border-outline pt-3 flex justify-between items-center">
                                    <span className="text-on-surface-variant font-bold text-sm">TOTAL</span>
                                    <span className="text-2xl font-extrabold text-primary font-mono">{formatFCFA(price)}</span>
                                </div>
                            </div>

                            {data.payment_method === 'cash' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[11px] font-extrabold text-on-surface-variant uppercase tracking-widest mb-1.5">MONTANT REÇU</label>
                                        <div className="relative">
                                            <input type="number" value={received} onChange={(e) => setReceived(parseInt(e.target.value) || 0)}
                                                className="w-full text-2xl font-bold bg-white border-outline text-slate-dark rounded-xl py-3.5 pl-4 pr-16 focus:ring-1 focus:ring-primary focus:border-primary transition-all font-mono outline-none border"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant text-sm tracking-wide">CFA</span>
                                        </div>
                                    </div>
                                    <div className={`p-4 rounded-xl flex justify-between items-center border ${
                                        change >= 0 && received > 0 ? 'bg-primary/5 border-primary/20' : 'bg-red-500/10 border-status-red-ring/20'
                                    }`}>
                                        <div>
                                            <span className="text-[10px] font-extrabold text-primary tracking-widest uppercase block mb-1">MONNAIE À RENDRE</span>
                                            <span className={`text-2xl font-black font-mono ${change >= 0 && received > 0 ? 'text-slate-dark' : 'text-status-red-text'}`}>
                                                {received > 0 ? (change >= 0 ? `${change.toLocaleString('fr-FR')} CFA` : 'Insuffisant') : '—'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={processing || !selectedSeat || !selectedTrajet}
                            className="mt-5 w-full bg-primary text-white py-4 rounded-xl font-semibold text-sm shadow-sm hover:bg-kinetic-red-hover active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {processing ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
                            ENCAISSER ET IMPRIMER
                        </button>
                    </section>
                </div>
            </form>
        </div>
    );
}

Guichet.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Billetterie" breadcrumbs={[{ label: 'Tableau de bord', href: route('admin.dashboard') }, { label: 'Billetterie' }]}>
        {page}
    </BackOfficeLayout>
);
