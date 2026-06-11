
import { ArrowLeft, Save } from 'lucide-react';
import { useForm } from '@/hooks/useForm';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { storeCourse, updateCourse } from '@/api/admin';

interface FormData {
    course: {
        id?: number; titre?: string; description?: string; categorie?: string;
        difficulte?: string; duree_minutes?: number; obligatoire?: boolean;
        published?: boolean; contenu?: string; video_url?: string;
        document_url?: string; image_url?: string; quizzes_count?: number;
    } | null;
    categories: string[];
    difficultes: string[];
}

export default function FormationsForm() {
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    const { data, loading } = useApi<FormData>(isEdit ? `/admin/formations/${id}` : null);
    const course = data?.course ?? null;
    const categories = data?.categories ?? [];
    const difficultes = data?.difficultes ?? [];
    const form = useForm({
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
    const { data: inputData, setData, post, put, processing, errors } = form;

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && course?.id) {
            await updateCourse(course.id, inputData as Record<string, unknown>);
        } else {
            await storeCourse(inputData as Record<string, unknown>);
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
                    <Link to="/admin/formations" className="text-on-surface-variant hover:text-slate-dark transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-dark">{isEdit ? 'Modifier' : 'Nouvelle'} Formation</h1>
                        <p className="text-on-surface-variant text-sm mt-0.5">{isEdit ? 'Modifier les informations du module' : 'Créer un nouveau module e-learning'}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={submit} className="bg-white rounded-xl border border-outline p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-on-surface-variant mb-1">Titre *</label>
                        <input type="text" value={inputData.titre} onChange={e => setData('titre', e.target.value)}
                            className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary transition-colors" />
                        {errors.titre && <p className="text-status-red-text text-xs mt-1">{errors.titre}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-on-surface-variant mb-1">Catégorie *</label>
                        <select value={inputData.categorie} onChange={e => setData('categorie', e.target.value)}
                            className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary transition-colors">
                            {categories.map(c => <option key={c} value={c}>{CAT_LABELS[c] ?? c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-on-surface-variant mb-1">Difficulté *</label>
                        <select value={inputData.difficulte} onChange={e => setData('difficulte', e.target.value)}
                            className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary transition-colors">
                            {difficultes.map(d => <option key={d} value={d}>{DIF_LABELS[d] ?? d}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-on-surface-variant mb-1">Durée (minutes) *</label>
                        <input type="number" min={1} value={inputData.duree_minutes} onChange={e => setData('duree_minutes', parseInt(e.target.value) || 30)}
                            className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div className="flex gap-6 items-end pb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={inputData.obligatoire} onChange={e => setData('obligatoire', e.target.checked)}
                                className="rounded bg-gris-surface border-outline text-primary" />
                            <span className="text-sm text-on-surface-variant">Obligatoire</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={inputData.published} onChange={e => setData('published', e.target.checked)}
                                className="rounded bg-gris-surface border-outline text-primary" />
                            <span className="text-sm text-on-surface-variant">Publié</span>
                        </label>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-on-surface-variant mb-1">Description</label>
                        <textarea rows={3} value={inputData.description} onChange={e => setData('description', e.target.value)}
                            className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary transition-colors resize-none" />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-on-surface-variant mb-1">Contenu (markdown/HTML)</label>
                        <textarea rows={6} value={inputData.contenu} onChange={e => setData('contenu', e.target.value)}
                            className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm font-mono focus:outline-none focus:border-primary transition-colors resize-none" />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-on-surface-variant mb-1">URL Vidéo (YouTube/Vimeo)</label>
                        <input type="url" value={inputData.video_url} onChange={e => setData('video_url', e.target.value)}
                            className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary transition-colors" placeholder="https://..." />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-on-surface-variant mb-1">URL Document (PDF lié)</label>
                        <input type="url" value={inputData.document_url} onChange={e => setData('document_url', e.target.value)}
                            className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary transition-colors" placeholder="https://..." />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-on-surface-variant mb-1">URL Image de couverture</label>
                        <input type="url" value={inputData.image_url} onChange={e => setData('image_url', e.target.value)}
                            className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary transition-colors" placeholder="https://..." />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-outline">
                    <Link to="/admin/formations"
                        className="px-4 py-2 text-sm text-on-surface-variant hover:text-slate-dark transition-colors"
                    >Annuler</Link>
                    <button type="submit" disabled={processing}
                        className="btn-primary px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                    ><Save size={16} /> {isEdit ? 'Mettre à jour' : 'Créer'}</button>
                </div>
            </form>
        </div>
    );
}
