import { router, useForm } from '@inertiajs/react';
import { MapPin, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { useState } from 'react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps, PaginatedData } from '@/types';

interface CityItem {
    id: number;
    nom: string;
    trips_as_departure_count: number;
    trips_as_arrival_count: number;
    stations_count: number;
    created_at: string;
}

interface Props extends PageProps {
    cities: PaginatedData<CityItem>;
}

export default function CitiesIndex({ cities }: Props) {
    const { data, setData, post, processing, reset, errors } = useForm({
        nom: '',
    });

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingNom, setEditingNom] = useState('');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.villes.stocker'), { onSuccess: () => reset() });
    };

    const startEdit = (city: CityItem) => {
        setEditingId(city.id);
        setEditingNom(city.nom);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingNom('');
    };

    const saveEdit = (id: number) => {
        router.put(
            route('admin.villes.mettre-a-jour', id),
            { nom: editingNom },
            { onSuccess: () => cancelEdit() },
        );
    };

    const destroy = (id: number, nom: string) => {
        if (!confirm(`Supprimer la ville "${nom}" ?`)) return;
        router.delete(route('admin.villes.supprimer', id));
    };

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-dark">Villes</h1>
                <p className="text-on-surface-variant text-sm mt-0.5">
                    Référentiel des villes (utilisé par trajets, gares, colis, transport moto)
                </p>
            </div>

            {/* Formulaire de création */}
            <form
                onSubmit={submit}
                className="bg-white rounded-xl border border-outline shadow-sm p-5 flex flex-wrap items-center gap-3"
            >
                <div className="flex-1 min-w-[240px]">
                    <input
                        type="text"
                        value={data.nom}
                        onChange={e => setData('nom', e.target.value)}
                        required
                        placeholder="Nom de la ville (ex : Ouagadougou)"
                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm"
                    />
                    {errors.nom && (
                        <p className="text-status-red-text text-xs mt-1">{errors.nom}</p>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={processing}
                    className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                >
                    <Plus size={14} />
                    Ajouter
                </button>
            </form>

            {/* Liste des villes */}
            <div className="bg-white rounded-xl border border-outline shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase">
                        <tr>
                            <th className="text-left px-4 py-3 font-semibold">Ville</th>
                            <th className="text-center px-4 py-3 font-semibold">Trajets (départ)</th>
                            <th className="text-center px-4 py-3 font-semibold">Trajets (arrivée)</th>
                            <th className="text-center px-4 py-3 font-semibold">Gares</th>
                            <th className="text-right px-4 py-3 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cities.data.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center text-on-surface-variant py-8">
                                    Aucune ville enregistrée.
                                </td>
                            </tr>
                        )}
                        {cities.data.map(c => (
                            <tr key={c.id} className="border-t border-outline hover:bg-gris-surface/50">
                                <td className="px-4 py-3">
                                    {editingId === c.id ? (
                                        <input
                                            type="text"
                                            value={editingNom}
                                            onChange={e => setEditingNom(e.target.value)}
                                            className="bg-gris-surface border border-outline rounded-lg px-2 py-1 text-slate-dark text-sm"
                                            autoFocus
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') saveEdit(c.id);
                                                if (e.key === 'Escape') cancelEdit();
                                            }}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-dark font-medium">
                                            <div className="w-8 h-8 rounded-lg bg-gris-surface flex items-center justify-center">
                                                <MapPin size={14} className="text-slate-dark" />
                                            </div>
                                            {c.nom}
                                        </div>
                                    )}
                                </td>
                                <td className="text-center px-4 py-3 text-on-surface-variant">
                                    {c.trips_as_departure_count}
                                </td>
                                <td className="text-center px-4 py-3 text-on-surface-variant">
                                    {c.trips_as_arrival_count}
                                </td>
                                <td className="text-center px-4 py-3 text-on-surface-variant">
                                    {c.stations_count}
                                </td>
                                <td className="text-right px-4 py-3">
                                    {editingId === c.id ? (
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => saveEdit(c.id)}
                                                className="p-2 rounded-lg hover:bg-status-green-bg text-status-green-text"
                                                title="Enregistrer"
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="p-2 rounded-lg hover:bg-gris-surface text-on-surface-variant"
                                                title="Annuler"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => startEdit(c)}
                                                className="p-2 rounded-lg hover:bg-gris-surface text-slate-dark"
                                                title="Modifier"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => destroy(c.id, c.nom)}
                                                className="p-2 rounded-lg hover:bg-status-red-bg/30 text-status-red-text"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination simple */}
            {cities.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 text-sm">
                    {cities.links?.map((link, idx) => (
                        <button
                            key={idx}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url)}
                            className={`px-3 py-1 rounded-lg ${
                                link.active
                                    ? 'bg-slate-dark text-white'
                                    : 'bg-white border border-outline text-slate-dark hover:bg-gris-surface'
                            } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

CitiesIndex.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Villes" breadcrumbs={[{ label: 'Villes' }]}>
        {page}
    </BackOfficeLayout>
);
