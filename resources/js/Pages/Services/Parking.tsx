import { Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Car, CheckCircle } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import type { PageProps } from '@/types';

export default function Parking() {
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        vehicle_registration: '',
        driver_name: '',
        driver_phone: '',
    });

    if (recentlySuccessful) {
        return (
            <div className="max-w-lg mx-auto px-4 py-16 text-center">
                <div className="w-16 h-16 bg-status-green-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-status-green-text" />
                </div>
                <h1 className="text-2xl font-black text-on-surface tracking-tight mb-2">Stationnement enregistré !</h1>
                <p className="text-on-surface-variant text-sm mb-6">Veuillez vous présenter à l'accueil de la gare.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href={route('services.public.parking')} className="px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold text-sm">Nouveau stationnement</Link>
                    <Link href={route('services.index')} className="px-6 py-3 border border-outline-variant text-on-surface rounded-xl font-semibold text-sm">Retour aux services</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto px-4 md:px-6 py-10">
            <Link href={route('services.index')} className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface mb-6 transition-colors">
                <ArrowLeft size={14} /> Services
            </Link>

            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Car size={20} className="text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-black text-on-surface tracking-tight">Parking</h1>
                    <p className="text-xs text-on-surface-variant">Stationnez en toute sécurité</p>
                </div>
            </div>

            <motion.form onSubmit={e => { e.preventDefault(); post(route('services.public.parking.store')); }}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-ambient p-6 space-y-4"
            >
                <p className="text-sm text-on-surface-variant">Entrée automatique à {new Date().toLocaleString('fr-FR')}</p>
                <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Immatriculation *</label>
                    <input type="text" value={data.vehicle_registration} onChange={e => setData('vehicle_registration', e.target.value)} required
                        className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                        placeholder="AB-123-CD"
                    />
                </div>
                <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Nom complet *</label>
                    <input type="text" value={data.driver_name} onChange={e => setData('driver_name', e.target.value)} required
                        className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                        placeholder="Votre nom"
                    />
                </div>
                <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Téléphone *</label>
                    <input type="tel" value={data.driver_phone} onChange={e => setData('driver_phone', e.target.value)} required
                        className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                        placeholder="+226 XX XX XX XX"
                    />
                </div>
                <button type="submit" disabled={processing}
                    className="w-full py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-ambient"
                >{processing ? 'Enregistrement...' : 'Enregistrer mon stationnement'}</button>
            </motion.form>

            <div className="mt-4 bg-surface-container-low rounded-xl p-4 text-xs text-on-surface-variant flex items-start gap-2">
                <span className="font-bold shrink-0">Info</span>
                <span>Le tarif est calculé à la sortie selon la durée. Paiement à l'accueil.</span>
            </div>
        </div>
    );
}

Parking.layout = (page: React.ReactNode) => (
    <GuestLayout title="Parking" activeNav="Services">{page}</GuestLayout>
);