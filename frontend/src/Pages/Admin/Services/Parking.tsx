import { motion } from 'framer-motion';
import { Car, Clock, DollarSign, LogOut, Plus, X } from 'lucide-react';
import { useState } from 'react';

import StatusBadge from '@/Components/StatusBadge';
import { useForm } from '@/hooks/useForm';
import { useApi } from '@/hooks/useApi';
import { parkingSortir, storeParking } from '@/api/admin';

interface ParkingItem {
    id: number;
    vehicle_registration: string;
    driver_name: string;
    driver_phone: string;
    entry_date: string;
    exit_date: string | null;
    amount: number;
    amount_paid: number;
    solde: number;
    status: string;
    notes: string | null;
}

interface ParkingData {
    parkings: ParkingItem[];
    stats: { en_cours: number; termine: number; revenu: number };
}

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function Parking() {
    const { data: apiData, loading, refetch } = useApi<ParkingData>('/admin/services/parking');

    const parkings = apiData?.parkings ?? [];
    const stats = apiData?.stats ?? {} as any;
    const [showForm, setShowForm] = useState(false);
    const { data, setData, processing, errors, reset } = useForm({
        vehicle_registration: '', driver_name: '', driver_phone: '',
        entry_date: new Date().toISOString().slice(0, 16), exit_date: '',
        amount: '0', amount_paid: '0', notes: '',
    });

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await storeParking(data);
            setShowForm(false);
            reset();
        } catch {}
    };

    const ST = [
        { label: 'En cours', val: stats?.en_cours ?? 0, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
        { label: 'Terminés', val: stats?.termine ?? 0, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
        { label: 'Revenu', val: `${(stats?.revenu ?? 0).toLocaleString()} FCFA`, color: 'text-status-yellow-text', bg: 'bg-orange-900/30' },
    ];

    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-dark">Parking</h1>
                    <p className="text-on-surface-variant text-sm mt-0.5">Gestion des stationnements</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-all"
                ><Plus size={16} /> Nouveau stationnement</button>
            </div>

            <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-4" variants={stagger} initial="initial" animate="animate">
                {ST.map((s) => (
                    <motion.div key={s.label} variants={fadeUp}
                        className="bg-white rounded-xl border border-outline shadow-sm p-4 flex items-center gap-3"
                    >
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                            <Car size={18} className={s.color} />
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-xs text-on-surface-variant">{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-w-[600px] lg:min-w-0">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className=" text-on-surface-variant text-xs uppercase tracking-wider">
                                <th className="text-left p-4">Véhicule</th>
                                <th className="text-left p-4">Conducteur</th>
                                <th className="text-left p-4">Entrée</th>
                                <th className="text-left p-4">Sortie</th>
                                <th className="text-right p-4">Montant</th>
                                <th className="text-right p-4">Payé</th>
                                <th className="text-right p-4">Solde</th>
                                <th className="text-center p-4">Statut</th>
                                <th className="text-center p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parkings.map((p) => {
                                const s = p.status;
                                const borderCls = s === 'en_cours' ? 'border-l-status-yellow-ring' : s === 'termine' ? 'border-l-status-green-ring' : 'border-l-outline';
                                return (
                                <tr key={p.id} className={` hover:bg-gris-surface transition-colors border-l-4 ${borderCls}`}>
                                    <td className="p-4 font-semibold text-slate-dark">{p.vehicle_registration}</td>
                                    <td className="p-4">
                                        <p className="text-slate-dark">{p.driver_name}</p>
                                        <p className="text-on-surface-variant text-xs">{p.driver_phone}</p>
                                    </td>
                                    <td className="p-4 text-on-surface-variant">{p.entry_date}</td>
                                    <td className="p-4 text-on-surface-variant">{p.exit_date ?? '—'}</td>
                                    <td className="p-4 text-right text-slate-dark">{p.amount.toLocaleString()} FCFA</td>
                                    <td className="p-4 text-right text-status-green-text">{p.amount_paid.toLocaleString()} FCFA</td>
                                    <td className="p-4 text-right font-semibold text-status-red-text">{p.solde.toLocaleString()} FCFA</td>
                                    <td className="p-4 text-center"><StatusBadge status={p.status} /></td>
                                    <td className="p-4 text-center">
                                        {p.status === 'en_cours' && (
                                            <button onClick={() => parkingSortir(p.id).then(() => refetch())}
                                                className="flex items-center gap-1 mx-auto px-3 py-1.5 bg-status-yellow-text/20 text-status-yellow-text rounded-xl text-xs font-semibold hover:bg-status-yellow-text/30 transition-all"
                                            ><LogOut size={12} /> Sortie</button>
                                        )}
                                    </td>
                                </tr>
                                );
                            })}
                            {parkings.length === 0 && (
                                <tr><td colSpan={9} className="p-8 text-center text-on-surface-variant">Aucun stationnement</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
                    <div className="bg-white rounded-xl border border-outline shadow-sm p-6 w-full max-w-lg mx-2 sm:mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-dark">Nouveau stationnement</h2>
                            <button onClick={() => setShowForm(false)} className="text-on-surface-variant hover:text-slate-dark transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Immatriculation *</label>
                                    <input {...{...data, vehicle_registration: data.vehicle_registration}} onChange={e => setData('vehicle_registration', e.target.value)} required
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                    {errors.vehicle_registration && <p className="text-status-red-text text-xs mt-1">{errors.vehicle_registration}</p>}
                                </div>
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Entrée *</label>
                                    <input type="datetime-local" value={data.entry_date} onChange={e => setData('entry_date', e.target.value)} required
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-on-surface-variant mb-1 block">Conducteur *</label>
                                <input value={data.driver_name} onChange={e => setData('driver_name', e.target.value)} required
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                {errors.driver_name && <p className="text-status-red-text text-xs mt-1">{errors.driver_name}</p>}
                            </div>
                            <div>
                                <label className="text-xs text-on-surface-variant mb-1 block">Téléphone *</label>
                                <input value={data.driver_phone} onChange={e => setData('driver_phone', e.target.value)} required
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                {errors.driver_phone && <p className="text-status-red-text text-xs mt-1">{errors.driver_phone}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Montant (FCFA) *</label>
                                    <input type="number" value={data.amount} onChange={e => setData('amount', e.target.value)} required
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Payé (FCFA) *</label>
                                    <input type="number" value={data.amount_paid} onChange={e => setData('amount_paid', e.target.value)} required
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-on-surface-variant mb-1 block">Notes</label>
                                <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2}
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                            </div>
                            <button type="submit" disabled={processing}
                                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                            >{processing ? 'Enregistrement...' : 'Enregistrer'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
