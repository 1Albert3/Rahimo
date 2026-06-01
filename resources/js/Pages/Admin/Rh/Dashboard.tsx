import { Briefcase, CalendarCheck, Clock, Users } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { formatFCFA } from '@/lib/utils';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    total: number; actifs: number; chauffeurs: number; agents: number;
    presences: number; absences: number; congesEnCours: number;
    contratsExpirant: number; masseSalariale: number;
}

const cards = [
    { key: 'actifs', label: 'Employés Actifs', icon: Users, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
    { key: 'presences', label: 'Présents Aujourd\'hui', icon: Clock, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
    { key: 'congesEnCours', label: 'Congés en Cours', icon: CalendarCheck, color: 'text-status-yellow-text', bg: 'bg-status-yellow-bg/30' },
    { key: 'contratsExpirant', label: 'Contrats Expirants (30j)', icon: Briefcase, color: 'text-status-red-text', bg: 'bg-status-red-bg/30' },
];

export default function RhDashboard({ total, actifs, chauffeurs, agents, presences, absences, congesEnCours, contratsExpirant, masseSalariale }: Props) {
    const values: Record<string, number> = { actifs, presences, congesEnCours, contratsExpirant };
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Ressources Humaines</h1>
                <p className="text-admin-muted text-sm mt-0.5">Gestion du personnel, contrats, paie et pointage</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {cards.map(c => (
                    <div key={c.key} className="bg-admin-card rounded-xl border border-white/5 p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
                            <c.icon size={18} className={c.color} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{values[c.key] ?? 0}</p>
                            <p className="text-xs text-admin-muted">{c.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-admin-card rounded-xl border border-white/5 p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Effectifs</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Total', value: total, color: 'text-white' },
                            { label: 'Chauffeurs', value: chauffeurs, color: 'text-status-blue-text' },
                            { label: 'Agents', value: agents, color: 'text-status-green-text' },
                        ].map(e => (
                            <div key={e.label} className="flex justify-between text-sm">
                                <span className="text-admin-muted">{e.label}</span>
                                <span className={`font-bold ${e.color}`}>{e.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-admin-card rounded-xl border border-white/5 p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Pointage du Jour</h3>
                    <div className="space-y-3">
                        {presences + absences > 0 ? (
                            <>
                                <div className="flex justify-between text-sm">
                                    <span className="text-admin-muted">Présents</span>
                                    <span className="font-bold text-status-green-text">{presences}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-admin-muted">Absents</span>
                                    <span className="font-bold text-status-red-text">{absences}</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                                    <div className="bg-status-green-text h-2 rounded-full transition-all" style={{ width: `${presences + absences > 0 ? presences / (presences + absences) * 100 : 0}%` }} />
                                </div>
                            </>
                        ) : (
                            <p className="text-admin-muted text-sm">Aucun pointage aujourd'hui</p>
                        )}
                    </div>
                </div>

                <div className="bg-admin-card rounded-xl border border-white/5 p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Masse Salariale</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-admin-muted">Mois en cours</span>
                            <span className="font-bold text-white font-mono">{formatFCFA(masseSalariale)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-admin-muted">Absences</span>
                            <span className="font-bold text-status-yellow-text">{absences}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

RhDashboard.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="RH" breadcrumbs={[{ label: 'RH' }, { label: 'Tableau de bord' }]}>
        {page}
    </BackOfficeLayout>
);