
import { Bus, Home, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
    status: number;
}

const PAGES: Record<number, { title: string; message: string; icon: typeof Bus }> = {
    404: { title: 'Page introuvable', message: 'La page que vous cherchez n\'existe pas ou a été déplacée.', icon: Search },
    403: { title: 'Accès refusé', message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.', icon: Bus },
    500: { title: 'Erreur serveur', message: 'Une erreur est survenue. Veuillez réessayer plus tard.', icon: Bus },
};

export default function Error({ status }: Props) {
    const page = PAGES[status] ?? { title: 'Erreur', message: 'Une erreur est survenue.', icon: Bus };
    const Icon = page.icon;

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon size={36} className="text-primary" />
                </div>
                <h1 className="text-6xl font-black text-slate-dark mb-2">{status}</h1>
                <h2 className="text-2xl font-bold text-slate-dark mb-3">{page.title}</h2>
                <p className="text-on-surface-variant mb-8 leading-relaxed">{page.message}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/"
                        className="bg-primary text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors shadow-xl"
                    >
                        <Home size={16} /> Accueil
                    </Link>
                    <Link to="/voyages"
                        className="border text-slate-dark px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gris-surface transition-colors"
                    >
                        <Search size={16} /> Rechercher un voyage
                    </Link>
                </div>
            </div>
        </div>
    );
}
