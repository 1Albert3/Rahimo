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
            className="bg-white rounded-xl shadow-ambient p-12 text-center"
        >
            <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon size={28} className="text-on-surface-variant" />
            </div>
            <h3 className="font-semibold text-on-surface mb-1">{title}</h3>
            <p className="text-sm text-on-surface-variant mb-4">{message}</p>
            {action && (
                <button onClick={action.onClick}
                    className="bg-gradient-to-br from-primary to-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:from-primary hover:to-primary transition-colors shadow-ambient"
                >
                    {action.label}
                </button>
            )}
        </motion.div>
    );
}
