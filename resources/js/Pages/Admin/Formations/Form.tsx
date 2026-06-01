import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    course: {
        id?: number; titre?: string; description?: string; categorie?: string;
        difficulte?: string; duree_minutes?: number; obligatoire?: boolean;
        published?: boolean; contenu?: string; video_url?: string;
        document_url?: string; image_url?: string; quizzes_count?: number;
    } | null;
    categories: string[];
    difficultes: string[];
}

export default function FormationsForm({ course, categories, difficultes }: Props) {
    const isEdit = !!course?.id;
    const { data, setData, post, put, processing, errors } = useForm({
        titre: course?.titre ?? '',
        description: course?.description ?? '',
        categorie: course?.categorie ?? categories[0],
        difficulte: course?.difficulte ?? difficultes[0],
        duree_minutes: course?.duree_minutes ?? 30,
        obligatoire: course?.obligatoire ?? false,
        published: course?.published ?? true,
        contenu: course?.contenu ?? '',
        video_url: course?.video_url ?? '',
        document_url: course?.document_url ?? '',
        image_url: course?.image_url ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(route('admin.formations.cours.mettre-a-jour', course!.id));
        } else {
            post(route('admin.formations.cours.stocker'));
        }
    };

    const CAT_LABELS: Record<string, string> = {
        securite: 'Sécurité', reglement: 'Règlement', conduite: 'Conduite', service: 'Service',
    };
    const DIF_LABELS: Record<string, string> = {
        debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé',
    };

    return (
        <div className="w-full max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={route('admin.formations.cours')} className="text-admin-muted hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-white">{isEdit ? 'Modifier' : 'Nouvelle'} Formation</h1>
                        <p className="text-admin-muted text-sm mt-0.5">{isEdit ? 'Modifier les informations du module' : 'Créer un nouveau module e-learning'}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={submit} className="bg-admin-card rounded-xl border border-white/5 p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-admin-muted mb-1">Titre *</label>
                        <input type="text" value={data.titre} onChange={e => setData('titre', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-container outline-none" />
                        {errors.titre && <p className="text-status-red-text text-xs mt-1">{errors.titre}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-admin-muted mb-1">Catégorie *</label>
                        <select value={data.categorie} onChange={e => setData('categorie', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-container outline-none">
                            {categories.map(c => <option key={c} value={c}>{CAT_LABELS[c] ?? c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-admin-muted mb-1">Difficulté *</label>
                        <select value={data.difficulte} onChange={e => setData('difficulte', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-container outline-none">
                            {difficultes.map(d => <option key={d} value={d}>{DIF_LABELS[d] ?? d}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-admin-muted mb-1">Durée (minutes) *</label>
                        <input type="number" min={1} value={data.duree_minutes} onChange={e => setData('duree_minutes', parseInt(e.target.value) || 30)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-container outline-none" />
                    </div>
                    <div className="flex gap-6 items-end pb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={data.obligatoire} onChange={e => setData('obligatoire', e.target.checked)}
                                className="rounded bg-white/5 border-white/10 text-primary-container" />
                            <span className="text-sm text-admin-muted">Obligatoire</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={data.published} onChange={e => setData('published', e.target.checked)}
                                className="rounded bg-white/5 border-white/10 text-primary-container" />
                            <span className="text-sm text-admin-muted">Publié</span>
                        </label>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-admin-muted mb-1">Description</label>
                        <textarea rows={3} value={data.description} onChange={e => setData('description', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-container outline-none resize-none" />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-admin-muted mb-1">Contenu (markdown/HTML)</label>
                        <textarea rows={6} value={data.contenu} onChange={e => setData('contenu', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:border-primary-container outline-none resize-none" />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-admin-muted mb-1">URL Vidéo (YouTube/Vimeo)</label>
                        <input type="url" value={data.video_url} onChange={e => setData('video_url', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-container outline-none" placeholder="https://..." />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-admin-muted mb-1">URL Document (PDF lié)</label>
                        <input type="url" value={data.document_url} onChange={e => setData('document_url', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-container outline-none" placeholder="https://..." />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-admin-muted mb-1">URL Image de couverture</label>
                        <input type="url" value={data.image_url} onChange={e => setData('image_url', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-container outline-none" placeholder="https://..." />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <Link href={route('admin.formations.cours')}
                        className="px-4 py-2 text-sm text-admin-muted hover:text-white transition-colors"
                    >Annuler</Link>
                    <button type="submit" disabled={processing}
                        className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                    ><Save size={16} /> {isEdit ? 'Mettre à jour' : 'Créer'}</button>
                </div>
            </form>
        </div>
    );
}

FormationsForm.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Formation"
        breadcrumbs={[{ label: 'Formations', href: route('admin.formations.cours') }, { label: 'Formulaire' }]}>
        {page}
    </BackOfficeLayout>
);