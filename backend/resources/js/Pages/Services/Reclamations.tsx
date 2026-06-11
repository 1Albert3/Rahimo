import React from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, FileText, MessageSquare, Search } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import StatusBadge from '@/Components/StatusBadge';
import type { PageProps } from '@/types';

interface ReclamationItem {
    id: number;
    code: string;
    type: string;
    description: string;
    statut: string;
    response: string | null;
    created_at: string;
    treated_at: string | null;
}

interface Props extends PageProps {
    myReclamations: ReclamationItem[];
}

const TYPES = [
    'Retard', 'Annulation', 'Propreté', 'Confort', 'Bagage perdu',
    'Accueil', 'Paiement', 'Conducteur', 'Site web', 'Autre',
];

export default function Reclamations({ myReclamations }: Props) {
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        client_name: '',
        client_phone: '',
        type: '',
        description: '',
    });

    const [phoneSearch, setPhoneSearch] = React.useState('');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('services.public.reclamations.store'));
    };

    const searchReclamations = () => {
        if (phoneSearch) {
            router.get(route('services.public.reclamations', { phone: phoneSearch }));
        }
    };

    if (recentlySuccessful) {
        return (
            <div className="max-w-lg mx-auto px-4 py-16 text-center">
                <div className="w-16 h-16 bg-status-green-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-status-green-text" />
                </div>
                <h1 className="text-2xl font-black text-slate-dark tracking-tight mb-2">Réclamation envoyée !</h1>
                <p className="text-on-surface-variant text-sm mb-6">Nous traitons votre demande dans les plus brefs délais.</p>
                <Link href={route('services.index')} className="text-primary font-semibold hover:underline text-sm">Retour aux services</Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
            <Link href={route('services.index')} className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-slate-dark mb-6 transition-colors">
                <ArrowLeft size={14} /> Services
            </Link>

            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-status-red-text flex items-center justify-center">
                    <FileText size={20} className="text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-black text-slate-dark tracking-tight">Réclamations</h1>
                    <p className="text-xs text-on-surface-variant">Soumettre une réclamation ou suivre son traitement</p>
                </div>
            </div>

            {/* Rechercher mes réclamations */}
            <div className="bg-white rounded-xl shadow-xl p-5 mb-6">
                <h2 className="font-bold text-sm text-slate-dark mb-3 flex items-center gap-2">
                    <Search size={14} /> Suivre mes réclamations
                </h2>
                <div className="flex gap-2">
                    <input type="tel" value={phoneSearch} onChange={e => setPhoneSearch(e.target.value)}
                        placeholder="Entrez votre téléphone"
                        className="flex-1 px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                    />
                    <button onClick={searchReclamations}
                        className="px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm"
                    >Consulter</button>
                </div>
                {myReclamations.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {myReclamations.map(r => {
                            const rs = r.statut;
                            const rBorderCls = rs === 'resolue' ? 'border-l-status-green-ring' : rs === 'en_cours' ? 'border-l-status-yellow-ring' : rs === 'fermee' ? 'border-l-outline' : 'border-l-status-red-ring';
                            return (
                            <div key={r.id} className={`bg-gris-surface rounded-xl p-3 border-l-4 ${rBorderCls}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-xs font-bold text-primary">{r.code}</span>
                                    <StatusBadge status={r.statut} />
                                </div>
                                <p className="text-xs text-on-surface-variant">{r.type} · {r.created_at}</p>
                                <p className="text-sm text-slate-dark mt-1">{r.description}</p>
                                {r.response && (
                                    <div className="mt-2 bg-white/50 rounded-lg p-2 text-xs">
                                        <span className="font-bold text-primary">Réponse :</span> {r.response}
                                    </div>
                                )}
                            </div>
                            );
                        })}
                    </div>
                )}
                {myReclamations.length === 0 && phoneSearch && (
                    <p className="text-xs text-on-surface-variant mt-3">Aucune réclamation trouvée pour ce numéro.</p>
                )}
            </div>

            {/* Nouvelle réclamation */}
            <motion.form onSubmit={submit} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-xl p-6 space-y-4"
            >
                <h2 className="font-bold text-sm text-slate-dark flex items-center gap-2">
                    <MessageSquare size={14} /> Nouvelle réclamation
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Nom complet *</label>
                        <input type="text" value={data.client_name} onChange={e => setData('client_name', e.target.value)} required
                            className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                            placeholder="Votre nom"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Téléphone *</label>
                        <input type="tel" value={data.client_phone} onChange={e => setData('client_phone', e.target.value)} required
                            className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                            placeholder="+226 XX XX XX XX"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Type *</label>
                    <select value={data.type} onChange={e => setData('type', e.target.value)} required
                        className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all appearance-none"
                    >
                        <option value="">Sélectionner</option>
                        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Description *</label>
                    <textarea value={data.description} onChange={e => setData('description', e.target.value)} required rows={4}
                        className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all resize-none"
                        placeholder="Décrivez votre réclamation en détail..."
                    />
                </div>
                <button type="submit" disabled={processing}
                    className="w-full py-3 bg-status-red-text text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-xl"
                >{processing ? 'Envoi...' : 'Envoyer ma réclamation'}</button>
            </motion.form>
        </div>
    );
}

Reclamations.layout = (page: React.ReactNode) => (
    <GuestLayout title="Réclamations" activeNav="Services">{page}</GuestLayout>
);