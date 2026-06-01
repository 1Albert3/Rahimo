import { motion } from 'framer-motion';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowDownRight, ArrowUpRight, Banknote, CheckCircle, CreditCard, Download, Landmark,
    PiggyBank, Plus, X, Receipt, History,
} from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import StatusBadge from '@/Components/StatusBadge';
import { cn, formatFCFA } from '@/lib/utils';
import type { PageProps } from '@/types';

interface Stat {
    recettes_journalieres: number;
    recettes_mensuelles: number;
    depenses_journalieres: number;
    depenses_mensuelles: number;
    depenses_en_attente: number;
    benefice_journalier: number;
    recettes_par_source: { guichet: number; orange_money: number; moov_money: number };
}

interface DepenseItem {
    id: number;
    category: string;
    description: string;
    amount: number;
    status: string;
    user: string;
    expense_date: string;
    created_at: string;
}

interface CaisseItem {
    id: number;
    user: string;
    opened_at: string;
    closed_at: string | null;
    opening_balance: number;
    closing_balance: number | null;
    expected_balance: number | null;
    difference: number | null;
    status: string;
    notes: string | null;
}

interface ReconItem {
    id: number;
    user: string;
    account_name: string;
    account_number: string;
    statement_balance: number;
    system_balance: number;
    difference: number;
    status: string;
    reconciled_at: string | null;
    notes: string | null;
}

interface Props extends PageProps {
    stats: Stat;
    recettes_par_service: Record<string, number>;
    depenses_par_categorie: Record<string, number>;
    depenses_recentes: DepenseItem[];
    caisses: CaisseItem[];
    reconciliations: ReconItem[];
}

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

const CATEGORY_LABELS: Record<string, string> = {
    carburant: 'Carburant',
    salaires: 'Salaires',
    maintenance: 'Maintenance',
    peages_taxes: 'Péages & Taxes',
    fournitures: 'Fournitures',
    marketing: 'Marketing',
    assurance: 'Assurance',
    autres: 'Autres',
};

