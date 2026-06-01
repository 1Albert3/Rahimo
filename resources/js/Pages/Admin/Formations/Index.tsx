import { Link } from '@inertiajs/react';
import { Book, CheckCircle, Clock, Edit, Plus, Trash2, Video, Award } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps, PaginatedData } from '@/types';

interface CourseItem {
    id: number; titre: string; categorie: string; difficulte: string;
    duree_minutes: number; obligatoire: boolean; published: boolean;
    quizzes_count: number; video_url: string | null; created_at: string;
}

interface Props extends PageProps {
    courses: PaginatedData<CourseItem>;
    stats: { total: number; publies: number; obligatoires: number; certificats_delivres: number };
}

const CATEGORIES: Record<string, string> = {
    securite: 'Sécurité', reglement: 'Règlement', conduite: 'Conduite', service: 'Service',
};

export default function FormationsIndex({ courses, stats }: Props) {
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Gestion des Formations</h1>
                    <p className="text-admin-muted text-sm mt-0.5">CRUD des modules e-learning</p>
                </div>
                <Link href={route('admin.formations.cours.creer')}
                    className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                ><Plus size={16} /> Nouvelle Formation</Link>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total', val: stats.total, icon: Book, color: 'text-admin-text', bg: 'bg-white/5' },
                    { label: 'Publiées', val: stats.publies, icon: CheckCircle, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
                    { label: 'Obligatoires', val: stats.obligatoires, icon: Clock, color: 'text-status-yellow-text', bg: 'bg-status-yellow-bg/30' },
                    { label: 'Certificats', val: stats.certificats_delivres, icon: Award, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
                ].map(s => (
                    <div key={s.label} className="bg-admin-card rounded-xl border border-white/5 p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}><s.icon size={18} className={s.color} /></div>
                        <div>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-xs text-admin-muted">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['Titre', 'Catégorie', 'Difficulté', 'Durée', 'Quiz', 'Vidéo', 'Publié', 'Date', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {courses.data.map(c => (
                                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-white">{c.titre}</td>
                                    <td className="px-4 py-3 text-admin-muted">{CATEGORIES[c.categorie] ?? c.categorie}</td>
                                    <td className="px-4 py-3 text-admin-muted capitalize">{c.difficulte}</td>
                                    <td className="px-4 py-3 text-admin-muted font-mono">{c.duree_minutes} min</td>
                                    <td className="px-4 py-3">
                                        <Link href={route('admin.formations.quiz.index', c.id)}
                                            className="text-status-blue-text hover:underline font-semibold text-xs"
                                        >{c.quizzes_count} questions</Link>
                                    </td>
                                    <td className="px-4 py-3">{c.video_url ? <Video size={14} className="text-status-green-text" /> : '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${c.published ? 'bg-status-green-bg/30 text-status-green-text' : 'bg-status-red-bg/30 text-status-red-text'}`}>
                                            {c.published ? 'Oui' : 'Non'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-admin-muted text-xs font-mono">{c.created_at}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <Link href={route('admin.formations.cours.modifier', c.id)}
                                                className="text-status-yellow-text hover:underline text-xs"
                                            ><Edit size={12} className="inline" /> Modifier</Link>
                                            <button onClick={() => { if (confirm('Supprimer cette formation ?')) router.delete(route('admin.formations.cours.supprimer', c.id)); }}
                                                className="text-status-red-text hover:underline text-xs"
                                            ><Trash2 size={12} className="inline" /> Suppr.</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {courses.data.length === 0 && (
                                <tr><td colSpan={9} className="text-center py-8 text-admin-muted text-sm">Aucune formation.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

import { router } from '@inertiajs/react';

FormationsIndex.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Gestion Formations" breadcrumbs={[{ label: 'Formations' }]}>
        {page}
    </BackOfficeLayout>
);