import { motion } from 'framer-motion';
import { Car, CheckCheck, DollarSign, Plus, Bike, X } from 'lucide-react';
import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import StatusBadge from '@/Components/StatusBadge';
import type { PageProps } from '@/types';

interface RentalItem {
    id: number;
    type: string;
    brand: string;
    model: string;
    registration_number: string | null;
    rental_start: string;
    rental_end: string | null;
    amount_per_day: number;
    total_amount: number;
    deposit: number;
    status: string;
    notes: string | null;
}

interface Props extends PageProps {
    rentals: RentalItem[];
    stats: { en_cours: number; termine: number; revenu: number };
}

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function Location({ rentals, stats }: Props) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'voiture', brand: '', model: '', registration_number: '',
        rental_start: new Date().toISOString().slice(0, 16), rental_end: '',
        amount_per_day: '0', total_amount: '0', deposit: '0', notes: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.services.location.store'), {
            onSuccess: () => { setShowForm(false); reset(); },
        });
    };

    const ST = [
        { label: 'En cours', val: stats.en_cours, icon: Car, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
        { label: 'Terminées', val: stats.termine, icon: CheckCheck, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
        { label: 'Revenu', val: `${stats.revenu.toLocaleString()} FCFA`, icon: DollarSign, color: 'text-status-yellow-text', bg: 'bg-orange-900/30' },
    ];

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Location</h1>
                    <p className="text-admin-muted text-sm mt-0.5">Véhicules et motos en location</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all"
                ><Plus size={16} /> Nouvelle location</button>
            </div>

            <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-4" variants={stagger} initial="initial" animate="animate">
                {ST.map((s) => (
                    <motion.div key={s.label} variants={fadeUp}
                        className="bg-admin-card rounded-xl border border-white/5 p-4 flex items-center gap-3"
                    >
                        <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                            <s.icon size={18} className={s.color} />
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-xs text-admin-muted">{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto min-w-[600px] lg:min-w-0">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className=" text-admin-muted text-xs uppercase tracking-wider">
                                <th className="text-left p-4">Véhicule</th>
                                <th className="text-left p-4">Type</th>
                                <th className="text-left p-4">Début</th>
                                <th className="text-left p-4">Fin</th>
                                <th className="text-right p-4">Jour</th>
                                <th className="text-right p-4">Total</th>
                                <th className="text-right p-4">Caution</th>
                                <th className="text-center p-4">Statut</th>
                                <th className="text-center p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rentals.map((r) => (
                                <tr key={r.id} className=" hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <p className="font-semibold text-white">{r.brand} {r.model}</p>
                                        {r.registration_number && <p className="text-admin-muted text-xs">{r.registration_number}</p>}
                                    </td>
                                    <td className="p-4">
                                        <span className="flex items-center gap-1 text-admin-muted">
                                            {r.type === 'voiture' ? <Car size={14} /> : <Bike size={14} />}
                                            {r.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-admin-muted">{r.rental_start}</td>
                                    <td className="p-4 text-admin-muted">{r.rental_end ?? '—'}</td>
                                    <td className="p-4 text-right text-white">{r.amount_per_day.toLocaleString()}</td>
                                    <td className="p-4 text-right text-white font-semibold">{r.total_amount.toLocaleString()} FCFA</td>
                                    <td className="p-4 text-right text-admin-muted">{r.deposit.toLocaleString()} FCFA</td>
                                    <td className="p-4 text-center"><StatusBadge status={r.status} /></td>
                                    <td className="p-4 text-center">
                                        {r.status === 'en_cours' && (
                                            <button onClick={() => router.post(route('admin.services.location.terminer', r.id))}
                                                className="px-3 py-1.5 bg-status-yellow-text/20 text-status-yellow-text rounded-lg text-xs font-semibold hover:bg-status-yellow-text/30 transition-all"
                                            >Terminer</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {rentals.length === 0 && (
                                <tr><td colSpan={9} className="p-8 text-center text-admin-muted">Aucune location</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
                    <div className="bg-admin-card rounded-2xl border border-white/10 p-6 w-full max-w-lg mx-2 sm:mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">Nouvelle location</h2>
                            <button onClick={() => setShowForm(false)} className="text-admin-muted hover:text-white transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Type *</label>
                                    <select value={data.type} onChange={e => setData('type', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                                    >
                                        <option value="voiture">Voiture</option>
                                        <option value="moto">Moto</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Immatriculation</label>
                                    <input value={data.registration_number} onChange={e => setData('registration_number', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Marque *</label>
                                    <input value={data.brand} onChange={e => setData('brand', e.target.value)} required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                    {errors.brand && <p className="text-status-red-text text-xs mt-1">{errors.brand}</p>}
                                </div>
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Modèle *</label>
                                    <input value={data.model} onChange={e => setData('model', e.target.value)} required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Début *</label>
                                    <input type="datetime-local" value={data.rental_start} onChange={e => setData('rental_start', e.target.value)} required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Fin prévue</label>
                                    <input type="datetime-local" value={data.rental_end} onChange={e => setData('rental_end', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Prix/jour *</label>
                                    <input type="number" value={data.amount_per_day} onChange={e => setData('amount_per_day', e.target.value)} required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Total *</label>
                                    <input type="number" value={data.total_amount} onChange={e => setData('total_amount', e.target.value)} required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Caution *</label>
                                    <input type="number" value={data.deposit} onChange={e => setData('deposit', e.target.value)} required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-admin-muted mb-1 block">Notes</label>
                                <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                            </div>
                            <button type="submit" disabled={processing}
                                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
                            >{processing ? 'Enregistrement...' : 'Enregistrer'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

Location.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Location" breadcrumbs={[{ label: 'Services' }, { label: 'Location' }]}>
        {page}
    </BackOfficeLayout>
);
