import { usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PageProps } from '@/types';

export default function FlashToast() {
    const { flash } = usePage<PageProps>().props;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setVisible(true);
            const t = setTimeout(() => setVisible(false), 4000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    const isSuccess = !!flash?.success;
    const msg = flash?.success || flash?.error;
    const message = typeof msg === 'string' ? msg : typeof msg === 'object' && msg !== null ? (msg as Record<string, unknown>).message as string : '';

    return (
        <AnimatePresence>
            {visible && message && (
                <motion.div
                    initial={{ opacity: 0, y: -16, x: 16 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: -16, x: 16 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    className="fixed top-6 right-6 z-[9999] flex items-center gap-3 rounded-xl px-5 py-4 shadow-lg text-sm font-medium max-w-sm"
                    style={{
                        background: isSuccess ? '#F0FDF4' : '#FEF2F2',
                        border: `1px solid ${isSuccess ? '#86EFAC' : '#FECACA'}`,
                        color: isSuccess ? '#166534' : '#991B1B',
                    }}
                >
                    {isSuccess ? (
                        <CheckCircle size={18} className="shrink-0 text-status-green-text" />
                    ) : (
                        <XCircle size={18} className="shrink-0 text-status-red-text" />
                    )}
                    {message}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
