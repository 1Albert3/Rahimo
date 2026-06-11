
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Clock, Trophy, XCircle } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { useForm } from '@/hooks/useForm';
import { useAuth } from '@/hooks/useAuth';
import { Link, useParams } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { storeQuiz } from '@/api/admin';

interface QuizItem {
    id: number;
    question: string;
    options: string[];
    points: number;
    answered: boolean;
    correct: boolean | null;
    user_answer: string | null;
}

interface FormationDetailData {
    cours: { id: number; titre: string; description: string; categorie: string; duree_minutes: number; contenu?: string; completed: boolean; score: number };
    quizzes: QuizItem[];
}

export default function FormationDetail() {
    const { id } = useParams<{ id: string }>();
    const { data, loading } = useApi<FormationDetailData>(`/admin/formations/${id}`);

    const cours = data?.cours ?? ({} as any);
    const quizzes = data?.quizzes ?? [];
    const { user } = useAuth();
    const isDriver = user?.role === 'chauffeur';
    const prefix = isDriver ? 'driver' : 'admin';
    const { data: formData, setData, processing } = useForm({ answer: '' });

    const submitQuiz = async (quizId: number) => {
        if (!formData.answer) return;
        try {
            await storeQuiz(quizId, { answer: formData.answer });
            setData('answer', '');
        } catch {}
    };

    const answeredCount = quizzes.filter((q) => q.answered).length;
    const correctCount = quizzes.filter((q) => q.correct).length;

    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;
    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link to={`/${prefix}/formations`}
                    className="text-on-surface-variant hover:text-slate-dark transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-dark">{cours.titre}</h1>
                    <p className="text-on-surface-variant text-sm">{cours.categorie} · {cours.duree_minutes} min</p>
                </div>
            </div>

            {cours.contenu && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-outline p-6"
                >
                    <p className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-line">{cours.contenu}</p>
                </motion.div>
            )}

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <Trophy size={14} />
                    <span>Score: <span className="text-slate-dark font-bold">{cours.score}%</span></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <CheckCircle size={14} />
                    <span>{correctCount}/{quizzes.length} correctes</span>
                </div>
                {cours.completed && (
                    <span className="flex items-center gap-1 text-xs text-status-green-text font-bold">
                        <CheckCircle size={14} /> Complété
                    </span>
                )}
            </div>

            <motion.div className="space-y-4" initial="initial" animate="animate">
                {quizzes.map((quiz, i) => (
                    <motion.div key={quiz.id}
                        className="bg-white rounded-xl border border-outline p-5"
                    >
                        <div className="flex items-start gap-3 mb-4">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                                quiz.answered
                                    ? quiz.correct
                                        ? 'bg-status-green-bg/30 text-status-green-text'
                                        : 'bg-status-red-bg/30 text-status-red-text'
                                    : 'bg-gris-surface text-on-surface-variant'
                            }`}>
                                {quiz.answered
                                    ? quiz.correct ? <CheckCircle size={16} /> : <XCircle size={16} />
                                    : i + 1
                                }
                            </div>
                            <div className="flex-1">
                                <p className="text-slate-dark text-sm font-medium mb-1">{quiz.question}</p>
                                <p className="text-[10px] text-on-surface-variant">{quiz.points} points</p>
                            </div>
                        </div>

                        {!quiz.answered ? (
                            <div className="space-y-2 ml-11">
                                {quiz.options.map((opt) => (
                                    <label key={opt}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                            formData.answer === opt
                                                ? 'border-primary-container bg-primary/10 text-slate-dark'
                                                : 'border-outline text-on-surface-variant hover:border-white/20'
                                        }`}
                                    >
                                        <input type="radio" name={`quiz-${quiz.id}`} value={opt}
                                            checked={formData.answer === opt}
                                            onChange={() => setData('answer', opt)}
                                            className="text-primary focus:ring-primary-container"
                                        />
                                        <span className="text-sm">{opt}</span>
                                    </label>
                                ))}
                                <button onClick={() => submitQuiz(quiz.id)} disabled={processing || !formData.answer}
                                    className="bg-primary/10 text-on-primary px-5 py-2 rounded-xl font-semibold text-sm hover:bg-primary transition-colors disabled:opacity-50 mt-2"
                                >
                                    Valider
                                </button>
                            </div>
                        ) : (
                            <div className={`ml-11 p-3 rounded-xl text-sm ${
                                quiz.correct
                                    ? 'bg-status-green-bg/20 text-status-green-text border border-status-green-ring'
                                    : 'bg-status-red-bg/20 text-status-red-text border border-status-red-ring'
                            }`}>
                                {quiz.correct
                                    ? 'Bonne réponse !'
                                    : `Mauvaise réponse. Votre réponse: "${quiz.user_answer}"`
                                }
                            </div>
                        )}
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}

function FormationDetailLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const isDriver = user?.role === 'chauffeur';
    const homeRoute = isDriver ? '/driver/trips' : '/admin/dashboard';
    const listRoute = isDriver ? '/driver/formations' : '/admin/formations';
    return (
        <BackOfficeLayout title="Détail Formation" breadcrumbs={[{ label: 'Tableau de bord', href: homeRoute }, { label: 'Formations', href: listRoute }, { label: 'Détail' }]}>
            {children}
        </BackOfficeLayout>
    );
}
