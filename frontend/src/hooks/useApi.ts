import { useEffect, useState, useCallback } from 'react';
import api from '@/api/client';

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useApi<T>(url: string | null, defaultValue?: T): UseApiState<T> {
    const [data, setData] = useState<T | null>(defaultValue ?? null);
    const [loading, setLoading] = useState(!!url);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(() => {
        if (!url) return;
        setLoading(true);
        api.get(url)
            .then(res => { setData(res.data); setError(null); })
            .catch(err => setError(err.response?.data?.message ?? 'Erreur'))
            .finally(() => setLoading(false));
    }, [url]);

    useEffect(() => { fetch(); }, [fetch]);

    return { data, loading, error, refetch: fetch };
}
