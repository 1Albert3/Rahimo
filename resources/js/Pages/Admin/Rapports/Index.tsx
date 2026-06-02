import { useState } from 'react';
import { router } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, FileText, TrendingUp, TrendingDown, DollarSign, Users, Bus, Wrench } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    filters: { from: string; to: string };
    reports: {
        revenue_by_day: { date: string; revenue: number; bookings: number }[];
        by_route: { route: string; trips: number; passengers: number; revenue: number }[];
        by_service: { service: string; amount: number }[];
        total_revenue: number;
        total_expenses: number;
        net_result: number;
        yoy_revenue: number;
        occupancy: { rate: number; passengers: number; capacity: number };
        fleet_costs: { vehicle: string; cost: number; count: number }[];
    };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ReportsIndex({ filters, reports }: Props) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    const applyFilter = () => {
        router.get(route('admin.rapports.avances'), { from, to });
    };

    const exportExcel = () => {
        window.open(route('admin.rapports.avances.excel', { from, to }), '_blank');
    };

    const exportCsv = () => {
        window.open(route('admin.rapports.avances.csv', { from, to }), '_blank');
    };

    const netPositive = reports.net_result >= 0;

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-dark">Rapports Avancés</h1>
                    <p className="text-on-surface-variant text-sm mt-0.5">Analyse comparative, rentabilité, exports</p>
                </div>
                <div className="flex items-center gap-3">
                    <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                        className="bg-gris-surface border border-outline rounded-xl px-3 py-1.5 text-slate-dark text-sm" />
                    <span className="text-on-surface-variant text-xs">→</span>
                    <input type="date" value={to} onChange={e => setTo(e.target.value)}
                        className="bg-gris-surface border border-outline rounded-xl px-3 py-1.5 text-slate-dark text-sm" />
                    <button onClick={applyFilter}
                        className="btn-primary px-4 py-1.5 rounded-xl text-sm font-semibold"
                    >Appliquer</button>
                    <button onClick={exportExcel}
                        className="bg-status-green-bg/30 text-status-green-text px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1"
                    ><Download size={14} /> XLSX</button>
                    <button onClick={exportCsv}
                        className="bg-status-blue-bg/30 text-status-blue-text px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1"
                    ><FileText size={14} /> CSV</button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Revenu Total', val: `${reports.total_revenue.toLocaleString()} FCFA`, icon: DollarSign, col: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
                    { label: 'Dépenses', val: `${reports.total_expenses.toLocaleString()} FCFA`, icon: TrendingDown, col: 'text-status-red-text', bg: 'bg-status-red-bg/30' },
                    { label: 'Résultat Net', val: `${reports.net_result.toLocaleString()} FCFA`, icon: netPositive ? TrendingUp : TrendingDown, col: netPositive ? 'text-status-green-text' : 'text-status-red-text', bg: netPositive ? 'bg-status-green-bg/30' : 'bg-status-red-bg/30' },
                    { label: 'Taux Occupation', val: `${reports.occupancy.rate}%`, icon: Users, col: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-outline shadow-sm p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon size={18} className={s.col} /></div>
                        <div>
                            <p className={`text-xl font-bold ${s.col}`}>{s.val}</p>
                            <p className="text-xs text-on-surface-variant">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Revenus par jour */}
            <div className="bg-white rounded-xl border border-outline shadow-sm p-5">
                <h2 className="text-sm font-semibold text-slate-dark mb-4">Revenus par Jour</h2>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={reports.revenue_by_day}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '12px' }} />
                        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenus par service */}
                <div className="bg-white rounded-xl border border-outline shadow-sm p-5">
                    <h2 className="text-sm font-semibold text-slate-dark mb-4">Revenus par Service</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={reports.by_service} dataKey="amount" nameKey="service" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }: any) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                                {reports.by_service.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Top routes */}
                <div className="bg-white rounded-xl border border-outline shadow-sm p-5">
                    <h2 className="text-sm font-semibold text-slate-dark mb-4">Top Routes par Revenu</h2>
                    <div className="space-y-2">
                        {reports.by_route.slice(0, 8).map((r, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-on-surface-variant w-5 text-xs">{i + 1}.</span>
                                    <span className="text-slate-dark">{r.route}</span>
                                    <span className="text-on-surface-variant text-xs">({r.passengers} pax)</span>
                                </div>
                                <span className="text-status-green-text font-mono text-xs">{r.revenue.toLocaleString()} FCFA</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coûts flotte */}
                <div className="bg-white rounded-xl border border-outline shadow-sm p-5">
                    <h2 className="text-sm font-semibold text-slate-dark mb-4 flex items-center gap-2"><Wrench size={14} className="text-on-surface-variant" /> Coûts Maintenance par Véhicule</h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={reports.fleet_costs} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                            <YAxis dataKey="vehicle" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={100} />
                            <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '12px' }} />
                            <Bar dataKey="cost" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* YoY Comparison */}
                <div className="bg-white rounded-xl border border-outline shadow-sm p-5">
                    <h2 className="text-sm font-semibold text-slate-dark mb-4 flex items-center gap-2"><TrendingUp size={14} className="text-on-surface-variant" /> Comparaison Annuelle (YoY)</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gris-surface rounded-xl p-4 text-center">
                            <p className="text-xs text-on-surface-variant">Année Précédente</p>
                            <p className="text-2xl font-bold text-on-surface-variant mt-1">{reports.yoy_revenue.toLocaleString()}</p>
                            <p className="text-xs text-on-surface-variant">FCFA</p>
                        </div>
                        <div className="bg-gris-surface rounded-xl p-4 text-center">
                            <p className="text-xs text-on-surface-variant">Période Actuelle</p>
                            <p className="text-2xl font-bold text-status-green-text mt-1">{reports.total_revenue.toLocaleString()}</p>
                            <p className="text-xs text-on-surface-variant">FCFA</p>
                        </div>
                    </div>
                    {reports.yoy_revenue > 0 && (
                        <div className="mt-3 text-center">
                            <span className={`text-sm font-semibold ${reports.total_revenue >= reports.yoy_revenue ? 'text-status-green-text' : 'text-status-red-text'}`}>
                                {reports.total_revenue >= reports.yoy_revenue ? '▲' : '▼'} {Math.abs(Math.round(((reports.total_revenue - reports.yoy_revenue) / reports.yoy_revenue) * 100))}% vs année dernière
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

ReportsIndex.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Rapports" breadcrumbs={[{ label: 'Rapports' }]}>
        {page}
    </BackOfficeLayout>
);