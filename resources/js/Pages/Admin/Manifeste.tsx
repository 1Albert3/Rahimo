import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bus, FileText, User, Users } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import StatusBadge from '@/Components/StatusBadge';
import { formatFCFA } from '@/lib/utils';
import type { PageProps } from '@/types';

interface Passenger {
    nom: string;
    telephone: string;
    sieges: string | string[];
    statut: string;
}

interface Depart {
    id: number;
    trip_number: string;
    departure_time: string;
    arrival_time: string;
    departure_city: string;
    arrival_city: string;
    vehicle: { registration_number: string; capacity: number } | null;
    driver: { name: string } | null;
    total_seats: number;
    booked_seats: number;
    fill_rate: number;
    status: string;
    passagers: Passenger[];
}

interface Props extends PageProps {
    departs: Depart[];
}

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function Manifeste({ departs }: Props) {
    const [selectedIdx, setSelectedIdx] = useState<number>(0);
    const selected = departs[selectedIdx];

    const passagers = selected?.passagers ?? [];
    const embarques = passagers.filter((p) => p.statut === 'paid').length;
    const absents = passagers.filter((p) => p.statut !== 'paid').length;
    const libres = (selected?.total_seats ?? 0) - passagers.length;

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-dark">Départs & Manifestes</h1>
                    <p className="text-on-surface-variant text-sm mt-0.5">
                        Gestion des départs du jour —{' '}
                        {new Date().toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                        })}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                {/* Départs list */}
                <div className="xl:col-span-7 bg-white rounded-xl border border-outline shadow-xl overflow-hidden">
                    <div className="p-5">
                        <h3 className="font-semibold text-slate-dark flex items-center gap-2">
                            <Bus size={16} className="text-primary" /> Départs du Jour
                        </h3>
                    </div>
                    {departs.length === 0 ? (
                        <div className="p-8 text-center text-on-surface-variant text-sm">Aucun départ programmé aujourd'hui.</div>
                    ) : (
                        <div className="overflow-x-auto min-w-[600px] lg:min-w-0">
                            <table className="w-full text-sm min-w-[600px]">
                                <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                                    <tr>
                                        {['Bus', 'Destination', 'Heure', 'Passagers', 'Taux', 'Statut', 'Recette'].map(
                                            (h) => (
                                                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                            ),
                                        )}
                                    </tr>
                                </thead>
                                <motion.tbody variants={stagger} initial="initial" animate="animate">
                                    {departs.map((d) => {
                                        const s = d.status;
                                        const isGreen = s === 'en_cours' || s === 'in_progress' || s === 'completed';
                                        const isYellow = s === 'scheduled' || s === 'en_attente' || s === 'pending';
                                        const borderCls = isGreen ? 'border-l-status-green-ring' : isYellow ? 'border-l-status-yellow-ring' : s === 'cancelled' || s === 'annule' ? 'border-l-status-red-ring' : 'border-l-primary';
                                        return (
                                        <motion.tr
                                            key={d.id}
                                            variants={fadeUp}
                                            onClick={() => setSelectedIdx(departs.indexOf(d))}
                                            className={`hover:bg-gris-surface transition-colors cursor-pointer border-l-4 ${borderCls} ${
                                                selected?.id === d.id ? 'bg-primary/5' : ''
                                            }`}
                                        >
                                            <td className="px-4 py-3 font-mono font-bold text-slate-dark">
                                                {d.vehicle?.registration_number ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-dark">
                                                {d.departure_city} → {d.arrival_city}
                                            </td>
                                            <td className="px-4 py-3 text-on-surface-variant font-medium">
                                                {d.departure_time}
                                            </td>
                                            <td className="px-4 py-3 text-on-surface-variant">
                                                {d.booked_seats}/{d.total_seats}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-gris-surface rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${
                                                                d.fill_rate >= 90
                                                                    ? 'bg-status-green-ring'
                                                                    : d.fill_rate >= 60
                                                                      ? 'bg-status-yellow-ring'
                                                                      : 'bg-primary'
                                                            }`}
                                                            style={{ width: `${d.fill_rate}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-on-surface-variant">{d.fill_rate}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={d.status} />
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-slate-dark">
                                                {d.booked_seats > 0 ? formatFCFA(d.booked_seats * 6000) : '—'}
                                            </td>
                                        </motion.tr>
                                        );
                                    })}
                                </motion.tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Manifeste passagers */}
                <div className="xl:col-span-5 bg-white rounded-xl border border-outline shadow-sm overflow-hidden">
                    <div className="p-5 flex items-center justify-between border-b border-outline">
                        <h3 className="font-semibold text-slate-dark flex items-center gap-2">
                            <FileText size={16} className="text-primary" />
                            Manifeste — {selected?.vehicle?.registration_number ?? '—'}
                        </h3>
                        <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1 text-on-surface-variant">
                                <Users size={14} />
                                {passagers.length}/{selected?.total_seats ?? 0}
                            </span>
                            {selected?.driver && (
                                <span className="flex items-center gap-1 text-on-surface-variant">
                                    <User size={14} />
                                    {selected.driver.name}
                                </span>
                            )}
                        </div>
                    </div>
                    {!selected ? (
                        <div className="p-8 text-center text-on-surface-variant text-sm">
                            Sélectionnez un départ pour voir le manifeste.
                        </div>
                    ) : (
                        <>
                            <div className="px-5 py-4 bg-gris-surface border-b border-outline">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-status-green-bg flex items-center justify-center">
                                            <Users size={14} className="text-status-green-text" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-status-green-text leading-none">{embarques}</p>
                                            <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">Embarqués</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-status-red-bg flex items-center justify-center">
                                            <User size={14} className="text-status-red-text" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-status-red-text leading-none">{absents}</p>
                                            <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">Absents</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-gris-surface flex items-center justify-center">
                                            <Bus size={14} className="text-status-yellow-text" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-status-yellow-text leading-none">{Math.max(0, libres)}</p>
                                            <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">Libres</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-y-auto max-h-[360px]">
                                <table className="w-full text-xs">
                                    <thead className="bg-gris-surface text-on-surface-variant uppercase tracking-wider sticky top-0">
                                        <tr>
                                            {['Siège', 'Passager', 'Téléphone', 'Statut'].map((h) => (
                                                <th key={h} className="px-4 py-2.5 text-left font-semibold">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {passagers.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant">
                                                    Aucun passager enregistré.
                                                </td>
                                            </tr>
                                        ) : (
                                            passagers.map((p, i) => (
                                                <tr key={i} className="hover:bg-gris-surface transition-colors">
                                                    <td className="px-4 py-2.5 font-mono font-bold text-slate-dark">
                                                        {Array.isArray(p.sieges) ? p.sieges.join(', ') : p.sieges}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-slate-dark">{p.nom}</td>
                                                    <td className="px-4 py-2.5 text-on-surface-variant font-mono">{p.telephone}</td>
                                                    <td className="px-4 py-2.5">
                                                        <span
                                                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                                p.statut === 'paid'
                                                                    ? 'bg-status-green-bg/50 text-status-green-text'
                                                                    : 'bg-status-red-bg text-status-red-text'
                                                            }`}
                                                        >
                                                            {p.statut === 'paid' ? 'Embarqué' : 'En attente'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-outline">
                                <button
                                    onClick={() => window.print()}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-outline text-on-surface-variant hover:text-slate-dark hover:bg-gris-surface text-xs font-semibold transition-colors"
                                >
                                    <FileText size={14} /> Imprimer le Manifeste
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

Manifeste.layout = (page: React.ReactNode) => (
    <BackOfficeLayout
        title="Départs & Manifestes"
        breadcrumbs={[
            { label: 'Tableau de bord', href: route('admin.dashboard') },
            { label: 'Départs' },
        ]}
    >
        {page}
    </BackOfficeLayout>
);
