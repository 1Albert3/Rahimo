import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Pencil, Plus, Shield, Trash2, User, X } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import StatusBadge from '@/Components/StatusBadge';
import Pagination from '@/Components/Pagination';
import type { PageProps, PaginatedData } from '@/types';

interface UserItem {
    id: number; name: string; email: string; phone: string | null;
    city: string | null; role: string; is_active: boolean;
    trips_count: number; created_at: string;
}

interface Props extends PageProps {
    users: PaginatedData<UserItem>;
}

type FormMode = 'create' | 'edit';

const ROLE_LABELS: Record<string, string> = {
    directeur_general: 'Directeur Général',
    responsable_flotte: 'Resp. Flotte',
    comptable: 'Comptable',
    chef_garde: 'Chef de Garde',
    guichetiere: 'Guichetière',
    agent_police: 'Agent Police',
    bagagiste: 'Bagagiste',
    chauffeur: 'Chauffeur',
    client: 'Client',
};

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function Utilisateurs({ users }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState<FormMode>('create');
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        city: '',
        password: '',
        role: 'client',
        is_active: true,
    });

    const openCreate = () => {
        setMode('create');
        setEditingUser(null);
        reset();
        setShowModal(true);
    };

    const openEdit = (u: UserItem) => {
        setMode('edit');
        setEditingUser(u);
        setData({
            name: u.name,
            email: u.email,
            phone: u.phone ?? '',
            city: u.city ?? '',
            password: '',
            role: u.role,
            is_active: u.is_active,
        });
        setShowModal(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'create') {
            post(route('admin.utilisateurs.store'), {
                onSuccess: () => { setShowModal(false); reset(); },
            });
        } else if (editingUser) {
            put(route('admin.utilisateurs.update', { user: editingUser.id }), {
                onSuccess: () => { setShowModal(false); reset(); },
            });
        }
    };

    const confirmDeactivate = (u: UserItem) => {
        if (confirm(`Désactiver l'utilisateur ${u.name} (${u.email}) ?`)) {
            router.delete(route('admin.utilisateurs.destroy', { user: u.id }));
        }
    };

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-white">Gestion des Utilisateurs</h1>
                    <p className="text-admin-muted text-sm mt-0.5">Créer, modifier et gérer les comptes utilisateurs</p>
                </div>
                <button onClick={openCreate}
                    className="flex items-center gap-2 bg-primary text-on-primary text-sm font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-all"
                >
                    <Plus size={15} /> Nouvel utilisateur
                </button>
            </div>

            <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['Nom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Créé le', ''].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <motion.tbody variants={stagger} initial="initial" animate="animate">
                            {users.data.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-8 text-admin-muted text-sm">Aucun utilisateur.</td></tr>
                            ) : (
                                users.data.map((u) => (
                                    <motion.tr key={u.id} variants={fadeUp} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                    <User size={14} className="text-admin-muted" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white text-sm">{u.name}</p>
                                                    {u.city && <p className="text-[10px] text-admin-muted">{u.city}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-admin-muted text-xs">{u.email}</td>
                                        <td className="px-4 py-3 text-admin-muted text-xs font-mono">{u.phone ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-admin-muted">
                                                {ROLE_LABELS[u.role] ?? u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={u.is_active ? 'active' : 'inactive'} />
                                        </td>
                                        <td className="px-4 py-3 text-admin-muted text-xs">{u.created_at}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => openEdit(u)}
                                                    className="p-1.5 rounded-lg text-admin-muted hover:text-white hover:bg-white/10 transition-all"
                                                    title="Modifier"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => confirmDeactivate(u)}
                                                    className="p-1.5 rounded-lg text-admin-muted hover:text-status-red-text hover:bg-status-red-bg/20 transition-all"
                                                    title="Désactiver"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </motion.tbody>
                    </table>
                </div>
                {users.last_page > 1 && (
                    <div className="p-4 border-t border-white/5">
                        <Pagination data={users} />
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setShowModal(false)}>
                    <div className="bg-admin-card rounded-2xl border border-white/10 p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">
                                {mode === 'create' ? 'Nouvel utilisateur' : 'Modifier l\'utilisateur'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-1 text-admin-muted hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-admin-muted mb-1">Nom complet *</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-admin-muted focus:outline-none focus:border-primary transition-colors"
                                    placeholder="Jean Dupont" />
                                {errors.name && <p className="text-status-red-text text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-admin-muted mb-1">Email *</label>
                                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-admin-muted focus:outline-none focus:border-primary transition-colors"
                                        placeholder="jean@exemple.com" />
                                    {errors.email && <p className="text-status-red-text text-xs mt-1">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-admin-muted mb-1">Téléphone</label>
                                    <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-admin-muted focus:outline-none focus:border-primary transition-colors"
                                        placeholder="+226 70 00 00 00" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-admin-muted mb-1">Mot de passe {mode === 'edit' && <span className="text-admin-muted font-normal">(vide = inchangé)</span>} *</label>
                                    <input type="password" value={data.password} onChange={e => setData('password', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-admin-muted focus:outline-none focus:border-primary transition-colors"
                                        placeholder={mode === 'edit' ? 'Laisser vide' : 'Min. 8 caractères'} />
                                    {errors.password && <p className="text-status-red-text text-xs mt-1">{errors.password}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-admin-muted mb-1">Ville</label>
                                    <input type="text" value={data.city} onChange={e => setData('city', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-admin-muted focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Ouagadougou" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-admin-muted mb-1">Rôle *</label>
                                    <select value={data.role} onChange={e => setData('role', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                    >
                                        {Object.entries(ROLE_LABELS).map(([k, v]) => (
                                            <option key={k} value={k}>{v}</option>
                                        ))}
                                    </select>
                                    {errors.role && <p className="text-status-red-text text-xs mt-1">{errors.role}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-admin-muted mb-1">Statut</label>
                                    <div className="flex items-center gap-3 h-full pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)}
                                                className="accent-primary" />
                                            <span className="text-sm text-admin-muted">Actif</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-admin-muted hover:text-white hover:bg-white/5 text-sm font-semibold transition-all"
                                >Annuler</button>
                                <button type="submit" disabled={processing}
                                    className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
                                >{processing ? 'Enregistrement...' : mode === 'create' ? 'Créer' : 'Enregistrer'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

Utilisateurs.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Utilisateurs" breadcrumbs={[{ label: 'Tableau de bord', href: route('admin.dashboard') }, { label: 'Utilisateurs' }]}>
        {page}
    </BackOfficeLayout>
);