export default function Comptabilite({ stats, recettes_par_service, depenses_par_categorie, depenses_recentes, caisses, reconciliations }: Props) {
    const [showDepense, setShowDepense] = useState(false);
    const [showCaisse, setShowCaisse] = useState(false);
    const [showCloture, setShowCloture] = useState(false);
    const [showRecon, setShowRecon] = useState(false);
    const [closeCaisseId, setCloseCaisseId] = useState<number | null>(null);

    const dep = useForm({ category: 'carburant', description: '', amount: '', expense_date: new Date().toISOString().slice(0, 10), notes: '' });
    const caisse = useForm({ opening_balance: '' });
    const cloture = useForm({ closing_balance: '', notes: '' });
    const recon = useForm({ account_name: '', account_number: '', statement_balance: '', system_balance: '', notes: '' });

    const submitDepense = (e: React.FormEvent) => {
        e.preventDefault();
        dep.post(route('admin.depenses.store'), { onSuccess: () => { setShowDepense(false); dep.reset(); } });
    };

    const submitCaisse = (e: React.FormEvent) => {
        e.preventDefault();
        caisse.post(route('admin.caisses.ouvrir'), { onSuccess: () => { setShowCaisse(false); caisse.reset(); } });
    };

    const submitCloture = (e: React.FormEvent) => {
        e.preventDefault();
        if (!closeCaisseId) return;
        cloture.post(route('admin.caisses.fermer', closeCaisseId), { onSuccess: () => { setShowCloture(false); setCloseCaisseId(null); cloture.reset(); } });
    };

    const submitRecon = (e: React.FormEvent) => {
        e.preventDefault();
        recon.post(route('admin.rapprochement.store'), { onSuccess: () => { setShowRecon(false); recon.reset(); } });
    };

    const validerDepense = (id: number, status: string) => {
        router.patch(route('admin.depenses.valider', id), { status });
    };

    const totalDepensesCategorie = Object.values(depenses_par_categorie).reduce((s, v) => s + v, 0);
    const totalRecettesServices = Object.values(recettes_par_service).reduce((s, v) => s + v, 0);

    const KPIS = [
        { label: 'Recettes Journalières', val: stats.recettes_journalieres, icon: ArrowUpRight, color: 'text-status-green-text', bg: 'bg-status-green-bg/30', border: 'border-status-green-ring' },
        { label: 'Dépenses Journalières', val: stats.depenses_journalieres, icon: ArrowDownRight, color: 'text-status-red-text', bg: 'bg-red-900/30', border: 'border-status-red-ring' },
        { label: 'Bénéfice Net', val: stats.benefice_journalier, icon: CreditCard, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30', border: 'border-status-blue-ring' },
        { label: 'Dépenses en attente', val: stats.depenses_en_attente, icon: History, color: 'text-status-yellow-text', bg: 'bg-orange-900/30', border: 'border-status-yellow-ring' },
    ];

    return (
        <div className="w-full max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-white">Comptabilité & Rapports</h1>
                    <p className="text-admin-muted text-sm mt-0.5">Rapport journalier — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => setShowDepense(true)}
                        className="flex items-center gap-2 border border-white/10 text-admin-muted hover:text-white hover:bg-white/5 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    ><Receipt size={16} /> Nouvelle dépense</button>
                    <button onClick={() => setShowCaisse(true)}
                        className="flex items-center gap-2 border border-white/10 text-admin-muted hover:text-white hover:bg-white/5 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    ><Banknote size={16} /> Ouvrir caisse</button>
                    <button onClick={() => setShowRecon(true)}
                        className="flex items-center gap-2 border border-white/10 text-admin-muted hover:text-white hover:bg-white/5 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    ><Landmark size={16} /> Rapprochement</button>
                    <button onClick={() => router.get(route('admin.rapports'))}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    ><Download size={16} /> Rapports</button>
                </div>
            </div>

            {/* KPIs */}
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger} initial="initial" animate="animate">
                {KPIS.map((k) => {
                    const Icon = k.icon;
                    return (
                        <motion.div key={k.label} variants={fadeUp}
                            className={`bg-admin-card rounded-xl border-l-4 ${k.border} p-5`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-admin-muted">{k.label}</p>
                                <div className={`w-8 h-8 rounded-lg ${k.bg} flex items-center justify-center`}>
                                    <Icon size={16} className={k.color} />
                                </div>
                            </div>
                            <p className={`text-2xl font-extrabold ${k.color}`}>
                                {typeof k.val === 'number' ? formatFCFA(k.val) : k.val}
                            </p>
                        </motion.div>
                    );
                })}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Recettes par source */}
                <motion.div variants={fadeUp} initial="initial" animate="animate"
                    className="bg-admin-card rounded-xl border border-white/5 p-5"
                >
                    <h3 className="font-semibold text-white mb-5">Recettes du Jour par Source</h3>
                    <div className="space-y-4">
                        {[
                            { src: 'Guichet', val: stats.recettes_par_source.guichet, pct: stats.recettes_journalieres > 0 ? Math.round(stats.recettes_par_source.guichet / stats.recettes_journalieres * 100) : 0 },
                            { src: 'Orange Money', val: stats.recettes_par_source.orange_money, pct: stats.recettes_journalieres > 0 ? Math.round(stats.recettes_par_source.orange_money / stats.recettes_journalieres * 100) : 0 },
                            { src: 'Services', val: totalRecettesServices, pct: stats.recettes_journalieres > 0 ? Math.round(totalRecettesServices / (stats.recettes_journalieres + totalRecettesServices) * 100) : 0 },
                        ].filter(s => s.val > 0).map((s) => (
                            <div key={s.src}>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="text-admin-text">{s.src}</span>
                                    <span className="text-admin-muted">{formatFCFA(s.val)}</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-primary-container rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${s.pct}%` }}
                                        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                                    />
                                </div>
                            </div>
                        ))}
                        {stats.recettes_journalieres === 0 && totalRecettesServices === 0 && (
                            <p className="text-admin-muted text-sm text-center py-4">Aucune recette aujourd'hui</p>
                        )}
                    </div>
                </motion.div>

                {/* Dépenses par catégorie */}
                <motion.div variants={fadeUp} initial="initial" animate="animate"
                    className="bg-admin-card rounded-xl border border-white/5 p-5"
                >
                    <h3 className="font-semibold text-white mb-5">Dépenses du Mois par Catégorie</h3>
                    <div className="space-y-3">
                        {Object.entries(depenses_par_categorie).length > 0 ? (
                            Object.entries(depenses_par_categorie).map(([cat, val]) => (
                                <div key={cat} className="flex items-center justify-between py-2  last:border-0">
                                    <span className="text-sm text-admin-text">{CATEGORY_LABELS[cat] ?? cat}</span>
                                    <span className="text-sm font-semibold text-status-red-text">{formatFCFA(val)}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-admin-muted text-sm text-center py-4">Aucune dépense ce mois</p>
                        )}
                        {Object.entries(depenses_par_categorie).length > 0 && (
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-sm font-bold text-admin-text">Total Dépenses</span>
                                <span className="text-sm font-bold text-status-red-text">{formatFCFA(totalDepensesCategorie)}</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Caisses */}
            <motion.div variants={fadeUp} initial="initial" animate="animate"
                className="bg-admin-card rounded-xl border border-white/5 overflow-hidden"
            >
                <div className="p-5  flex items-center justify-between">
                    <h3 className="font-semibold text-white">État des Caisses</h3>
                    <button onClick={() => setShowCaisse(true)}
                        className="flex items-center gap-2 text-xs font-semibold text-primary-container hover:text-white transition-colors"
                    ><Plus size={14} /> Ouvrir une caisse</button>
                </div>
                <div className="overflow-x-auto min-w-[600px] lg:min-w-0">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['Caisse', 'Agent', 'Ouverture', 'Fermeture', 'Solde départ', 'Solde fin', 'Écart', 'Statut', ''].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="">
                            {caisses.map((c) => (
                                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-admin-text">Caisse #{c.id}</td>
                                    <td className="px-4 py-3 text-admin-text">{c.user}</td>
                                    <td className="px-4 py-3 text-admin-muted text-xs">{c.opened_at}</td>
                                    <td className="px-4 py-3 text-admin-muted text-xs">{c.closed_at ?? '—'}</td>
                                    <td className="px-4 py-3 text-admin-text font-semibold">{formatFCFA(c.opening_balance)}</td>
                                    <td className="px-4 py-3 text-admin-text">{c.closing_balance != null ? formatFCFA(c.closing_balance) : '—'}</td>
                                    <td className={`px-4 py-3 font-bold ${c.difference != null && c.difference < 0 ? 'text-status-red-text' : c.difference != null && c.difference > 0 ? 'text-status-green-text' : 'text-admin-muted'}`}>
                                        {c.difference != null ? (c.difference === 0 ? 'Équilibré' : formatFCFA(c.difference)) : '—'}
                                    </td>
                                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                                    <td className="px-4 py-3">
                                        {c.status === 'open' && (
                                            <button onClick={() => { setCloseCaisseId(c.id); setShowCloture(true); }}
                                                className="text-xs text-status-yellow-text hover:text-white font-semibold transition-colors"
                                            >Fermer</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {caisses.length === 0 && (
                                <tr><td colSpan={9} className="text-center py-8 text-admin-muted text-sm">Aucune caisse enregistrée</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Dépenses récentes */}
            <motion.div variants={fadeUp} initial="initial" animate="animate"
                className="bg-admin-card rounded-xl border border-white/5 overflow-hidden"
            >
                <div className="p-5  flex items-center justify-between">
                    <h3 className="font-semibold text-white">Dépenses Récentes</h3>
                    <span className="text-xs text-admin-muted">{stats.depenses_en_attente} en attente de validation</span>
                </div>
                <div className="overflow-x-auto min-w-[600px] lg:min-w-0">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['Date', 'Catégorie', 'Description', 'Montant', 'Soumis par', 'Statut', ''].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="">
                            {depenses_recentes.map((d) => (
                                <tr key={d.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 text-admin-muted text-xs">{d.expense_date}</td>
                                    <td className="px-4 py-3 text-admin-text">{CATEGORY_LABELS[d.category] ?? d.category}</td>
                                    <td className="px-4 py-3 text-admin-text">{d.description}</td>
                                    <td className="px-4 py-3 text-status-red-text font-semibold">{formatFCFA(d.amount)}</td>
                                    <td className="px-4 py-3 text-admin-muted text-xs">{d.user}</td>
                                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                                    <td className="px-4 py-3">
                                        {d.status === 'pending' && (
                                            <div className="flex gap-1">
                                                <button onClick={() => validerDepense(d.id, 'approved')}
                                                    className="text-xs text-status-green-text hover:text-white font-semibold transition-colors"
                                                ><CheckCircle size={14} className="inline" /> Approuver</button>
                                                <button onClick={() => validerDepense(d.id, 'rejected')}
                                                    className="text-xs text-status-red-text hover:text-white font-semibold transition-colors ml-2"
                                                ><X size={14} className="inline" /> Rejeter</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {depenses_recentes.length === 0 && (
                                <tr><td colSpan={7} className="text-center py-8 text-admin-muted text-sm">Aucune dépense enregistrée</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Rapprochements bancaires */}
            <motion.div variants={fadeUp} initial="initial" animate="animate"
                className="bg-admin-card rounded-xl border border-white/5 overflow-hidden"
            >
                <div className="p-5  flex items-center justify-between">
                    <h3 className="font-semibold text-white">Rapprochements Bancaires</h3>
                    <button onClick={() => setShowRecon(true)}
                        className="flex items-center gap-2 text-xs font-semibold text-primary-container hover:text-white transition-colors"
                    ><Plus size={14} /> Nouveau rapprochement</button>
                </div>
                <div className="overflow-x-auto min-w-[600px] lg:min-w-0">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['Compte', 'Solde relevé', 'Solde système', 'Différence', 'Statut', 'Rapproché le'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="">
                            {reconciliations.map((r) => (
                                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-admin-text">{r.account_name}</div>
                                        <div className="text-xs text-admin-muted">{r.account_number}</div>
                                    </td>
                                    <td className="px-4 py-3 text-admin-text font-semibold">{formatFCFA(r.statement_balance)}</td>
                                    <td className="px-4 py-3 text-admin-text font-semibold">{formatFCFA(r.system_balance)}</td>
                                    <td className={`px-4 py-3 font-bold ${r.difference > 0 ? 'text-status-red-text' : r.difference < 0 ? 'text-status-green-text' : 'text-admin-muted'}`}>
                                        {r.difference === 0 ? '—' : formatFCFA(Math.abs(r.difference))}
                                    </td>
                                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                                    <td className="px-4 py-3 text-admin-muted text-xs">{r.reconciled_at ?? '—'}</td>
                                </tr>
                            ))}
                            {reconciliations.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-8 text-admin-muted text-sm">Aucun rapprochement effectué</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* ─── Modale Nouvelle Dépense ─────────────────────────────── */}
            {showDepense && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setShowDepense(false)}>
                    <div className="bg-admin-card rounded-xl border border-white/10 p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-white">Nouvelle Dépense</h3>
                            <button onClick={() => setShowDepense(false)} className="text-admin-muted hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={submitDepense} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-admin-muted block mb-1">Catégorie</label>
                                <select value={dep.data.category} onChange={e => dep.setData('category', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                >
                                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>
                                {dep.errors.category && <p className="text-status-red-text text-xs mt-1">{dep.errors.category}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-admin-muted block mb-1">Description</label>
                                <input type="text" value={dep.data.description} onChange={e => dep.setData('description', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                />
                                {dep.errors.description && <p className="text-status-red-text text-xs mt-1">{dep.errors.description}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-admin-muted block mb-1">Montant (FCFA)</label>
                                    <input type="number" min="0" value={dep.data.amount} onChange={e => dep.setData('amount', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                    />
                                    {dep.errors.amount && <p className="text-status-red-text text-xs mt-1">{dep.errors.amount}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-admin-muted block mb-1">Date</label>
                                    <input type="date" value={dep.data.expense_date} onChange={e => dep.setData('expense_date', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-admin-muted block mb-1">Notes (optionnel)</label>
                                <textarea value={dep.data.notes} onChange={e => dep.setData('notes', e.target.value)} rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowDepense(false)}
                                    className="px-4 py-2 text-sm text-admin-muted hover:text-white transition-colors"
                                >Annuler</button>
                                <button type="submit" disabled={dep.processing}
                                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                                >{dep.processing ? 'Enregistrement...' : 'Enregistrer'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Modale Ouverture Caisse ─────────────────────────────── */}
            {showCaisse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setShowCaisse(false)}>
                    <div className="bg-admin-card rounded-xl border border-white/10 p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-white">Ouverture de Caisse</h3>
                            <button onClick={() => setShowCaisse(false)} className="text-admin-muted hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={submitCaisse} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-admin-muted block mb-1">Solde d'ouverture (FCFA)</label>
                                <input type="number" min="0" value={caisse.data.opening_balance} onChange={e => caisse.setData('opening_balance', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                />
                                {caisse.errors.opening_balance && <p className="text-status-red-text text-xs mt-1">{caisse.errors.opening_balance}</p>}
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowCaisse(false)}
                                    className="px-4 py-2 text-sm text-admin-muted hover:text-white transition-colors"
                                >Annuler</button>
                                <button type="submit" disabled={caisse.processing}
                                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                                >{caisse.processing ? 'Ouverture...' : 'Ouvrir la caisse'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Modale Clôture Caisse ───────────────────────────────── */}
            {showCloture && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setShowCloture(false)}>
                    <div className="bg-admin-card rounded-xl border border-white/10 p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-white">Fermeture de Caisse</h3>
                            <button onClick={() => setShowCloture(false)} className="text-admin-muted hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={submitCloture} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-admin-muted block mb-1">Solde de clôture (FCFA)</label>
                                <input type="number" min="0" value={cloture.data.closing_balance} onChange={e => cloture.setData('closing_balance', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                />
                                {cloture.errors.closing_balance && <p className="text-status-red-text text-xs mt-1">{cloture.errors.closing_balance}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-admin-muted block mb-1">Notes (optionnel)</label>
                                <textarea value={cloture.data.notes} onChange={e => cloture.setData('notes', e.target.value)} rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowCloture(false)}
                                    className="px-4 py-2 text-sm text-admin-muted hover:text-white transition-colors"
                                >Annuler</button>
                                <button type="submit" disabled={cloture.processing}
                                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                                >{cloture.processing ? 'Fermeture...' : 'Fermer la caisse'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Modale Rapprochement Bancaire ────────────────────────── */}
            {showRecon && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setShowRecon(false)}>
                    <div className="bg-admin-card rounded-xl border border-white/10 p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-white">Nouveau Rapprochement Bancaire</h3>
                            <button onClick={() => setShowRecon(false)} className="text-admin-muted hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={submitRecon} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-admin-muted block mb-1">Nom du compte</label>
                                    <input type="text" value={recon.data.account_name} onChange={e => recon.setData('account_name', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-admin-muted block mb-1">N° de compte</label>
                                    <input type="text" value={recon.data.account_number} onChange={e => recon.setData('account_number', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-admin-muted block mb-1">Solde relevé bancaire</label>
                                    <input type="number" value={recon.data.statement_balance} onChange={e => recon.setData('statement_balance', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                    />
                                    {recon.errors.statement_balance && <p className="text-status-red-text text-xs mt-1">{recon.errors.statement_balance}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-admin-muted block mb-1">Solde système</label>
                                    <input type="number" value={recon.data.system_balance} onChange={e => recon.setData('system_balance', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                    />
                                    {recon.errors.system_balance && <p className="text-status-red-text text-xs mt-1">{recon.errors.system_balance}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-admin-muted block mb-1">Notes (optionnel)</label>
                                <textarea value={recon.data.notes} onChange={e => recon.setData('notes', e.target.value)} rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowRecon(false)}
                                    className="px-4 py-2 text-sm text-admin-muted hover:text-white transition-colors"
                                >Annuler</button>
                                <button type="submit" disabled={recon.processing}
                                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                                >{recon.processing ? 'Enregistrement...' : 'Enregistrer'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

Comptabilite.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Comptabilité" breadcrumbs={[{ label: 'Tableau de bord', href: route('admin.dashboard') }, { label: 'Comptabilité' }]}>
        {page}
    </BackOfficeLayout>
);
