import { Briefcase, CalendarCheck, Clock, Users } from 'lucide-react';
import { formatFCFA } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
const cards = [
    { key: 'actifs', label: 'Employés Actifs', icon: Users, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
    { key: 'presences', label: 'Présents Aujourd\'hui', icon: Clock, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
    { key: 'congesEnCours', label: 'Congés en Cours', icon: CalendarCheck, color: 'text-status-yellow-text', bg: 'bg-status-yellow-bg/30' },
    { key: 'contratsExpirant', label: 'Contrats Expirants (30j)', icon: Briefcase, color: 'text-status-red-text', bg: 'bg-status-red-bg/30' },
];

export default function RhDashboard() {
    const { data, loading } = useApi<{ total: number; actifs: number; chauffeurs: number; agents: number; presences: number; absences: number; congesEnCours: number; contratsExpirant: number; masseSalariale: number }>('/admin/rh/dashboard');
    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;
    const total = data?.total ?? 0;
    const actifs = data?.actifs ?? 0;
    const chauffeurs = data?.chauffeurs ?? 0;
    const agents = data?.agents ?? 0;
    const presences = data?.presences ?? 0;
    const absences = data?.absences ?? 0;
    const congesEnCours = data?.congesEnCours ?? 0;
    const contratsExpirant = data?.contratsExpirant ?? 0;
    const masseSalariale = data?.masseSalariale ?? 0;
    const values: Record<string, number> = { actifs, presences, congesEnCours, contratsExpirant };
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-dark">Ressources Humaines</h1>
                <p className="text-on-surface-variant text-sm mt-0.5">Gestion du personnel, contrats, paie et pointage</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {cards.map(c => (
                    <div key={c.key} className="bg-white rounded-xl border border-outline shadow-sm p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
                            <c.icon size={18} className={c.color} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-dark">{values[c.key] ?? 0}</p>
                            <p className="text-xs text-on-surface-variant">{c.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-outline shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-slate-dark mb-4">Effectifs</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Total', value: total, color: 'text-slate-dark' },
                            { label: 'Chauffeurs', value: chauffeurs, color: 'text-status-blue-text' },
                            { label: 'Agents', value: agents, color: 'text-status-green-text' },
                        ].map(e => (
                            <div key={e.label} className="flex justify-between text-sm">
                                <span className="text-on-surface-variant">{e.label}</span>
                                <span className={`font-bold ${e.color}`}>{e.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-outline shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-slate-dark mb-4">Pointage du Jour</h3>
                    <div className="space-y-3">
                        {presences + absences > 0 ? (
                            <>
                                <div className="flex justify-between text-sm">
                                    <span className="text-on-surface-variant">Présents</span>
                                    <span className="font-bold text-status-green-text">{presences}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-on-surface-variant">Absents</span>
                                    <span className="font-bold text-status-red-text">{absences}</span>
                                </div>
                                <div className="w-full bg-gris-surface rounded-full h-2 mt-2">
                                    <div className="bg-status-green-text h-2 rounded-full transition-all" style={{ width: `${presences + absences > 0 ? presences / (presences + absences) * 100 : 0}%` }} />
                                </div>
                            </>
                        ) : (
                            <p className="text-on-surface-variant text-sm">Aucun pointage aujourd'hui</p>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-outline shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-slate-dark mb-4">Masse Salariale</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-on-surface-variant">Mois en cours</span>
                            <span className="font-bold text-slate-dark font-mono">{formatFCFA(masseSalariale)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-on-surface-variant">Absences</span>
                            <span className="font-bold text-status-yellow-text">{absences}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
