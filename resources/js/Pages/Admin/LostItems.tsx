import { motion } from 'framer-motion';
import { Camera, Eye, Package, Search } from 'lucide-react';
import { router, useForm } from '@inertiajs/react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import StatusBadge from '@/Components/StatusBadge';
import { formatDate } from '@/lib/utils';
import type { PageProps } from '@/types';

interface LostItem {
    id: number;
    type: string;
    reported_by_name: string;
    reported_by_phone: string;
    trip_info: string | null;
    description: string;
    status: string;
    photo_url: string | null;
    admin_notes: string | null;
    created_at: string;
}

interface Props extends PageProps {
    items: LostItem[];
}

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

const TYPE_ICONS: Record<string, string> = {
    'porte-monnaie': '👛', 'telephone': '📱', 'sac': '🎒',
    'document': '📄', 'vetement': '👕', 'electronique': '💻', 'autre': '📦',
};

export default function LostItems({ items }: Props) {
    const stats = {
        perdu: items.filter(i => i.status === 'perdu').length,
        retrouve: items.filter(i => i.status === 'retrouve').length,
        rendu: items.filter(i => i.status === 'rendu').length,
        total: items.length,
    };

    const updateStatus = (id: number, status: string) => {
        const notes = prompt('Notes internes (optionnel) :');
        router.patch(route('admin.lost-items.update', id), { status, admin_notes: notes ?? '' });
    };

    const uploadPhoto = (id: number) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;
            const formData = new FormData();
            formData.append('photo', file);
            router.post(route('admin.lost-items.photo', id), formData);
        };
        input.click();
    };

    const ST = [
        { label: 'Perdus', val: stats.perdu, color: 'text-status-red-text', bg: 'bg-status-red-bg/30' },
        { label: 'Retrouvés', val: stats.retrouve, color: 'text-status-yellow-text', bg: 'bg-orange-900/30' },
        { label: 'Rendus', val: stats.rendu, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
        { label: 'Total', val: stats.total, color: 'text-white', bg: 'bg-white/5' },
    ];

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Objets Trouvés</h1>
                <p className="text-admin-muted text-sm mt-0.5">Gestion des objets perdus et retrouvés</p>
            </div>

            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={stagger} initial="initial" animate="animate">
                {ST.map((s) => (
                    <motion.div key={s.label} variants={fadeUp}
                        className="bg-admin-card rounded-xl border border-white/5 p-4 flex items-center gap-3"
                    >
                        <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                            <Package size={18} className={s.color} />
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-xs text-admin-muted">{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto min-w-[700px] lg:min-w-0">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['Type', 'Déclarant', 'Description', 'Trajet', 'Statut', 'Photo', 'Date', ''].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className="text-xl">{TYPE_ICONS[item.type] ?? '📦'}</span>
                                        <span className="text-admin-text ml-2 capitalize">{item.type}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-admin-text font-medium">{item.reported_by_name}</p>
                                        <p className="text-xs text-admin-muted font-mono">{item.reported_by_phone}</p>
                                    </td>
                                    <td className="px-4 py-3 text-admin-muted max-w-[200px]">
                                        <p className="truncate text-xs">{item.description}</p>
                                        {item.admin_notes && (
                                            <p className="text-[10px] text-primary-container mt-1">Note: {item.admin_notes}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-admin-muted text-xs">{item.trip_info ?? '—'}</td>
                                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                                    <td className="px-4 py-3">
                                        {item.photo_url ? (
                                            <a href={item.photo_url} target="_blank" rel="noopener noreferrer"
                                                className="text-primary-container hover:underline text-xs flex items-center gap-1"
                                            ><Eye size={12} /> Voir</a>
                                        ) : (
                                            <button onClick={() => uploadPhoto(item.id)}
                                                className="text-admin-muted hover:text-white text-xs flex items-center gap-1 transition-colors"
                                            ><Camera size={12} /> Ajouter</button>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-admin-muted">{formatDate(item.created_at)}</td>
                                    <td className="px-4 py-3">
                                        <select value={item.status}
                                            onChange={e => updateStatus(item.id, e.target.value)}
                                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-primary"
                                        >
                                            <option value="perdu">Perdu</option>
                                            <option value="retrouve">Retrouvé</option>
                                            <option value="rendu">Rendu</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr><td colSpan={8} className="p-8 text-center text-admin-muted">Aucun objet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

LostItems.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Objets Trouvés" breadcrumbs={[{ label: 'Services' }, { label: 'Objets Trouvés' }]}>
        {page}
    </BackOfficeLayout>
);