import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <AlertTriangle size={40} className="text-status-red-text mb-4" />
                    <h2 className="text-lg font-bold text-slate-dark mb-2">Une erreur est survenue</h2>
                    <p className="text-on-surface-variant text-sm mb-4 max-w-md">
                        {this.state.error?.message ?? 'Erreur inconnue'}
                    </p>
                    <button onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover"
                    ><RefreshCw size={14} /> Réessayer</button>
                </div>
            );
        }
        return this.props.children;
    }
}
