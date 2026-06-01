import { motion } from 'framer-motion';
import { FileText, MessageSquare, Plus, X, Send } from 'lucide-react';
import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import StatusBadge from '@/Components/StatusBadge';
import { formatDate } from '@/lib/utils';
import type { PageProps } from '@/types';

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

export default function Reclamations({ reclamations, stats }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [traitement, setTraitement] = useState<{ id: number; statut: string; response: string } | null>(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        client_name: '', client_phone: '', type: '', description: '', priorite: 'moyenne',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.reclamations.store'), {
            onSuccess: () => { setShowForm(false); reset(); },
        });
    };

    const traiter = (id: number) => {
        if (!traitement) return;
        router.patch(
            route('admin.reclamations.status', id),
            { statut: traitement.statut, response: traitement.response },
            { onSuccess: () => setTraitement(null) },
        );
    };

    const ST = [
        { label: 'En attente', val: stats.en_attente, color: 'text-status-yellow-text', bg: 'bg-orange-900/30' },
        { label: 'En cours', val: stats.en_cours, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
        { label: 'Résolues', val: stats.resolue, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
        { label: 'Total', val: stats.total, color: 'text-white', bg: 'bg-white/5' },
    ];

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Gestion des Réclamations</h1>
                    <p className="text-admin-muted text-sm mt-0.5">Suivi et traitement des réclamations clients</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all"
                ><Plus size={16} /> Nouvelle réclamation</button>
            </div>

            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={stagger} initial="initial" animate="animate">
                {ST.map((s) => (
                    <motion.div key={s.label} variants={fadeUp}
                        className="bg-admin-card rounded-xl border border-white/5 p-4 flex items-center gap-3"
                    >
                        <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                            <FileText size={18} className={s.color} />
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-xs text-admin-muted">{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                <div className="p-5 ">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <MessageSquare size={16} className="text-primary-container" /> Réclamations ({reclamations.length})
                    </h3>
                </div>
                <div className="overflow-x-auto min-w-[600px] lg:min-w-0">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['Code', 'Client', 'Type', 'Description', 'Priorité', 'Statut', 'Date', ''].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="">
                            {reclamations.map((r) => (
                                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs font-bold text-primary-container">{r.code}</td>
                                    <td className="px-4 py-3">
                                        <p className="text-admin-text font-medium">{r.client_name}</p>
                                        <p className="text-xs text-admin-muted font-mono">{r.client_phone}</p>
                                    </td>
                                    <td className="px-4 py-3 text-admin-muted">{r.type}</td>
                                    <td className="px-4 py-3 text-admin-muted max-w-[200px]">
                                        <p className="truncate text-xs">{r.description}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${PRIORITE_CONFIG[r.priorite]}`}>
                                            {r.priorite}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3"><StatusBadge status={r.statut} /></td>
                                    <td className="px-4 py-3 text-xs text-admin-muted">{formatDate(r.created_at)}</td>
                                    <td className="px-4 py-3">
                                        {r.statut !== 'resolue' && r.statut !== 'fermee' ? (
                                            <button onClick={() => setTraitement({ id: r.id, statut: 'en_cours', response: '' })}
                                                className="text-xs text-primary-container hover:underline font-semibold"
                                            >Traiter</button>
                                        ) : (
                                            <span className="text-xs text-admin-muted">par {r.treated_by_name}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {reclamations.length === 0 && (
                                <tr><td colSpan={8} className="p-8 text-center text-admin-muted">Aucune réclamation</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {reclamations.some(r => r.response) && (
                <div className="bg-admin-card rounded-xl border border-white/5 p-5">
                    <h3 className="font-semibold text-white text-sm mb-4">Dernières réponses</h3>
                    <div className="space-y-3">
                        {reclamations.filter(r => r.response).slice(0, 5).map(r => (
                            <div key={r.id} className="bg-white/5 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-xs text-primary-container">{r.code}</span>
                                    <StatusBadge status={r.statut} />
                                </div>
                                <p className="text-xs text-admin-muted">{r.response}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Nouvelle réclamation modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
                    <div className="bg-admin-card rounded-2xl border border-white/10 p-6 w-full max-w-lg mx-2 sm:mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">Nouvelle réclamation</h2>
                            <button onClick={() => setShowForm(false)} className="text-admin-muted hover:text-white transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Client *</label>
                                    <input value={data.client_name} onChange={e => setData('client_name', e.target.value)} required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Téléphone *</label>
                                    <input value={data.client_phone} onChange={e => setData('client_phone', e.target.value)} required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Type *</label>
                                    <input value={data.type} onChange={e => setData('type', e.target.value)} required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-admin-muted mb-1 block">Priorité *</label>
                                    <select value={data.priorite} onChange={e => setData('priorite', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                                    >
                                        <option value="basse">Basse</option>
                                        <option value="moyenne">Moyenne</option>
                                        <option value="haute">Haute</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-admin-muted mb-1 block">Description *</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} required rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                            </div>
                            <button type="submit" disabled={processing}
                                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
                            >{processing ? 'Enregistrement...' : 'Enregistrer'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Traitement modal */}
            {traitement && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setTraitement(null)}>
                    <div className="bg-admin-card rounded-2xl border border-white/10 p-6 w-full max-w-lg mx-2 sm:mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">Traiter la réclamation</h2>
                            <button onClick={() => setTraitement(null)} className="text-admin-muted hover:text-white transition-colors"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-admin-muted mb-1 block">Statut *</label>
                                <select value={traitement.statut}
                                    onChange={e => setTraitement({ ...traitement, statut: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                                >
                                    <option value="en_cours">En cours</option>
                                    <option value="resolue">Résolue</option>
                                    <option value="fermee">Fermée</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-admin-muted mb-1 block">Réponse</label>
                                <textarea value={traitement.response}
                                    onChange={e => setTraitement({ ...traitement, response: e.target.value })}
                                    rows={4}
                                    placeholder="Votre réponse au client..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                            </div>
                            <button onClick={() => traiter(traitement.id)}
                                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                            ><Send size={14} /> Enregistrer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

Reclamations.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Réclamations" breadcrumbs={[{ label: 'Tableau de bord', href: route('admin.dashboard') }, { label: 'Réclamations' }]}>
        {page}
    </BackOfficeLayout>
);
