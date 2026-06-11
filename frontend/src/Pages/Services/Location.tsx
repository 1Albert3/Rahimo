
import { motion } from 'framer-motion';
import { ArrowLeft, Bike, Car, CheckCircle } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useForm } from '@/hooks/useForm';
import { Link } from 'react-router-dom';


interface Props extends PageProps {
    types: { key: string; label: string; icon: string; desc: string }[];
}

export default function Location({ types }: Props) {
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        type: 'voiture',
        brand: '',
        model: '',
        registration_number: '',
        rental_start: new Date().toISOString().slice(0, 16),
        rental_end: '',
        amount_per_day: '',
        deposit: '',
        notes: '',
    });

    if (recentlySuccessful) {
        return (
            <div className="max-w-lg mx-auto px-4 py-16 text-center">
                <div className="w-16 h-16 bg-status-green-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-status-green-text" />
                </div>
                <h1 className="text-2xl font-black text-slate-dark tracking-tight mb-2">Demande envoyée !</h1>
                <p className="text-on-surface-variant text-sm mb-6">Nous vous contacterons sous 24h pour finaliser la location.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/services/location" className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm">Nouvelle demande</Link>
                    <Link to="/services" className="px-6 py-3 border border-outline text-slate-dark rounded-xl font-semibold text-sm">Retour aux services</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto px-4 md:px-6 py-10">
            <Link to="/services" className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-slate-dark mb-6 transition-colors">
                <ArrowLeft size={14} /> Services
            </Link>

            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                    <Car size={20} className="text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-black text-slate-dark tracking-tight">Location</h1>
                    <p className="text-xs text-on-surface-variant">Louez un véhicule pour vos déplacements</p>
                </div>
            </div>

            <motion.form onSubmit={e => { e.preventDefault(); post('/services/location'); }}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-xl p-6 space-y-4"
            >
                <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Type *</label>
                    <div className="grid grid-cols-2 gap-2">
                        {types.map(t => (
                            <button key={t.key} type="button" onClick={() => setData('type', t.key)}
                                className={`p-3 rounded-xl border-2 text-center transition-all ${
                                    data.type === t.key ? 'border-emerald-500 bg-emerald-50' : 'border-outline hover:border-emerald-500/50'
                                }`}
                            >
                                {t.key === 'voiture' ? <Car size={20} className="mx-auto mb-1" /> : <Bike size={20} className="mx-auto mb-1" />}
                                <p className="font-bold text-sm">{t.label}</p>
                                <p className="text-[10px] text-on-surface-variant">{t.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Marque *</label>
                        <input type="text" value={data.brand} onChange={e => setData('brand', e.target.value)} required
                            className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition-all"
                            placeholder="Toyota"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Modèle *</label>
                        <input type="text" value={data.model} onChange={e => setData('model', e.target.value)} required
                            className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition-all"
                            placeholder="Hilux"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Immatriculation</label>
                    <input type="text" value={data.registration_number} onChange={e => setData('registration_number', e.target.value)}
                        className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition-all"
                        placeholder="AB-123-CD"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Début *</label>
                        <input type="datetime-local" value={data.rental_start} onChange={e => setData('rental_start', e.target.value)} required
                            className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Fin prévue</label>
                        <input type="datetime-local" value={data.rental_end} onChange={e => setData('rental_end', e.target.value)}
                            className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Prix par jour *</label>
                        <input type="number" min="0" value={data.amount_per_day} onChange={e => setData('amount_per_day', e.target.value)} required
                            className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition-all"
                            placeholder="25000"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Caution *</label>
                        <input type="number" min="0" value={data.deposit} onChange={e => setData('deposit', e.target.value)} required
                            className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition-all"
                            placeholder="100000"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Notes</label>
                    <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2}
                        className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition-all resize-none"
                        placeholder="Informations complémentaires..."
                    />
                </div>

                <button type="submit" disabled={processing}
                    className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-xl"
                >{processing ? 'Envoi...' : 'Envoyer ma demande'}</button>
            </motion.form>
        </div>
    );
}