import { motion } from 'framer-motion';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { BarChart3, Bed, Bike, Car, Download, FileText, TrendingUp, Users } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { formatFCFA } from '@/lib/utils';
import type { PageProps } from '@/types';

interface CaItem {
    date: string;
    recettes: number;
    reservations: number;
}

interface TopRoute {
    route: string;
    total_passagers: number;
}

interface RevenusService {
    parking: number;
    location: number;
    hebergement: number;
    moto_transport: number;
}

interface Props extends PageProps {
    chiffre_affaires: CaItem[];
    top_routes: TopRoute[];
    taux_occupation: number;
    recettes_mensuelles: number;
    total_voyageurs: number;
    reclamations_mois: number;
    revenus_par_service: RevenusService;
}

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function Rapports({ chiffre_affaires, top_routes, taux_occupation, recettes_mensuelles, total_voyageurs, reclamations_mois, revenus_par_service }: Props) {
    const [exporting, setExporting] = useState(false);
    const maxCA = Math.max(...chiffre_affaires.map((d) => d.recettes), 1);
    const totalSemaine = chiffre_affaires.reduce((s, d) => s + d.recettes, 0);
    const semaineAvant = chiffre_affaires.length >= 7
        ? ((totalSemaine - chiffre_affaires[0].recettes) || 1)
        : 1;
    const evolution = ((totalSemaine - semaineAvant) / semaineAvant * 100).toFixed(1);

    const doExport = async (periode: string) => {
        setExporting(true);
        try {
            const res = await fetch(route('admin.export.rapports'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '' },
                body: JSON.stringify({ type: 'csv', periode }),
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `rapport_rahimo_${periode}.csv`; a.click();
                URL.revokeObjectURL(url);
            }
        } catch { /* ignore */ }
        setExporting(false);
    };

    const doExportPDF = async (periode: string) => {
        setExporting(true);
        try {
            const res = await fetch(route('admin.export.rapports'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '' },
                body: JSON.stringify({ type: 'pdf', periode }),
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `rapport_rahimo_${periode}.pdf`; a.click();
                URL.revokeObjectURL(url);
            }
        } catch { /* ignore */ }
        setExporting(false);
    };

    const KPIS = [
        { label: 'Recettes mensuelles', val: formatFCFA(recettes_mensuelles), icon: TrendingUp, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
        { label: 'Voyageurs (mois)', val: total_voyageurs.toLocaleString('fr-FR'), icon: Users, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
        { label: 'Occupation', val: `${taux_occupation}%`, icon: BarChart3, color: 'text-status-yellow-text', bg: 'bg-orange-900/30' },
        { label: 'Réclamations (mois)', val: reclamations_mois, icon: FileText, color: 'text-status-red-text', bg: 'bg-red-900/30' },
    ];

    const SERVICE_ICONS: Record<string, React.ReactNode> = {
        parking: <Car size={14} />,
        location: <Car size={14} />,
        hebergement: <Bed size={14} />,
        moto_transport: <Bike size={14} />,
    };

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Rapports & Analyses</h1>
                    <p className="text-admin-muted text-sm mt-0.5">Indicateurs de performance du réseau</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => doExport('mensuel')} disabled={exporting}
                        className="flex items-center gap-2 border border-white/10 text-admin-muted hover:text-white hover:bg-white/5 text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    ><Download size={16} /> Export mensuel</button>
                    <button onClick={() => doExport('mensuel')} disabled={exporting}
                        className="flex items-center gap-2 border border-white/10 text-admin-muted hover:text-white hover:bg-white/5 text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    ><Download size={16} /> CSV mensuel</button>
                    <button onClick={() => doExport('annuel')} disabled={exporting}
                        className="flex items-center gap-2 border border-white/10 text-admin-muted hover:text-white hover:bg-white/5 text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    ><Download size={16} /> CSV annuel</button>
                    <button onClick={() => doExportPDF('mensuel')} disabled={exporting}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    ><FileText size={16} /> PDF mensuel</button>
                </div>
            </div>

            <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger} initial="initial" animate="animate">
                {KPIS.map((k) => (
                    <motion.div key={k.label} variants={fadeUp}
                        className="bg-admin-card rounded-xl border border-white/5 p-4 flex items-center gap-3"
                    >
                        <div className={`w-10 h-10 rounded-lg ${k.bg} flex items-center justify-center`}>
                            <k.icon size={18} className={k.color} />
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${k.color}`}>{k.val}</p>
                            <p className="text-xs text-admin-muted">{k.label}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* CA semaine */}
                <motion.div variants={fadeUp} initial="initial" animate="animate"
                    className="bg-admin-card rounded-xl border border-white/5 p-5"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <BarChart3 size={16} className="text-primary-container" /> CA — 7 derniers jours
                        </h3>
                        <span className="text-xs text-status-green-text font-semibold flex items-center gap-1">
                            <TrendingUp size={12} /> {evolution}% vs 7j préc.
                        </span>
                    </div>
                    <div className="flex items-end gap-2 h-40">
                        {chiffre_affaires.map((d, i) => {
                            const h = Math.max(Math.round((d.recettes / maxCA) * 100), 4);
                            const isToday = i === chiffre_affaires.length - 1;
                            return (
                                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                                    <motion.div
                                        className={`w-full rounded-t-md ${isToday ? 'bg-primary-container' : 'bg-white/10 hover:bg-white/20'} transition-colors cursor-pointer`}
                                        style={{ height: `${h}%` }}
                                        initial={{ scaleY: 0, originY: 1 }}
                                        animate={{ scaleY: 1 }}
                                        transition={{ delay: i * 0.07, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                                        title={formatFCFA(d.recettes)}
                                    />
                                    <span className={`text-[10px] font-semibold ${isToday ? 'text-primary-container' : 'text-admin-muted'}`}>
                                        {new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs text-admin-muted">
                        <span>Total 7 jours</span>
                        <span className="font-bold text-admin-text">{formatFCFA(totalSemaine)}</span>
                    </div>
                </motion.div>

                {/* Top routes */}
                <motion.div variants={fadeUp} initial="initial" animate="animate"
                    className="bg-admin-card rounded-xl border border-white/5 p-5"
                >
                    <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
                        <TrendingUp size={16} className="text-primary-container" /> Top Routes
                    </h3>
                    <div className="space-y-3">
                        {top_routes.map((r, i) => (
                            <div key={r.route} className="flex items-center gap-3">
                                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-admin-muted shrink-0">
                                    {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-admin-text truncate">{r.route}</span>
                                        <span className="text-xs text-admin-muted ml-2 shrink-0">{r.total_passagers} passagers</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-primary-container rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(r.total_passagers / top_routes[0]?.total_passagers) * 100}%` }}
                                            transition={{ delay: i * 0.1, duration: 0.7 }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {top_routes.length === 0 && (
                            <p className="text-admin-muted text-sm text-center py-4">Aucune donnée de route</p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Revenus par service */}
            {Object.values(revenus_par_service).some(v => v > 0) && (
                <motion.div variants={fadeUp} initial="initial" animate="animate"
                    className="bg-admin-card rounded-xl border border-white/5 p-5"
                >
                    <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
                        <BarChart3 size={16} className="text-primary-container" /> Revenus par service (mois en cours)
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(revenus_par_service).map(([key, val]) => (
                            <div key={key} className="bg-white/5 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-admin-muted mb-2 text-sm">
                                    {SERVICE_ICONS[key]}
                                    <span className="capitalize">{key.replace('_', ' ')}</span>
                                </div>
                                <p className="text-xl font-bold text-white">{formatFCFA(val)}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Taux occupation */}
            <motion.div variants={fadeUp} initial="initial" animate="animate"
                className="bg-admin-card rounded-xl border border-white/5 p-5"
            >
                <h3 className="font-semibold text-white mb-5">Taux d'Occupation Moyen</h3>
                <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                            <circle cx="50" cy="50" r="42" fill="none"
                                stroke={taux_occupation >= 90 ? '#22c55e' : taux_occupation >= 75 ? '#eab308' : '#ef4444'}
                                strokeWidth="8" strokeLinecap="round"
                                strokeDasharray={`${(taux_occupation / 100) * 264} 264`}
                            />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">{taux_occupation}%</span>
                    </div>
                    <div className="flex-1 space-y-2">
                        <p className="text-sm text-admin-muted">Occupation moyenne mensuelle</p>
                        <p className="text-xs text-admin-muted">
                            {taux_occupation >= 90 ? 'Excellent — réseau saturé' :
                             taux_occupation >= 75 ? 'Bon — bonne gestion des capacités' :
                             'À améliorer — optimiser le planning des départs'}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

Rapports.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Rapports" breadcrumbs={[{ label: 'Tableau de bord', href: route('admin.dashboard') }, { label: 'Rapports' }]}>
        {page}
    </BackOfficeLayout>
);
