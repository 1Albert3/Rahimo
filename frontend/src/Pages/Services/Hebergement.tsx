
import { motion } from 'framer-motion';
import { ArrowLeft, Bed, CheckCircle } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useForm } from '@/hooks/useForm';
import { Link } from 'react-router-dom';


const ROOM_TYPES = [
    { key: 'standard', label: 'Standard', price: '15 000 FCFA/nuit', desc: 'Chambre confortable avec climatisation, TV et wifi' },
    { key: 'vip', label: 'VIP', price: '25 000 FCFA/nuit', desc: 'Chambre spacieuse avec salon, minibar et vue' },
    { key: 'suite', label: 'Suite', price: '40 000 FCFA/nuit', desc: 'Suite premium avec jacuzzi, terrasse et service en chambre' },
];

export default function Hebergement() {
    const { data, setData, setDataMulti, post, processing, recentlySuccessful } = useForm({
        guest_name: '',
        guest_phone: '',
        check_in: new Date().toISOString().slice(0, 16),
        check_out: '',
        room_type: 'standard',
        amount_per_night: '15000',
        notes: '',
    });

    const updateRoom = (key: string, price: string) => {
        setDataMulti({ room_type: key, amount_per_night: price.replace(/\s/g, '').replace('FCFA/nuit', '') });
    };

    if (recentlySuccessful) {
        return (
            <div className="max-w-lg mx-auto px-4 py-16 text-center">
                <div className="w-16 h-16 bg-status-green-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-status-green-text" />
                </div>
                <h1 className="text-2xl font-black text-slate-dark tracking-tight mb-2">Réservation effectuée !</h1>
                <p className="text-on-surface-variant text-sm mb-6">Un agent vous contactera pour confirmer votre séjour.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/services/hebergement" className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm">Nouvelle réservation</Link>
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
                <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                    <Bed size={20} className="text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-black text-slate-dark tracking-tight">Hébergement</h1>
                    <p className="text-xs text-on-surface-variant">Réservez une chambre dans nos gares</p>
                </div>
            </div>

            <motion.div className="space-y-3 mb-6">
                {ROOM_TYPES.map(r => (
                    <button key={r.key} type="button" onClick={() => updateRoom(r.key, r.price)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            data.room_type === r.key ? 'border-purple-500 bg-purple-50' : 'border-outline hover:border-purple-500/50'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <p className="font-black text-slate-dark">{r.label}</p>
                            <p className="font-bold text-sm text-purple-600">{r.price}</p>
                        </div>
                        <p className="text-xs text-on-surface-variant">{r.desc}</p>
                    </button>
                ))}
            </motion.div>

            <motion.form onSubmit={e => { e.preventDefault(); post('/services/hebergement'); }}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-xl p-6 space-y-4"
            >
                <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Nom complet *</label>
                    <input type="text" value={data.guest_name} onChange={e => setData('guest_name', e.target.value)} required
                        className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15 outline-none transition-all"
                        placeholder="Votre nom"
                    />
                </div>
                <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Téléphone *</label>
                    <input type="tel" value={data.guest_phone} onChange={e => setData('guest_phone', e.target.value)} required
                        className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15 outline-none transition-all"
                        placeholder="+226 XX XX XX XX"
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Check-in *</label>
                        <input type="datetime-local" value={data.check_in} onChange={e => setData('check_in', e.target.value)} required
                            className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Check-out</label>
                        <input type="datetime-local" value={data.check_out} onChange={e => setData('check_out', e.target.value)}
                            className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15 outline-none transition-all" />
                    </div>
                </div>
                <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Notes</label>
                    <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2}
                        className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15 outline-none transition-all resize-none"
                        placeholder="Demandes particulières..."
                    />
                </div>
                <button type="submit" disabled={processing}
                    className="w-full py-3 bg-purple-500 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-xl"
                >{processing ? 'Envoi...' : 'Réserver ma chambre'}</button>
            </motion.form>
        </div>
    );
}