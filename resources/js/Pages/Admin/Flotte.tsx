import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { AlertTriangle, Bus, CheckCircle, MapPin, Navigation, Pencil, Plus, RefreshCw, Trash2, Wrench, X } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import StatusBadge from '@/Components/StatusBadge';
import type { PageProps, Vehicle } from '@/types';

interface Props extends PageProps {
    vehicules: (Vehicle & { last_latitude?: number; last_longitude?: number; last_gps_update?: string })[];
    stats: { total: number; actifs: number; maintenance: number; hors_service: number; en_retard_maintenance: number };
}

type FormMode = 'create' | 'edit';

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function Flotte({ vehicules, stats }: Props) {
    const [gpsVehicles, setGpsVehicles] = useState<typeof vehicules>([]);
    const [simulating, setSimulating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState<FormMode>('create');
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        registration_number: '',
        brand: '',
        model: '',
        capacity: 50,
        type: '',
        year: new Date().getFullYear(),
        fuel_type: '',
        mileage: 0,
        status: 'active',
    });

    const openCreate = () => {
        setMode('create');
        setEditingVehicle(null);
        reset();
        setShowModal(true);
    };

    const openEdit = (v: Vehicle & { last_gps_update?: string }) => {
        setMode('edit');
        setEditingVehicle(v);
        setData({
            registration_number: v.registration_number,
            brand: v.brand,
            model: v.model,
            capacity: v.capacity,
            type: (v as any).type ?? '',
            year: v.year ?? new Date().getFullYear(),
            fuel_type: v.fuel_type,
            mileage: v.mileage,
            status: v.status,
        });
        setShowModal(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'create') {
            post(route('admin.flotte.store'), {
                onSuccess: () => { setShowModal(false); reset(); },
            });
        } else if (editingVehicle) {
            put(route('admin.flotte.update', { vehicle: editingVehicle.id }), {
                onSuccess: () => { setShowModal(false); reset(); },
            });
        }
    };

    const confirmDelete = (v: Vehicle) => {
        if (confirm(`Supprimer le véhicule ${v.registration_number} ? Cette action est irréversible.`)) {
            router.delete(route('admin.flotte.destroy', { vehicle: v.id }));
        }
    };

    const loadGps = async () => {
        try {
            const res = await fetch(route('admin.flotte.gps'));
            const json = await res.json();
            setGpsVehicles(json.vehicules ?? []);
        } catch { /* ignore */ }
    };

    const simulate = async () => {
        setSimulating(true);
        try {
            await fetch(route('admin.flotte.gps.simuler'), { method: 'POST' });
            await loadGps();
        } catch { /* ignore */ }
        setSimulating(false);
    };

    useEffect(() => { loadGps(); const t = setInterval(loadGps, 15000); return () => clearInterval(t); }, []);

    const STATS = [
        { label: 'Total',        val: stats.total,                   icon: Bus,            color: 'text-admin-muted',        bg: 'bg-white/5' },
        { label: 'Bus Actifs',   val: stats.actifs,                  icon: CheckCircle,    color: 'text-status-green-text',  bg: 'bg-status-green-bg/30' },
        { label: 'Maintenance',  val: stats.maintenance,             icon: Wrench,         color: 'text-status-yellow-text', bg: 'bg-status-yellow-bg/30' },
        { label: 'Retard Maint.',val: stats.en_retard_maintenance,   icon: AlertTriangle,  color: 'text-status-red-text',    bg: 'bg-status-red-bg/30' },
    ];

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-white">Gestion de la Flotte</h1>
                    <p className="text-admin-muted text-sm mt-0.5">Suivi GPS, maintenance et gestion des véhicules</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={openCreate}
                        className="flex items-center gap-2 bg-primary text-on-primary text-sm font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-all"
                    >
                        <Plus size={15} /> Ajouter
                    </button>
                    <button onClick={loadGps}
                        className="flex items-center gap-2 border border-white/10 text-admin-muted hover:text-white hover:bg-white/5 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                        <RefreshCw size={15} /> Actualiser
                    </button>
                    <button onClick={simulate} disabled={simulating}
                        className="flex items-center gap-2 border border-white/10 text-admin-muted hover:text-white hover:bg-white/5 text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Navigation size={15} className={simulating ? 'animate-pulse' : ''} /> Simuler GPS
                    </button>
                </div>
            </div>

            <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger} initial="initial" animate="animate">
                {STATS.map((s) => {
                    const Icon = s.icon;
                    return (
                        <motion.div key={s.label} variants={fadeUp}
                            className="bg-admin-card rounded-xl border border-white/5 p-4 flex items-center gap-3"
                        >
                            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                                <Icon size={18} className={s.color} />
                            </div>
                            <div>
                                <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
                                <p className="text-xs text-admin-muted">{s.label}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                        <MapPin size={15} className="text-primary-container" />
                        Suivi GPS Temps Réel
                    </h2>
                    <span className="text-xs text-admin-muted">{gpsVehicles.length} véhicules actifs</span>
                </div>
                <div className="p-6 min-h-[300px] bg-[#0F172A] relative">
                    <div className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #475569 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                    />
                    <div className="relative z-10 flex flex-wrap gap-3">
                        {gpsVehicles.map((v: any) => {
                            const speed = v.speed ?? 0;
                            return (
                                <div key={v.id}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
                                        speed > 90
                                            ? 'bg-red-950/50 border-status-red-ring text-status-red-text'
                                            : 'bg-white/5 border-white/10 text-white'
                                    }`}
                                >
                                    <Navigation size={16} className={speed > 0 ? 'animate-pulse' : ''} />
                                    <div>
                                        <p className="font-mono font-bold text-xs">{v.registration_number}</p>
                                        <p className="text-[10px] opacity-70">
                                            {v.brand} · {speed} km/h · {v.last_update ?? 'N/A'}
                                        </p>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${speed > 90 ? 'bg-status-red-text animate-pulse' : 'bg-status-green-text'}`} />
                                </div>
                            );
                        })}
                        {gpsVehicles.length === 0 && (
                            <p className="text-admin-muted text-sm w-full text-center py-8">
                                Aucun véhicule actif. Cliquez sur "Simuler GPS" pour générer des données de test.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {vehicules.map((v, i) => (
                    <motion.div key={v.id} variants={fadeUp} initial="initial" animate="animate"
                        className="bg-admin-card rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors group"
                    >
                        <div className="p-5 flex flex-col lg:flex-row gap-4 lg:items-center">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                                    <Bus size={22} className="text-admin-muted" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">{v.brand} {v.model}</h3>
                                    <p className="text-xs font-mono text-admin-muted mt-0.5">{v.registration_number} · {v.capacity} places</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <StatusBadge status={v.status} />
                                <span className="text-xs text-admin-muted font-mono">{v.year}</span>
                                <button onClick={() => openEdit(v)}
                                    className="p-1.5 rounded-lg text-admin-muted hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                                    title="Modifier"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button onClick={() => confirmDelete(v)}
                                    className="p-1.5 rounded-lg text-admin-muted hover:text-status-red-text hover:bg-status-red-bg/20 transition-all opacity-0 group-hover:opacity-100"
                                    title="Supprimer"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="border-t border-white/5 px-5 py-3 bg-white/[0.02] flex flex-wrap gap-x-6 gap-y-1 text-xs">
                            <span className="text-admin-muted">Km: <span className="text-white font-mono">{v.mileage.toLocaleString('fr-FR')}</span></span>
                            <span className="text-admin-muted">Dernière maint.: <span className="text-white font-mono">{v.last_maintenance_date ?? 'N/A'}</span></span>
                            <span className="text-admin-muted">Prochaine: <span className="text-white font-mono">{v.next_maintenance_date ?? 'N/A'}</span></span>
                            {(v as any).last_gps_update && (
                                <span className="text-admin-muted">GPS: <span className="text-white font-mono">{(v as any).last_gps_update}</span></span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal Ajouter / Modifier */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setShowModal(false)}>
                    <div className="bg-admin-card rounded-2xl border border-white/10 p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">
                                {mode === 'create' ? 'Ajouter un véhicule' : 'Modifier le véhicule'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-1 text-admin-muted hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-admin-muted mb-1">Immatriculation *</label>
                                    <input type="text" value={data.registration_number} onChange={e => setData('registration_number', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-admin-muted focus:outline-none focus:border-primary transition-colors"
                                        placeholder="R-XXX" />
                                    {errors.registration_number && <p className="text-status-red-text text-xs mt-1">{errors.registration_number}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-admin-muted mb-1">Marque *</label>
                                    <input type="text" value={data.brand} onChange={e => setData('brand', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-admin-muted focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Mercedes" />
                                    {errors.brand && <p className="text-status-red-text text-xs mt-1">{errors.brand}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-admin-muted mb-1">Modèle *</label>
                                    <input type="text" value={data.model} onChange={e => setData('model', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-admin-muted focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Sprinter" />
                                    {errors.model && <p className="text-status-red-text text-xs mt-1">{errors.model}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-admin-muted mb-1">Capacité *</label>
                                    <input type="number" value={data.capacity} onChange={e => setData('capacity', Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-admin-muted focus:outline-none focus:border-primary transition-colors"
                                        min={1} />
                                    {errors.capacity && <p className="text-status-red-text text-xs mt-1">{errors.capacity}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-admin-muted mb-1">Année</label>
                                    <input type="number" value={data.year} onChange={e => setData('year', Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-admin-muted focus:outline-none focus:border-primary transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-admin-muted mb-1">Carburant</label>
                                    <select value={data.fuel_type} onChange={e => setData('fuel_type', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                    >
                                        <option value="">Sélectionner</option>
                                        <option value="diesel">Diesel</option>
                                        <option value="essence">Essence</option>
                                        <option value="electrique">Électrique</option>
                                        <option value="hybrid">Hybride</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-admin-muted mb-1">Statut *</label>
                                    <select value={data.status} onChange={e => setData('status', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                    >
                                        <option value="active">Actif</option>
                                        <option value="maintenance">En maintenance</option>
                                        <option value="out_of_service">Hors service</option>
                                    </select>
                                    {errors.status && <p className="text-status-red-text text-xs mt-1">{errors.status}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-admin-muted mb-1">Kilométrage</label>
                                <input type="number" value={data.mileage} onChange={e => setData('mileage', Number(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-admin-muted focus:outline-none focus:border-primary transition-colors"
                                    min={0} />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-admin-muted hover:text-white hover:bg-white/5 text-sm font-semibold transition-all"
                                >Annuler</button>
                                <button type="submit" disabled={processing}
                                    className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
                                >{processing ? 'Enregistrement...' : mode === 'create' ? 'Ajouter' : 'Enregistrer'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

Flotte.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Flotte" breadcrumbs={[{ label: 'Tableau de bord', href: route('admin.dashboard') }, { label: 'Flotte' }]}>
        {page}
    </BackOfficeLayout>
);
