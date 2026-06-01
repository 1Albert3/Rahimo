import React from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps } from '@/types';

interface QuizItem {
    id: number; question: string; options: string[];
    correct_answer: string; points: number;
}

interface Props extends PageProps {
    course: { id: number; titre: string };
    quizzes: QuizItem[];
}

export default function Quizzes({ course, quizzes }: Props) {
    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        question: '', options: ['', ''], correct_answer: '', points: 10,
    });

    const addOption = () => setData('options', [...data.options, '']);
    const removeOption = (i: number) => { if (data.options.length > 2) setData('options', data.options.filter((_, idx) => idx !== i)); };
    const setOption = (i: number, v: string) => { const o = [...data.options]; o[i] = v; setData('options', o); };

    const [editingId, setEditingId] = React.useState<number | null>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(route('admin.formations.quiz.mettre-a-jour', [course.id, editingId]), {
                onSuccess: () => { setEditingId(null); reset(); },
            });
        } else {
            post(route('admin.formations.quiz.stocker', course.id), {
                onSuccess: () => reset(),
            });
        }
    };

    const editQuiz = (q: QuizItem) => {
        setEditingId(q.id);
        setData({ question: q.question, options: q.options, correct_answer: q.correct_answer, points: q.points });
    };

    const cancelEdit = () => { setEditingId(null); reset(); };

    return (
        <div className="w-full max-w-4xl space-y-6">
            <div className="flex items-center gap-3">
                <a href={route('admin.formations.cours')} className="text-admin-muted hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </a>
                <div>
                    <h1 className="text-xl font-bold text-white">Quiz : {course.titre}</h1>
                    <p className="text-admin-muted text-sm mt-0.5">Gérer les questions du module</p>
                </div>
            </div>

            <form onSubmit={submit} className="bg-admin-card rounded-xl border border-white/5 p-5 space-y-4">
                <h2 className="font-semibold text-white text-sm">{editingId ? 'Modifier' : 'Ajouter'} une question</h2>
                <div>
                    <label className="block text-sm text-admin-muted mb-1">Question *</label>
                    <input type="text" value={data.question} onChange={e => setData('question', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-container outline-none" />
                </div>
                <div>
                    <label className="block text-sm text-admin-muted mb-1">Réponses *</label>
                    <div className="space-y-2">
                        {data.options.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <input type="radio" name="correct"
                                    checked={data.correct_answer === opt}
                                    onChange={() => setData('correct_answer', opt)}
                                    className="text-primary-container" />
                                <input type="text" value={opt} onChange={e => setOption(i, e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:border-primary-container outline-none"
                                    placeholder={`Option ${i + 1}`} />
                                {data.options.length > 2 && (
                                    <button type="button" onClick={() => removeOption(i)}
                                        className="text-status-red-text hover:underline text-xs"
                                    ><Trash2 size={12} /></button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addOption}
                        className="text-xs text-status-blue-text hover:underline mt-2 flex items-center gap-1"
                    ><Plus size={10} /> Ajouter une option</button>
                </div>
                <div className="flex gap-4">
                    <div>
                        <label className="block text-sm text-admin-muted mb-1">Points</label>
                        <input type="number" min={1} value={data.points} onChange={e => setData('points', parseInt(e.target.value) || 10)}
                            className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-container outline-none" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button type="submit" disabled={processing}
                        className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                    ><Save size={14} /> {editingId ? 'Mettre à jour' : 'Ajouter'}</button>
                    {editingId && (
                        <button type="button" onClick={cancelEdit}
                            className="px-4 py-2 text-sm text-admin-muted hover:text-white"
                        >Annuler</button>
                    )}
                </div>
            </form>

            <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['Question', 'Réponses', 'Bonne réponse', 'Points', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {quizzes.map(q => (
                                <tr key={q.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 text-white">{q.question}</td>
                                    <td className="px-4 py-3 text-admin-muted">
                                        <div className="flex flex-wrap gap-1">
                                            {q.options.map((o, i) => (
                                                <span key={i} className="text-xs bg-white/5 px-2 py-0.5 rounded">{o}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-status-green-text font-mono text-xs">{q.correct_answer}</span>
                                    </td>
                                    <td className="px-4 py-3 text-admin-muted font-mono">{q.points}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => editQuiz(q)}
                                                className="text-status-yellow-text hover:underline text-xs"
                                            >Modifier</button>
                                            <button onClick={() => { if (confirm('Supprimer cette question ?')) destroy(route('admin.formations.quiz.supprimer', [course.id, q.id])); }}
                                                className="text-status-red-text hover:underline text-xs"
                                            >Suppr.</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {quizzes.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-8 text-admin-muted text-sm">Aucune question.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

Quizzes.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Gérer Quiz" breadcrumbs={[{ label: 'Formations', href: route('admin.formations.cours') }, { label: 'Quiz' }]}>
        {page}
    </BackOfficeLayout>
);