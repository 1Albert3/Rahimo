import { useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Loader2, Navigation, Package, Search, Truck } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import StatusBadge from '@/Components/StatusBadge';
import { formatFCFA } from '@/lib/utils';
import type { PageProps } from '@/types';

interface TimelineEntry {
    status: string;
    label: string;
    icon: string;
    date: string;
    location: string | null;
}

interface ColisDetail {
    id: number;
    tracking_number: string;
    expediteur_name: string;
    expediteur_phone: string;
    destinataire_name: string;
    destinataire_phone: string;
    departure_city: string;
    arrival_city: string;
    destination_address: string | null;
    weight: number | null;
    description: string | null;
    type: string;
    status: string;
    payment_on_delivery: boolean;
    photos: string[];
    price: number;
    notes: string | null;
    expedition_date: string | null;
    livraison_date: string | null;
    timeline: TimelineEntry[];
}

interface Props extends PageProps { colis?: ColisDetail | null; }

const ICON_MAP: Record<string, any> = {
    Package, Truck, Navigation, CheckCircle, AlertTriangle,
};

function formatDate(iso?: string | null): string {
    if (!iso) return '--';
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
                        {i < entries.length - 1 && (
                            <div className={`absolute left-[15px] top-8 w-0.5 h-full -z-0 ${isPast ? 'bg-primary' : 'bg-surface-container-high'}`} />
                        )}
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-primary text-white shadow-md scale-110' :
                            isPast ? 'bg-primary-fixed text-primary' : 'bg-surface-container-high text-on-surface-variant'
                        } transition-all`}>
                            <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                            <p className={`text-sm font-bold ${isActive ? 'text-primary' : 'text-on-surface'}`}>{e.label}</p>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                                {formatDate(e.date)}
                                {e.location && ` · ${e.location}`}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function Track({ colis }: Props) {
    const { data, setData, post, processing } = useForm({ tracking_number: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('colis.track.post'));
    };

    const hasTimeline = colis && colis.timeline && colis.timeline.length > 0;
    const hasPhotos = colis && colis.photos && colis.photos.length > 0;

    return (
        <div className="max-w-[720px] mx-auto px-4 md:px-6 py-10">
            <div className="mb-8 text-center">
                <div className="w-14 h-14 bg-primary-fixed rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package size={26} className="text-primary" />
                </div>
                <h1 className="text-2xl font-black text-on-surface tracking-tight mb-1">Suivre un Colis</h1>
                <p className="text-on-surface-variant text-sm">Entrez le numéro de suivi pour connaître l'état de votre colis</p>
            </div>

            <form onSubmit={submit} className="flex gap-3 mb-8">
                <input
                    type="text"
                    value={data.tracking_number}
                    onChange={(e) => setData('tracking_number', e.target.value)}
                    placeholder="COL-20250525-XXXXXX"
                    className="flex-1 px-4 py-3 bg-white rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all font-mono"
                />
                <button
                    type="submit"
                    disabled={processing || !data.tracking_number}
                    className="bg-gradient-to-br from-primary to-primary-container hover:from-primary hover:to-primary text-white px-5 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors shadow-ambient disabled:opacity-50"
                >
                    {processing ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    Suivre
                </button>
            </form>

            {colis && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Header */}
                    <div className="bg-white rounded-2xl shadow-ambient overflow-hidden">
                        <div className="bg-primary px-6 py-4 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-on-primary-container mb-1">Numéro de suivi</p>
                                    <p className="font-mono text-lg font-black tracking-wider">{colis.tracking_number}</p>
                                </div>
                                <StatusBadge status={colis.status} />
                            </div>
                        </div>

                        {/* Port dû indicator */}
                        {colis.payment_on_delivery && (
                            <div className="bg-status-yellow-bg px-6 py-3 flex items-center gap-2 text-xs font-semibold text-status-yellow-text">
                                <AlertTriangle size={14} />
                                Port dû — paiement à la livraison par le destinataire ({formatFCFA(colis.price)})
                            </div>
                        )}

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Expéditeur</p>
                                    <p className="font-semibold text-on-surface text-sm">{colis.expediteur_name}</p>
                                    <p className="text-xs text-on-surface-variant">{colis.expediteur_phone}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Destinataire</p>
                                    <p className="font-semibold text-on-surface text-sm">{colis.destinataire_name}</p>
                                    <p className="text-xs text-on-surface-variant">{colis.destinataire_phone}</p>
                                </div>
                            </div>

                            {colis.destination_address && (
                                <div className="text-sm text-on-surface-variant">
                                    <span className="font-semibold text-on-surface">Adresse livraison :</span> {colis.destination_address}
                                </div>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { label: 'Départ', val: colis.departure_city },
                                    { label: 'Arrivée', val: colis.arrival_city },
                                    { label: 'Poids', val: colis.weight ? `${colis.weight} kg` : '—' },
                                    { label: 'Prix', val: formatFCFA(colis.price) },
                                ].map(({ label, val }) => (
                                    <div key={label}>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-0.5">{label}</p>
                                        <p className="text-sm font-semibold text-on-surface">{val}</p>
                                    </div>
                                ))}
                            </div>

                            {colis.description && (
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Description</p>
                                    <p className="text-sm text-on-surface">{colis.description}</p>
                                </div>
                            )}

                            {colis.expedition_date && (
                                <div className="bg-surface-container-low rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary-fixed rounded-lg flex items-center justify-center">
                                        <Package size={14} className="text-primary" />
                                    </div>
                                    <p className="text-sm font-semibold text-on-surface">Expédié le {formatDate(colis.expedition_date)}</p>
                                </div>
                            )}

                            {colis.livraison_date && (
                                <div className="bg-status-green-bg rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-status-green-bg rounded-lg flex items-center justify-center">
                                        <CheckCircle size={14} className="text-status-green-text" />
                                    </div>
                                    <p className="text-sm font-semibold text-status-green-text">Livré le {formatDate(colis.livraison_date)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline */}
                    {hasTimeline && (
                        <div className="bg-white rounded-2xl shadow-ambient p-6">
                            <h2 className="font-bold text-sm text-on-surface mb-5 flex items-center gap-2">
                                <Navigation size={14} className="text-primary" /> Suivi en temps réel
                            </h2>
                            <Timeline entries={colis.timeline} />
                        </div>
                    )}

                    {/* Photos */}
                    {hasPhotos && (
                        <div className="bg-white rounded-2xl shadow-ambient p-6">
                            <h2 className="font-bold text-sm text-on-surface mb-4">Photos du colis</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {colis.photos.map((url, i) => (
                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                        className="aspect-square rounded-xl overflow-hidden bg-surface-container-low group"
                                    >
                                        <img src={url} alt={`Photo ${i + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {colis === null && data.tracking_number && (
                <div className="text-center py-10">
                    <p className="text-on-surface-variant">Aucun colis trouvé avec ce numéro de suivi.</p>
                </div>
            )}
        </div>
    );
}

Track.layout = (page: React.ReactNode) => (
    <GuestLayout title="Suivi Colis" activeNav="Colis">{page}</GuestLayout>
);