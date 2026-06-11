
import { motion } from 'framer-motion';
import { CheckCircle, Home, Package, Truck } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { formatFCFA } from '@/lib/utils';
import { useForm } from '@/hooks/useForm';
import { Link } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';


interface TripOption {
    id: number;
    label: string;
    departure_city: string;
    arrival_city: string;
    price: number;
}

export default function Send() {
    const { data: apiData, loading } = useApi<{ trips: TripOption[] }>('/colis');
    const form = useForm({
        expediteur_name: '',
        expediteur_phone: '',
        destinataire_name: '',
        destinataire_phone: '',
        destination_address: '',
        departure_city: '',
        arrival_city: '',
        weight: '',
        description: '',
        type: 'colis' as string,
        price: '',
        payment_on_delivery: false,
        trip_id: '',
    });
    const { data, setData, post, processing, errors, recentlySuccessful } = form;
    const trips = apiData?.trips ?? [];

    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/colis/envoyer');
    };

    const cities = [...new Set(trips.map((t: TripOption) => t.departure_city))].sort();
    const arrivalCities = [...new Set(
        data.departure_city
            ? trips.filter((t: TripOption) => t.departure_city === data.departure_city).map((t: TripOption) => t.arrival_city)
            : trips.map((t: TripOption) => t.arrival_city)
    )].sort();

    const estimatedPrice = trips.find(
        (t: TripOption) => t.departure_city === data.departure_city && t.arrival_city === data.arrival_city
    ) as TripOption | undefined;

    if (recentlySuccessful) {
        return (
            <div className="max-w-lg mx-auto px-4 py-16 text-center">
                <div className="w-16 h-16 bg-status-green-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-status-green-text" />
                </div>
                <h1 className="text-2xl font-black text-slate-dark tracking-tight mb-2">Colis Enregistré !</h1>
                <p className="text-on-surface-variant text-sm mb-6">Vous allez recevoir une notification dès la prise en charge.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/colis/envoyer"
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm"
                    >Envoyer un autre colis</Link>
                    <Link to="/"
                        className="px-6 py-3 border border-outline text-slate-dark rounded-xl font-semibold text-sm flex items-center gap-2"
                    ><Home size={14} /> Accueil</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
            <div className="mb-8 text-center">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Package size={26} className="text-primary" />
                </div>
                <h1 className="text-2xl font-black text-slate-dark tracking-tight mb-1">Envoyer un Colis</h1>
                <p className="text-on-surface-variant text-sm">Remplissez les informations pour expédier votre colis</p>
            </div>

            <motion.form onSubmit={submit} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-xl p-6 space-y-5"
            >
                <div>
                    <h2 className="font-bold text-sm text-slate-dark mb-3 flex items-center gap-2">
                        <Package size={14} className="text-primary" /> Expéditeur
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Nom complet</label>
                            <input type="text" value={data.expediteur_name} onChange={e => setData('expediteur_name', e.target.value)}
                                className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                                placeholder="Votre nom" required
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Téléphone</label>
                            <input type="tel" value={data.expediteur_phone} onChange={e => setData('expediteur_phone', e.target.value)}
                                className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                                placeholder="+226 XX XX XX XX" required
                            />
                        </div>
                    </div>
                </div>

                <hr className="border-outline" />

                <div>
                    <h2 className="font-bold text-sm text-slate-dark mb-3 flex items-center gap-2">
                        <Truck size={14} className="text-primary" /> Destinataire
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Nom complet</label>
                            <input type="text" value={data.destinataire_name} onChange={e => setData('destinataire_name', e.target.value)}
                                className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                                placeholder="Nom du destinataire" required
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Téléphone</label>
                            <input type="tel" value={data.destinataire_phone} onChange={e => setData('destinataire_phone', e.target.value)}
                                className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                                placeholder="+226 XX XX XX XX" required
                            />
                        </div>
                    </div>
                    <div className="mt-3">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Adresse de livraison (optionnel)</label>
                        <input type="text" value={data.destination_address} onChange={e => setData('destination_address', e.target.value)}
                            className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                            placeholder="Quartier, ville, point de référence..."
                        />
                    </div>
                </div>

                <hr className="border-outline" />

                <div>
                    <h2 className="font-bold text-sm text-slate-dark mb-3">Trajet</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Ville de départ</label>
                            <select value={data.departure_city} onChange={e => setData('departure_city', e.target.value)}
                                className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all appearance-none" required
                            >
                                <option value="">Sélectionner</option>
                                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Ville d'arrivée</label>
                            <select value={data.arrival_city} onChange={e => setData('arrival_city', e.target.value)}
                                className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all appearance-none" required
                            >
                                <option value="">Sélectionner</option>
                                {arrivalCities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <hr className="border-outline" />

                <div>
                    <h2 className="font-bold text-sm text-slate-dark mb-3">Détails du colis</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Type</label>
                            <select value={data.type} onChange={e => setData('type', e.target.value)}
                                className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all appearance-none" required
                            >
                                <option value="colis">Colis</option>
                                <option value="bagage">Bagage</option>
                                <option value="marchandise">Marchandise</option>
                                <option value="fragile">Fragile</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Poids (kg)</label>
                            <input type="number" step="0.1" min="0" value={data.weight} onChange={e => setData('weight', e.target.value)}
                                className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                                placeholder="0.0"
                            />
                        </div>
                    </div>
                    <div className="mt-3">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Description</label>
                        <textarea value={data.description} onChange={e => setData('description', e.target.value)}
                            className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all resize-none"
                            rows={2} placeholder="Contenu du colis..."
                        />
                    </div>
                </div>

                <hr className="border-outline" />

                <div>
                    <h2 className="font-bold text-sm text-slate-dark mb-3">Paiement</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Prix de l'envoi (FCFA)</label>
                            <input type="number" min="0" value={data.price} onChange={e => setData('price', e.target.value)}
                                className="w-full px-3 py-2.5 bg-surface rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                                placeholder="0" required
                            />
                            {estimatedPrice && !data.price && (
                                <p className="text-[10px] text-on-surface-variant mt-1">Prix indicatif : {formatFCFA(estimatedPrice.price)}</p>
                            )}
                        </div>
                        <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={data.payment_on_delivery} onChange={e => setData('payment_on_delivery', e.target.checked)}
                                    className="w-4 h-4 accent-primary rounded"
                                />
                                <div>
                                    <span className="text-sm font-semibold text-slate-dark">Port dû</span>
                                    <p className="text-[10px] text-on-surface-variant">Paiement par le destinataire à la livraison</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={processing}
                    className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-xl"
                >{processing ? 'Enregistrement...' : 'Envoyer le colis'}</button>
            </motion.form>
        </div>
    );
}