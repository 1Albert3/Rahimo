import { useForm, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Clock, Trophy, XCircle } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps } from '@/types';

interface QuizItem {
    id: number;
    question: string;
    options: string[];
    points: number;
    answered: boolean;
    correct: boolean | null;
    user_answer: string | null;
}

interface Props extends PageProps {
    cours: { id: number; titre: string; description: string; categorie: string; duree_minutes: number; contenu?: string; completed: boolean; score: number };
    quizzes: QuizItem[];
}

export default function FormationDetail({ cours, quizzes }: Props) {
    const { auth } = usePage<PageProps>().props;
    const isDriver = auth?.user?.role === 'chauffeur';
    const prefix = isDriver ? 'driver' : 'admin';
    const { data, setData, post, processing } = useForm({ answer: '' });

    const submitQuiz = (quizId: number) => {
        if (!data.answer) return;
        post(route(`${prefix}.formations.quiz`, { quiz: quizId }), {
            preserveScroll: true,
            onSuccess: () => setData('answer', ''),
        });
    };

    const answeredCount = quizzes.filter((q) => q.answered).length;
    const correctCount = quizzes.filter((q) => q.correct).length;

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href={route(`${prefix}.formations`)}
                    className="text-admin-muted hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-white">{cours.titre}</h1>
                    <p className="text-admin-muted text-sm">{cours.categorie} · {cours.duree_minutes} min</p>
                </div>
            </div>

            {cours.contenu && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-admin-card rounded-xl border border-white/5 p-6"
                >
                    <p className="text-admin-muted text-sm leading-relaxed whitespace-pre-line">{cours.contenu}</p>
                </motion.div>
            )}

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-admin-muted">
                    <Trophy size={14} />
                    <span>Score: <span className="text-white font-bold">{cours.score}%</span></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-admin-muted">
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
                        className="bg-admin-card rounded-xl border border-white/5 p-5"
                    >
                        <div className="flex items-start gap-3 mb-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                quiz.answered
                                    ? quiz.correct
                                        ? 'bg-status-green-bg/30 text-status-green-text'
                                        : 'bg-status-red-bg/30 text-status-red-text'
                                    : 'bg-white/5 text-admin-muted'
                            }`}>
                                {quiz.answered
                                    ? quiz.correct ? <CheckCircle size={16} /> : <XCircle size={16} />
                                    : i + 1
                                }
                            </div>
                            <div className="flex-1">
                                <p className="text-white text-sm font-medium mb-1">{quiz.question}</p>
                                <p className="text-[10px] text-admin-muted">{quiz.points} points</p>
                            </div>
                        </div>

                        {!quiz.answered ? (
                            <div className="space-y-2 ml-11">
                                {quiz.options.map((opt) => (
                                    <label key={opt}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                            data.answer === opt
                                                ? 'border-primary-container bg-primary/10 text-white'
                                                : 'border-white/10 text-admin-muted hover:border-white/20'
                                        }`}
                                    >
                                        <input type="radio" name={`quiz-${quiz.id}`} value={opt}
                                            checked={data.answer === opt}
                                            onChange={() => setData('answer', opt)}
                                            className="text-primary-container focus:ring-primary-container"
                                        />
                                        <span className="text-sm">{opt}</span>
                                    </label>
                                ))}
                                <button onClick={() => submitQuiz(quiz.id)} disabled={processing || !data.answer}
                                    className="bg-primary-container text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-primary transition-colors disabled:opacity-50 mt-2"
                                >
                                    Valider
                                </button>
                            </div>
                        ) : (
                            <div className={`ml-11 p-3 rounded-lg text-sm ${
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
    const { auth } = usePage<PageProps>().props;
    const isDriver = auth?.user?.role === 'chauffeur';
    const homeRoute = isDriver ? route('driver.trips') : route('admin.dashboard');
    const listRoute = isDriver ? route('driver.formations') : route('admin.formations');
    return (
        <BackOfficeLayout title="Détail Formation" breadcrumbs={[{ label: 'Tableau de bord', href: homeRoute }, { label: 'Formations', href: listRoute }, { label: 'Détail' }]}>
            {children}
        </BackOfficeLayout>
    );
}

FormationDetail.layout = (page: React.ReactNode) => <FormationDetailLayout>{page}</FormationDetailLayout>;
