
import { Book, CheckCircle, Clock, Edit, Plus, Trash2, Video, Award } from 'lucide-react';
import type { PaginatedData } from '@/types';
import { Link } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { deleteCourse } from '@/api/admin';
interface CourseItem {
    id: number; titre: string; categorie: string; difficulte: string;
    duree_minutes: number; obligatoire: boolean; published: boolean;
    quizzes_count: number; video_url: string | null; created_at: string;
}

interface FormationsIndexData {
    courses: PaginatedData<CourseItem>;
    stats: { total: number; publies: number; obligatoires: number; certificats_delivres: number };
}

const CATEGORIES: Record<string, string> = {
    securite: 'Sécurité', reglement: 'Règlement', conduite: 'Conduite', service: 'Service',
};

export default function FormationsIndex() {
    const { data, loading } = useApi<FormationsIndexData>('/admin/formations');
    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;
    const courses = data?.courses ?? ({} as any);
    const safeStats: any = data?.stats ?? {};
    const safeCourses = courses && typeof courses === 'object' && Array.isArray(courses.data) ? courses : { data: [] };
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-dark">Gestion des Formations</h1>
                    <p className="text-on-surface-variant text-sm mt-0.5">CRUD des modules e-learning</p>
                </div>
                <Link to="/admin/formations"
                    className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                ><Plus size={16} /> Nouvelle Formation</Link>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total', val: safeStats.total ?? 0, icon: Book, color: 'text-slate-dark', bg: 'bg-gris-surface' },
                    { label: 'Publiées', val: safeStats.publies ?? 0, icon: CheckCircle, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
                    { label: 'Obligatoires', val: safeStats.obligatoires ?? 0, icon: Clock, color: 'text-status-yellow-text', bg: 'bg-status-yellow-bg/30' },
                    { label: 'Certificats', val: safeStats.certificats_delivres ?? 0, icon: Award, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-outline p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon size={18} className={s.color} /></div>
                        <div>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-xs text-on-surface-variant">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-outline overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                            <tr>
                                {['Titre', 'Catégorie', 'Difficulté', 'Durée', 'Quiz', 'Vidéo', 'Publié', 'Date', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {safeCourses.data.map((c: CourseItem) => (
                                <tr key={c.id} className="hover:bg-gris-surface transition-colors">
                                    <td className="px-4 py-3 font-semibold text-slate-dark">{c.titre}</td>
                                    <td className="px-4 py-3 text-on-surface-variant">{CATEGORIES[c.categorie] ?? c.categorie}</td>
                                    <td className="px-4 py-3 text-on-surface-variant capitalize">{c.difficulte}</td>
                                    <td className="px-4 py-3 text-on-surface-variant font-mono">{c.duree_minutes} min</td>
                                    <td className="px-4 py-3">
                                        <Link to={`/admin/formations/${c.id}`}
                                            className="text-status-blue-text hover:underline font-semibold text-xs"
                                        >{c.quizzes_count} questions</Link>
                                    </td>
                                    <td className="px-4 py-3">{c.video_url ? <Video size={14} className="text-status-green-text" /> : '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${c.published ? 'bg-status-green-bg/30 text-status-green-text' : 'bg-status-red-bg/30 text-status-red-text'}`}>
                                            {c.published ? 'Oui' : 'Non'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-on-surface-variant text-xs font-mono">{c.created_at}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <Link to={`/admin/formations/${c.id}`}
                                                className="text-status-yellow-text hover:underline text-xs"
                                            ><Edit size={12} className="inline" /> Modifier</Link>
                                            <button onClick={() => { if (confirm('Supprimer cette formation ?')) deleteCourse(c.id); }}
                                                className="text-status-red-text hover:underline text-xs"
                                            ><Trash2 size={12} className="inline" /> Suppr.</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {safeCourses.data.length === 0 && (
                                <tr><td colSpan={9} className="text-center py-8 text-on-surface-variant text-sm">Aucune formation.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
