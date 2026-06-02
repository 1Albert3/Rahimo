import { useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Loader2, Package, Search } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import StatusBadge from '@/Components/StatusBadge';
import { formatFCFA } from '@/lib/utils';
import type { Colis, PageProps } from '@/types';

interface Props extends PageProps { colis_list: Colis[]; }

const VILLES = ['Ouagadougou','Bobo-Dioulasso','Koudougou','Banfora','Ouahigouya','Dori','Fada N\'Gourma'];

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function AdminColis({ colis_list }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        expediteur_name: '', expediteur_phone: '',
        destinataire_name: '', destinataire_phone: '',
        departure_city: 'Ouagadougou', arrival_city: 'Bobo-Dioulasso',
        weight: '', description: '', type: 'colis', price: 0,
    });

    const TARIF = data.weight ? Math.max(1000, parseFloat(data.weight) * 800) : 0;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('price', TARIF);
        post(route('admin.colis.store'), {
            onSuccess: () => reset(),
            preserveScroll: true,
        });
    };

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-dark">Gestion des Colis</h1>
                <p className="text-on-surface-variant text-sm mt-0.5">Enregistrement et suivi des expéditions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <form onSubmit={submit} className="lg:col-span-5 bg-white rounded-xl border border-outline shadow-sm p-6 space-y-5">
                    <h2 className="font-semibold text-slate-dark flex items-center gap-2 pb-4 ">
                        <Package size={16} className="text-primary" /> Nouveau Colis
                    </h2>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-3">Expéditeur</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[{ key: 'expediteur_name' as const, label: 'Nom', ph: 'Traoré Amadou' }, { key: 'expediteur_phone' as const, label: 'Téléphone', ph: '+226 70 00 00 00' }].map(({ key, label, ph }) => (
                                <div key={key} className="space-y-1">
                                    <label className="text-xs text-on-surface-variant">{label}</label>
                                    <input type="text" value={data[key]} onChange={(e) => setData(key, e.target.value)} placeholder={ph}
                                        className="w-full px-3 py-2.5 bg-white border border-outline rounded-xl text-sm text-slate-dark placeholder-on-surface-variant focus:border-primary outline-none transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-3">Destinataire</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[{ key: 'destinataire_name' as const, label: 'Nom', ph: 'Sawadogo Fatou' }, { key: 'destinataire_phone' as const, label: 'Téléphone', ph: '+226 76 00 00 00' }].map(({ key, label, ph }) => (
                                <div key={key} className="space-y-1">
                                    <label className="text-xs text-on-surface-variant">{label}</label>
                                    <input type="text" value={data[key]} onChange={(e) => setData(key, e.target.value)} placeholder={ph}
                                        className="w-full px-3 py-2.5 bg-white border border-outline rounded-xl text-sm text-slate-dark placeholder-on-surface-variant focus:border-primary outline-none transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-3">Trajet & Colis</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[{ key: 'departure_city' as const, label: 'Départ' }, { key: 'arrival_city' as const, label: 'Arrivée' }].map(({ key, label }) => (
                                <div key={key} className="space-y-1">
                                    <label className="text-xs text-on-surface-variant">{label}</label>
                                    <select value={data[key]} onChange={(e) => setData(key, e.target.value)}
                                        className="w-full px-3 py-2.5 bg-white border border-outline rounded-xl text-sm text-slate-dark focus:border-primary outline-none">
                                        {VILLES.map((v) => <option key={v}>{v}</option>)}
                                    </select>
                                </div>
                            ))}
                            <div className="space-y-1">
                                <label className="text-xs text-on-surface-variant">Poids (kg)</label>
                                <input type="number" step="0.1" value={data.weight} onChange={(e) => setData('weight', e.target.value)} placeholder="2.5"
                                    className="w-full px-3 py-2.5 bg-white border border-outline rounded-xl text-sm text-slate-dark placeholder-on-surface-variant focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-on-surface-variant">Tarif estimé</label>
                                <div className="px-3 py-2.5 bg-white border border-outline rounded-xl text-sm font-bold text-primary">
                                    {TARIF > 0 ? formatFCFA(TARIF) : '—'}
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <label className="text-xs text-on-surface-variant">Description</label>
                            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)}
                                placeholder="Vêtements, documents, etc." rows={2}
                                className="w-full px-3 py-2.5 bg-white border border-outline rounded-xl text-sm text-slate-dark placeholder-on-surface-variant focus:border-primary outline-none resize-none" />
                        </div>
                    </div>

                    <button type="submit" disabled={processing}
                        className="w-full flex items-center justify-center gap-2 bg-primary/10 text-white font-semibold py-3 rounded-xl hover:bg-primary transition-colors disabled:opacity-70"
                    >
                        {processing ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
                        Enregistrer le Colis
                    </button>
                </form>

                <div className="lg:col-span-7 bg-white rounded-xl border border-outline shadow-sm overflow-hidden">
                    <div className="p-5  flex items-center justify-between">
                        <h3 className="font-semibold text-slate-dark text-sm">Colis Récents</h3>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                            <input type="text" placeholder="Rechercher..."
                                className="pl-8 pr-3 py-1.5 bg-white border border-outline rounded-xl text-xs text-slate-dark placeholder-on-surface-variant focus:border-primary outline-none w-48" />
                        </div>
                    </div>
                    <div className="overflow-x-auto min-w-[600px] lg:min-w-0">
                        <table className="w-full text-sm min-w-[500px]">
                            <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                                <tr>
                                    {['Code', 'Expéditeur → Destinataire', 'Trajet', 'Poids', 'Statut', 'Prix'].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <motion.tbody className="" variants={stagger} initial="initial" animate="animate">
                                {colis_list.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant text-xs">Aucun colis enregistré</td>
                                    </tr>
                                )}
                                {colis_list.map((c) => {
                                    const s = c.status;
                                    const isGreen = s === 'arrive' || s === 'livre' || s === 'confirme';
                                    const isYellow = s === 'en_transit' || s === 'pending' || s === 'en_attente';
                                    const borderCls = isGreen ? 'border-l-status-green-ring' : isYellow ? 'border-l-status-yellow-ring' : s === 'annule' || s === 'cancelled' ? 'border-l-status-red-ring' : 'border-l-outline';
                                    return (
                                    <motion.tr key={c.id} variants={fadeUp}
                                        className={`hover:bg-gris-surface transition-colors border-l-4 ${borderCls}`}
                                    >
                                        <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{c.tracking_number}</td>
                                        <td className="px-4 py-3">
                                            <p className="text-slate-dark text-xs font-medium">{c.expediteur_name}</p>
                                            <p className="text-on-surface-variant text-xs">→ {c.destinataire_name}</p>
                                        </td>
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

AdminColis.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Colis" breadcrumbs={[{ label: 'Tableau de bord', href: route('admin.dashboard') }, { label: 'Colis' }]}>
        {page}
    </BackOfficeLayout>
);
