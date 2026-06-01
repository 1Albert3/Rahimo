import { useForm } from '@inertiajs/react';
import { Building2, Plus } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps, PaginatedData } from '@/types';

interface CompanyItem {
    id: number; name: string; slug: string; phone: string | null;
    email: string | null; is_active: boolean; vehicles_count: number;
    trips_count: number; users_count: number; created_at: string;
}

interface Props extends PageProps { companies: PaginatedData<CompanyItem> }

export default function CompaniesIndex({ companies }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        name: '', slug: '', registration_number: '', phone: '',
        email: '', address: '', primary_color: '#1e40af', is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.compagnies.stocker'), { onSuccess: () => reset() });
    };

    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Multi-Compagnies</h1>
                <p className="text-admin-muted text-sm mt-0.5">Gérer les compagnies de transport</p>
            </div>

            <form onSubmit={submit} className="bg-admin-card rounded-xl border border-white/5 p-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required
                    placeholder="Nom *" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="text" value={data.slug} onChange={e => setData('slug', e.target.value)} required
                    placeholder="Slug *" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)}
                    placeholder="Téléphone" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                <div className="flex gap-2">
                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                        placeholder="Email"
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                    <button type="submit" disabled={processing}
                        className="btn-primary px-4 rounded-lg text-sm font-semibold disabled:opacity-50"
                    ><Plus size={14} /></button>
                </div>
            </form>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {companies.data.map(c => (
                    <div key={c.id} className="bg-admin-card rounded-xl border border-white/5 p-5">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                <Building2 size={18} className="text-admin-text" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-white">{c.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${c.is_active ? 'bg-status-green-bg/30 text-status-green-text' : 'bg-status-red-bg/30 text-status-red-text'}`}>
                                        {c.is_active ? 'Actif' : 'Inactif'}
                                    </span>
                                </div>
                                <p className="text-admin-muted text-xs mt-0.5">@{c.slug}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-admin-muted">
                                    <span>{c.vehicles_count} véhicules</span>
                                    <span>{c.trips_count} trajets</span>
                                    <span>{c.users_count} employés</span>
                                </div>
                                {c.phone && <p className="text-admin-muted text-xs mt-1">{c.phone}</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

CompaniesIndex.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Compagnies" breadcrumbs={[{ label: 'Compagnies' }]}>
        {page}
    </BackOfficeLayout>
);