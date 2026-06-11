import { motion } from 'framer-motion';
import { FileText, MessageSquare, Plus, X, Send } from 'lucide-react';
import { useState } from 'react';
import StatusBadge from '@/Components/StatusBadge';
import { formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import api from '@/api/client';
interface ReclamationItem {
    id: number;
    code: string;
    client_name: string;
    client_phone: string;
    type: string;
    description: string;
    priorite: 'haute' | 'moyenne' | 'basse';
    statut: 'en_attente' | 'en_cours' | 'resolue' | 'fermee';
    response: string | null;
    created_at: string;
    treated_at: string | null;
    treated_by_name: string | null;
}

interface Props extends PageProps {
    reclamations: ReclamationItem[];
    stats: { en_attente: number; en_cours: number; resolue: number; total: number };
}

const PRIORITE_CONFIG: Record<string, string> = {
    haute: 'bg-red-900/50 text-status-red-text',
    moyenne: 'bg-status-yellow-bg/50 text-status-yellow-text',
    basse: 'bg-status-green-bg/50 text-status-green-text',
};

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function Reclamations() {
    const { data: rData, refetch } = useApi<{ reclamations: ReclamationItem[]; stats: { en_attente: number; en_cours: number; resolue: number; total: number } }>('/admin/reclamations');
    const reclamations = rData?.reclamations ?? [];
    const stats = rData?.stats ?? { en_attente: 0, en_cours: 0, resolue: 0, total: 0 };
    const [showForm, setShowForm] = useState(false);
    const [traitement, setTraitement] = useState<{ id: number; statut: string; response: string } | null>(null);
    const [processing, setProcessing] = useState(false);
    const [form, setForm] = useState({ client_name: '', client_phone: '', type: '', description: '', priorite: 'moyenne' });

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try { await api.post('/admin/reclamations', form); setShowForm(false); setForm({ client_name: '', client_phone: '', type: '', description: '', priorite: 'moyenne' }); refetch(); } catch { }
        setProcessing(false);
    };

    const traiter = async (id: number) => {
        if (!traitement) return;
        try { await api.patch(`/admin/reclamations/${id}/statut`, { statut: traitement.statut, response: traitement.response }); setTraitement(null); refetch(); } catch { }
    };

    const ST = [
        { label: 'En attente', val: stats.en_attente, color: 'text-status-yellow-text', bg: 'bg-orange-900/30' },
        { label: 'En cours', val: stats.en_cours, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
        { label: 'Résolues', val: stats.resolue, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
        { label: 'Total', val: stats.total, color: 'text-slate-dark', bg: 'bg-gris-surface' },
    ];

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-dark">Gestion des Réclamations</h1>
                    <p className="text-on-surface-variant text-sm mt-0.5">Suivi et traitement des réclamations clients</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-all"
                ><Plus size={16} /> Nouvelle réclamation</button>
            </div>

            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={stagger} initial="initial" animate="animate">
                {ST.map((s) => (
                    <motion.div key={s.label} variants={fadeUp}
                        className="bg-white rounded-xl border border-outline shadow-sm p-4 flex items-center gap-3"
                    >
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                            <FileText size={18} className={s.color} />
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-xs text-on-surface-variant">{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden">
                <div className="p-5 ">
                    <h3 className="font-semibold text-slate-dark flex items-center gap-2">
                        <MessageSquare size={16} className="text-primary" /> Réclamations ({reclamations.length})
                    </h3>
                </div>
                <div className="overflow-x-auto min-w-[600px] lg:min-w-0">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                            <tr>
                                {['Code', 'Client', 'Type', 'Description', 'Priorité', 'Statut', 'Date', ''].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="">
                            {reclamations.map((r) => {
                                const s = r.statut;
                                const borderCls = s === 'resolue' ? 'border-l-status-green-ring' : s === 'en_cours' ? 'border-l-status-yellow-ring' : s === 'fermee' ? 'border-l-outline' : 'border-l-status-red-ring';
                                return (
                                <tr key={r.id} className={`hover:bg-gris-surface transition-colors border-l-4 ${borderCls}`}>
                                    <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{r.code}</td>
                                    <td className="px-4 py-3">
                                        <p className="text-slate-dark font-medium">{r.client_name}</p>
                                        <p className="text-xs text-on-surface-variant font-mono">{r.client_phone}</p>
                                    </td>
                                    <td className="px-4 py-3 text-on-surface-variant">{r.type}</td>
                                    <td className="px-4 py-3 text-on-surface-variant max-w-[200px]">
                                        <p className="truncate text-xs">{r.description}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${PRIORITE_CONFIG[r.priorite]}`}>
                                            {r.priorite}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3"><StatusBadge status={r.statut} /></td>
                                    <td className="px-4 py-3 text-xs text-on-surface-variant">{formatDate(r.created_at)}</td>
                                    <td className="px-4 py-3">
                                        {r.statut !== 'resolue' && r.statut !== 'fermee' ? (
                                            <button onClick={() => setTraitement({ id: r.id, statut: 'en_cours', response: '' })}
                                                className="text-xs text-primary hover:underline font-semibold"
                                            >Traiter</button>
                                        ) : (
                                            <span className="text-xs text-on-surface-variant">par {r.treated_by_name}</span>
                                        )}
                                    </td>
                                </tr>
                                );
                            })}
                            {reclamations.length === 0 && (
                                <tr><td colSpan={8} className="p-8 text-center text-on-surface-variant">Aucune réclamation</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {reclamations.some(r => r.response) && (
                <div className="bg-white rounded-xl border border-outline shadow-sm p-5">
                    <h3 className="font-semibold text-slate-dark text-sm mb-4">Dernières réponses</h3>
                    <div className="space-y-3">
                        {reclamations.filter(r => r.response).slice(0, 5).map(r => (
                            <div key={r.id} className="bg-gris-surface rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-xs text-primary">{r.code}</span>
                                    <StatusBadge status={r.statut} />
                                </div>
                                <p className="text-xs text-on-surface-variant">{r.response}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Nouvelle réclamation modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
                    <div className="bg-white rounded-xl border border-outline shadow-sm p-6 w-full max-w-lg mx-2 sm:mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-dark">Nouvelle réclamation</h2>
                            <button onClick={() => setShowForm(false)} className="text-on-surface-variant hover:text-slate-dark transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Client *</label>
                                    <input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} required
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Téléphone *</label>
                                    <input value={form.client_phone} onChange={e => setForm(f => ({ ...f, client_phone: e.target.value }))} required
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Type *</label>
                                    <input value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} required
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Priorité *</label>
                                    <select value={form.priorite} onChange={e => setForm(f => ({ ...f, priorite: e.target.value }))}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary"
                                    >
                                        <option value="basse">Basse</option>
                                        <option value="moyenne">Moyenne</option>
                                        <option value="haute">Haute</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-on-surface-variant mb-1 block">Description *</label>
                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={3}
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                            </div>
                            <button type="submit" disabled={processing}
                                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                            >{processing ? 'Enregistrement...' : 'Enregistrer'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Traitement modal */}
            {traitement && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setTraitement(null)}>
                    <div className="bg-white rounded-xl border border-outline shadow-sm p-6 w-full max-w-lg mx-2 sm:mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-dark">Traiter la réclamation</h2>
                            <button onClick={() => setTraitement(null)} className="text-on-surface-variant hover:text-slate-dark transition-colors"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-on-surface-variant mb-1 block">Statut *</label>
                                <select value={traitement.statut}
                                    onChange={e => setTraitement({ ...traitement, statut: e.target.value })}
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary"
                                >
                                    <option value="en_cours">En cours</option>
                                    <option value="resolue">Résolue</option>
                                    <option value="fermee">Fermée</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-on-surface-variant mb-1 block">Réponse</label>
                                <textarea value={traitement.response}
                                    onChange={e => setTraitement({ ...traitement, response: e.target.value })}
                                    rows={4}
                                    placeholder="Votre réponse au client..."
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                            </div>
                            <button onClick={() => traiter(traitement.id)}
                                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                            ><Send size={14} /> Enregistrer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
