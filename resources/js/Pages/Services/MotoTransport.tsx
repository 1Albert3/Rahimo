import { Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Package } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import type { PageProps } from '@/types';

export default function MotoTransport() {
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        sender_name: '',
        sender_phone: '',
        recipient_name: '',
        recipient_phone: '',
        origin_city: '',
        destination_city: '',
        moto_brand: '',
        moto_model: '',
        moto_registration: '',
        notes: '',
    });

    if (recentlySuccessful) {
        return (
            <div className="max-w-lg mx-auto px-4 py-16 text-center">
                <div className="w-16 h-16 bg-status-green-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-status-green-text" />
                </div>
                <h1 className="text-2xl font-black text-on-surface tracking-tight mb-2">Demande envoyée !</h1>
                <p className="text-on-surface-variant text-sm mb-6">Nous vous envoyons une estimation sous 24h.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href={route('services.public.moto')} className="px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold text-sm">Nouvelle demande</Link>
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <Package size={20} className="text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-black text-on-surface tracking-tight">Transport Moto</h1>
                    <p className="text-xs text-on-surface-variant">Expédiez votre moto en toute sécurité</p>
                </div>
            </div>

            <motion.form onSubmit={e => { e.preventDefault(); post(route('services.public.moto.store')); }}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-ambient p-6 space-y-4"
            >
                <div>
                    <h2 className="font-bold text-sm text-on-surface mb-3">Expéditeur</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Nom *</label>
                            <input type="text" value={data.sender_name} onChange={e => setData('sender_name', e.target.value)} required
                                className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 outline-none transition-all"
                                placeholder="Votre nom"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Téléphone *</label>
                            <input type="tel" value={data.sender_phone} onChange={e => setData('sender_phone', e.target.value)} required
                                className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 outline-none transition-all"
                                placeholder="+226 XX XX XX XX"
                            />
                        </div>
                    </div>
                </div>

                <hr className="border-outline-variant/30" />

                <div>
                    <h2 className="font-bold text-sm text-on-surface mb-3">Destinataire</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Nom *</label>
                            <input type="text" value={data.recipient_name} onChange={e => setData('recipient_name', e.target.value)} required
                                className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 outline-none transition-all"
                                placeholder="Nom du destinataire"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Téléphone *</label>
                            <input type="tel" value={data.recipient_phone} onChange={e => setData('recipient_phone', e.target.value)} required
                                className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 outline-none transition-all"
                                placeholder="+226 XX XX XX XX"
                            />
                        </div>
                    </div>
                </div>

                <hr className="border-outline-variant/30" />

                <div>
                    <h2 className="font-bold text-sm text-on-surface mb-3">Trajet</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Ville d'origine *</label>
                            <input type="text" value={data.origin_city} onChange={e => setData('origin_city', e.target.value)} required
                                className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 outline-none transition-all"
                                placeholder="Ouagadougou"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Ville de destination *</label>
                            <input type="text" value={data.destination_city} onChange={e => setData('destination_city', e.target.value)} required
                                className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 outline-none transition-all"
                                placeholder="Bobo-Dioulasso"
                            />
                        </div>
                    </div>
                </div>

                <hr className="border-outline-variant/30" />

                <div>
                    <h2 className="font-bold text-sm text-on-surface mb-3">Moto</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Marque *</label>
                            <input type="text" value={data.moto_brand} onChange={e => setData('moto_brand', e.target.value)} required
                                className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 outline-none transition-all"
                                placeholder="Yamaha"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Modèle *</label>
                            <input type="text" value={data.moto_model} onChange={e => setData('moto_model', e.target.value)} required
                                className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 outline-none transition-all"
                                placeholder="Crypto"
                            />
                        </div>
                    </div>
                    <div className="mt-3">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Immatriculation</label>
                        <input type="text" value={data.moto_registration} onChange={e => setData('moto_registration', e.target.value)}
                            className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 outline-none transition-all"
                            placeholder="AB-123-CD"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Notes</label>
                    <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2}
                        className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 outline-none transition-all resize-none"
                        placeholder="État de la moto, accessoires..."
                    />
                </div>

                <button type="submit" disabled={processing}
                    className="w-full py-3 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-ambient"
                >{processing ? 'Envoi...' : 'Envoyer ma demande'}</button>
            </motion.form>
        </div>
    );
}

MotoTransport.layout = (page: React.ReactNode) => (
    <GuestLayout title="Transport Moto" activeNav="Services">{page}</GuestLayout>
);