
import { motion } from 'framer-motion';
import { Book, BookOpen, CheckCircle, Clock, GraduationCap, Trophy } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';


interface CoursItem {
    id: number;
    titre: string;
    description: string;
    categorie: string;
    duree_minutes: number;
    difficulte: string;
    obligatoire: boolean;
    completed: boolean;
    score: number;
    progress: number;
    total_quizzes: number;
    passed_quizzes: number;
}

interface FormationsData {
    cours: CoursItem[];
    stats: { total: number; completed: number; obligatoires: number; score_moyen: number };
}

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

const CATEGORIES: Record<string, { label: string; color: string }> = {
    securite:   { label: 'Sécurité',     color: 'text-status-red-text' },
    reglement:  { label: 'Règlement',    color: 'text-status-yellow-text' },
    conduite:   { label: 'Conduite',     color: 'text-status-blue-text' },
    service:    { label: 'Service',      color: 'text-status-green-text' },
};

const DIFFICULTES: Record<string, string> = {
    debutant:     'Débutant',
    intermediaire:'Intermédiaire',
    avance:       'Avancé',
};

export default function Formations() {
    const { data, loading } = useApi<FormationsData>('/admin/formations');
    const { user } = useAuth();
    const isDriver = user?.role === 'chauffeur';
    const prefix = isDriver ? 'driver' : 'admin';
    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;
    const cours = data?.cours ?? [];
    const safeStats: any = data?.stats ?? {};
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-dark">Formations & E-Learning</h1>
                <p className="text-on-surface-variant text-sm mt-0.5">Modules de formation pour les chauffeurs et le personnel</p>
            </div>

            <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger} initial="initial" animate="animate">
                {[
                    { label: 'Total Modules',   val: safeStats.total ?? 0,     icon: Book,        color: 'text-slate-dark',      bg: 'bg-gris-surface' },
                    { label: 'Complétés',       val: safeStats.completed ?? 0, icon: CheckCircle,  color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
                    { label: 'Score Moyen',     val: `${safeStats.score_moyen ?? 0}%`, icon: Trophy, color: 'text-status-yellow-text',  bg: 'bg-status-yellow-bg/30' },
                    { label: 'Obligatoires',    val: safeStats.obligatoires ?? 0, icon: GraduationCap, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
                ].map((s) => {
                    const Icon = s.icon;
                    return (
                        <motion.div key={s.label} variants={fadeUp}
                            className="bg-white rounded-xl border border-outline p-4 flex items-center gap-3"
                        >
                            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                                <Icon size={18} className={s.color} />
                            </div>
                            <div>
                                <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
                                <p className="text-xs text-on-surface-variant">{s.label}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4" variants={stagger} initial="initial" animate="animate">
                {cours.map((c) => {
                    const cat = CATEGORIES[c.categorie] ?? { label: c.categorie, color: 'text-on-surface-variant' };
                    return (
                        <motion.div key={c.id} variants={fadeUp}>
                            <Link to={`/${prefix}/formations/${c.id}`}
                                className="block bg-white rounded-xl border border-outline p-5 hover:border-outline transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-xl ${c.completed ? 'bg-status-green-bg/30' : 'bg-gris-surface'} flex items-center justify-center shrink-0`}>
                                        {c.completed
                                            ? <CheckCircle size={20} className="text-status-green-text" />
                                            : <BookOpen size={20} className="text-on-surface-variant" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold uppercase ${cat.color}`}>{cat.label}</span>
                                            {c.obligatoire && (
                                                <span className="text-[9px] font-bold uppercase text-status-red-text bg-status-red-bg/30 px-1.5 py-0.5 rounded">Obligatoire</span>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-slate-dark text-sm mb-1">{c.titre}</h3>
                                        <p className="text-xs text-on-surface-variant line-clamp-2">{c.description}</p>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-on-surface-variant">
                                            <span className="flex items-center gap-1"><Clock size={11} /> {c.duree_minutes} min</span>
                                            <span>{DIFFICULTES[c.difficulte] ?? c.difficulte}</span>
                                            <span>{c.passed_quizzes}/{c.total_quizzes} quiz</span>
                                        </div>
                                        {c.progress > 0 && (
                                            <div className="mt-3">
                                                <div className="w-full h-1.5 bg-gris-surface rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary/10 rounded-full transition-all"
                                                        style={{ width: `${c.progress}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-on-surface-variant mt-1">{c.progress}% complété</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}

function FormationsLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const isDriver = user?.role === 'chauffeur';
    const homeRoute = isDriver ? '/driver/trips' : '/admin/dashboard';
    return (
        <BackOfficeLayout title="Formations" breadcrumbs={[{ label: 'Tableau de bord', href: homeRoute }, { label: 'Formations' }]}>
            {children}
        </BackOfficeLayout>
    );
}
