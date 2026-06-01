import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowRight, Bike, Bus, Car, CreditCard, Hotel,
    Package, ParkingCircle, PlayCircle, Search, Smartphone, Star, Ticket
} from 'lucide-react';
import { useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';

const VILLES = [
    'Ouagadougou','Bobo-Dioulasso','Koudougou','Banfora',
    'Ouahigouya','Dori','Fada N\'Gourma','Tenkodogo','Kaya','Ziniaré',
];

const SERVICES = [
    { icon: Ticket,        title: 'Billets de Voyage',     desc: 'Réservation de billets de bus pour toutes les destinations nationales avec choix de siège.' },
    { icon: Package,       title: 'Envoi de Colis',        desc: 'Service d\'expédition de courriers et colis express sécurisé à travers tout le réseau.' },
    { icon: Bike,          title: 'Transport de Motos',    desc: 'Logistique spécialisée pour le transport sécurisé de vos engins à deux roues.' },
    { icon: Car,           title: 'Location de Véhicules', desc: 'Mise à disposition de bus et minibus pour vos événements et voyages de groupe.' },
    { icon: ParkingCircle, title: 'Parking Sécurisé',      desc: 'Espaces de stationnement surveillés dans nos gares principales pour vos véhicules.' },
    { icon: Hotel,         title: 'Hébergement',           desc: 'Chambres de repos confortables disponibles en transit dans nos gares majeures.' },
];

const STEPS = [
    { n: '1', icon: Search,     title: 'Recherche',          desc: 'Sélectionnez votre itinéraire, la date et consultez les horaires disponibles en temps réel.' },
    { n: '2', icon: Ticket,     title: 'Sélection du Siège', desc: 'Choisissez votre place préférée sur le plan de salle interactif du bus.' },
    { n: '3', icon: CreditCard, title: 'Paiement Sécurisé',  desc: 'Réglez via Mobile Money ou carte bancaire et recevez votre e-ticket instantanément.' },
];

const TEMOIGNAGES = [
    { nom: 'Amadou T.',    note: 5, texte: '"L\'application m\'a sauvé tellement de temps ! Fini les files d\'attente à la gare de Ouaga. Mon siège préféré m\'attend à chaque voyage."' },
    { nom: 'Fatoumata S.', note: 5, texte: '"Le service d\'envoi de colis est impeccable. Je peux suivre mon paquet en temps réel sur mon téléphone jusqu\'à Bobo-Dioulasso."' },
];

const BOOKING_TABS = [
    { key: 'ticket',   label: 'Ticket',   icon: Ticket  },
    { key: 'colis',    label: 'Colis',    icon: Package },
    { key: 'moto',     label: 'Moto',     icon: Bike    },
    { key: 'location', label: 'Location', icon: Car     },
];

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function Welcome() {
    const [tab, setTab] = useState('ticket');
    const [form, setForm] = useState({ depart: 'Ouagadougou', arrivee: 'Bobo-Dioulasso', date: '', passagers: '1 Passager' });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.visit(route('trips.search'), { data: form });
    };

    return (
        <>
            {/* ── Hero ─────────────────────────────────────────────── */}
            <header className="relative bg-surface-container w-full min-h-[600px] flex items-center justify-center overflow-hidden">
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
                    {/* Headline */}
                    <motion.div className="md:w-1/2 text-white"
                        initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 leading-tight">
                            Voyagez au Burkina Faso en toute sérénité
                        </h1>
                        <p className="text-sm sm:text-lg text-surface-container-highest mb-6 sm:mb-8 max-w-lg leading-relaxed">
                            Achetez votre ticket en ligne, suivez vos colis, réservez vos services — sans file d'attente.
                        </p>
                    </motion.div>

                    {/* Booking Widget */}
                    <motion.div className="md:w-1/2 w-full"
                        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        <div className="bg-surface-container-lowest rounded-xl shadow-ambient overflow-hidden">
                            {/* Tabs */}
                            <div className="flex bg-surface-container-low">
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

                            {/* Form */}
                            <form onSubmit={handleSearch} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { key: 'depart' as const,  label: 'Ville de départ' },
                                        { key: 'arrivee' as const, label: "Ville d'arrivée" },
                                    ].map(({ key, label }) => (
                                        <div key={key} className="space-y-1">
                                            <label className="text-[11px] font-bold uppercase text-on-surface-variant tracking-widest">{label}</label>
                                            <select value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                                className="w-full px-4 py-3 bg-surface-container-low rounded-lg focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/15 outline-none text-on-surface transition-all text-sm"
                                            >
                                                {VILLES.map((v) => <option key={v}>{v}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold uppercase text-on-surface-variant tracking-widest">Date de départ</label>
                                        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                                            className="w-full px-4 py-3 bg-surface-container-low rounded-lg focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/15 outline-none text-on-surface transition-all text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold uppercase text-on-surface-variant tracking-widest">Passagers</label>
                                        <select value={form.passagers} onChange={(e) => setForm({ ...form, passagers: e.target.value })}
                                            className="w-full px-4 py-3 bg-surface-container-low rounded-lg focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/15 outline-none text-on-surface transition-all text-sm"
                                        >
                                            {['1 Passager','2 Passagers','3 Passagers','4 Passagers','5 Passagers'].map((n) => <option key={n}>{n}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button type="submit"
                                    className="w-full bg-gradient-to-br from-primary to-primary-container text-white font-bold py-4 rounded-lg mt-4 hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-ambient"
                                >
                                    Rechercher les départs
                                    <ArrowRight size={18} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* ── Stats Bar — bg-primary ────────────────────────────── */}
            <div className="bg-primary py-8 sm:py-10">
                <motion.div
                    className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row justify-around items-center gap-6 sm:gap-8"
                    variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }}
                >
                    {[
                        { val: '50 000+', label: 'Voyageurs Mensuels' },
                        { val: '25',      label: 'Destinations Desservies' },
                        { val: '150+',    label: 'Flotte Moderne' },
                    ].map((s) => (
                        <motion.div key={s.label} variants={fadeUp} className="text-center text-white">
                            <p className="font-mono text-2xl sm:text-4xl font-bold mb-1">{s.val}</p>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-on-primary-container">{s.label}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* ── Services — bg-surface-container-low ──────────────── */}
            <section className="py-16 sm:py-24 bg-surface-container-low">
                <div className="max-w-7xl mx-auto px-4 sm:px-8">
                    <div className="text-center mb-10 sm:mb-16">
                        <h2 className="text-2xl sm:text-4xl font-bold text-on-surface mb-3 sm:mb-4">Nos Services</h2>
                        <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto">
                            Découvrez l'ensemble de nos solutions logistiques et de transport, conçues pour votre confort et votre efficacité.
                        </p>
                    </div>
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8"
                        variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }}
                    >
                        {SERVICES.map((s) => {
                            const Icon = s.icon;
                            return (
                                <motion.div key={s.title} variants={fadeUp}
                                    whileHover={{ y: -4 }}
                                    className="bg-surface-container-lowest p-5 sm:p-8 rounded-2xl shadow-ambient hover:shadow-lg transition-all group cursor-pointer"
                                >
                                    <div className="w-14 h-14 bg-surface-container-high flex items-center justify-center rounded-xl mb-6 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary-container group-hover:text-white transition-all text-primary">
                                        <Icon size={26} />
                                    </div>
                                    <h3 className="text-xl font-bold text-on-surface mb-3">{s.title}</h3>
                                    <p className="text-on-surface-variant leading-relaxed">{s.desc}</p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* ── Steps — bg-white ─────────────────────────────────── */}
            <section className="py-16 sm:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-8">
                    <div className="text-center mb-10 sm:mb-16">
                        <h2 className="text-2xl sm:text-4xl font-bold text-on-surface mb-3 sm:mb-4">Acheter un ticket en 3 étapes</h2>
                        <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto">
                            Un processus simple, rapide et entièrement digitalisé pour garantir votre place sans tracas.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-surface-container-high -translate-y-1/2 z-0" />
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-12 relative z-10"
                            variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }}
                        >
                            {STEPS.map((s) => {
                                const Icon = s.icon;
                                return (
                                    <motion.div key={s.n} variants={fadeUp}
                                        className="bg-surface-container-low p-6 sm:p-10 rounded-2xl shadow-ambient text-center relative group"
                                    >
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center font-mono text-xl font-bold border-4 border-white shadow-card">
                                            {s.n}
                                        </div>
                                        <div className="mt-4 mb-6 flex justify-center text-primary">
                                            <Icon size={48} />
                                        </div>
                                        <h3 className="text-xl font-bold text-on-surface mb-3">{s.title}</h3>
                                        <p className="text-on-surface-variant leading-relaxed">{s.desc}</p>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Testimonials + App — bg-surface-container-low ────── */}
            <section className="py-16 sm:py-24 bg-surface-container-low">
                <div className="max-w-7xl mx-auto px-4 sm:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-16 items-center">
                        {/* Testimonials */}
                        <motion.div className="lg:col-span-7 space-y-6 sm:space-y-8"
                            variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }}
                        >
                            <h2 className="text-2xl sm:text-4xl font-bold text-on-surface">Ce que disent nos voyageurs</h2>
                            <div className="grid gap-4 sm:gap-6">
                                {TEMOIGNAGES.map((t) => (
                                    <motion.div key={t.nom} variants={fadeUp}
                                        className="bg-surface-container-lowest p-5 sm:p-8 rounded-2xl shadow-ambient"
                                    >
                                        <div className="flex items-center gap-4 mb-4 sm:mb-6">
                                            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm sm:text-lg border-2 border-primary/10 shrink-0">
                                                {t.nom.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-on-surface text-sm sm:text-lg">{t.nom}</h4>
                                                <div className="flex text-kinetic-gold mt-0.5">
                                                    {Array.from({ length: t.note }).map((_, i) => (
                                                        <Star key={i} size={14} className="sm:size-[16px] fill-current" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm sm:text-lg text-on-surface-variant italic leading-relaxed">{t.texte}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* App download — bg-primary rounded-[2rem] */}
                        <motion.div className="lg:col-span-5"
                            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.5 }}
                        >
                            <div className="bg-primary rounded-2xl sm:rounded-[2rem] p-6 sm:p-12 text-white relative overflow-hidden shadow-primary-glow">
                                <div className="absolute -right-16 -bottom-16 opacity-10 rotate-12">
                                    <Smartphone size={256} />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6">L'expérience complète dans votre poche</h3>
                                    <p className="text-sm sm:text-lg text-on-primary-container mb-6 sm:mb-10 leading-relaxed">
                                        Téléchargez l'application Rahimo pour gérer vos voyages, suivre vos colis en direct et accéder à des offres exclusives.
                                    </p>
                                    <div className="flex flex-col gap-3 sm:gap-4">
                                        <button className="bg-white text-on-surface flex items-center gap-3 sm:gap-4 py-3 sm:py-4 px-5 sm:px-8 rounded-xl font-bold hover:bg-surface-container-low transition-all shadow-card">
                                            <PlayCircle size={24} className="sm:size-[32px] text-primary" />
                                            <div className="text-left">
                                                <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant leading-none mb-0.5 sm:mb-1">DISPONIBLE SUR</div>
                                                <div className="text-sm sm:text-lg leading-none">Google Play</div>
                                            </div>
                                        </button>
                                        <button className="bg-white text-on-surface flex items-center gap-3 sm:gap-4 py-3 sm:py-4 px-5 sm:px-8 rounded-xl font-bold hover:bg-surface-container-low transition-all shadow-card">
                                            <Smartphone size={24} className="sm:size-[32px] text-primary" />
                                            <div className="text-left">
                                                <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant leading-none mb-0.5 sm:mb-1">TÉLÉCHARGER DANS L'</div>
                                                <div className="text-sm sm:text-lg leading-none">App Store</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </>
    );
}

Welcome.layout = (page: React.ReactNode) => (
    <GuestLayout title="Accueil" activeNav="Accueil">{page}</GuestLayout>
);
