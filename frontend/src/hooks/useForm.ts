import { useState, useCallback } from 'react';
import api from '@/api/client';

interface FormState<T extends Record<string, unknown>> {
    data: T;
    errors: Partial<Record<keyof T, string>>;
    processing: boolean;
    recentlySuccessful: boolean;
    setData: <K extends keyof T>(key: K, value: T[K]) => void;
    setDataMulti: (values: Partial<T>) => void;
    setError: (key: keyof T, value: string) => void;
    reset: (...keys: Array<keyof T>) => void;
    clearErrors: (...keys: Array<keyof T>) => void;
    post: (url: string, opts?: SubmitOpts) => Promise<void>;
    put: (url: string, opts?: SubmitOpts) => Promise<void>;
    patch: (url: string, opts?: SubmitOpts) => Promise<void>;
    delete: (url: string, opts?: SubmitOpts) => Promise<void>;
}

type SubmitOpts = {
    onSuccess?: (data: unknown) => void;
    onError?: (e: unknown) => void;
    onFinish?: () => void;
};

export function useForm<T extends Record<string, unknown>>(initial?: T): FormState<T> {
    const [data, setDataState] = useState<T>((initial ?? {}) as T);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [processing, setProcessing] = useState(false);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

    const setData = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
        setDataState(prev => ({ ...prev, [key]: value }));
    }, []);

    const setDataMulti = useCallback((values: Partial<T>) => {
        setDataState(prev => ({ ...prev, ...values }));
    }, []);

    const setError = useCallback((key: keyof T, value: string) => {
        setErrors(prev => ({ ...prev, [key]: value }));
    }, []);

    const reset = useCallback((...keys: Array<keyof T>) => {
        if (keys.length === 0 && initial) {
            setDataState(initial as T);
        } else {
            setDataState(prev => {
                const next = { ...prev };
                keys.forEach(k => { if (initial) next[k] = initial[k]; });
                return next;
            });
        }
        setErrors({});
    }, [initial]);

    const clearErrors = useCallback((...keys: Array<keyof T>) => {
        if (keys.length === 0) {
            setErrors({});
        } else {
            setErrors(prev => {
                const next = { ...prev };
                keys.forEach(k => delete next[k]);
                return next;
            });
        }
    }, []);

    const submit = useCallback(async (
        method: 'post' | 'put' | 'patch' | 'delete',
        url: string,
        opts?: SubmitOpts,
    ) => {
        setProcessing(true);
        setErrors({});
        try {
            const { data: resData } = method === 'delete'
                ? await api.delete(url)
                : await api[method](url, data);
            setRecentlySuccessful(true);
            setTimeout(() => setRecentlySuccessful(false), 2000);
            opts?.onSuccess?.(resData);
        } catch (e: unknown) {
            const resp = (e as { response?: { data?: { errors?: Record<string, string[]> } } }).response?.data?.errors;
            if (resp) {
                setErrors(
                    Object.fromEntries(
                        Object.entries(resp).map(([k, v]) => [k, v[0]]),
                    ) as Partial<Record<keyof T, string>>,
                );
            }
            opts?.onError?.(e);
        } finally {
            setProcessing(false);
            opts?.onFinish?.();
        }
    }, [data]);

    return {
        data, errors, processing, recentlySuccessful,
        setData, setDataMulti, setError, reset, clearErrors,
        post: (url, opts) => submit('post', url, opts),
        put: (url, opts) => submit('put', url, opts),
        patch: (url, opts) => submit('patch', url, opts),
        delete: (url, opts) => submit('delete', url, opts),
    };
}
