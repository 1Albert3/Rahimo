
import { useForm } from '@/hooks/useForm';
import { useApi } from '@/hooks/useApi';
import { storePointage } from '@/api/admin';
interface PointageItem {
    id: number; name: string; role: string;
    clock_in: string | null; clock_out: string | null;
    status: string; notes: string | null;
}

const STATUS_LABELS: Record<string, string> = {
    present: 'Présent', absent: 'Absent', late: 'Retard', half_day: 'Demi-journée', leave: 'Congé', holiday: 'Férié',
};

export default function Pointage() {
    const { data, loading } = useApi<{ pointage: PointageItem[]; stats: { present: number; absent: number; late: number; leave: number } }>('/admin/rh/pointage');
    const form = useForm({ user_id: 0, status: 'present', notes: '' });

    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;
    const pointage = data?.pointage ?? [];
    const stats = data?.stats ?? { present: 0, absent: 0, late: 0, leave: 0 };

    const pointer = async (id: number, status: string) => {
        await storePointage({ user_id: id, status, notes: '' });
    };

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-dark">Pointage</h1>
                <p className="text-on-surface-variant text-sm mt-0.5">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Présents', val: stats?.present ?? 0, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
                    { label: 'Absents', val: stats?.absent ?? 0, color: 'text-status-red-text', bg: 'bg-status-red-bg/30' },
                    { label: 'Retards', val: stats?.late ?? 0, color: 'text-status-yellow-text', bg: 'bg-status-yellow-bg/30' },
                    { label: 'Congés', val: stats?.leave ?? 0, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} rounded-xl border border-outline p-4 text-center`}>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                        <p className="text-xs text-on-surface-variant">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                            <tr>
                                {['Employé', 'Rôle', 'Arrivée', 'Départ', 'Statut', 'Notes', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pointage.map(p => (
                                <tr key={p.id} className="hover:bg-gris-surface transition-colors">
                                    <td className="px-4 py-3 font-semibold text-slate-dark">{p.name}</td>
                                    <td className="px-4 py-3 text-on-surface-variant capitalize">{p.role}</td>
                                    <td className="px-4 py-3 font-mono text-on-surface-variant">{p.clock_in ?? '—'}</td>
                                    <td className="px-4 py-3 font-mono text-on-surface-variant">{p.clock_out ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                            p.status === 'present' ? 'bg-status-green-bg text-status-green-text' :
                                            p.status === 'absent' ? 'bg-status-red-bg text-status-red-text' :
                                            p.status === 'late' ? 'bg-status-yellow-bg text-status-yellow-text' :
                                            'bg-status-blue-bg text-status-blue-text'
                                        }`}>{STATUS_LABELS[p.status] ?? p.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-on-surface-variant text-xs max-w-[150px] truncate">{p.notes ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <select onChange={e => { if (e.target.value) pointer(p.id, e.target.value); }} defaultValue=""
                                            className="bg-gris-surface border border-outline rounded-xl px-2 py-1 text-xs text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
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
