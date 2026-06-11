import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 24, className = '' }: { size?: number; className?: string }) {
    return (
        <div className={`flex items-center justify-center py-12 ${className}`}>
            <Loader2 size={size} className="animate-spin text-primary" />
        </div>
    );
}
