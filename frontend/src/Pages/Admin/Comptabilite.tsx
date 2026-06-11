import { motion } from 'framer-motion';

import { useState } from 'react';
import {
    ArrowDownRight, ArrowUpRight, Banknote, CheckCircle, CreditCard, Download, Landmark,
    PiggyBank, Plus, X, Receipt, History,
} from 'lucide-react';
import StatusBadge from '@/Components/StatusBadge';
import { cn, formatFCFA } from '@/lib/utils';
import { useForm } from '@/hooks/useForm';
import { useApi } from '@/hooks/useApi';
import { storeDepense, ouvrirCaisse, fermerCaisse, validerDepense } from '@/api/admin';
import api from '@/api/client';
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

export default function Comptabilite({ stats = {} as any, recettes_par_service = {} as any, depenses_par_categorie = {} as any, depenses_recentes = [], caisses = [], reconciliations = [] }: Props) {
    const [showDepense, setShowDepense] = useState(false);
    const [showCaisse, setShowCaisse] = useState(false);
    const [showCloture, setShowCloture] = useState(false);
    const [showRecon, setShowRecon] = useState(false);
    const [closeCaisseId, setCloseCaisseId] = useState<number | null>(null);

    const dep = useForm({ category: 'carburant', description: '', amount: '', expense_date: new Date().toISOString().slice(0, 10), notes: '' });
    const caisse = useForm({ opening_balance: '' });
    const cloture = useForm({ closing_balance: '', notes: '' });
    const recon = useForm({ account_name: '', account_number: '', statement_balance: '', system_balance: '', notes: '' });

    const submitDepense = async (e: React.FormEvent) => {
        e.preventDefault();
        await storeDepense(dep.data as Record<string, unknown>);
        setShowDepense(false);
        dep.reset();
    };

    const submitCaisse = async (e: React.FormEvent) => {
        e.preventDefault();
        await ouvrirCaisse(caisse.data as Record<string, unknown>);
        setShowCaisse(false);
        caisse.reset();
    };

    const submitCloture = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!closeCaisseId) return;
        await fermerCaisse(closeCaisseId, cloture.data as Record<string, unknown>);
        setShowCloture(false);
        setCloseCaisseId(null);
        cloture.reset();
    };

    const submitRecon = async (e: React.FormEvent) => {
        e.preventDefault();
        await api.post('/admin/rapprochement', recon.data as Record<string, unknown>);
        setShowRecon(false);
        recon.reset();
    };

    const handleValiderDepense = async (id: number, status: string) => {
        await api.patch(`/admin/depenses/${id}/valider`, { status });
    };

    const totalDepensesCategorie = Object.values(depenses_par_categorie).reduce((s, v) => s + v, 0);
    const totalRecettesServices = Object.values(recettes_par_service).reduce((s, v) => s + v, 0);

    const safeStats: any = stats && typeof stats === 'object' ? stats : {};
    const recettesSource = safeStats.recettes_par_source && typeof safeStats.recettes_par_source === 'object' ? safeStats.recettes_par_source : {};
    const recettesJournalieres = safeStats.recettes_journalieres ?? 0;

    const KPIS = [
        { label: 'Recettes Journalières', val: recettesJournalieres, icon: ArrowUpRight, color: 'text-status-green-text', bg: 'bg-status-green-bg/30', border: 'border-status-green-ring' },
        { label: 'Dépenses Journalières', val: safeStats.depenses_journalieres ?? 0, icon: ArrowDownRight, color: 'text-status-red-text', bg: 'bg-red-900/30', border: 'border-status-red-ring' },
        { label: 'Bénéfice Net', val: safeStats.benefice_journalier ?? 0, icon: CreditCard, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30', border: 'border-status-blue-ring' },
        { label: 'Dépenses en attente', val: safeStats.depenses_en_attente ?? 0, icon: History, color: 'text-status-yellow-text', bg: 'bg-orange-900/30', border: 'border-status-yellow-ring' },
    ];

    return (
        <div className="w-full max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-dark">Comptabilité & Rapports</h1>
                    <p className="text-on-surface-variant text-sm mt-0.5">Rapport journalier — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => setShowDepense(true)}
                        className="flex items-center gap-2 border border-outline text-on-surface-variant hover:text-slate-dark hover:bg-gris-surface text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                    ><Receipt size={16} /> Nouvelle dépense</button>
                    <button onClick={() => setShowCaisse(true)}
                        className="flex items-center gap-2 border border-outline text-on-surface-variant hover:text-slate-dark hover:bg-gris-surface text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                    ><Banknote size={16} /> Ouvrir caisse</button>
                    <button onClick={() => setShowRecon(true)}
                        className="flex items-center gap-2 border border-outline text-on-surface-variant hover:text-slate-dark hover:bg-gris-surface text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                    ><Landmark size={16} /> Rapprochement</button>
                    <button onClick={() => window.location.href = '/admin/rapports'}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                    ><Download size={16} /> Rapports</button>
                </div>
            </div>

            {/* KPIs */}
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger} initial="initial" animate="animate">
                {KPIS.map((k) => {
                    const Icon = k.icon;
                    return (
                        <motion.div key={k.label} variants={fadeUp}
                            className={`bg-white rounded-xl border border-outline shadow-sm border-l-4 ${k.border} p-5 flex items-center gap-3`}
                        >
                            <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center shrink-0`}>
                                <Icon size={18} className={k.color} />
                            </div>
                            <div>
                                <p className={`text-xl font-bold ${k.color}`}>
                                    {typeof k.val === 'number' ? formatFCFA(k.val) : k.val}
                                </p>
                                <p className="text-xs text-on-surface-variant">{k.label}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Recettes par source */}
                <motion.div variants={fadeUp} initial="initial" animate="animate"
                    className="bg-white rounded-xl border border-outline shadow-sm p-5"
                >
                    <h3 className="font-semibold text-slate-dark mb-5">Recettes du Jour par Source</h3>
                    <div className="space-y-4">
                        {[
                            { src: 'Guichet', val: recettesSource.guichet ?? 0, pct: recettesJournalieres > 0 ? Math.round((recettesSource.guichet ?? 0) / recettesJournalieres * 100) : 0 },
                            { src: 'Orange Money', val: recettesSource.orange_money ?? 0, pct: recettesJournalieres > 0 ? Math.round((recettesSource.orange_money ?? 0) / recettesJournalieres * 100) : 0 },
                            { src: 'Services', val: totalRecettesServices, pct: recettesJournalieres > 0 ? Math.round(totalRecettesServices / (recettesJournalieres + totalRecettesServices) * 100) : 0 },
                        ].filter(s => s.val > 0).map((s) => (
                            <div key={s.src}>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="text-slate-dark">{s.src}</span>
                                    <span className="text-on-surface-variant">{formatFCFA(s.val)}</span>
                                </div>
                                <div className="h-2 bg-gris-surface rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-primary/10 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${s.pct}%` }}
                                        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                                    />
                                </div>
                            </div>
                        ))}
                        {stats.recettes_journalieres === 0 && totalRecettesServices === 0 && (
                            <p className="text-on-surface-variant text-sm text-center py-4">Aucune recette aujourd'hui</p>
                        )}
                    </div>
                </motion.div>

                {/* Dépenses par catégorie */}
                <motion.div variants={fadeUp} initial="initial" animate="animate"
                    className="bg-white rounded-xl border border-outline shadow-sm p-5"
                >
                    <h3 className="font-semibold text-slate-dark mb-5">Dépenses du Mois par Catégorie</h3>
                    <div className="space-y-3">
                        {Object.entries(depenses_par_categorie).length > 0 ? (
                            Object.entries(depenses_par_categorie).map(([cat, val]) => (
                                <div key={cat} className="flex items-center justify-between py-2  last:border-0">
                                    <span className="text-sm text-slate-dark">{CATEGORY_LABELS[cat] ?? cat}</span>
                                    <span className="text-sm font-semibold text-status-red-text">{formatFCFA(val)}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-on-surface-variant text-sm text-center py-4">Aucune dépense ce mois</p>
                        )}
                        {Object.entries(depenses_par_categorie).length > 0 && (
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-sm font-bold text-slate-dark">Total Dépenses</span>
                                <span className="text-sm font-bold text-status-red-text">{formatFCFA(totalDepensesCategorie)}</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Caisses */}
            <motion.div variants={fadeUp} initial="initial" animate="animate"
                className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden"
            >
                <div className="p-5  flex items-center justify-between">
                    <h3 className="font-semibold text-slate-dark">État des Caisses</h3>
                    <button onClick={() => setShowCaisse(true)}
                        className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-slate-dark transition-colors"
                    ><Plus size={14} /> Ouvrir une caisse</button>
                </div>
                <div className="overflow-x-auto min-w-[600px] lg:min-w-0">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                            <tr>
                                {['Caisse', 'Agent', 'Ouverture', 'Fermeture', 'Solde départ', 'Solde fin', 'Écart', 'Statut', ''].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="">
                            {caisses.map((c) => (
                                <tr key={c.id} className="hover:bg-gris-surface transition-colors">
                                    <td className="px-4 py-3 font-semibold text-slate-dark">Caisse #{c.id}</td>
                                    <td className="px-4 py-3 text-slate-dark">{c.user}</td>
                                    <td className="px-4 py-3 text-on-surface-variant text-xs">{c.opened_at}</td>
                                    <td className="px-4 py-3 text-on-surface-variant text-xs">{c.closed_at ?? '—'}</td>
                                    <td className="px-4 py-3 text-slate-dark font-semibold">{formatFCFA(c.opening_balance)}</td>
                                    <td className="px-4 py-3 text-slate-dark">{c.closing_balance != null ? formatFCFA(c.closing_balance) : '—'}</td>
                                    <td className={`px-4 py-3 font-bold ${c.difference != null && c.difference < 0 ? 'text-status-red-text' : c.difference != null && c.difference > 0 ? 'text-status-green-text' : 'text-on-surface-variant'}`}>
                                        {c.difference != null ? (c.difference === 0 ? 'Équilibré' : formatFCFA(c.difference)) : '—'}
                                    </td>
                                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                                    <td className="px-4 py-3">
                                        {c.status === 'open' && (
                                            <button onClick={() => { setCloseCaisseId(c.id); setShowCloture(true); }}
                                                className="text-xs text-status-yellow-text hover:text-slate-dark font-semibold transition-colors"
                                            >Fermer</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {caisses.length === 0 && (
                                <tr><td colSpan={9} className="text-center py-8 text-on-surface-variant text-sm">Aucune caisse enregistrée</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Dépenses récentes */}
            <motion.div variants={fadeUp} initial="initial" animate="animate"
                className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden"
            >
                <div className="p-5  flex items-center justify-between">
                    <h3 className="font-semibold text-slate-dark">Dépenses Récentes</h3>
                    <span className="text-xs text-on-surface-variant">{stats.depenses_en_attente} en attente de validation</span>
                </div>
                <div className="overflow-x-auto min-w-[600px] lg:min-w-0">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                            <tr>
                                {['Date', 'Catégorie', 'Description', 'Montant', 'Soumis par', 'Statut', ''].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="">
                            {depenses_recentes.map((d) => (
                                <tr key={d.id} className="hover:bg-gris-surface transition-colors">
                                    <td className="px-4 py-3 text-on-surface-variant text-xs">{d.expense_date}</td>
                                    <td className="px-4 py-3 text-slate-dark">{CATEGORY_LABELS[d.category] ?? d.category}</td>
                                    <td className="px-4 py-3 text-slate-dark">{d.description}</td>
                                    <td className="px-4 py-3 text-status-red-text font-semibold">{formatFCFA(d.amount)}</td>
                                    <td className="px-4 py-3 text-on-surface-variant text-xs">{d.user}</td>
                                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                                    <td className="px-4 py-3">
                                        {d.status === 'pending' && (
                                            <div className="flex gap-1">
                                                <button onClick={() => handleValiderDepense(d.id, 'approved')}
                                                    className="text-xs text-status-green-text hover:text-slate-dark font-semibold transition-colors"
                                                ><CheckCircle size={14} className="inline" /> Approuver</button>
                                                <button onClick={() => handleValiderDepense(d.id, 'rejected')}
                                                    className="text-xs text-status-red-text hover:text-slate-dark font-semibold transition-colors ml-2"
                                                ><X size={14} className="inline" /> Rejeter</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {depenses_recentes.length === 0 && (
                                <tr><td colSpan={7} className="text-center py-8 text-on-surface-variant text-sm">Aucune dépense enregistrée</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Rapprochements bancaires */}
            <motion.div variants={fadeUp} initial="initial" animate="animate"
                className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden"
            >
                <div className="p-5  flex items-center justify-between">
                    <h3 className="font-semibold text-slate-dark">Rapprochements Bancaires</h3>
                    <button onClick={() => setShowRecon(true)}
                        className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-slate-dark transition-colors"
                    ><Plus size={14} /> Nouveau rapprochement</button>
                </div>
                <div className="overflow-x-auto min-w-[600px] lg:min-w-0">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                            <tr>
                                {['Compte', 'Solde relevé', 'Solde système', 'Différence', 'Statut', 'Rapproché le'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="">
                            {reconciliations.map((r) => (
                                <tr key={r.id} className="hover:bg-gris-surface transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-dark">{r.account_name}</div>
                                        <div className="text-xs text-on-surface-variant">{r.account_number}</div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-dark font-semibold">{formatFCFA(r.statement_balance)}</td>
                                    <td className="px-4 py-3 text-slate-dark font-semibold">{formatFCFA(r.system_balance)}</td>
                                    <td className={`px-4 py-3 font-bold ${r.difference > 0 ? 'text-status-red-text' : r.difference < 0 ? 'text-status-green-text' : 'text-on-surface-variant'}`}>
                                        {r.difference === 0 ? '—' : formatFCFA(Math.abs(r.difference))}
                                    </td>
                                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                                    <td className="px-4 py-3 text-on-surface-variant text-xs">{r.reconciled_at ?? '—'}</td>
                                </tr>
                            ))}
                            {reconciliations.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-8 text-on-surface-variant text-sm">Aucun rapprochement effectué</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* ─── Modale Nouvelle Dépense ─────────────────────────────── */}
            {showDepense && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setShowDepense(false)}>
                    <div className="bg-white rounded-xl border border-outline shadow-sm p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-slate-dark">Nouvelle Dépense</h3>
                            <button onClick={() => setShowDepense(false)} className="text-on-surface-variant hover:text-slate-dark"><X size={20} /></button>
                        </div>
                        <form onSubmit={submitDepense} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-on-surface-variant block mb-1">Catégorie</label>
                                <select value={dep.data.category} onChange={e => dep.setData('category', e.target.value)}
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark"
                                >
                                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>
                                {dep.errors.category && <p className="text-status-red-text text-xs mt-1">{dep.errors.category}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-on-surface-variant block mb-1">Description</label>
                                <input type="text" value={dep.data.description} onChange={e => dep.setData('description', e.target.value)}
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark"
                                />
                                {dep.errors.description && <p className="text-status-red-text text-xs mt-1">{dep.errors.description}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-on-surface-variant block mb-1">Montant (FCFA)</label>
                                    <input type="number" min="0" value={dep.data.amount} onChange={e => dep.setData('amount', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark"
                                    />
                                    {dep.errors.amount && <p className="text-status-red-text text-xs mt-1">{dep.errors.amount}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-on-surface-variant block mb-1">Date</label>
                                    <input type="date" value={dep.data.expense_date} onChange={e => dep.setData('expense_date', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-on-surface-variant block mb-1">Notes (optionnel)</label>
                                <textarea value={dep.data.notes} onChange={e => dep.setData('notes', e.target.value)} rows={2}
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowDepense(false)}
                                    className="px-4 py-2 text-sm text-on-surface-variant hover:text-slate-dark transition-colors"
                                >Annuler</button>
                                <button type="submit" disabled={dep.processing}
                                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                                >{dep.processing ? 'Enregistrement...' : 'Enregistrer'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Modale Ouverture Caisse ─────────────────────────────── */}
            {showCaisse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setShowCaisse(false)}>
                    <div className="bg-white rounded-xl border border-outline shadow-sm p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-slate-dark">Ouverture de Caisse</h3>
                            <button onClick={() => setShowCaisse(false)} className="text-on-surface-variant hover:text-slate-dark"><X size={20} /></button>
                        </div>
                        <form onSubmit={submitCaisse} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-on-surface-variant block mb-1">Solde d'ouverture (FCFA)</label>
                                <input type="number" min="0" value={caisse.data.opening_balance} onChange={e => caisse.setData('opening_balance', e.target.value)}
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark"
                                />
                                {caisse.errors.opening_balance && <p className="text-status-red-text text-xs mt-1">{caisse.errors.opening_balance}</p>}
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowCaisse(false)}
                                    className="px-4 py-2 text-sm text-on-surface-variant hover:text-slate-dark transition-colors"
                                >Annuler</button>
                                <button type="submit" disabled={caisse.processing}
                                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                                >{caisse.processing ? 'Ouverture...' : 'Ouvrir la caisse'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Modale Clôture Caisse ───────────────────────────────── */}
            {showCloture && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setShowCloture(false)}>
                    <div className="bg-white rounded-xl border border-outline shadow-sm p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-slate-dark">Fermeture de Caisse</h3>
                            <button onClick={() => setShowCloture(false)} className="text-on-surface-variant hover:text-slate-dark"><X size={20} /></button>
                        </div>
                        <form onSubmit={submitCloture} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-on-surface-variant block mb-1">Solde de clôture (FCFA)</label>
                                <input type="number" min="0" value={cloture.data.closing_balance} onChange={e => cloture.setData('closing_balance', e.target.value)}
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark"
                                />
                                {cloture.errors.closing_balance && <p className="text-status-red-text text-xs mt-1">{cloture.errors.closing_balance}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-on-surface-variant block mb-1">Notes (optionnel)</label>
                                <textarea value={cloture.data.notes} onChange={e => cloture.setData('notes', e.target.value)} rows={2}
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowCloture(false)}
                                    className="px-4 py-2 text-sm text-on-surface-variant hover:text-slate-dark transition-colors"
                                >Annuler</button>
                                <button type="submit" disabled={cloture.processing}
                                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                                >{cloture.processing ? 'Fermeture...' : 'Fermer la caisse'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Modale Rapprochement Bancaire ────────────────────────── */}
            {showRecon && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setShowRecon(false)}>
                    <div className="bg-white rounded-xl border border-outline shadow-sm p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-slate-dark">Nouveau Rapprochement Bancaire</h3>
                            <button onClick={() => setShowRecon(false)} className="text-on-surface-variant hover:text-slate-dark"><X size={20} /></button>
                        </div>
                        <form onSubmit={submitRecon} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-on-surface-variant block mb-1">Nom du compte</label>
                                    <input type="text" value={recon.data.account_name} onChange={e => recon.setData('account_name', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-on-surface-variant block mb-1">N° de compte</label>
                                    <input type="text" value={recon.data.account_number} onChange={e => recon.setData('account_number', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-on-surface-variant block mb-1">Solde relevé bancaire</label>
                                    <input type="number" value={recon.data.statement_balance} onChange={e => recon.setData('statement_balance', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark"
                                    />
                                    {recon.errors.statement_balance && <p className="text-status-red-text text-xs mt-1">{recon.errors.statement_balance}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-on-surface-variant block mb-1">Solde système</label>
                                    <input type="number" value={recon.data.system_balance} onChange={e => recon.setData('system_balance', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark"
                                    />
                                    {recon.errors.system_balance && <p className="text-status-red-text text-xs mt-1">{recon.errors.system_balance}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-on-surface-variant block mb-1">Notes (optionnel)</label>
                                <textarea value={recon.data.notes} onChange={e => recon.setData('notes', e.target.value)} rows={2}
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-sm text-slate-dark"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowRecon(false)}
                                    className="px-4 py-2 text-sm text-on-surface-variant hover:text-slate-dark transition-colors"
                                >Annuler</button>
                                <button type="submit" disabled={recon.processing}
                                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                                >{recon.processing ? 'Enregistrement...' : 'Enregistrer'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
