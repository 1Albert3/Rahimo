import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertTriangle, Bus, FileDown, Package, RefreshCw, Ticket, TrendingDown, TrendingUp, Zap,
} from 'lucide-react';
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { formatFCFA } from '@/lib/utils';
import type { PageProps } from '@/types';

interface DashboardProps extends PageProps {
    kpis: {
        trajets_aujourdhui: number;
        reservations_aujourdhui: number;
        revenus_aujourdhui: number;
        vehicules_actifs: number;
        chauffeurs_actifs: number;
        reservations_en_attente: number;
    };
    revenus_tendances: { date: string; jour: string; recettes: number }[];
    top_routes: { route: string; reservations: number; passagers: number; revenu: number }[];
    revenus_par_service: { billets: number; parking: number; location: number; hebergement: number; moto: number };
    occupation_tendances: { date: string; taux: number }[];
    departs: { bus_id: string; destination: string; heure: string; passagers: string; statut: string; recette: number }[];
    alertes: { id: number; type: string; severite: string; message: string; created_at: string }[];
}

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };
const fadeIn = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };
const PIE_COLORS = ['#b70100', '#2563eb', '#059669', '#7c3aed', '#d97706'];

function KpiCard({ label, value, trend, trendUp, sub }: {
    label: string; value: string; trend?: string; trendUp?: boolean; sub?: string;
}) {
    return (
        <motion.div variants={fadeIn}
            className="bg-white p-6 rounded-2xl border border-outline-variant/15 shadow-ambient"
        >
            <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{label}</p>
                {trend && (
                    <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-status-green-bg text-status-green-text' : 'bg-status-red-bg text-status-red-text'}`}>
                        {trend}
                        {trendUp ? <TrendingUp size={12} className="ml-1" /> : <TrendingDown size={12} className="ml-1" />}
                    </span>
                )}
            </div>
            <h3 className="text-3xl font-mono font-bold text-primary">{value}</h3>
            {sub && <p className="mt-2 text-xs text-on-surface-variant">{sub}</p>}
        </motion.div>
    );
}

function ChartCard({ title, subtitle, children, className }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
    return (
        <motion.div variants={fadeIn}
            className={`bg-white p-6 rounded-2xl border border-outline-variant/15 shadow-ambient ${className ?? ''}`}
        >
            <h3 className="font-bold text-on-surface mb-1">{title}</h3>
            {subtitle && <p className="text-xs text-on-surface-variant mb-4">{subtitle}</p>}
            {children}
        </motion.div>
    );
}

