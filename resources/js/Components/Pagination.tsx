import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaginatedData } from '@/types';

interface Props<T> {
    data: PaginatedData<T>;
    preserveScroll?: boolean;
}

export default function Pagination<T>({ data, preserveScroll = true }: Props<T>) {
    if (data.last_page <= 1) return null;

    const go = (url: string | null) => {
        if (!url) return;
        router.visit(url, { preserveScroll });
    };

    return (
        <div className="flex items-center justify-center gap-1 mt-6">
            <button
                onClick={() => go(data.links[0]?.url ?? null)}
                disabled={data.current_page === 1}
                className="w-9 h-9 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft size={16} />
            </button>

            {data.links.slice(1, -1).map((link, i) => (
                <button
                    key={i}
                    onClick={() => go(link.url)}
                    disabled={!link.url}
                    className={cn(
                        'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                        link.active
                            ? 'bg-primary-container text-on-primary shadow-card'
                            : 'border border-outline-variant text-on-surface hover:bg-surface-container',
                    )}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}

            <button
                onClick={() => go(data.links[data.links.length - 1]?.url ?? null)}
                disabled={data.current_page === data.last_page}
                className="w-9 h-9 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
}
