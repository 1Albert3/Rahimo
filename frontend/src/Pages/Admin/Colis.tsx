import { motion } from 'framer-motion';
import { Loader2, Package, Search } from 'lucide-react';
import { useState } from 'react';
import StatusBadge from '@/Components/StatusBadge';
import { formatFCFA } from '@/lib/utils';
import type { ColisItem } from '@/types';
import { useApi } from '@/hooks/useApi';
import api from '@/api/client';

const VILLES = ['Ouagadougou','Bobo-Dioulasso','Koudougou','Banfora','Ouahigouya','Dori','Fada N\'Gourma'];
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function AdminColis() {
    const { data, loading, refetch } = useApi<{ colis: ColisItem[] }>('/admin/colis');
    const colisList = data?.colis ?? [];

    const [form, setForm] = useState({
        expediteur_name: '', expediteur_phone: '',
        destinataire_name: '', destinataire_phone: '',
        departure_city: 'Ouagadougou', arrival_city: 'Bobo-Dioulasso',
        weight: '', description: '', type: 'colis', price: 0,
    });
    const [processing, setProcessing] = useState(false);
    const [search, setSearch] = useState('');

    const tarif = form.weight ? Math.max(1000, parseFloat(form.weight) * 800) : 0;

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await api.post('/admin/colis', { ...form, price: tarif });
            setForm({ expediteur_name: '', expediteur_phone: '', destinataire_name: '', destinataire_phone: '', departure_city: 'Ouagadougou', arrival_city: 'Bobo-Dioulasso', weight: '', description: '', type: 'colis', price: 0 });
            refetch();
        } catch { }
        setProcessing(false);
    };

    const filtered = colisList.filter(c =>
        !search || c.tracking_number.includes(search.toUpperCase()) || c.expediteur_name.toLowerCase().includes(search.toLowerCase()) || c.destinataire_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-dark">Gestion des Colis</h1>
                <p className="text-on-surface-variant text-sm mt-0.5">Enregistrement et suivi des expéditions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <form onSubmit={submit} className="lg:col-span-5 bg-white rounded-xl border border-outline shadow-sm p-6 space-y-5">
                    <h2 className="font-semibold text-slate-dark flex items-center gap-2 pb-4"><Package size={16} className="text-primary" /> Nouveau Colis</h2>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-3">Expéditeur</p>
                        <div className="grid grid-cols-2 gap-3">
                            {([['expediteur_name', 'Nom', 'Traoré Amadou'], ['expediteur_phone', 'Téléphone', '+226 70 00 00 00']] as const).map(([key, label, ph]) => (
                                <div key={key} className="space-y-1">
                                    <label className="text-xs text-on-surface-variant">{label}</label>
                                    <input type="text" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph}
                                        className="w-full px-3 py-2.5 bg-white border border-outline rounded-xl text-sm text-slate-dark focus:border-primary outline-none" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-3">Destinataire</p>
                        <div className="grid grid-cols-2 gap-3">
                            {([['destinataire_name', 'Nom', 'Sawadogo Fatou'], ['destinataire_phone', 'Téléphone', '+226 76 00 00 00']] as const).map(([key, label, ph]) => (
                                <div key={key} className="space-y-1">
                                    <label className="text-xs text-on-surface-variant">{label}</label>
                                    <input type="text" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph}
                                        className="w-full px-3 py-2.5 bg-white border border-outline rounded-xl text-sm text-slate-dark focus:border-primary outline-none" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-3">Trajet & Colis</p>
                        <div className="grid grid-cols-2 gap-3">
                            {([['departure_city', 'Départ'], ['arrival_city', 'Arrivée']] as const).map(([key, label]) => (
                                <div key={key} className="space-y-1">
                                    <label className="text-xs text-on-surface-variant">{label}</label>
                                    <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                        className="w-full px-3 py-2.5 bg-white border border-outline rounded-xl text-sm text-slate-dark focus:border-primary outline-none">
                                        {VILLES.map(v => <option key={v}>{v}</option>)}
                                    </select>
                                </div>
                            ))}
                            <div className="space-y-1">
                                <label className="text-xs text-on-surface-variant">Poids (kg)</label>
                                <input type="number" step="0.1" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="2.5"
                                    className="w-full px-3 py-2.5 bg-white border border-outline rounded-xl text-sm text-slate-dark focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-on-surface-variant">Tarif estimé</label>
                                <div className="px-3 py-2.5 bg-white border border-outline rounded-xl text-sm font-bold text-primary">{tarif > 0 ? formatFCFA(tarif) : '—'}</div>
                            </div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <label className="text-xs text-on-surface-variant">Description</label>
                            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Vêtements, documents, etc." rows={2}
                                className="w-full px-3 py-2.5 bg-white border border-outline rounded-xl text-sm text-slate-dark focus:border-primary outline-none resize-none" />
                        </div>
                    </div>
                    <button type="submit" disabled={processing}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-colors disabled:opacity-70">
                        {processing ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
                        Enregistrer le Colis
                    </button>
                </form>

                <div className="lg:col-span-7 bg-white rounded-xl border border-outline shadow-sm overflow-hidden">
                    <div className="p-5 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-dark text-sm">Colis Récents {loading && <Loader2 size={14} className="inline animate-spin ml-2" />}</h3>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                            <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
                                className="pl-8 pr-3 py-1.5 bg-white border border-outline rounded-xl text-xs text-slate-dark focus:border-primary outline-none w-48" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[500px]">
                            <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                                <tr>{['Code','Expéditeur → Destinataire','Trajet','Poids','Statut','Prix'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}</tr>
                            </thead>
                            <motion.tbody variants={stagger} initial="initial" animate="animate">
                                {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant text-xs">Aucun colis enregistré</td></tr>}
                                {filtered.map(c => {
                                    const s = c.status;
                                    const borderCls = s === 'arrive' || s === 'livre' ? 'border-l-status-green-ring' : s === 'en_transit' || s === 'en_attente' ? 'border-l-status-yellow-ring' : s === 'annule' ? 'border-l-status-red-ring' : 'border-l-outline';
                                    return (
                                        <motion.tr key={c.id} variants={fadeUp} className={`hover:bg-gris-surface transition-colors border-l-4 ${borderCls}`}>
                                            <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{c.tracking_number}</td>
                                            <td className="px-4 py-3"><p className="text-slate-dark text-xs font-medium">{c.expediteur_name}</p><p className="text-on-surface-variant text-xs">→ {c.destinataire_name}</p></td>
                                            <td className="px-4 py-3 text-xs text-on-surface-variant">{c.departure_city} → {c.arrival_city}</td>
                                            <td className="px-4 py-3 text-xs text-on-surface-variant">{c.weight ? `${c.weight} kg` : '—'}</td>
                                            <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                                            <td className="px-4 py-3 text-xs font-semibold text-slate-dark">{formatFCFA(c.price)}</td>
                                        </motion.tr>
                                    );
                                })}
                            </motion.tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
