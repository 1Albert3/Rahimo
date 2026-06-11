import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ToastState { message: string; type: 'success' | 'error' }
interface ToastContextType { toast: (message: string, type?: 'success' | 'error') => void }

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [current, setCurrent] = useState<ToastState | null>(null);

    const toast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setCurrent({ message, type });
        setTimeout(() => setCurrent(null), 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <AnimatePresence>
                {current && (
                    <motion.div
                        initial={{ opacity: 0, y: -16, x: 16 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: -16, x: 16 }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                        className="fixed top-6 right-6 z-[9999] flex items-center gap-3 rounded-xl px-5 py-4 shadow-lg text-sm font-medium max-w-sm"
                        style={{
                            background: current.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                            border: `1px solid ${current.type === 'success' ? '#86EFAC' : '#FECACA'}`,
                            color: current.type === 'success' ? '#166534' : '#991B1B',
                        }}
                    >
                        {current.type === 'success'
                            ? <CheckCircle size={18} className="shrink-0 text-status-green-text" />
                            : <XCircle size={18} className="shrink-0 text-status-red-text" />}
                        {current.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

export default function FlashToast() { return null; }
