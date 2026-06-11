import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Plus, Shield, Trash2, User, X } from 'lucide-react';
import StatusBadge from '@/Components/StatusBadge';
import Pagination from '@/Components/Pagination';
import type { PaginatedData } from '@/types';
import { useApi } from '@/hooks/useApi';
import api from '@/api/client';

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

export default function Utilisateurs() {
    const { data: uData, refetch } = useApi<{ users: PaginatedData<UserItem> }>('/admin/utilisateurs');
    const users = uData?.users ?? { data: [], current_page: 1, last_page: 1, per_page: 15, total: 0, links: [] };
    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState<FormMode>('create');
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', password: '', role: 'client', is_active: true });

    const openCreate = () => { setMode('create'); setEditingUser(null); setForm({ name: '', email: '', phone: '', city: '', password: '', role: 'client', is_active: true }); setShowModal(true); };
    const openEdit = (u: UserItem) => { setMode('edit'); setEditingUser(u); setForm({ name: u.name, email: u.email, phone: u.phone ?? '', city: u.city ?? '', password: '', role: u.role, is_active: u.is_active }); setShowModal(true); };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault(); setProcessing(true); setErrors({});
        try {
            if (mode === 'create') await api.post('/admin/utilisateurs', form);
            else if (editingUser) await api.put(`/admin/utilisateurs/${editingUser.id}`, form);
            setShowModal(false); refetch();
        } catch (err: unknown) {
            const e = (err as { response?: { data?: { errors?: Record<string, string[]> } } }).response?.data?.errors;
            if (e) setErrors(Object.fromEntries(Object.entries(e).map(([k, v]) => [k, v[0]])));
        }
        setProcessing(false);
    };

    const confirmDeactivate = async (u: UserItem) => {
        if (!confirm(`Désactiver ${u.name} ?`)) return;
        await api.delete(`/admin/utilisateurs/${u.id}`);
        refetch();
    };

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-dark">Gestion des Utilisateurs</h1>
                    <p className="text-on-surface-variant text-sm mt-0.5">Créer, modifier et gérer les comptes utilisateurs</p>
                </div>
                <button onClick={openCreate}
                    className="flex items-center gap-2 bg-primary text-on-primary text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-all"
                >
                    <Plus size={15} /> Nouvel utilisateur
                </button>
            </div>

            <div className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                            <tr>
                                {['Nom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Créé le', ''].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <motion.tbody variants={stagger} initial="initial" animate="animate">
                            {users.data.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-8 text-on-surface-variant text-sm">Aucun utilisateur.</td></tr>
                            ) : (
                                users.data.map((u) => {
                                    const borderCls = u.is_active ? 'border-l-status-green-ring' : 'border-l-status-red-ring';
                                    return (
                                    <motion.tr key={u.id} variants={fadeUp}
                                        className={`hover:bg-gris-surface transition-colors border-l-4 ${borderCls}`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gris-surface flex items-center justify-center">
                                                    <User size={14} className="text-on-surface-variant" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-dark text-sm">{u.name}</p>
                                                    {u.city && <p className="text-[10px] text-on-surface-variant">{u.city}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-on-surface-variant text-xs">{u.email}</td>
                                        <td className="px-4 py-3 text-on-surface-variant text-xs font-mono">{u.phone ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gris-surface text-on-surface-variant">
                                                {ROLE_LABELS[u.role] ?? u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={u.is_active ? 'active' : 'inactive'} />
                                        </td>
                                        <td className="px-4 py-3 text-on-surface-variant text-xs">{u.created_at}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => openEdit(u)}
                                                    className="p-1.5 rounded-xl text-on-surface-variant hover:text-slate-dark hover:bg-gris-surface transition-all"
                                                    title="Modifier"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => confirmDeactivate(u)}
                                                    className="p-1.5 rounded-xl text-on-surface-variant hover:text-status-red-text hover:bg-status-red-bg/20 transition-all"
                                                    title="Désactiver"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                    );
                                })
                            )}
                        </motion.tbody>
                    </table>
                </div>
                {users.last_page > 1 && (
                    <div className="p-4 border-t border-outline">
                        <Pagination data={users} />
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-xl border border-outline p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-dark">
                                {mode === 'create' ? 'Nouvel utilisateur' : 'Modifier l\'utilisateur'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-1 text-on-surface-variant hover:text-slate-dark">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Nom complet *</label>
                                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark placeholder-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                                    placeholder="Jean Dupont" />
                                {errors.name && <p className="text-status-red-text text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Email *</label>
                                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark placeholder-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                                        placeholder="jean@exemple.com" />
                                    {errors.email && <p className="text-status-red-text text-xs mt-1">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Téléphone</label>
                                    <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark placeholder-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                                        placeholder="+226 70 00 00 00" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Mot de passe {mode === 'edit' && <span className="text-on-surface-variant font-normal">(vide = inchangé)</span>} *</label>
                                    <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark placeholder-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                                        placeholder={mode === 'edit' ? 'Laisser vide' : 'Min. 8 caractères'} />
                                    {errors.password && <p className="text-status-red-text text-xs mt-1">{errors.password}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Ville</label>
                                    <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark placeholder-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Ouagadougou" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Rôle *</label>
                                    <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark focus:outline-none focus:border-primary transition-colors"
                                    >
                                        {Object.entries(ROLE_LABELS).map(([k, v]) => (
                                            <option key={k} value={k}>{v}</option>
                                        ))}
                                    </select>
                                    {errors.role && <p className="text-status-red-text text-xs mt-1">{errors.role}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Statut</label>
                                    <div className="flex items-center gap-3 h-full pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                                                className="accent-primary" />
                                            <span className="text-sm text-on-surface-variant">Actif</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-outline text-on-surface-variant hover:text-slate-dark hover:bg-gris-surface text-sm font-semibold transition-all"
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
