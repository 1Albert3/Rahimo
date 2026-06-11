import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { AlertTriangle, Bus, CalendarClock, CheckCircle, Gauge, MapPin, Navigation, Pencil, Plus, RefreshCw, Search, Trash2, Wrench, X } from 'lucide-react';
import StatusBadge from '@/Components/StatusBadge';
import type { Vehicle } from '@/types';
import { useApi } from '@/hooks/useApi';
import api from '@/api/client';

type VehicleExt = Vehicle & { last_latitude?: number; last_longitude?: number; last_gps_update?: string };
interface FlotteData { vehicules: VehicleExt[]; stats: { total: number; actifs: number; maintenance: number; hors_service: number; en_retard_maintenance: number } }

type FormMode = 'create' | 'edit';

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function Flotte() {
    const { data: flData, loading, refetch } = useApi<FlotteData>('/admin/flotte');
    const vehicules = flData?.vehicules ?? [];
    const stats = flData?.stats ?? { total: 0, actifs: 0, maintenance: 0, hors_service: 0, en_retard_maintenance: 0 };
    const [gpsVehicles, setGpsVehicles] = useState<VehicleExt[]>([]);
    const [simulating, setSimulating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState<FormMode>('create');
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [search, setSearch] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({ registration_number: '', brand: '', model: '', capacity: 50, type: '', year: new Date().getFullYear(), fuel_type: '', mileage: 0, status: 'active' });

    const filteredVehicules = vehicules.filter(v =>
        !search || `${v.brand} ${v.model} ${v.registration_number}`.toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => {
        setMode('create');
        setEditingVehicle(null);
        setFormData({ registration_number: '', brand: '', model: '', capacity: 50, type: '', year: new Date().getFullYear(), fuel_type: '', mileage: 0, status: 'active' });
        setShowModal(true);
    };

    const openEdit = (v: VehicleExt) => {
        setMode('edit');
        setEditingVehicle(v);
        setFormData({ registration_number: v.registration_number, brand: v.brand, model: v.model, capacity: v.capacity, type: (v as { type?: string }).type ?? '', year: v.year ?? new Date().getFullYear(), fuel_type: v.fuel_type, mileage: v.mileage, status: v.status });
        setShowModal(true);
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        try {
            if (mode === 'create') await api.post('/admin/flotte', formData);
            else if (editingVehicle) await api.put(`/admin/flotte/${editingVehicle.id}`, formData);
            setShowModal(false);
            refetch();
        } catch (err: unknown) {
            const e = (err as { response?: { data?: { errors?: Record<string, string[]> } } }).response?.data?.errors;
            if (e) setErrors(Object.fromEntries(Object.entries(e).map(([k, v]) => [k, v[0]])));
        }
        setProcessing(false);
    };

    const confirmDelete = async (v: Vehicle) => {
        if (!confirm(`Supprimer le véhicule ${v.registration_number} ?`)) return;
        await api.delete(`/admin/flotte/${v.id}`);
        refetch();
    };

    const loadGps = async () => {
        try {
            const { data: gps } = await api.get('/admin/flotte/gps');
            setGpsVehicles(gps.vehicules ?? []);
        } catch { }
    };

    const simulate = async () => {
        setSimulating(true);
            try { await api.post('/admin/flotte/gps/simuler'); await loadGps(); } catch { }
        setSimulating(false);
    };

    useEffect(() => { loadGps(); const t = setInterval(loadGps, 15000); return () => clearInterval(t); }, []);

    const STATS = [
        { label: 'Total',        val: stats?.total ?? 0,                   icon: Bus,            color: 'text-on-surface-variant',        bg: 'bg-gris-surface' },
        { label: 'Bus Actifs',   val: stats?.actifs ?? 0,                  icon: CheckCircle,    color: 'text-status-green-text',  bg: 'bg-status-green-bg/30' },
        { label: 'Maintenance',  val: stats?.maintenance ?? 0,             icon: Wrench,         color: 'text-status-yellow-text', bg: 'bg-status-yellow-bg/30' },
        { label: 'Retard Maint.',val: stats?.en_retard_maintenance ?? 0,   icon: AlertTriangle,  color: 'text-status-red-text',    bg: 'bg-status-red-bg/30' },
    ];

    return (
        <div className="w-full max-w-7xl space-y-6">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-dark tracking-tight">Gestion de la flotte</h1>
                    <p className="text-sm text-on-surface-variant mt-0.5">Suivi GPS, maintenance et gestion des véhicules</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            className="w-52 bg-gris-surface border border-outline rounded-xl pl-9 pr-3 py-2 text-sm text-slate-dark placeholder-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                            placeholder="Immatriculation, marque..."
                        />
                    </div>
                    <button onClick={openCreate}
                        className="flex items-center gap-1.5 bg-primary text-on-primary text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-all"
                    >
                        <Plus size={16} /> Véhicule
                    </button>
                    <div className="flex items-center gap-1 ml-1 pl-2 border-l border-outline">
                        <button onClick={loadGps} title="Actualiser"
                            className="p-2 rounded-xl text-on-surface-variant hover:text-slate-dark hover:bg-gris-surface transition-colors"
                        >
                            <RefreshCw size={16} />
                        </button>
                        <button onClick={simulate} disabled={simulating} title="Simuler GPS"
                            className="p-2 rounded-xl text-on-surface-variant hover:text-slate-dark hover:bg-gris-surface transition-colors disabled:opacity-50"
                        >
                            <Navigation size={16} className={simulating ? 'animate-pulse' : ''} />
                        </button>
                        <a href="/admin/carte-gps" title="Vue Live"
                            className="p-2 rounded-xl text-sahel-yellow hover:bg-sahel-yellow/10 transition-colors"
                        >
                            <MapPin size={16} />
                        </a>
                    </div>
                </div>
            </div>

            {/* KPI */}
            <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger} initial="initial" animate="animate">
                {STATS.map((s) => {
                    const Icon = s.icon;
                    return (
                        <motion.div key={s.label} variants={fadeUp}
                            className="bg-white rounded-xl border border-outline shadow-sm p-4 flex items-center gap-3"
                        >
                            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                                <Icon size={18} className={s.color} />
                            </div>
                            <div>
                                <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
                                <p className="text-xs text-on-surface-variant">{s.label}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Suivi GPS */}
            <div className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-outline">
                    <h2 className="text-sm font-bold text-slate-dark flex items-center gap-2">
                        <MapPin size={15} className="text-primary" />
                        Suivi GPS temps réel
                    </h2>
                    <span className="text-xs text-on-surface-variant">{gpsVehicles.length} véhicule{gpsVehicles.length > 1 ? 's' : ''} actif{gpsVehicles.length > 1 ? 's' : ''}</span>
                </div>
                <div className="p-5 min-h-[260px] bg-gris-surface relative">
                    <div className="absolute inset-0 opacity-[0.04]"
                        style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #475569 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                    />
                    <div className="relative z-10 flex flex-wrap gap-3">
                        {gpsVehicles.map((v: any) => {
                            const speed = v.speed ?? 0;
                            return (
                                <div key={v.id}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
                                        speed > 90
                                            ? 'bg-status-red-bg/30 border-status-red-ring text-status-red-text'
                                            : 'bg-white border-outline text-slate-dark shadow-sm'
                                    }`}
                                >
                                    <Navigation size={16} className={speed > 0 ? 'animate-pulse' : ''} />
                                    <div>
                                        <p className="font-mono font-bold text-xs">{v.registration_number}</p>
                                        <p className="text-[10px] text-on-surface-variant">
                                            {v.brand} <span className="mx-1">·</span> {speed} km/h <span className="mx-1">·</span> {v.last_update ?? 'N/A'}
                                        </p>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${speed > 90 ? 'bg-status-red-text animate-pulse' : 'bg-status-green-text'}`} />
                                </div>
                            );
                        })}
                        {gpsVehicles.length === 0 && (
                            <p className="text-on-surface-variant text-sm w-full text-center py-8">
                                Aucun véhicule actif. Cliquez sur "Simuler GPS" pour générer des données de test.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Parc véhicules */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-dark tracking-tight">
                        Parc véhicules
                        <span className="text-on-surface-variant font-normal ml-2">({filteredVehicules.length} véhicule{filteredVehicules.length > 1 ? 's' : ''})</span>
                    </h2>
                    {search && (
                        <button onClick={() => setSearch('')} className="text-xs text-primary hover:underline font-semibold">
                            Effacer le filtre
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {filteredVehicules.map((v, i) => {
                        const statusBorder = v.status === 'active' ? 'border-l-status-yellow-ring' : v.status === 'maintenance' ? 'border-l-sahel-yellow' : 'border-l-primary';
                        const iconBg = v.status === 'active' ? 'bg-status-yellow-bg text-status-yellow-text' : v.status === 'maintenance' ? 'bg-sahel-yellow/20 text-sahel-yellow' : 'bg-status-red-bg text-primary';
                        return (
                            <motion.div key={v.id} variants={fadeUp} initial="initial" animate="animate"
                                className={`bg-white rounded-xl border border-outline shadow-sm overflow-hidden transition-all hover:shadow-md border-l-4 ${statusBorder}`}
                            >
                                <div className="p-6 flex items-start justify-between gap-5">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-14 h-14 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                                            <Bus size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-dark text-base">{v.brand} {v.model}</h3>
                                            <p className="text-xs font-mono text-on-surface-variant mt-1">{v.registration_number} <span className="mx-1">·</span> {v.capacity} places</p>
                                            <div className="flex items-center gap-2 mt-3">
                                                <StatusBadge status={v.status} />
                                                <span className="text-[10px] text-on-surface-variant font-mono">{v.year}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={() => openEdit(v)}
                                            className="p-2 rounded-xl text-on-surface-variant hover:text-slate-dark hover:bg-gris-surface transition-all"
                                            title="Modifier"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button onClick={() => confirmDelete(v)}
                                            className="p-2 rounded-xl text-on-surface-variant hover:text-status-red-text hover:bg-status-red-bg/20 transition-all"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="border-t border-outline/60 px-6 py-4">
                                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-8 text-xs">
                                        <div className="flex items-center gap-2.5 text-on-surface-variant">
                                            <Gauge size={14} className="shrink-0 text-primary" />
                                            <span className="font-medium">Km</span>
                                            <span className="ml-auto font-mono font-semibold text-slate-dark">{v.mileage.toLocaleString('fr-FR')}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-on-surface-variant">
                                            <Wrench size={14} className="shrink-0 text-status-yellow-text" />
                                            <span className="font-medium">Dernière</span>
                                            <span className="ml-auto font-mono text-slate-dark">{v.last_maintenance_date ?? '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-on-surface-variant">
                                            <CalendarClock size={14} className="shrink-0 text-primary" />
                                            <span className="font-medium">Prochaine</span>
                                            <span className={`ml-auto font-mono font-semibold ${
                                                v.next_maintenance_date && v.next_maintenance_date <= new Date().toISOString().slice(0, 10)
                                                    ? 'text-status-red-text'
                                                    : 'text-slate-dark'
                                            }`}>
                                                {v.next_maintenance_date ?? '—'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-on-surface-variant">
                                            <MapPin size={14} className="shrink-0 text-status-yellow-text" />
                                            <span className="font-medium">GPS</span>
                                            <span className="ml-auto font-mono text-slate-dark">{(v as any).last_gps_update ?? '—'}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                    {filteredVehicules.length === 0 && (
                        <div className="xl:col-span-2 py-20 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gris-surface flex items-center justify-center mx-auto mb-4">
                                <Bus size={28} className="text-on-surface-variant/50" />
                            </div>
                            <p className="text-sm font-medium text-slate-dark mb-1">Aucun véhicule trouvé</p>
                            <p className="text-xs text-on-surface-variant mb-4">
                                {search ? 'Aucun résultat ne correspond à votre recherche.' : 'Le parc est vide pour le moment.'}
                            </p>
                            {search && (
                                <button onClick={() => setSearch('')} className="text-xs text-primary hover:underline font-semibold">
                                    ← Réinitialiser la recherche
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Ajouter / Modifier */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-xl border border-outline p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-dark">
                                {mode === 'create' ? 'Ajouter un véhicule' : 'Modifier le véhicule'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-1 text-on-surface-variant hover:text-slate-dark">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Immatriculation *</label>
                                    <input type="text" value={formData.registration_number} onChange={e => setFormData(f => ({ ...f, registration_number: e.target.value }))}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark placeholder-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                                        placeholder="R-XXX" />
                                    {errors.registration_number && <p className="text-status-red-text text-xs mt-1">{errors.registration_number}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Marque *</label>
                                    <input type="text" value={formData.brand} onChange={e => setFormData(f => ({ ...f, brand: e.target.value }))}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark placeholder-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Mercedes" />
                                    {errors.brand && <p className="text-status-red-text text-xs mt-1">{errors.brand}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Modèle *</label>
                                    <input type="text" value={formData.model} onChange={e => setFormData(f => ({ ...f, model: e.target.value }))}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark placeholder-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Sprinter" />
                                    {errors.model && <p className="text-status-red-text text-xs mt-1">{errors.model}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Capacité *</label>
                                    <input type="number" value={formData.capacity} onChange={e => setFormData(f => ({ ...f, capacity: Number(e.target.value) }))}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark placeholder-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                                        min={1} />
                                    {errors.capacity && <p className="text-status-red-text text-xs mt-1">{errors.capacity}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Année</label>
                                    <input type="number" value={formData.year} onChange={e => setFormData(f => ({ ...f, year: Number(e.target.value) }))}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark placeholder-on-surface-variant focus:outline-none focus:border-primary transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Carburant</label>
                                    <select value={formData.fuel_type} onChange={e => setFormData(f => ({ ...f, fuel_type: e.target.value }))}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark focus:outline-none focus:border-primary transition-colors"
                                    >
                                        <option value="">Sélectionner</option>
                                        <option value="diesel">Diesel</option>
                                        <option value="essence">Essence</option>
                                        <option value="electrique">Électrique</option>
                                        <option value="hybrid">Hybride</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Statut *</label>
                                    <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark focus:outline-none focus:border-primary transition-colors"
                                    >
                                        <option value="active">Actif</option>
                                        <option value="maintenance">En maintenance</option>
                                        <option value="out_of_service">Hors service</option>
                                    </select>
                                    {errors.status && <p className="text-status-red-text text-xs mt-1">{errors.status}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Kilométrage</label>
                                <input type="number" value={formData.mileage} onChange={e => setFormData(f => ({ ...f, mileage: Number(e.target.value) }))}
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark placeholder-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                                    min={0} />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-outline text-on-surface-variant hover:text-slate-dark hover:bg-gris-surface text-sm font-semibold transition-all"
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