export default function AdminDashboard({ kpis, revenus_tendances, top_routes, revenus_par_service, occupation_tendances, departs, alertes }: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const role = auth?.user?.role ?? '';
    const isDG = role === 'directeur_general';
    const isFlotte = role === 'responsable_flotte' || isDG;
    const isCompta = role === 'comptable' || isDG;
    const isGuichet = role === 'guichetiere' || role === 'chef_garde' || isDG;

    const k = kpis;
    const services = [
        { name: 'Billets', value: Math.round(revenus_par_service.billets / 1000) },
        { name: 'Parking', value: Math.round(revenus_par_service.parking / 1000) },
        { name: 'Location', value: Math.round(revenus_par_service.location / 1000) },
        { name: 'Hébergement', value: Math.round(revenus_par_service.hebergement / 1000) },
        { name: 'Moto', value: Math.round(revenus_par_service.moto / 1000) },
    ].filter(s => s.value > 0);

    return (
        <div className="space-y-8 w-full max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-on-surface">
                        {isDG && 'Revue Financière & Opérationnelle'}
                        {role === 'responsable_flotte' && 'Pilotage de la Flotte'}
                        {role === 'comptable' && 'Revue Financière'}
                        {role === 'chef_garde' && 'Supervision de la Gare'}
                        {role === 'guichetiere' && 'Vue d\'ensemble du Guichet'}
                        {(role === 'agent_police' || role === 'bagagiste') && 'Tableau de Bord'}
                    </h2>
                    <p className="text-sm text-on-surface-variant mt-1">Données en temps réel — Rahimo Transport</p>
                </div>
            </div>

            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="initial" animate="animate">
                {isCompta && <KpiCard label="CA JOUR (FCFA)" value={formatFCFA(k.revenus_aujourdhui)} sub={`Objectif: ${formatFCFA(6200000)}`} />}
                {isGuichet && <KpiCard label="RÉSERVATIONS (24H)" value={k.reservations_aujourdhui.toLocaleString('fr-FR')} sub="Dont nouvelles" />}
                {isFlotte && <KpiCard label="TRAJETS AUJOURD'HUI" value={k.trajets_aujourdhui.toString()} sub="Mois préc: 136.8M FCFA" />}
                {isFlotte && <KpiCard label="BUS ACTIFS" value={k.vehicules_actifs.toString()} sub={`Chauffeurs: ${k.chauffeurs_actifs}`} />}
            </motion.div>

            {isCompta && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Évolution du Chiffre d'Affaires" subtitle="30 derniers jours">
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={revenus_tendances}>
                                <XAxis dataKey="jour" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                                <Tooltip formatter={(v: any) => [formatFCFA(Number(v)), 'CA']} labelFormatter={(l: any) => String(l)} />
                                <Line type="monotone" dataKey="recettes" stroke="#b70100" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                    <ChartCard title="Taux d'Occupation" subtitle="7 derniers jours">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={occupation_tendances}>
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} />
                                <Tooltip formatter={(v: any) => [`${Number(v)}%`, 'Occupation']} />
                                <Bar dataKey="taux" fill="#b70100" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {isCompta && (
                    <ChartCard title="Top Routes" subtitle="Par chiffre d'affaires (30 jours)">
                        <div className="space-y-4">
                            {top_routes.map((r, i) => (
                                <div key={r.route} className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-on-surface truncate">{r.route}</p>
                                        <p className="text-xs text-on-surface-variant">{r.passagers} passagers · {r.reservations} résa.</p>
                                    </div>
                                    <p className="font-mono font-bold text-sm text-primary">{formatFCFA(r.revenu)}</p>
                                </div>
                            ))}
                            {top_routes.length === 0 && <p className="text-sm text-on-surface-variant py-4 text-center">Aucune donnée ce mois.</p>}
                        </div>
                    </ChartCard>
                )}

                {isCompta && (
                    <ChartCard title="Répartition CA" subtitle="Par service (mois en cours)">
                        {services.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie data={services} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                                            {services.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()}k FCFA`]} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {services.map((s, i) => (
                                        <div key={s.name} className="flex items-center gap-2 text-xs">
                                            <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                            <span className="text-on-surface-variant">{s.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-on-surface-variant py-8 text-center">Aucun revenu ce mois.</p>
                        )}
                    </ChartCard>
                )}

                {isFlotte && (
                    <ChartCard title="Parc Auto - Prochaines Maintenances" subtitle="Véhicules à entretenir">
                        <p className="text-sm text-on-surface-variant py-8 text-center">Accédez à la page Maintenance pour planifier.</p>
                    </ChartCard>
                )}

                {isGuichet && (
                    <ChartCard title="Dernières Réservations" subtitle="Activité du guichet">
                        <p className="text-sm text-on-surface-variant py-8 text-center">Accédez à la Billetterie pour voir les détails.</p>
                    </ChartCard>
                )}

                {/* Alertes (visible par tous) */}
                <motion.div variants={fadeIn}
                    className="bg-white rounded-2xl border border-outline-variant/15 shadow-ambient flex flex-col"
                >
                    <div className="p-6 bg-surface-container-low">
                        <h3 className="font-bold text-on-surface flex items-center gap-2">
                            <Zap size={18} className="text-primary" /> Alertes
                        </h3>
                    </div>
                    <div className="p-4 space-y-4 overflow-y-auto max-h-[380px]">
                        {alertes.length === 0 && (
                            <p className="text-sm text-on-surface-variant text-center py-6">Aucune alerte récente.</p>
                        )}
                        {alertes.map(a => (
                            <div key={a.id} className={`p-4 rounded-xl border-l-4 flex gap-3 ${
                                a.severite === 'critique' ? 'bg-status-red-bg border-primary' :
                                a.severite === 'haute' ? 'bg-status-yellow-bg border-status-yellow-ring' : 'bg-surface-container-low border-outline-variant'
                            }`}>
                                <AlertTriangle size={16} className={`shrink-0 mt-0.5 ${
                                    a.severite === 'critique' ? 'text-primary' :
                                    a.severite === 'haute' ? 'text-status-yellow-text' : 'text-on-surface-variant'
                                }`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-on-surface">{a.type}</p>
                                    <p className="text-xs text-on-surface-variant mt-0.5">{a.message}</p>
                                    <p className="text-[10px] text-on-surface-variant mt-1">{a.created_at}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Départs du jour (visible guichet, chef garde, flotte, DG) */}
            {isGuichet && (
                <motion.div variants={fadeIn}
                    className="bg-white rounded-2xl border border-outline-variant/15 shadow-ambient overflow-hidden"
                >
                    <div className="p-6 bg-surface-container-low flex justify-between items-center">
                        <h3 className="font-bold text-on-surface">Départs du Jour</h3>
                        <span className="inline-flex items-center rounded-full bg-status-green-bg px-3 py-1 text-xs font-bold text-status-green-text border border-status-green-ring">
                            Ponctualité: {departs.length > 0 ? Math.round(departs.filter(d => d.statut !== 'retarde').length / departs.length * 100) : 100}%
                        </span>
                    </div>
                    <div className="overflow-x-auto min-w-[600px] lg:min-w-0">
                        <table className="w-full text-left min-w-[640px]">
                            <thead className="bg-surface-container-low text-on-surface-variant">
                                <tr>
                                    {['Bus ID', 'Destination', 'Départ', 'Passagers', 'Statut', 'Action'].map(h => (
                                        <th key={h} className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {departs.map(d => (
                                    <tr key={d.bus_id + d.heure} className="hover:bg-surface-container-low transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-primary">{d.bus_id}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-on-surface">{d.destination}</td>
                                        <td className="px-6 py-4 text-sm font-mono text-on-surface-variant">{d.heure}</td>
                                        <td className="px-6 py-4 text-sm font-mono text-on-surface-variant">{d.passagers}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-lg ${
                                                d.statut === 'in_progress' || d.statut === 'confirmed' ? 'bg-status-green-bg text-status-green-text' :
                                                d.statut === 'retarde' ? 'bg-status-yellow-bg text-status-yellow-text' : 'bg-surface-container text-on-surface-variant'
                                            }`}>
                                                {d.statut === 'in_progress' ? 'En route' : d.statut === 'confirmed' ? 'Programmé' : d.statut === 'retarde' ? 'Retardé' : d.statut}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-primary hover:underline text-sm font-bold">Détails</button>
                                        </td>
                                    </tr>
                                ))}
                                {departs.length === 0 && (
                                    <tr><td colSpan={6} className="p-8 text-center text-on-surface-variant text-sm">Aucun départ aujourd'hui.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

AdminDashboard.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Tableau de bord" breadcrumbs={[{ label: 'Tableau de bord' }]}>
        {page}
    </BackOfficeLayout>
);