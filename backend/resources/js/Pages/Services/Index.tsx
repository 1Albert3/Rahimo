import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Bed, Bike, Car, FileText, Package, Search } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import type { PageProps } from '@/types';

const SERVICES = [
    { icon: Car, label: 'Parking', desc: 'Stationnez votre véhicule en toute sécurité dans nos gares', route: 'services.public.parking', color: 'from-blue-500 to-blue-600' },
    { icon: Bike, label: 'Location', desc: 'Louez une voiture ou une moto pour vos déplacements', route: 'services.public.location', color: 'from-emerald-500 to-emerald-600' },
    { icon: Bed, label: 'Hébergement', desc: 'Nuitées dans nos chambres standard, VIP ou suites', route: 'services.public.hebergement', color: 'from-purple-500 to-purple-600' },
    { icon: Package, label: 'Transport Moto', desc: 'Expédiez votre moto d\'une ville à l\'autre en toute sécurité', route: 'services.public.moto', color: 'from-orange-500 to-orange-600' },
    { icon: FileText, label: 'Réclamations', desc: 'Soumettre une réclamation et suivre son traitement', route: 'services.public.reclamations', color: 'from-red-500 to-red-600' },
    { icon: Search, label: 'Objets Trouvés', desc: 'Signaler un objet perdu ou consulter les objets retrouvés', route: 'services.public.lost-and-found', color: 'from-amber-500 to-amber-600' },
];

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function ServicesIndex() {
    return (
        <div className="max-w-[1080px] mx-auto px-4 md:px-6 py-10 md:py-16">
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-black text-slate-dark tracking-tight mb-2">Nos Services</h1>
                <p className="text-on-surface-variant text-sm max-w-lg mx-auto">
                    Rahimo Transport propose une gamme complète de services pour faciliter vos déplacements et vos envois.
                </p>
            </div>

            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={stagger} initial="initial" animate="animate">
                {SERVICES.map(s => (
                    <motion.div key={s.label} variants={fadeUp}>
                        <Link href={route(s.route)}
                            className="block bg-white rounded-xl shadow-xl p-5 hover:shadow-xl transition-all group"
                        >
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                <s.icon size={20} className="text-white" />
                            </div>
                            <h2 className="font-black text-slate-dark text-base mb-1">{s.label}</h2>
                            <p className="text-sm text-on-surface-variant">{s.desc}</p>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            <div className="mt-10 bg-gris-surface rounded-xl p-6 text-center">
                <p className="text-sm text-on-surface-variant">
                    Vous avez déjà une réservation en cours ?{' '}
                    <Link href={route('client.dashboard')} className="text-primary font-semibold hover:underline">Mon espace client →</Link>
                </p>
            </div>
        </div>
    );
}

ServicesIndex.layout = (page: React.ReactNode) => (
    <GuestLayout title="Services" activeNav="Services">{page}</GuestLayout>
);