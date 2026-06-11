import { useState } from 'react';

import { ArrowLeft, CheckCircle, Eye, Package, Search, X } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useForm } from '@/hooks/useForm';
import { Link } from 'react-router-dom';


interface FoundItem {
    id: number;
    type: string;
    description: string;
    trip_info: string | null;
    photo_url: string | null;
    created_at: string;
}

interface Props extends PageProps {
    foundItems: FoundItem[];
}

const TYPES = [
    { key: 'porte-monnaie', label: 'Porte-monnaie / Portefeuille' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'sac', label: 'Sac / Bagage' },
    { key: 'document', label: 'Document / Papier' },
    { key: 'vetement', label: 'Vêtement' },
    { key: 'electronique', label: 'Appareil électronique' },
    { key: 'autre', label: 'Autre' },
];

const TYPE_ICONS: Record<string, string> = {
    'porte-monnaie': '👛', 'telephone': '📱', 'sac': '🎒',
    'document': '📄', 'vetement': '👕', 'electronique': '💻', 'autre': '📦',
};

export default function LostAndFound({ foundItems }: Props) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        type: '',
        reported_by_name: '',
        reported_by_phone: '',
        trip_info: '',
        description: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/services/objets-trouves', {
            onSuccess: () => setShowForm(false),
        });
    };

    if (recentlySuccessful) {
        return (
            <div className="max-w-lg mx-auto px-4 py-16 text-center">
                <div className="w-16 h-16 bg-status-green-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-status-green-text" />
                </div>
                <h1 className="text-2xl font-black text-slate-dark tracking-tight mb-2">Objet signalé !</h1>
                <p className="text-on-surface-variant text-sm mb-6">Nous vous contacterons si nous retrouvons votre bien.</p>
                <Link to="/services" className="text-primary font-semibold hover:underline text-sm">Retour aux services</Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
            <Link to="/services" className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-slate-dark mb-6 transition-colors">
                <ArrowLeft size={14} /> Services
            </Link>

            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                    <Search size={20} className="text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-black text-slate-dark tracking-tight">Objets Trouvés</h1>
                    <p className="text-xs text-on-surface-variant">Signalez un objet perdu ou consultez les objets retrouvés</p>
                </div>
            </div>

            {/* Objets retrouvés */}
            {foundItems.length > 0 && (
                <div className="mb-6">
                    <h2 className="font-bold text-sm text-slate-dark mb-3 flex items-center gap-2">
                        <Eye size={14} /> Objets retrouvés ({foundItems.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {foundItems.map(item => (
                            <div key={item.id} className="bg-white rounded-xl shadow-xl p-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{TYPE_ICONS[item.type] ?? '📦'}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-slate-dark capitalize">{item.type}</p>
                                        <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{item.description}</p>
                                        {item.trip_info && <p className="text-[10px] text-on-surface-variant mt-1">Trajet : {item.trip_info}</p>}
                                        <p className="text-[10px] text-on-surface-variant mt-0.5">Signalé le {item.created_at}</p>
                                        {item.photo_url && (
                                            <a href={item.photo_url} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold mt-1 hover:underline"
                                            ><Eye size={11} /> Voir photo</a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {foundItems.length === 0 && (
                <div className="bg-white rounded-xl shadow-xl p-6 text-center mb-6">
                    <Package size={32} className="text-on-surface-variant/30 mx-auto mb-2" />
                    <p className="text-sm text-on-surface-variant">Aucun objet retrouvé pour le moment.</p>
                </div>
            )}

            {/* Signaler un objet perdu */}
            <button onClick={() => setShowForm(true)}
                className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-xl"
            >Signaler un objet perdu</button>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-slate-dark">Signaler un objet perdu</h3>
                            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gris-surface rounded-lg"><X size={18} /></button>
                        </div>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Type d'objet *</label>
                                <select value={data.type} onChange={e => setData('type', e.target.value)} required
                                    className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 outline-none transition-all appearance-none"
                                >
                                    <option value="">Sélectionner</option>
                                    {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Votre nom *</label>
                                    <input type="text" value={data.reported_by_name} onChange={e => setData('reported_by_name', e.target.value)} required
                                        className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 outline-none transition-all"
                                        placeholder="Votre nom"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Téléphone *</label>
                                    <input type="tel" value={data.reported_by_phone} onChange={e => setData('reported_by_phone', e.target.value)} required
                                        className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 outline-none transition-all"
                                        placeholder="+226 XX XX XX XX"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Trajet concerné (optionnel)</label>
                                <input type="text" value={data.trip_info} onChange={e => setData('trip_info', e.target.value)}
                                    className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 outline-none transition-all"
                                    placeholder="Ex: Ouagadougou → Bobo, 15/05/2026"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Description *</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} required rows={3}
                                    className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 outline-none transition-all resize-none"
                                    placeholder="Décrivez l'objet perdu (couleur, marque, contenu...)"
                                />
                            </div>
                            <button type="submit" disabled={processing}
                                className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                            >{processing ? 'Envoi...' : 'Signaler'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}