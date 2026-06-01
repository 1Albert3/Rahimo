import { useForm } from '@inertiajs/react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps } from '@/types';

interface PointageItem {
    id: number; name: string; role: string;
    clock_in: string | null; clock_out: string | null;
    status: string; notes: string | null;
}

interface Props extends PageProps {
    pointage: PointageItem[];
    stats: { present: number; absent: number; late: number; leave: number };
}

const STATUS_LABELS: Record<string, string> = {
    present: 'Présent', absent: 'Absent', late: 'Retard', half_day: 'Demi-journée', leave: 'Congé', holiday: 'Férié',
};

export default function Pointage({ pointage, stats }: Props) {
    const form = useForm({ user_id: 0, status: 'present', notes: '' });

    const pointer = (id: number, status: string) => {
        form.setData({ user_id: id, status, notes: '' });
        form.post(route('admin.rh.pointage.store'));
    };

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Pointage</h1>
                <p className="text-admin-muted text-sm mt-0.5">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Présents', val: stats.present, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
                    { label: 'Absents', val: stats.absent, color: 'text-status-red-text', bg: 'bg-status-red-bg/30' },
                    { label: 'Retards', val: stats.late, color: 'text-status-yellow-text', bg: 'bg-status-yellow-bg/30' },
                    { label: 'Congés', val: stats.leave, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} rounded-xl border border-white/5 p-4 text-center`}>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                        <p className="text-xs text-admin-muted">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['Employé', 'Rôle', 'Arrivée', 'Départ', 'Statut', 'Notes', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pointage.map(p => (
                                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-white">{p.name}</td>
                                    <td className="px-4 py-3 text-admin-muted capitalize">{p.role}</td>
                                    <td className="px-4 py-3 font-mono text-admin-muted">{p.clock_in ?? '—'}</td>
                                    <td className="px-4 py-3 font-mono text-admin-muted">{p.clock_out ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                            p.status === 'present' ? 'bg-status-green-bg text-status-green-text' :
                                            p.status === 'absent' ? 'bg-status-red-bg text-status-red-text' :
                                            p.status === 'late' ? 'bg-status-yellow-bg text-status-yellow-text' :
                                            'bg-status-blue-bg text-status-blue-text'
                                        }`}>{STATUS_LABELS[p.status] ?? p.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-admin-muted text-xs max-w-[150px] truncate">{p.notes ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <select onChange={e => { if (e.target.value) pointer(p.id, e.target.value); }} defaultValue=""
                                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-admin-muted focus:outline-none focus:border-primary"
                                        >
                                            <option value="" disabled>Action...</option>
                                            <option value="present">Présent</option>
                                            <option value="absent">Absent</option>
                                            <option value="late">Retard</option>
                                            <option value="half_day">Demi-journée</option>
                                            <option value="leave">Congé</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

Pointage.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Pointage" breadcrumbs={[{ label: 'RH' }, { label: 'Pointage' }]}>
        {page}
    </BackOfficeLayout>
);