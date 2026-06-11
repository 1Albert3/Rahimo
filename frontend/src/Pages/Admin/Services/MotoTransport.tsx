import { motion } from 'framer-motion';
import { Bike, CheckCheck, DollarSign, Package, Plus, Truck, X } from 'lucide-react';
import { useState } from 'react';

import StatusBadge from '@/Components/StatusBadge';
import { useForm } from '@/hooks/useForm';
import { useApi } from '@/hooks/useApi';
import { updateMotoTransportStatus, storeMotoTransport } from '@/api/admin';
interface TransportItem {
    id: number;
    sender_name: string;
    sender_phone: string;
    recipient_name: string;
    recipient_phone: string;
    origin_city: string;
    destination_city: string;
    moto_brand: string;
    moto_model: string;
    moto_registration: string | null;
    amount: number;
    status: string;
    notes: string | null;
}

interface MotoTransportData {
    transports: TransportItem[];
    stats: { en_attente: number; en_cours: number; livre: number; revenu: number };
}

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

const STATUS_ACTIONS: Record<string, { label: string; next: string }> = {
    en_attente: { label: 'Prendre en charge', next: 'en_cours' },
    en_cours: { label: 'Marquer livré', next: 'livre' },
};

export default function MotoTransport() {
    const { data: apiData, loading, refetch } = useApi<MotoTransportData>('/admin/services/moto-transport');

    const transports = apiData?.transports ?? [];
    const stats = apiData?.stats ?? {} as any;
    const [showForm, setShowForm] = useState(false);
    const { data, setData, processing, errors, reset } = useForm({
        sender_name: '', sender_phone: '', recipient_name: '', recipient_phone: '',
        origin_city: '', destination_city: '', moto_brand: '', moto_model: '',
        moto_registration: '', amount: '0', notes: '',
    });

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await storeMotoTransport(data);
            setShowForm(false);
            reset();
        } catch {}
    };

    const ST = [
        { label: 'En attente', val: stats?.en_attente ?? 0, icon: Package, color: 'text-status-yellow-text', bg: 'bg-orange-900/30' },
        { label: 'En cours', val: stats?.en_cours ?? 0, icon: Truck, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
        { label: 'Livrées', val: stats?.livre ?? 0, icon: CheckCheck, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
        { label: 'Revenu', val: `${(stats?.revenu ?? 0).toLocaleString()} FCFA`, icon: DollarSign, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
    ];

    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-dark">Transport Motos</h1>
                    <p className="text-on-surface-variant text-sm mt-0.5">Expédition de motos entre villes</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-all"
                ><Plus size={16} /> Nouvel envoi</button>
            </div>

            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={stagger} initial="initial" animate="animate">
                {ST.map((s) => (
                    <motion.div key={s.label} variants={fadeUp}
                        className="bg-white rounded-xl border border-outline shadow-sm p-4 flex items-center gap-3"
                    >
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                            <s.icon size={18} className={s.color} />
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
                                <th className="text-left p-4">Expéditeur</th>
                                <th className="text-left p-4">Destinataire</th>
                                <th className="text-left p-4">Trajet</th>
                                <th className="text-left p-4">Moto</th>
                                <th className="text-right p-4">Montant</th>
                                <th className="text-center p-4">Statut</th>
                                <th className="text-center p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transports.map((m) => {
                                const s = m.status;
                                const borderCls = s === 'livre' ? 'border-l-status-green-ring' : s === 'en_cours' ? 'border-l-status-yellow-ring' : s === 'en_attente' ? 'border-l-primary' : 'border-l-outline';
                                return (
                                <tr key={m.id} className={` hover:bg-gris-surface transition-colors border-l-4 ${borderCls}`}>
                                    <td className="p-4">
                                        <p className="font-semibold text-slate-dark">{m.sender_name}</p>
                                        <p className="text-on-surface-variant text-xs">{m.sender_phone}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-slate-dark">{m.recipient_name}</p>
                                        <p className="text-on-surface-variant text-xs">{m.recipient_phone}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-on-surface-variant">{m.origin_city} → {m.destination_city}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="flex items-center gap-1 text-on-surface-variant">
                                            <Bike size={14} />
                                            {m.moto_brand} {m.moto_model}
                                            {m.moto_registration && <>({m.moto_registration})</>}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right text-slate-dark font-semibold">{m.amount.toLocaleString()} FCFA</td>
                                    <td className="p-4 text-center"><StatusBadge status={m.status} /></td>
                                    <td className="p-4 text-center">
                                        {STATUS_ACTIONS[m.status] && (
                                            <button onClick={() => updateMotoTransportStatus(m.id, { status: STATUS_ACTIONS[m.status].next }).then(() => refetch())}
                                                className="px-3 py-1.5 bg-status-blue-text/20 text-status-blue-text rounded-xl text-xs font-semibold hover:bg-status-blue-text/30 transition-all"
                                            >{STATUS_ACTIONS[m.status].label}</button>
                                        )}
                                    </td>
                                </tr>
                                );
                            })}
                            {transports.length === 0 && (
                                <tr><td colSpan={7} className="p-8 text-center text-on-surface-variant">Aucun transport</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
                    <div className="bg-white rounded-xl border border-outline shadow-sm p-6 w-full max-w-lg mx-2 sm:mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-dark">Nouvel envoi moto</h2>
                            <button onClick={() => setShowForm(false)} className="text-on-surface-variant hover:text-slate-dark transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Expéditeur *</label>
                                    <input value={data.sender_name} onChange={e => setData('sender_name', e.target.value)} required
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Tél. expéditeur *</label>
                                    <input value={data.sender_phone} onChange={e => setData('sender_phone', e.target.value)} required
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Destinataire *</label>
                                    <input value={data.recipient_name} onChange={e => setData('recipient_name', e.target.value)} required
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Tél. destinataire *</label>
                                    <input value={data.recipient_phone} onChange={e => setData('recipient_phone', e.target.value)} required
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Ville départ *</label>
                                    <input value={data.origin_city} onChange={e => setData('origin_city', e.target.value)} required
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Ville arrivée *</label>
                                    <input value={data.destination_city} onChange={e => setData('destination_city', e.target.value)} required
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Marque *</label>
                                    <input value={data.moto_brand} onChange={e => setData('moto_brand', e.target.value)} required
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Modèle *</label>
                                    <input value={data.moto_model} onChange={e => setData('moto_model', e.target.value)} required
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Immatriculation</label>
                                    <input value={data.moto_registration} onChange={e => setData('moto_registration', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Montant (FCFA) *</label>
                                    <input type="number" value={data.amount} onChange={e => setData('amount', e.target.value)} required
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Notes</label>
                                    <input value={data.notes} onChange={e => setData('notes', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
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
