import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaginatedData } from '@/types';

interface Props<T> {
    data: PaginatedData<T>;
    onPageChange?: (url: string) => void;
}

export default function Pagination<T>({ data, onPageChange }: Props<T>) {
    if (data.last_page <= 1) return null;

    const go = (url: string | null) => {
        if (!url) return;
        if (onPageChange) { onPageChange(url); return; }
        // Extract page param and navigate
        const p = new URL(url, window.location.origin).searchParams.get('page');
        if (p) {
            const params = new URLSearchParams(window.location.search);
            params.set('page', p);
            window.history.pushState({}, '', '?' + params.toString());
            window.dispatchEvent(new PopStateEvent('popstate'));
        }
    };

    return (
        <div className="flex items-center justify-center gap-1 mt-6">
            <button
                onClick={() => go(data.links[0]?.url ?? null)}
                disabled={data.current_page === 1}
                className="w-9 h-9 rounded-xl border border-outline flex items-center justify-center text-slate-dark hover:bg-gris-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft size={16} />
            </button>

            {data.links.slice(1, -1).map((link, i) => (
                <button
                    key={i}
                    onClick={() => go(link.url)}
                    disabled={!link.url}
                    className={cn(
                        'w-9 h-9 rounded-xl text-sm font-medium transition-colors',
                        link.active
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'border border-outline text-slate-dark hover:bg-gris-surface',
                    )}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}

            <button
                onClick={() => go(data.links[data.links.length - 1]?.url ?? null)}
                disabled={data.current_page === data.last_page}
                className="w-9 h-9 rounded-xl border border-outline flex items-center justify-center text-slate-dark hover:bg-gris-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
}
