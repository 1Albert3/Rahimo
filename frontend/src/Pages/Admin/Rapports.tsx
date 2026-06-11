import { motion } from 'framer-motion';

import { useState } from 'react';
import { BarChart3, Bed, Bike, Car, Download, FileText, TrendingUp, Users } from 'lucide-react';
import { formatFCFA } from '@/lib/utils';

import { useApi } from '@/hooks/useApi';
import api from '@/api/client';
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

export default function Rapports({ chiffre_affaires = [], top_routes = [], taux_occupation = 0, recettes_mensuelles = 0, total_voyageurs = 0, reclamations_mois = 0, revenus_par_service = {} as any }: Props) {
    const [exporting, setExporting] = useState(false);
    const safeCA = Array.isArray(chiffre_affaires) ? chiffre_affaires : [];
    const safeTopRoutes = Array.isArray(top_routes) ? top_routes : [];
    const safeRevenusService: any = revenus_par_service && typeof revenus_par_service === 'object' ? revenus_par_service : {};
    const maxCA = safeCA.length > 0 ? Math.max(...safeCA.map((d) => d.recettes ?? 0), 1) : 1;
    const totalSemaine = safeCA.reduce((s, d) => s + (d.recettes ?? 0), 0);
    const semaineAvant = safeCA.length >= 7
        ? ((totalSemaine - (safeCA[0]?.recettes ?? 0)) || 1)
        : 1;
    const evolution = ((totalSemaine - semaineAvant) / semaineAvant * 100).toFixed(1);

    const doExport = async (periode: string) => {
        setExporting(true);
        try {
            const res = await fetch('/admin/export/rapports', {
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
            const res = await fetch('/admin/export/rapports', {
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
        { label: 'Recettes mensuelles', val: formatFCFA(recettes_mensuelles ?? 0), icon: TrendingUp, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
        { label: 'Voyageurs (mois)', val: (total_voyageurs ?? 0).toLocaleString('fr-FR'), icon: Users, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
        { label: 'Occupation', val: `${taux_occupation ?? 0}%`, icon: BarChart3, color: 'text-status-yellow-text', bg: 'bg-orange-900/30' },
        { label: 'Réclamations (mois)', val: reclamations_mois ?? 0, icon: FileText, color: 'text-status-red-text', bg: 'bg-red-900/30' },
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
                    <h1 className="text-xl font-bold text-slate-dark">Rapports & Analyses</h1>
                    <p className="text-on-surface-variant text-sm mt-0.5">Indicateurs de performance du réseau</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => doExport('mensuel')} disabled={exporting}
                        className="flex items-center gap-2 border border-outline text-on-surface-variant hover:text-slate-dark hover:bg-gris-surface text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                    ><Download size={16} /> Export mensuel</button>
                    <button onClick={() => doExport('mensuel')} disabled={exporting}
                        className="flex items-center gap-2 border border-outline text-on-surface-variant hover:text-slate-dark hover:bg-gris-surface text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                    ><Download size={16} /> CSV mensuel</button>
                    <button onClick={() => doExport('annuel')} disabled={exporting}
                        className="flex items-center gap-2 border border-outline text-on-surface-variant hover:text-slate-dark hover:bg-gris-surface text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                    ><Download size={16} /> CSV annuel</button>
                    <button onClick={() => doExportPDF('mensuel')} disabled={exporting}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                    ><FileText size={16} /> PDF mensuel</button>
                </div>
            </div>

            <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger} initial="initial" animate="animate">
                {KPIS.map((k) => (
                    <motion.div key={k.label} variants={fadeUp}
                        className="bg-white rounded-xl border border-outline shadow-sm p-4 flex items-center gap-3"
                    >
                        <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center`}>
                            <k.icon size={18} className={k.color} />
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${k.color}`}>{k.val}</p>
                            <p className="text-xs text-on-surface-variant">{k.label}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* CA semaine */}
                <motion.div variants={fadeUp} initial="initial" animate="animate"
                    className="bg-white rounded-xl border border-outline shadow-sm p-5"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-slate-dark flex items-center gap-2">
                            <BarChart3 size={16} className="text-primary" /> CA — 7 derniers jours
                        </h3>
                        <span className="text-xs text-status-green-text font-semibold flex items-center gap-1">
                            <TrendingUp size={12} /> {evolution}% vs 7j préc.
                        </span>
                    </div>
                    <div className="flex items-end gap-2 h-40">
                        {safeCA.map((d, i) => {
                            const h = Math.max(Math.round(((d.recettes ?? 0) / maxCA) * 100), 4);
                            const isToday = i === safeCA.length - 1;
                            return (
                                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                                    <motion.div
                                        className={`w-full rounded-t-md ${isToday ? 'bg-primary/10' : 'bg-gris-surface hover:bg-gris-surface'} transition-colors cursor-pointer`}
                                        style={{ height: `${h}%` }}
                                        initial={{ scaleY: 0, originY: 1 }}
                                        animate={{ scaleY: 1 }}
                                        transition={{ delay: i * 0.07, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                                        title={formatFCFA(d.recettes)}
                                    />
                                    <span className={`text-[10px] font-semibold ${isToday ? 'text-primary' : 'text-on-surface-variant'}`}>
                                        {new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-outline flex justify-between text-xs text-on-surface-variant">
                        <span>Total 7 jours</span>
                        <span className="font-bold text-slate-dark">{formatFCFA(totalSemaine)}</span>
                    </div>
                </motion.div>

                {/* Top routes */}
                <motion.div variants={fadeUp} initial="initial" animate="animate"
                    className="bg-white rounded-xl border border-outline shadow-sm p-5"
                >
                    <h3 className="font-semibold text-slate-dark mb-5 flex items-center gap-2">
                        <TrendingUp size={16} className="text-primary" /> Top Routes
                    </h3>
                    <div className="space-y-3">
                        {safeTopRoutes.map((r, i) => (
                            <div key={r.route} className="flex items-center gap-3">
                                <span className="w-5 h-5 rounded-full bg-gris-surface flex items-center justify-center text-[10px] font-bold text-on-surface-variant shrink-0">
                                    {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-slate-dark truncate">{r.route}</span>
                                        <span className="text-xs text-on-surface-variant ml-2 shrink-0">{r.total_passagers} passagers</span>
                                    </div>
                                    <div className="h-1.5 bg-gris-surface rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-primary/10 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(r.total_passagers / (safeTopRoutes[0]?.total_passagers ?? 1)) * 100}%` }}
                                            transition={{ delay: i * 0.1, duration: 0.7 }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {safeTopRoutes.length === 0 && (
                            <p className="text-on-surface-variant text-sm text-center py-4">Aucune donnée de route</p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Revenus par service */}
            {Object.values(safeRevenusService).some((v: any) => v > 0) && (
                <motion.div variants={fadeUp} initial="initial" animate="animate"
                    className="bg-white rounded-xl border border-outline shadow-sm p-5"
                >
                    <h3 className="font-semibold text-slate-dark mb-5 flex items-center gap-2">
                        <BarChart3 size={16} className="text-primary" /> Revenus par service (mois en cours)
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(safeRevenusService).map(([key, val]: [string, any]) => (
                            <div key={key} className="bg-gris-surface rounded-xl p-4">
                                <div className="flex items-center gap-2 text-on-surface-variant mb-2 text-sm">
                                    {SERVICE_ICONS[key]}
                                    <span className="capitalize">{key.replace('_', ' ')}</span>
                                </div>
                                <p className="text-xl font-bold text-slate-dark">{formatFCFA(val)}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Taux occupation */}
            <motion.div variants={fadeUp} initial="initial" animate="animate"
                className="bg-white rounded-xl border border-outline shadow-sm p-5"
            >
                <h3 className="font-semibold text-slate-dark mb-5">Taux d'Occupation Moyen</h3>
                <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                            <circle cx="50" cy="50" r="42" fill="none"
                                stroke={taux_occupation >= 90 ? '#22c55e' : taux_occupation >= 75 ? '#eab308' : '#ef4444'}
                                strokeWidth="8" strokeLinecap="round"
                                strokeDasharray={`${(taux_occupation / 100) * 264} 264`}
                            />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-slate-dark">{taux_occupation}%</span>
                    </div>
                    <div className="flex-1 space-y-2">
                        <p className="text-sm text-on-surface-variant">Occupation moyenne mensuelle</p>
                        <p className="text-xs text-on-surface-variant">
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
