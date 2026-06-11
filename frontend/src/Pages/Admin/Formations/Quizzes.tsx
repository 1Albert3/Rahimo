import React from 'react';

import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { useForm } from '@/hooks/useForm';
import { useParams } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { storeQuiz } from '@/api/admin';
import api from '@/api/client';

interface QuizItem {
    id: number; question: string; options: string[];
    correct_answer: string; points: number;
}

interface QuizzesData {
    course: { id: number; titre: string };
    quizzes: QuizItem[];
}

export default function Quizzes() {
    const { id } = useParams<{ id: string }>();
    const { data, loading } = useApi<QuizzesData>(`/admin/formations/${id}/quizzes`);

    const course = data?.course ?? ({} as any);
    const quizzes = data?.quizzes ?? [];
    const { data: inputData, setData, setDataMulti, post, put, delete: destroy, processing, reset } = useForm({
        question: '', options: ['', ''], correct_answer: '', points: 10,
    });

    const addOption = () => setData('options', [...inputData.options, '']);
    const removeOption = (i: number) => { if (inputData.options.length > 2) setData('options', inputData.options.filter((_, idx) => idx !== i)); };
    const setOption = (i: number, v: string) => { const o = [...inputData.options]; o[i] = v; setData('options', o); };

    const [editingId, setEditingId] = React.useState<number | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            await api.put(`/admin/formations/${course.id}/quiz/${editingId}`, inputData as Record<string, unknown>);
            setEditingId(null);
            reset();
        } else {
            await storeQuiz(course.id, inputData as Record<string, unknown>);
            reset();
        }
    };

    const editQuiz = (q: QuizItem) => {
        setEditingId(q.id);
        setDataMulti({ question: q.question, options: q.options, correct_answer: q.correct_answer, points: q.points });
    };

    const cancelEdit = () => { setEditingId(null); reset(); };

    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;
    return (
        <div className="w-full max-w-4xl space-y-6">
            <div className="flex items-center gap-3">
                <a href="/admin/formations" className="text-on-surface-variant hover:text-slate-dark transition-colors">
                    <ArrowLeft size={20} />
                </a>
                <div>
                    <h1 className="text-xl font-bold text-slate-dark">Quiz : {course.titre}</h1>
                    <p className="text-on-surface-variant text-sm mt-0.5">Gérer les questions du module</p>
                </div>
            </div>

            <form onSubmit={submit} className="bg-white rounded-xl border border-outline p-5 space-y-4">
                <h2 className="font-semibold text-slate-dark text-sm">{editingId ? 'Modifier' : 'Ajouter'} une question</h2>
                <div>
                    <label className="block text-sm text-on-surface-variant mb-1">Question *</label>
                    <input type="text" value={inputData.question} onChange={e => setData('question', e.target.value)}
                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                    <label className="block text-sm text-on-surface-variant mb-1">Réponses *</label>
                    <div className="space-y-2">
                        {inputData.options.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <input type="radio" name="correct"
                                    checked={inputData.correct_answer === opt}
                                    onChange={() => setData('correct_answer', opt)}
                                    className="text-primary" />
                                <input type="text" value={opt} onChange={e => setOption(i, e.target.value)}
                                    className="flex-1 bg-gris-surface border border-outline rounded-xl px-3 py-1.5 text-slate-dark text-sm focus:outline-none focus:border-primary transition-colors"
                                    placeholder={`Option ${i + 1}`} />
                                {inputData.options.length > 2 && (
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
                        <label className="block text-sm text-on-surface-variant mb-1">Points</label>
                        <input type="number" min={1} value={inputData.points} onChange={e => setData('points', parseInt(e.target.value) || 10)}
                            className="w-20 bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary transition-colors" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button type="submit" disabled={processing}
                        className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                    ><Save size={14} /> {editingId ? 'Mettre à jour' : 'Ajouter'}</button>
                    {editingId && (
                        <button type="button" onClick={cancelEdit}
                            className="px-4 py-2 text-sm text-on-surface-variant hover:text-slate-dark"
                        >Annuler</button>
                    )}
                </div>
            </form>

            <div className="bg-white rounded-xl border border-outline overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                            <tr>
                                {['Question', 'Réponses', 'Bonne réponse', 'Points', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {quizzes.map(q => (
                                <tr key={q.id} className="hover:bg-gris-surface transition-colors">
                                    <td className="px-4 py-3 text-slate-dark">{q.question}</td>
                                    <td className="px-4 py-3 text-on-surface-variant">
                                        <div className="flex flex-wrap gap-1">
                                            {q.options.map((o, i) => (
                                                <span key={i} className="text-xs bg-gris-surface px-2 py-0.5 rounded">{o}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-status-green-text font-mono text-xs">{q.correct_answer}</span>
                                    </td>
                                    <td className="px-4 py-3 text-on-surface-variant font-mono">{q.points}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => editQuiz(q)}
                                                className="text-status-yellow-text hover:underline text-xs"
                                            >Modifier</button>
                                                <button onClick={() => { if (confirm('Supprimer cette question ?')) { api.delete(`/admin/formations/${course.id}/quiz/${q.id}`); } }}
                                                className="text-status-red-text hover:underline text-xs"
                                            >Suppr.</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {quizzes.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-8 text-on-surface-variant text-sm">Aucune question.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
