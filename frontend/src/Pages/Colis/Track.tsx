import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Loader2, Navigation, Package, Search, Truck } from 'lucide-react';
import { useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import StatusBadge from '@/Components/StatusBadge';
import { formatFCFA } from '@/lib/utils';
import api from '@/api/client';

interface TimelineEntry { status: string; label: string; icon: string; date: string; location: string | null }
interface ColisDetail {
    id: number; tracking_number: string; expediteur_name: string; expediteur_phone: string;
    destinataire_name: string; destinataire_phone: string; departure_city: string; arrival_city: string;
    destination_address: string | null; weight: number | null; description: string | null;
    status: string; payment_on_delivery: boolean; photos: string[]; price: number;
    expedition_date: string | null; livraison_date: string | null; timeline: TimelineEntry[];
}

const ICON_MAP: Record<string, React.ElementType> = { Package, Truck, Navigation, CheckCircle, AlertTriangle };

function formatDate(iso?: string | null) {
    if (!iso) return '--';
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Timeline({ entries }: { entries: TimelineEntry[] }) {
    const activeIdx = entries.length - 1;
    return (
        <div className="relative">
            {entries.map((e, i) => {
                const Icon = ICON_MAP[e.icon] ?? Package;
                const isActive = i === activeIdx;
                const isPast = i <= activeIdx;
                return (
                    <div key={i} className="flex gap-4 pb-6 last:pb-0 relative">
                        {i < entries.length - 1 && <div className={`absolute left-[15px] top-8 w-0.5 h-full -z-0 ${isPast ? 'bg-primary' : 'bg-gris-surface'}`} />}
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${isActive ? 'bg-primary text-white shadow-xl scale-110' : isPast ? 'bg-white text-primary' : 'bg-gris-surface text-on-surface-variant'}`}>
                            <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                            <p className={`text-sm font-bold ${isActive ? 'text-primary' : 'text-slate-dark'}`}>{e.label}</p>
                            <p className="text-xs text-on-surface-variant mt-0.5">{formatDate(e.date)}{e.location && ` · ${e.location}`}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function Track() {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [colis, setColis] = useState<ColisDetail | null | undefined>(undefined);
    const [searching, setSearching] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingNumber.trim()) return;
        setSearching(true);
        try {
            const { data } = await api.get('/colis/track', { params: { tracking_number: trackingNumber } });
            setColis(data.colis ?? null);
        } catch { setColis(null); }
        setSearching(false);
    };

    return (
        <div className="max-w-[720px] mx-auto px-4 md:px-6 py-10">
            <div className="mb-8 text-center">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mx-auto mb-4"><Package size={26} className="text-primary" /></div>
                <h1 className="text-2xl font-black text-slate-dark tracking-tight mb-1">Suivre un Colis</h1>
                <p className="text-on-surface-variant text-sm">Entrez le numéro de suivi pour connaître l'état de votre colis</p>
            </div>

            <form onSubmit={submit} className="flex gap-3 mb-8">
                <input type="text" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="COL-20250525-XXXXXX"
                    className="flex-1 px-4 py-3 bg-white rounded-xl text-sm text-slate-dark placeholder:text-on-surface-variant/60 focus:ring-2 focus:ring-primary/15 outline-none font-mono" />
                <button type="submit" disabled={searching || !trackingNumber}
                    className="bg-primary text-white px-5 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors shadow-xl disabled:opacity-50">
                    {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Suivre
                </button>
            </form>

            {colis && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                        <div className="bg-primary px-6 py-4 text-white flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">Numéro de suivi</p>
                                <p className="font-mono text-lg font-black tracking-wider">{colis.tracking_number}</p>
                            </div>
                            <StatusBadge status={colis.status} />
                        </div>
                        {colis.payment_on_delivery && (
                            <div className="bg-status-yellow-bg px-6 py-3 flex items-center gap-2 text-xs font-semibold text-status-yellow-text">
                                <AlertTriangle size={14} /> Port dû — paiement à la livraison ({formatFCFA(colis.price)})
                            </div>
                        )}
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[['Expéditeur', colis.expediteur_name, colis.expediteur_phone], ['Destinataire', colis.destinataire_name, colis.destinataire_phone]].map(([label, name, phone]) => (
                                    <div key={label as string}>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">{label}</p>
                                        <p className="font-semibold text-slate-dark text-sm">{name}</p>
                                        <p className="text-xs text-on-surface-variant">{phone}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[{ label: 'Départ', val: colis.departure_city }, { label: 'Arrivée', val: colis.arrival_city }, { label: 'Poids', val: colis.weight ? `${colis.weight} kg` : '—' }, { label: 'Prix', val: formatFCFA(colis.price) }].map(({ label, val }) => (
                                    <div key={label}>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-0.5">{label}</p>
                                        <p className="text-sm font-semibold text-slate-dark">{val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {(colis.timeline?.length ?? 0) > 0 && (
                        <div className="bg-white rounded-xl shadow-xl p-6">
                            <h2 className="font-bold text-sm text-slate-dark mb-5 flex items-center gap-2"><Navigation size={14} className="text-primary" /> Suivi en temps réel</h2>
                            <Timeline entries={colis.timeline} />
                        </div>
                    )}

                    {(colis.photos?.length ?? 0) > 0 && (
                        <div className="bg-white rounded-xl shadow-xl p-6">
                            <h2 className="font-bold text-sm text-slate-dark mb-4">Photos du colis</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {colis.photos.map((url, i) => (
                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-xl overflow-hidden bg-gris-surface">
                                        <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {colis === null && <div className="text-center py-10"><p className="text-on-surface-variant">Aucun colis trouvé avec ce numéro.</p></div>}
        </div>
    );
}
