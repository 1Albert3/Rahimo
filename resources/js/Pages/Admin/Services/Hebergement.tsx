import { motion } from 'framer-motion';
import { Bed, CheckCheck, DoorOpen, DoorClosed, Plus, DollarSign, X } from 'lucide-react';
import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import StatusBadge from '@/Components/StatusBadge';
import type { PageProps } from '@/types';

interface AccommodationItem {
    id: number;
    guest_name: string;
    guest_phone: string;
    check_in: string;
    check_out: string | null;
    room_type: string;
    room_number: string | null;
    amount_per_night: number;
    total_amount: number;
    status: string;
    notes: string | null;
}

interface Props extends PageProps {
    accommodations: AccommodationItem[];
    stats: { en_cours: number; reserve: number; termine: number; revenu: number };
}

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

const ROOM_LABELS: Record<string, string> = { standard: 'Standard', vip: 'VIP', suite: 'Suite' };

export default function Hebergement({ accommodations, stats }: Props) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        guest_name: '', guest_phone: '',
        check_in: new Date().toISOString().slice(0, 16), check_out: '',
        room_type: 'standard', room_number: '',
        amount_per_night: '0', total_amount: '0', notes: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.services.hebergement.store'), {
            onSuccess: () => { setShowForm(false); reset(); },
        });
    };

    const ST = [
        { label: 'Réservées', val: stats.reserve, icon: DoorOpen, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
        { label: 'En cours', val: stats.en_cours, icon: DoorClosed, color: 'text-status-yellow-text', bg: 'bg-orange-900/30' },
        { label: 'Terminées', val: stats.termine, icon: CheckCheck, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
        { label: 'Revenu', val: `${stats.revenu.toLocaleString()} FCFA`, icon: DollarSign, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
    ];

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Hébergement</h1>
                    <p className="text-admin-muted text-sm mt-0.5">Gestion des chambres et réservations</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all"
                ><Plus size={16} /> Nouvelle réservation</button>
            </div>

            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={stagger} initial="initial" animate="animate">
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
                                <th className="text-left p-4">Client</th>
                                <th className="text-left p-4">Chambre</th>
                                <th className="text-left p-4">Check-in</th>
                                <th className="text-left p-4">Check-out</th>
                                <th className="text-right p-4">Nuit</th>
                                <th className="text-right p-4">Total</th>
                                <th className="text-center p-4">Statut</th>
                                <th className="text-center p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accommodations.map((a) => (
                                <tr key={a.id} className=" hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <p className="font-semibold text-white">{a.guest_name}</p>
                                        <p className="text-admin-muted text-xs">{a.guest_phone}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className="flex items-center gap-1 text-admin-muted">
                                            <Bed size={14} />
                                            {ROOM_LABELS[a.room_type] ?? a.room_type}
                                            {a.room_number && <> — #{a.room_number}</>}
                                        </span>
                                    </td>
                                    <td className="p-4 text-admin-muted">{a.check_in}</td>
                                    <td className="p-4 text-admin-muted">{a.check_out ?? '—'}</td>
                                    <td className="p-4 text-right text-white">{a.amount_per_night.toLocaleString()} FCFA</td>
                                    <td className="p-4 text-right text-white font-semibold">{a.total_amount.toLocaleString()} FCFA</td>
                                    <td className="p-4 text-center"><StatusBadge status={a.status} /></td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {a.status === 'reserve' && (
                                                <button onClick={() => router.post(route('admin.services.hebergement.checkin', a.id))}
                                                    className="px-3 py-1.5 bg-status-blue-text/20 text-status-blue-text rounded-lg text-xs font-semibold hover:bg-status-blue-text/30 transition-all"
                                                ><DoorOpen size={12} /> Check-in</button>
                                            )}
                                            {a.status === 'en_cours' && (
                                                <button onClick={() => router.post(route('admin.services.hebergement.checkout', a.id))}
                                                    className="px-3 py-1.5 bg-status-yellow-text/20 text-status-yellow-text rounded-lg text-xs font-semibold hover:bg-status-yellow-text/30 transition-all"
                                                ><DoorClosed size={12} /> Check-out</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {accommodations.length === 0 && (
                                <tr><td colSpan={8} className="p-8 text-center text-admin-muted">Aucune réservation</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
                    <div className="bg-admin-card rounded-2xl border border-white/10 p-6 w-full max-w-lg mx-2 sm:mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">Nouvelle réservation</h2>
                            <button onClick={() => setShowForm(false)} className="text-admin-muted hover:text-white transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Nom complet *</label>
                                    <input value={data.guest_name} onChange={e => setData('guest_name', e.target.value)} required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                    {errors.guest_name && <p className="text-status-red-text text-xs mt-1">{errors.guest_name}</p>}
                                </div>
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Téléphone *</label>
                                    <input value={data.guest_phone} onChange={e => setData('guest_phone', e.target.value)} required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Type chambre *</label>
                                    <select value={data.room_type} onChange={e => setData('room_type', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                                    >
                                        <option value="standard">Standard</option>
                                        <option value="vip">VIP</option>
                                        <option value="suite">Suite</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">N° chambre</label>
                                    <input value={data.room_number} onChange={e => setData('room_number', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Check-in *</label>
                                    <input type="datetime-local" value={data.check_in} onChange={e => setData('check_in', e.target.value)} required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Check-out</label>
                                    <input type="datetime-local" value={data.check_out} onChange={e => setData('check_out', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Prix/nuit (FCFA) *</label>
                                    <input type="number" value={data.amount_per_night} onChange={e => setData('amount_per_night', e.target.value)} required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Total (FCFA) *</label>
                                    <input type="number" value={data.total_amount} onChange={e => setData('total_amount', e.target.value)} required
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

Hebergement.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Hébergement" breadcrumbs={[{ label: 'Services' }, { label: 'Hébergement' }]}>
        {page}
    </BackOfficeLayout>
);
