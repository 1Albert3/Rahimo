import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { formatFCFA } from '@/lib/utils';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    revenus: Record<string, number>;
    totalRevenus: number;
    depenses: number;
    masseSalariale: number;
    totalDepenses: number;
    resultatNet: number;
    depensesParCategorie: Record<string, number>;
}

const PIE_COLORS = ['#22c55e', '#3b82f6', '#eab308', '#a855f7', '#ec4899', '#f97316'];

export default function Bilan({ revenus, totalRevenus, depenses, masseSalariale, totalDepenses, resultatNet, depensesParCategorie }: Props) {
    const revData = Object.entries(revenus).map(([k, v]) => ({ name: k, value: Math.round(v / 100) })).filter(d => d.value > 0);
    const depData = Object.entries(depensesParCategorie).map(([k, v]) => ({ name: k, value: Math.round(Number(v) / 100) })).filter(d => d.value > 0);

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Bilan & Compte de Résultat</h1>
                <p className="text-admin-muted text-sm mt-0.5">Mois en cours</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Revenus', val: formatFCFA(totalRevenus), color: 'text-status-green-text' },
                    { label: 'Dépenses', val: formatFCFA(totalDepenses), color: 'text-status-red-text' },
                    { label: 'Masse Salariale', val: formatFCFA(masseSalariale), color: 'text-status-yellow-text' },
                    { label: 'Résultat Net', val: formatFCFA(resultatNet), color: resultatNet >= 0 ? 'text-status-green-text' : 'text-status-red-text' },
                ].map(s => (
                    <div key={s.label} className="bg-admin-card rounded-xl border border-white/5 p-4">
                        <p className="text-xs text-admin-muted">{s.label}</p>
                        <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.val}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-admin-card rounded-xl border border-white/5 p-5">
                    <h3 className="text-sm font-semibold text-white mb-1">Répartition des Revenus</h3>
                    <p className="text-xs text-admin-muted mb-4">Par service</p>
                    {revData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={revData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                                        {revData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {revData.map((s, i) => (
                                    <div key={s.name} className="flex items-center gap-2 text-xs">
                                        <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                        <span className="text-admin-muted capitalize">{s.name}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : <p className="text-admin-muted text-sm text-center py-8">Aucun revenu ce mois.</p>}
                </div>

                <div className="bg-admin-card rounded-xl border border-white/5 p-5">
                    <h3 className="text-sm font-semibold text-white mb-1">Dépenses par Catégorie</h3>
                    <p className="text-xs text-admin-muted mb-4">Mois en cours</p>
                    {depData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={depData} layout="vertical">
                                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}k`} />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#b70100" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-admin-muted text-sm text-center py-8">Aucune dépense ce mois.</p>}
                </div>
            </div>
        </div>
    );
}

Bilan.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Bilan" breadcrumbs={[{ label: 'Finance' }, { label: 'Bilan / P&L' }]}>
        {page}
    </BackOfficeLayout>
);