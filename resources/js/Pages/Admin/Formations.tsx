import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Book, BookOpen, CheckCircle, Clock, GraduationCap, Trophy } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps } from '@/types';

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

interface Props extends PageProps { cours: CoursItem[]; stats: { total: number; completed: number; obligatoires: number; score_moyen: number }; }

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

export default function Formations({ cours, stats }: Props) {
    const { auth } = usePage<PageProps>().props;
    const isDriver = auth?.user?.role === 'chauffeur';
    const prefix = isDriver ? 'driver' : 'admin';
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Formations & E-Learning</h1>
                <p className="text-admin-muted text-sm mt-0.5">Modules de formation pour les chauffeurs et le personnel</p>
            </div>

            <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger} initial="initial" animate="animate">
                {[
                    { label: 'Total Modules',   val: stats.total,     icon: Book,        color: 'text-admin-text',      bg: 'bg-white/5' },
                    { label: 'Complétés',       val: stats.completed, icon: CheckCircle,  color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
                    { label: 'Score Moyen',     val: `${stats.score_moyen}%`, icon: Trophy, color: 'text-status-yellow-text',  bg: 'bg-status-yellow-bg/30' },
                    { label: 'Obligatoires',    val: stats.obligatoires, icon: GraduationCap, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
                ].map((s) => {
                    const Icon = s.icon;
                    return (
                        <motion.div key={s.label} variants={fadeUp}
                            className="bg-admin-card rounded-xl border border-white/5 p-4 flex items-center gap-3"
                        >
                            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                                <Icon size={18} className={s.color} />
                            </div>
                            <div>
                                <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
                                <p className="text-xs text-admin-muted">{s.label}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4" variants={stagger} initial="initial" animate="animate">
                {cours.map((c) => {
                    const cat = CATEGORIES[c.categorie] ?? { label: c.categorie, color: 'text-admin-muted' };
                    return (
                        <motion.div key={c.id} variants={fadeUp}>
                            <Link href={route(`${prefix}.formations.show`, { course: c.id })}
                                className="block bg-admin-card rounded-xl border border-white/5 p-5 hover:border-white/10 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-lg ${c.completed ? 'bg-status-green-bg/30' : 'bg-white/5'} flex items-center justify-center shrink-0`}>
                                        {c.completed
                                            ? <CheckCircle size={20} className="text-status-green-text" />
                                            : <BookOpen size={20} className="text-admin-muted" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold uppercase ${cat.color}`}>{cat.label}</span>
                                            {c.obligatoire && (
                                                <span className="text-[9px] font-bold uppercase text-status-red-text bg-status-red-bg/30 px-1.5 py-0.5 rounded">Obligatoire</span>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-white text-sm mb-1">{c.titre}</h3>
                                        <p className="text-xs text-admin-muted line-clamp-2">{c.description}</p>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-admin-muted">
                                            <span className="flex items-center gap-1"><Clock size={11} /> {c.duree_minutes} min</span>
                                            <span>{DIFFICULTES[c.difficulte] ?? c.difficulte}</span>
                                            <span>{c.passed_quizzes}/{c.total_quizzes} quiz</span>
                                        </div>
                                        {c.progress > 0 && (
                                            <div className="mt-3">
                                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary-container rounded-full transition-all"
                                                        style={{ width: `${c.progress}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-admin-muted mt-1">{c.progress}% complété</p>
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
    const { auth } = usePage<PageProps>().props;
    const isDriver = auth?.user?.role === 'chauffeur';
    const homeRoute = isDriver ? route('driver.trips') : route('admin.dashboard');
    return (
        <BackOfficeLayout title="Formations" breadcrumbs={[{ label: 'Tableau de bord', href: homeRoute }, { label: 'Formations' }]}>
            {children}
        </BackOfficeLayout>
    );
}

Formations.layout = (page: React.ReactNode) => <FormationsLayout>{page}</FormationsLayout>;
