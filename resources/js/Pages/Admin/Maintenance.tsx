import { router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertTriangle, Bus, Calendar, CalendarCheck, CheckCircle, Plus, Wrench, X } from 'lucide-react';
import { useState } from 'react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import StatusBadge from '@/Components/StatusBadge';
import { formatFCFA } from '@/lib/utils';
import type { PageProps } from '@/types';

interface MaintenanceItem {
    id: number;
    vehicle: string;
    type: string;
    description: string;
    cost: number;
    date: string;
    mileage: number | null;
    performed_by?: string | null;
}

interface VehicleItem {
    id: number;
    registration_number: string;
    brand: string;
    model: string;
    mileage: number;
    status: string;
    last_maintenance_date: string | null;
    next_maintenance_date: string | null;
    maintenance_count: number;
}

interface Props extends PageProps {
    vehicles: VehicleItem[];
    upcoming: MaintenanceItem[];
    overdue: MaintenanceItem[];
    history: MaintenanceItem[];
    stats: {
        total: number; upcoming: number; overdue: number; completed: number;
        total_cost: number; month_cost: number;
    };
}

const TYPE_LABELS: Record<string, string> = {
    routine: 'Routine', repair: 'Réparation', inspection: 'Inspection', emergency: 'Urgence',
};

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function Maintenance({ vehicles, upcoming, overdue, history, stats }: Props) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        vehicle_id: vehicles.length > 0 ? vehicles[0].id : 0,
        maintenance_type: 'routine',
        description: '',
        cost: '',
        maintenance_date: new Date().toISOString().slice(0, 10),
        next_maintenance_date: '',
        performed_by: '',
        mileage_at_maintenance: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.maintenance.store'), {
            onSuccess: () => { setShowForm(false); reset(); },
        });
    };

    const completeMaintenance = (item: MaintenanceItem) => {
        const cost = prompt('Coût réel (FCFA) :', String(Math.round(item.cost || 0)));
        if (cost === null) return;
        const performedBy = prompt('Effectué par :', '');
        router.patch(
            route('admin.maintenance.complete', item.id),
            { cost: parseFloat(cost) || 0, performed_by: performedBy ?? '', notes: '' },
        );
    };

    const ST = [
        { label: 'Planifiés', val: stats.upcoming, icon: Calendar, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
        { label: 'En retard', val: stats.overdue, icon: AlertTriangle, color: 'text-status-red-text', bg: 'bg-status-red-bg/30' },
        { label: 'Terminés', val: stats.completed, icon: CheckCircle, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
        { label: 'Coût mois', val: formatFCFA(stats.month_cost), icon: Wrench, color: 'text-status-yellow-text', bg: 'bg-orange-900/30' },
    ];

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Maintenance Préventive</h1>
                    <p className="text-admin-muted text-sm mt-0.5">Planification et suivi des entretiens véhicules</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all"
                ><Plus size={16} /> Planifier un entretien</button>
            </div>

            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={stagger} initial="initial" animate="animate">
                {ST.map(s => (
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

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* En retard */}
                {overdue.length > 0 && (
                    <div className="bg-admin-card rounded-xl border border-status-red-ring/30 overflow-hidden">
                        <div className="p-4 flex items-center gap-2 bg-status-red-bg/20">
                            <AlertTriangle size={16} className="text-status-red-text" />
                            <h3 className="font-semibold text-status-red-text text-sm">Entretiens en Retard ({overdue.length})</h3>
                        </div>
                        <div className="divide-y divide-white/5">
                            {overdue.map(o => (
                                <div key={o.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-semibold text-sm">{o.vehicle}</p>
                                        <p className="text-admin-muted text-xs">{TYPE_LABELS[o.type] ?? o.type} · prévu le {o.date}</p>
                                        <p className="text-admin-muted text-xs mt-0.5">{o.description}</p>
                                    </div>
                                    <button onClick={() => completeMaintenance(o)}
                                        className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg font-semibold"
                                    >Terminer</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* À venir */}
                <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                    <div className="p-4 flex items-center gap-2">
                        <CalendarCheck size={16} className="text-primary-container" />
                        <h3 className="font-semibold text-white text-sm">Planifiés ({upcoming.length})</h3>
                    </div>
                    {upcoming.length === 0 ? (
                        <p className="text-admin-muted text-sm text-center py-6">Aucun entretien planifié.</p>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {upcoming.map(u => (
                                <div key={u.id} className="p-4 flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-semibold text-sm">{u.vehicle}</p>
                                        <p className="text-admin-muted text-xs">{TYPE_LABELS[u.type] ?? u.type} · {u.date}</p>
                                    </div>
                                    <div className="text-right shrink-0 ml-3">
                                        <p className="text-admin-muted text-xs">{formatFCFA(u.cost)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Véhicules */}
            <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                <div className="p-4">
                    <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                        <Bus size={16} className="text-primary-container" /> Parc Véhicules
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['Véhicule', 'Km', 'Dernière maintenance', 'Prochaine', 'Entretiens', 'Statut'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map(v => (
                                <tr key={v.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-white">{v.registration_number}</td>
                                    <td className="px-4 py-3 text-admin-muted font-mono">{v.mileage.toLocaleString('fr-FR')}</td>
                                    <td className="px-4 py-3 text-admin-muted">{v.last_maintenance_date ?? '—'}</td>
                                    <td className={`px-4 py-3 font-mono ${v.next_maintenance_date && v.next_maintenance_date <= new Date().toISOString().slice(0, 10) ? 'text-status-red-text font-bold' : 'text-admin-muted'}`}>
                                        {v.next_maintenance_date ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-admin-muted">{v.maintenance_count}</td>
                                    <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Historique */}
            {history.length > 0 && (
                <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                    <div className="p-4">
                        <h3 className="font-semibold text-white text-sm">Historique (20 derniers)</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                                <tr>
                                    {['Véhicule', 'Type', 'Description', 'Date', 'Km', 'Coût', 'Par'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(h => (
                                    <tr key={h.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 font-semibold text-white">{h.vehicle}</td>
                                        <td className="px-4 py-3 text-admin-muted">{TYPE_LABELS[h.type] ?? h.type}</td>
                                        <td className="px-4 py-3 text-admin-muted text-xs max-w-[200px] truncate">{h.description}</td>
                                        <td className="px-4 py-3 text-admin-muted">{h.date}</td>
                                        <td className="px-4 py-3 text-admin-muted font-mono">{h.mileage?.toLocaleString('fr-FR') ?? '—'}</td>
                                        <td className="px-4 py-3 text-admin-text font-semibold font-mono">{formatFCFA(h.cost)}</td>
                                        <td className="px-4 py-3 text-admin-muted">{h.performed_by ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
                    <div className="bg-admin-card rounded-2xl border border-white/10 p-6 w-full max-w-lg mx-2" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">Planifier un entretien</h2>
                            <button onClick={() => setShowForm(false)} className="text-admin-muted hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="text-xs text-admin-muted mb-1 block">Véhicule *</label>
                                <select value={data.vehicle_id} onChange={e => setData('vehicle_id', Number(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" required
                                >
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} — {v.brand} {v.model}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Type *</label>
                                    <select value={data.maintenance_type} onChange={e => setData('maintenance_type', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                                    >
                                        <option value="routine">Routine</option>
                                        <option value="repair">Réparation</option>
                                        <option value="inspection">Inspection</option>
                                        <option value="emergency">Urgence</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Date *</label>
                                    <input type="date" value={data.maintenance_date} onChange={e => setData('maintenance_date', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" required />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-admin-muted mb-1 block">Description *</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} required rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Coût estimé (FCFA)</label>
                                    <input type="number" value={data.cost} onChange={e => setData('cost', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Km à l'entretien</label>
                                    <input type="number" value={data.mileage_at_maintenance} onChange={e => setData('mileage_at_maintenance', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Prochaine maintenance</label>
                                    <input type="date" value={data.next_maintenance_date} onChange={e => setData('next_maintenance_date', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Effectué par</label>
                                    <input type="text" value={data.performed_by} onChange={e => setData('performed_by', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <button type="submit" disabled={processing}
                                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold text-sm disabled:opacity-50"
                            >{processing ? 'Enregistrement...' : 'Planifier'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

Maintenance.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Maintenance" breadcrumbs={[{ label: 'Flotte' }, { label: 'Maintenance' }]}>
        {page}
    </BackOfficeLayout>
);