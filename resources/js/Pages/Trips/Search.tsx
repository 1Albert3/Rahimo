import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowUpDown, Bus, Filter, SlidersHorizontal, Wind, X } from 'lucide-react';
import { useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import StatusBadge from '@/Components/StatusBadge';
import { formatFCFA } from '@/lib/utils';
import type { PageProps, Trajet } from '@/types';

interface Props extends PageProps {
    trajets: Trajet[];
    depart: string;
    arrivee: string;
    date: string;
    passagers: string;
    filters: {
        bus_type: string;
        price_max: string;
        time_from: string;
        time_to: string;
        sort_by: string;
        sort_order: string;
    };
}

const VILLES = ['Ouagadougou','Bobo-Dioulasso','Koudougou','Banfora','Ouahigouya','Dori','Fada N\'Gourma','Tenkodogo'];

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const inputCls = 'w-full px-3 py-2.5 bg-gris-surface rounded-lg text-sm text-slate-dark focus:bg-white focus:ring-2 focus:ring-primary/15 outline-none transition-all';

const TYPE_LABELS: Record<string, string> = {
    vip: 'VIP Climatisé',
    standard: 'Standard',
};

const TYPE_SUBS: Record<string, string> = {
    vip: 'Confort optimal, WiFi, Climatisation',
    standard: 'Économique, confort standard',
};

const SORT_OPTIONS = [
    { val: 'departure_time_asc', label: 'Heure ↑' },
    { val: 'departure_time_desc', label: 'Heure ↓' },
    { val: 'price_asc', label: 'Prix ↑' },
    { val: 'price_desc', label: 'Prix ↓' },
];

export default function Search({ trajets, depart, arrivee, date, passagers, filters: initialFilters }: Props) {
    const [form, setForm] = useState({
        depart:    depart    ?? 'Ouagadougou',
        arrivee:   arrivee   ?? 'Bobo-Dioulasso',
        date:      date      ?? '',
        passagers: passagers ?? '1',
    });
    const [filtersOpen, setFiltersOpen] = useState(false);

    const [busType, setBusType] = useState<string[]>(
        (initialFilters?.bus_type ?? 'vip,standard').split(',')
    );
    const [priceMax, setPriceMax] = useState(initialFilters?.price_max ?? '');
    const [sortBy, setSortBy] = useState(
        `${initialFilters?.sort_by ?? 'departure_time'}_${initialFilters?.sort_order ?? 'asc'}`
    );

    const toggleType = (type: string) => {
        setBusType(prev => {
            const next = prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type];
            return next.length === 0 ? ['vip', 'standard'] : next;
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        doSearch();
    };

    const doSearch = () => {
        const [sortField, sortDir] = sortBy.split('_');
        router.visit(route('trips.search'), {
            data: {
                ...form,
                bus_type: busType.join(','),
                price_max: priceMax,
                sort_by: sortField,
                sort_order: sortDir,
            },
        });
    };

    const resetFilters = () => {
        setBusType(['vip', 'standard']);
        setPriceMax('');
        setSortBy('departure_time_asc');
        router.visit(route('trips.search'), {
            data: {
                depart: form.depart,
                arrivee: form.arrivee,
                date: form.date,
                passagers: form.passagers,
                bus_type: 'vip,standard',
                price_max: '',
                sort_by: 'departure_time',
                sort_order: 'asc',
            },
        });
    };

    const selectTrip = (trajet: Trajet) => {
        if (trajet.available_seats === 0) return;
        router.visit(route('trips.seats', { trip: trajet.id }), {
            data: { passagers: form.passagers },
        });
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
            <form onSubmit={handleSearch}
                className="bg-white rounded-xl p-4 shadow-xl mb-8 flex flex-wrap gap-3 items-end"
            >
                {[
                    { label: 'Départ',  key: 'depart'  as const },
                    { label: 'Arrivée', key: 'arrivee' as const },
                ].map(({ label, key }) => (
                    <div key={key} className="flex-1 min-w-[140px] space-y-1">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">{label}</label>
                        <select value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={inputCls}>
                            {VILLES.map((v) => <option key={v}>{v}</option>)}
                        </select>
                    </div>
                ))}
                <div className="flex-1 min-w-[140px] space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Date</label>
                    <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} />
                </div>
                <div className="w-24 space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Passagers</label>
                    <select value={form.passagers} onChange={(e) => setForm({ ...form, passagers: e.target.value })} className={inputCls}>
                        {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                <button type="submit"
                    className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-2 shadow-xl"
                >
                    <Filter size={16} /> Rechercher
                </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <button onClick={() => setFiltersOpen(true)}
                    className="md:hidden flex items-center gap-2 text-sm font-semibold text-primary bg-white rounded-xl shadow-xl px-4 py-3"
                >
                    <SlidersHorizontal size={16} /> Filtres
                </button>

                <aside className="hidden md:block md:col-span-3">
                    <div className="bg-white rounded-xl p-5 shadow-xl sticky top-20">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-semibold text-slate-dark text-sm">Filtres</h2>
                            <button onClick={resetFilters} className="text-xs text-primary hover:underline font-medium">Réinitialiser</button>
                        </div>

                        <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-3">Type de bus</h3>
                        {(['vip', 'standard'] as const).map((val) => (
                            <label key={val} className="flex items-start gap-3 cursor-pointer mb-3 group">
                                <input type="checkbox" checked={busType.includes(val)} onChange={() => toggleType(val)}
                                    className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary/20"
                                />
                                <div>
                                    <p className="text-sm text-slate-dark group-hover:text-primary transition-colors">{TYPE_LABELS[val]}</p>
                                    <p className="text-xs text-on-surface-variant">{TYPE_SUBS[val]}</p>
                                </div>
                            </label>
                        ))}

                        <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-3 mt-5">Tri</h3>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                            className={inputCls + ' mb-5'}
                        >
                            {SORT_OPTIONS.map(opt => (
                                <option key={opt.val} value={opt.val}>{opt.label}</option>
                            ))}
                        </select>

                        <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-3">Prix max (FCFA)</h3>
                        <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)}
                            placeholder="Ex: 10000" className={inputCls}
                        />

                        <button onClick={doSearch}
                            className="w-full mt-5 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:brightness-110 transition-all shadow-xl"
                        >
                            Appliquer
                        </button>
                    </div>
                </aside>

                <AnimatePresence>
                    {filtersOpen && (
                        <motion.aside
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/40 md:hidden"
                            onClick={() => setFiltersOpen(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                                className="bg-white rounded-xl p-5 shadow-xl w-[90vw] max-w-sm mx-auto"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="font-semibold text-slate-dark text-sm">Filtres</h2>
                                    <button onClick={() => setFiltersOpen(false)} className="text-on-surface-variant hover:text-slate-dark"><X size={18} /></button>
                                </div>

                                <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-3">Type de bus</h3>
                                {(['vip', 'standard'] as const).map((val) => (
                                    <label key={val} className="flex items-start gap-3 cursor-pointer mb-3 group">
                                        <input type="checkbox" checked={busType.includes(val)} onChange={() => toggleType(val)}
                                            className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary/20"
                                        />
                                        <div>
                                            <p className="text-sm text-slate-dark group-hover:text-primary transition-colors">{TYPE_LABELS[val]}</p>
                                            <p className="text-xs text-on-surface-variant">{TYPE_SUBS[val]}</p>
                                        </div>
                                    </label>
                                ))}

                                <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-3 mt-5">Tri</h3>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                                    className={inputCls + ' mb-5'}
                                >
                                    {SORT_OPTIONS.map(opt => (
                                        <option key={opt.val} value={opt.val}>{opt.label}</option>
                                    ))}
                                </select>

                                <button onClick={() => { doSearch(); setFiltersOpen(false); }}
                                    className="w-full bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:brightness-110 transition-all shadow-xl"
                                >
                                    Appliquer
                                </button>
                            </motion.div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                <section className="md:col-span-9 flex flex-col gap-4">
                    <div className="bg-white rounded-xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-bold text-slate-dark flex items-center gap-2">
                                {form.depart}
                                <ArrowRight size={18} className="text-primary" />
                                {form.arrivee}
                            </h1>
                            <p className="text-sm text-on-surface-variant mt-0.5">
                                {form.date || "Aujourd'hui"} · {trajets.length} départ{trajets.length > 1 ? 's' : ''} trouvé{trajets.length > 1 ? 's' : ''}
                                {parseInt(form.passagers) > 1 && ` · ${form.passagers} passagers`}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                            <ArrowUpDown size={14} />
                            <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); }}
                                className="bg-transparent font-semibold text-slate-dark outline-none"
                            >
                                {SORT_OPTIONS.map(opt => (
                                    <option key={opt.val} value={opt.val}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {trajets.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 shadow-xl text-center">
                            <Wind size={40} className="mx-auto text-on-surface-variant/60 mb-4" />
                            <p className="text-slate-dark font-semibold mb-1">Aucun départ disponible</p>
                            <p className="text-sm text-on-surface-variant">Essayez une autre date ou modifiez vos filtres.</p>
                        </div>
                    ) : (
                        <motion.div className="flex flex-col gap-4" variants={stagger} initial="initial" animate="animate">
                            {trajets.map((trajet) => {
                                const complet = trajet.available_seats === 0;
                                const vehicleType = (trajet as any).type ?? 'standard';
                                return (
                                    <motion.div key={trajet.id} variants={fadeUp}
                                        className={`bg-white rounded-xl shadow-xl overflow-hidden transition-all ${
                                            complet ? 'opacity-60' : 'hover:shadow-xl cursor-pointer'
                                        }`}
                                    >
                                        <div className="p-5 flex flex-col lg:flex-row items-center gap-5">
                                            <div className="flex flex-col items-center justify-center w-full lg:w-28 pb-4 lg:pb-0 lg:pr-5 shrink-0">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${
                                                    vehicleType === 'vip' ? 'bg-sahel-yellow/10' : 'bg-gris-surface'
                                                }`}>
                                                    <Bus size={22} className={vehicleType === 'vip' ? 'text-sahel-yellow' : 'text-on-surface-variant'} />
                                                </div>
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-center">
                                                    {vehicleType === 'vip' ? (
                                                        <span className="text-sahel-yellow">VIP</span>
                                                    ) : 'Standard'}
                                                </span>
                                            </div>

                                            <div className="flex-1 flex items-center justify-between w-full gap-4 px-2">
                                                <div className="text-center">
                                                    <div className="text-2xl font-black text-slate-dark tracking-tight">{trajet.departure_time}</div>
                                                    <div className="text-xs text-on-surface-variant mt-0.5">{trajet.departure_city}</div>
                                                </div>
                                                <div className="flex-1 flex flex-col items-center px-3">
                                                    <span className="text-xs font-semibold text-on-surface-variant mb-1.5">{trajet.duration}</span>
                                                    <div className="w-full h-px bg-gris-surface relative">
                                                        <div className="w-2 h-2 rounded-full bg-primary absolute left-0 top-1/2 -translate-y-1/2" />
                                                        <div className="w-2 h-2 rounded-full border-2 border-primary bg-white absolute right-0 top-1/2 -translate-y-1/2" />
                                                    </div>
                                                    <span className="text-xs mt-1.5 font-medium text-primary">Direct</span>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-black text-slate-dark tracking-tight">{trajet.arrival_time}</div>
                                                    <div className="text-xs text-on-surface-variant mt-0.5">{trajet.arrival_city}</div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end justify-center w-full lg:w-44 pt-4 lg:pt-0 lg:pl-5 shrink-0 gap-2">
                                                <div className="flex flex-wrap gap-1.5 justify-end">
                                                    {complet ? (
                                                        <StatusBadge status="complet" />
                                                    ) : trajet.available_seats <= 5 ? (
                                                        <span className="bg-status-yellow-bg text-status-yellow-text text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                                                            {trajet.available_seats} places
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <div className={`text-xl font-black tracking-tight ${complet ? 'text-on-surface-variant/60 line-through' : 'text-slate-dark'}`}>
                                                    {formatFCFA(trajet.price)}
                                                </div>
                                                <button
                                                    onClick={() => selectTrip(trajet)}
                                                    disabled={complet}
                                                    className={`w-full text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                                                        complet
                                                            ? 'bg-gris-surface text-on-surface-variant cursor-not-allowed'
                                                            : 'bg-primary text-white hover:brightness-110 shadow-xl'
                                                    }`}
                                                >
                                                    {complet ? 'Non disponible' : 'Choisir'}
                                                    {!complet && <ArrowRight size={13} />}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </section>
            </div>
        </div>
    );
}

Search.layout = (page: React.ReactNode) => (
    <GuestLayout title="Résultats" activeNav="Réserver">{page}</GuestLayout>
);
