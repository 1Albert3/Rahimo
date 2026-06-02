import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

interface Props {
    icon?: typeof Inbox;
    title?: string;
    message?: string;
    action?: { label: string; onClick: () => void };
}

export default function EmptyState({
    icon: Icon = Inbox,
    title = 'Aucune donnée',
    message = 'Il n\'y a rien à afficher pour le moment.',
    action,
}: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-xl p-12 text-center"
        >
            <div className="w-16 h-16 bg-gris-surface rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon size={28} className="text-on-surface-variant" />
            </div>
            <h3 className="font-semibold text-slate-dark mb-1">{title}</h3>
            <p className="text-sm text-on-surface-variant mb-4">{message}</p>
            {action && (
                <button onClick={action.onClick}
                    className="bg-primary text-on-primary px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-kinetic-red-hover transition-colors shadow-sm"
                >
                    {action.label}
                </button>
            )}
        </motion.div>
    );
}
