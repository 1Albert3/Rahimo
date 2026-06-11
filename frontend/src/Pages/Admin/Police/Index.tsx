import { useState } from 'react';

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Eye, EyeOff, Search, Shield, UserCheck, UserX } from 'lucide-react';
import { removeFromWatchlist, verifyPassenger } from '@/api/admin';
import { useApi } from '@/hooks/useApi';

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp  = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function PoliceIndex() {
    const { data, loading, refetch } = useApi<{ stats: any; recentChecks: any[]; watchlist: any[]; departs: any[] }>('/admin/police');

    const stats = data?.stats ?? {};
    const recentChecks = data?.recentChecks ?? [];
    const watchlist = data?.watchlist ?? [];
    const departs = data?.departs ?? [];
    const [verifyName, setVerifyName] = useState('');
    const [verifyPhone, setVerifyPhone] = useState('');
    const [verifyResult, setVerifyResult] = useState<any>(null);
    const [verifying, setVerifying] = useState(false);

    const doVerify = async () => {
        if (!verifyName.trim()) return;
        setVerifying(true);
        try {
            const res = await verifyPassenger({ full_name: verifyName, phone: verifyPhone || null });
            setVerifyResult(res);
        } catch {}
        setVerifying(false);
    };

    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-dark">Interface Police & Sécurité</h1>
                <p className="text-on-surface-variant text-sm mt-0.5">Vérification silencieuse des passagers & listes de surveillance</p>
            </div>

            <motion.div className="grid grid-cols-4 gap-4" variants={stagger} initial="initial" animate="animate">
                {[
                    { label: 'Surveillance Active', val: stats?.watchlist_active ?? 0, icon: Eye, color: 'text-status-red-text', bg: 'bg-status-red-bg/30' },
                    { label: 'Vérifications Aujourd\'hui', val: stats?.checks_today ?? 0, icon: Search, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
                    { label: 'Correspondances', val: stats?.matches_found ?? 0, icon: UserX, color: 'text-status-yellow-text', bg: 'bg-status-yellow-bg/30' },
                    { label: 'Alertes Ouvertes', val: stats?.alertes_ouvertes ?? 0, icon: AlertTriangle, color: 'text-status-red-text', bg: 'bg-status-red-bg/30' },
                ].map(s => (
                    <motion.div key={s.label} variants={fadeUp} className="bg-white rounded-xl border border-outline p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon size={18} className={s.color} /></div>
                        <div>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-xs text-on-surface-variant">{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vérification silencieuse */}
                <div className="bg-white rounded-xl border border-outline p-5">
                    <h2 className="text-sm font-semibold text-slate-dark mb-4 flex items-center gap-2"><EyeOff size={14} className="text-on-surface-variant" /> Vérification Silencieuse</h2>
                    <div className="space-y-3">
                        <input type="text" value={verifyName} onChange={e => setVerifyName(e.target.value)}
                            placeholder="Nom complet du passager"
                            className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm" />
                        <input type="text" value={verifyPhone} onChange={e => setVerifyPhone(e.target.value)}
                            placeholder="Téléphone (optionnel)"
                            className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm" />
                        <button onClick={doVerify} disabled={verifying}
                            className="btn-primary w-full py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                        ><Search size={14} className="inline" /> {verifying ? 'Vérification...' : 'Vérifier silencieusement'}</button>
                    </div>
                    {verifyResult && (
                        <div className={`mt-4 p-3 rounded-xl ${verifyResult.match ? 'bg-status-red-bg/30 border border-status-red-border' : 'bg-status-green-bg/30 border border-status-green-border'}`}>
                            <div className="flex items-center gap-2">
                                {verifyResult.match ? <UserX size={16} className="text-status-red-text" /> : <UserCheck size={16} className="text-status-green-text" />}
                                <span className={`font-bold text-sm ${verifyResult.match ? 'text-status-red-text' : 'text-status-green-text'}`}>
                                    {verifyResult.match ? 'ATTENTION - Correspondance trouvée!' : 'Aucune correspondance'}
                                </span>
                            </div>
                            {verifyResult.details && (
                                <p className="text-xs text-on-surface-variant mt-2">{verifyResult.details.reason}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Vérifications récentes */}
                <div className="bg-white rounded-xl border border-outline p-5">
                    <h2 className="text-sm font-semibold text-slate-dark mb-4 flex items-center gap-2"><Shield size={14} className="text-on-surface-variant" /> Dernières Vérifications</h2>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {recentChecks.map(c => (
                            <div key={c.id} className="flex items-center justify-between text-sm py-1.5 border-b border-outline last:border-0">
                                <div className="flex items-center gap-2">
                                    {c.status === 'confirmed_match' ? <UserX size={12} className="text-status-red-text" /> :
                                     c.status === 'possible_match' ? <AlertTriangle size={12} className="text-status-yellow-text" /> :
                                     <CheckCircle size={12} className="text-status-green-text" />}
                                    <span className="text-slate-dark">{c.name}</span>
                                    <span className="text-on-surface-variant text-xs">{c.phone}</span>
                                </div>
                                <span className="text-on-surface-variant text-xs font-mono">{c.created_at}</span>
                            </div>
                        ))}
                        {recentChecks.length === 0 && <p className="text-on-surface-variant text-sm">Aucune vérification.</p>}
                    </div>
                </div>

                {/* Départs du jour */}
                <div className="bg-white rounded-xl border border-outline p-5">
                    <h2 className="text-sm font-semibold text-slate-dark mb-4">Départs à Venir</h2>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {departs.map(d => (
                            <div key={d.id} className="flex items-center justify-between text-sm py-1.5 border-b border-outline last:border-0">
                                <div>
                                    <p className="text-slate-dark">{d.route}</p>
                                    <p className="text-on-surface-variant text-xs">{d.date} {d.heure} — {d.vehicle}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-on-surface-variant text-xs">{d.driver}</p>
                                    <p className="text-status-blue-text text-xs font-bold">{d.passengers} pax</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Liste surveillance */}
                <div className="bg-white rounded-xl border border-outline p-5">
                    <h2 className="text-sm font-semibold text-slate-dark mb-4 flex items-center gap-2"><Eye size={14} className="text-on-surface-variant" /> Liste de Surveillance</h2>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {watchlist.map(w => (
                            <div key={w.id} className="flex items-center justify-between text-sm py-1.5 border-b border-outline last:border-0">
                                <div>
                                    <p className="text-slate-dark font-semibold">{w.full_name}</p>
                                    <p className="text-on-surface-variant text-xs">{w.phone ?? w.id_card_number ?? '—'}</p>
                                    <p className="text-status-red-text text-xs">{w.reason}</p>
                                </div>
                                <button onClick={() => removeFromWatchlist(w.id).then(() => refetch())}
                                    className="text-on-surface-variant hover:text-status-green-text text-xs"
                                ><CheckCircle size={12} /></button>
                            </div>
                        ))}
                        {watchlist.length === 0 && <p className="text-on-surface-variant text-sm">Liste vide.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
