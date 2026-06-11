import { motion } from 'framer-motion';
import { ArrowRight, Search, Ticket, CreditCard, Bike, Package, Car, ParkingCircle, Hotel } from 'lucide-react';
import Button from '@/Components/Button';
import { Select, Input } from '@/Components/FormControls';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VILLES = [
    'Ouagadougou','Bobo-Dioulasso','Koudougou','Banfora',
    'Ouahigouya','Dori','Fada N\'Gourma','Tenkodogo','Kaya','Ziniaré',
];

const BOOKING_TABS = [
    { key: 'ticket',   label: 'Ticket',   icon: Ticket  },
    { key: 'colis',    label: 'Colis',    icon: Package },
    { key: 'moto',     label: 'Moto',     icon: Bike    },
    { key: 'location', label: 'Location', icon: Car     },
];

export default function Hero() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('ticket');
    const [form, setForm] = useState({ depart: 'Ouagadougou', arrivee: 'Bobo-Dioulasso', date: '', passagers: '1 Passager' });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams({ depart: form.depart, arrivee: form.arrivee, date: form.date, passagers: form.passagers });
        navigate(`/voyages?${params.toString()}`);
    };

    return (
        <header className="relative bg-gris-surface w-full min-h-[600px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1600&q=80"
                    alt="Bus Rahimo Transport"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary/60 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16 flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-12">
                <motion.div className="md:w-1/2 text-white"
                    initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 leading-tight">
                        Voyagez au Burkina Faso en toute sérénité
                    </h1>
                    <p className="text-sm sm:text-lg text-on-surface-variant mb-6 sm:mb-8 max-w-lg leading-relaxed">
                        Achetez votre ticket en ligne, suivez vos colis, réservez vos services — sans file d'attente.
                    </p>
                </motion.div>

                <motion.div className="md:w-1/2 w-full"
                    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                        <div className="flex bg-gris-surface">
                            {BOOKING_TABS.map(({ key, label, icon: Icon }) => (
                                <button key={key} onClick={() => setTab(key)}
                                    className={`flex-1 py-4 text-center font-bold text-xs uppercase tracking-wider flex flex-col items-center gap-2 transition-colors ${
                                        tab === key
                                            ? 'border-b-2 border-primary text-primary'
                                            : 'text-on-surface-variant hover:text-primary border-b-2 border-transparent'
                                    }`}
                                >
                                    <Icon size={20} />
                                    {label}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSearch} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { key: 'depart' as const,  label: 'Ville de départ' },
                                    { key: 'arrivee' as const, label: "Ville d'arrivée" },
                                ].map(({ key, label }) => (
                                    <div key={key} className="space-y-1">
                                        <label className="text-[11px] font-bold uppercase text-on-surface-variant tracking-widest">{label}</label>
                                        <Select value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
                                            {VILLES.map((v) => <option key={v} value={v}>{v}</option>)}
                                        </Select>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold uppercase text-on-surface-variant tracking-widest">Date de départ</label>
                                    <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold uppercase text-on-surface-variant tracking-widest">Passagers</label>
                                    <select value={form.passagers} onChange={(e) => setForm({ ...form, passagers: e.target.value })}
                                        className="w-full px-4 py-3 bg-gris-surface rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/15 outline-none text-slate-dark transition-all text-sm"
                                    >
                                        {['1 Passager','2 Passagers','3 Passagers','4 Passagers','5 Passagers'].map((n) => <option key={n}>{n}</option>)}
                                    </select>
                                </div>
                            </div>
                            <Button type="submit" className="w-full py-4 mt-4 shadow-xl flex items-center justify-center" variant="primary">
                                Rechercher les départs
                                <ArrowRight size={18} />
                            </Button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </header>
    );
}
