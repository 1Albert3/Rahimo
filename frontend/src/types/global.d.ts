import { AxiosInstance } from 'axios';
import type { User } from '@/types';

declare global {
    interface Window {
        axios: AxiosInstance;
    }

    // route() shim global — fourni par inertia-shims
    function route(name: string, params?: unknown): string;

    // Compatibilité shim Inertia : PageProps disponible globalement dans toutes les pages
    interface PageProps {
        auth?: { user?: User | null };
        flash?: { success?: string; error?: string };
        [key: string]: unknown;
    }
}

export {};
