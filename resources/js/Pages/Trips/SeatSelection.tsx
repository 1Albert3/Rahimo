import { router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Bus, Check, Info, X } from 'lucide-react';
import { useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { formatFCFA } from '@/lib/utils';
import type { PageProps, Siege, Trajet } from '@/types';

interface Props extends PageProps { trajet: Trajet; sieges: Siege[]; passagers_max?: number; }

function generateSeatGrid(sieges: Siege[]): { row: number; col: string; seat: Siege | undefined; side: 'gauche' | 'droite' }[] {
    const grid: { row: number; col: string; seat: Siege | undefined; side: 'gauche' | 'droite' }[] = [];
    const rows = Math.ceil(sieges.length / 4);
    let idx = 0;
    for (let row = 1; row <= rows; row++) {
        for (const side of ['gauche', 'droite'] as const) {
            const cols = side === 'gauche' ? ['A', 'B'] : ['C', 'D'];
            for (const col of cols) {
                const seat = sieges[idx];
                grid.push({ row, col, seat: seat || undefined, side });
                idx++;
            }
            if (side === 'gauche') {
                grid.push({ row, col: '-', seat: undefined, side: 'gauche' });
            }
        }
    }
    return grid;
}

export default function SeatSelection({ trajet, sieges, passagers_max = 4 }: Props) {
    const [selected, setSelected] = useState<number[]>([]);
    const [tooltipSeat, setTooltipSeat] = useState<number | null>(null);
    const grid = generateSeatGrid(sieges);
    const maxSelect = passagers_max;

    const toggle = (seat: Siege) => {
        if (!seat.libre) return;
        setSelected((prev) =>
            prev.includes(seat.numero)
                ? prev.filter((s) => s !== seat.numero)
                : prev.length < maxSelect ? [...prev, seat.numero] : prev
        );
    };

    const total = selected.length * trajet.price + (selected.length > 0 ? 500 : 0);

    const seatCls = (seat: Siege) => {
        if (!seat.libre) return 'bg-primary/10 border-2 border-primary/30 cursor-not-allowed opacity-60';
        if (selected.includes(seat.numero)) return 'bg-primary border-2 border-primary shadow-ambient scale-105';
        return 'bg-white border-2 hover:border-primary/50 hover:bg-primary-fixed cursor-pointer';
    };

    const vehicleType = (trajet as any).type ?? 'standard';

    return (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-black text-on-surface tracking-tight mb-1">Sélection de Siège</h1>
                    <p className="text-on-surface-variant text-sm">
                        {trajet.departure_city} → {trajet.arrival_city} · {trajet.departure_time}
                        {trajet.vehicle?.registration_number && <span className="font-mono font-semibold ml-2">{trajet.vehicle.registration_number}</span>}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold">{maxSelect} passager{maxSelect > 1 ? 's' : ''}</span>
                    <span className={`px-2 py-1 rounded font-bold uppercase ${vehicleType === 'vip' ? 'bg-kinetic-gold-light text-kinetic-gold' : 'bg-surface-container-low text-on-surface-variant'}`}>
                        {vehicleType === 'vip' ? 'VIP' : 'Standard'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                    <div className="bg-white rounded-xl shadow-ambient p-6">
                        <div className="flex flex-wrap items-center justify-center gap-5 mb-7">
                            {[
                                { cls: 'bg-white border-2',                    label: 'Libre' },
                                { cls: 'bg-primary/10 border-2 border-primary/30 opacity-60', label: 'Occupé' },
                                { cls: 'bg-primary border-2 border-primary shadow-ambient scale-105', label: 'Sélectionné' },
                            ].map((l) => (
                                <div key={l.label} className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-md ${l.cls}`} />
                                    <span className="text-xs text-on-surface-variant font-medium">{l.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="max-w-[320px] mx-auto">
                            <div className="border-4 rounded-t-[3rem] rounded-b-2xl p-5 bg-surface-container-low shadow-inner">
                                <div className="flex justify-between items-center mb-5 px-2">
                                    <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-sm opacity-60"><Bus size={16} /></div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Avant</span>
                                </div>
                                <div className="space-y-2.5">
                                    {Array.from({ length: Math.ceil(sieges.length / 4) }, (_, i) => i + 1).map((row) => {
                                        const rowSeats = grid.filter(s => s.row === row);
                                        return (
                                            <div key={row} className="grid grid-cols-5 gap-2">
                                                {rowSeats.map((item) => {
                                                    if (item.col === '-') return <div key={`${row}-gap`} className="flex items-center justify-center" />;
                                                    if (!item.seat) return <div key={`${row}${item.col}`} className="h-11" />;
                                                    const seat = item.seat;
                                                    const isSel = selected.includes(seat.numero);
                                                    return (
                                                        <motion.div key={seat.numero} className="relative">
                                                            <motion.button whileTap={{ scale: 0.9 }}
                                                                onClick={() => toggle(seat)}
                                                                disabled={!seat.libre}
                                                                onMouseEnter={() => setTooltipSeat(seat.numero)}
                                                                onMouseLeave={() => setTooltipSeat(null)}
                                                                className={`h-11 w-full rounded-lg flex flex-col items-center justify-center transition-all ${seatCls(seat)}`}
                                                            >
                                                                {!seat.libre
                                                                    ? <X size={12} className="text-primary/50" />
                                                                    : isSel ? <Check size={12} className="text-white" /> : null}
                                                                <span className={`text-[9px] font-bold ${isSel ? 'text-white' : !seat.libre ? 'text-primary/40' : 'text-on-surface-variant'}`}>
                                                                    {seat.numero}
                                                                </span>
                                                            </motion.button>
                                                            <AnimatePresence>
                                                                {tooltipSeat === seat.numero && seat.libre && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                                                                        className="absolute -top-8 left-1/2 -translate-x-1/2 z-10 bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-1 rounded whitespace-nowrap font-medium"
                                                                    >
                                                                        Siège {seat.numero} · {((seat as any).features ?? []).join(' · ')}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5">
                    <div className="sticky top-20 bg-white rounded-xl shadow-ambient p-6 flex flex-col gap-5">
                        <h3 className="font-bold text-on-surface">Résumé du Trajet</h3>

                        <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center mt-1">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                <div className="w-px h-8 bg-surface-container-high my-1" />
                                <div className="w-2.5 h-2.5 rounded-full border-2 border-primary" />
                            </div>
                            <div className="flex flex-col gap-4 flex-1">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-0.5">Départ</p>
                                    <p className="font-semibold text-on-surface text-sm">{trajet.departure_city}</p>
                                    <p className="text-xs text-on-surface-variant">Gare Centrale · {trajet.departure_time}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-0.5">Arrivée</p>
                                    <p className="font-semibold text-on-surface text-sm">{trajet.arrival_city}</p>
                                    <p className="text-xs text-on-surface-variant">Gare Routière · {trajet.arrival_time}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                                Sièges Sélectionnés ({selected.length}/{maxSelect})
                            </p>
                            <AnimatePresence>
                                {selected.length === 0
                                    ? <p className="text-sm text-on-surface-variant italic">Cliquez sur un siège libre</p>
                                    : (
                                        <div className="flex flex-wrap gap-2">
                                            {selected.map((s) => (
                                                <motion.span key={s}
                                                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                                    className="px-3 py-1.5 bg-primary text-white rounded-md text-sm font-mono font-bold"
                                                >
                                                    Siège {s}
                                                </motion.span>
                                            ))}
                                        </div>
                                    )}
                            </AnimatePresence>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-on-surface-variant">
                                <span>Tickets (×{selected.length})</span>
                                <span>{formatFCFA(selected.length * trajet.price)}</span>
                            </div>
                            <div className="flex justify-between text-on-surface-variant">
                                <span>Frais de service</span>
                                <span>{selected.length > 0 ? formatFCFA(500) : '—'}</span>
                            </div>
                            <div className="flex justify-between font-black text-lg text-on-surface pt-2">
                                <span>Total</span>
                                <span>{formatFCFA(total)}</span>
                            </div>
                        </div>

                        <motion.button whileTap={{ scale: 0.97 }}
                            onClick={() => {
                                if (selected.length > 0)
                                    router.visit(route('trips.checkout'), { data: { trajet: trajet.id, sieges: selected } });
                            }}
                            disabled={selected.length === 0}
                            className="w-full bg-gradient-to-br from-primary to-primary-container hover:from-primary hover:to-primary text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-ambient disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Continuer <ArrowRight size={18} />
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
}

SeatSelection.layout = (page: React.ReactNode) => (
    <GuestLayout title="Sélection de siège" activeNav="Réserver">{page}</GuestLayout>
);
