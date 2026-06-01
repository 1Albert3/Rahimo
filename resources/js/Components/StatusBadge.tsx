import { cn } from '@/lib/utils';

type Status = string;

const MAP: Record<string, { label: string; cls: string }> = {
    confirme:     { label: 'Confirmé',     cls: 'bg-status-green-bg text-status-green-text ring-1 ring-status-green-ring' },
    confirmed:    { label: 'Confirmé',     cls: 'bg-status-green-bg text-status-green-text ring-1 ring-status-green-ring' },
    en_attente:   { label: 'En attente',   cls: 'bg-status-yellow-bg text-status-yellow-text ring-1 ring-status-yellow-ring' },
    pending:      { label: 'En attente',   cls: 'bg-status-yellow-bg text-status-yellow-text ring-1 ring-status-yellow-ring' },
    annule:       { label: 'Annulé',       cls: 'bg-error-container text-on-error-container ring-1 ring-error/20' },
    cancelled:    { label: 'Annulé',       cls: 'bg-error-container text-on-error-container ring-1 ring-error/20' },
    utilise:      { label: 'Utilisé',      cls: 'bg-surface-container-high text-on-surface-variant ring-1 ring-outline/20' },
    completed:    { label: 'Terminé',      cls: 'bg-surface-container-high text-on-surface-variant ring-1 ring-outline/20' },
    enregistre:   { label: 'Enregistré',   cls: 'bg-tertiary-fixed text-on-tertiary-fixed ring-1 ring-tertiary/20' },
    en_transit:   { label: 'En transit',   cls: 'bg-status-yellow-bg text-status-yellow-text ring-1 ring-status-yellow-ring' },
    arrive:       { label: 'Arrivé',       cls: 'bg-status-green-bg text-status-green-text ring-1 ring-status-green-ring' },
    livre:        { label: 'Livré',        cls: 'bg-status-green-bg text-status-green-text ring-1 ring-status-green-ring' },
    actif:        { label: 'Actif',        cls: 'bg-status-green-bg text-status-green-text ring-1 ring-status-green-ring' },
    active:       { label: 'Actif',        cls: 'bg-status-green-bg text-status-green-text ring-1 ring-status-green-ring' },
    maintenance:  { label: 'Maintenance',  cls: 'bg-status-yellow-bg text-status-yellow-text ring-1 ring-status-yellow-ring' },
    hors_service: { label: 'Hors service', cls: 'bg-error-container text-on-error-container ring-1 ring-error/20' },
    out_of_service: { label: 'Hors service', cls: 'bg-error-container text-on-error-container ring-1 ring-error/20' },
    en_route:     { label: 'En route',     cls: 'bg-status-green-bg text-status-green-text ring-1 ring-status-green-ring' },
    in_progress:  { label: 'En cours',     cls: 'bg-tertiary-fixed text-on-tertiary-fixed ring-1 ring-tertiary/20' },
    retarde:      { label: 'Retardé',      cls: 'bg-status-yellow-bg text-status-yellow-text ring-1 ring-status-yellow-ring' },
    complet:      { label: 'Complet',      cls: 'bg-error-container text-on-error-container ring-1 ring-error/20' },
    scheduled:    { label: 'Planifié',     cls: 'bg-tertiary-fixed text-on-tertiary-fixed ring-1 ring-tertiary/20' },
    en_cours:     { label: 'En cours',     cls: 'bg-tertiary-fixed text-on-tertiary-fixed ring-1 ring-tertiary/20' },
    resolue:      { label: 'Résolue',      cls: 'bg-status-green-bg text-status-green-text ring-1 ring-status-green-ring' },
    fermee:       { label: 'Fermée',       cls: 'bg-surface-container-high text-on-surface-variant ring-1 ring-outline/20' },
    conge:        { label: 'En congé',     cls: 'bg-status-yellow-bg text-status-yellow-text ring-1 ring-status-yellow-ring' },
    suspendu:     { label: 'Suspendu',     cls: 'bg-error-container text-on-error-container ring-1 ring-error/20' },
    paid:         { label: 'Payé',         cls: 'bg-status-green-bg text-status-green-text ring-1 ring-status-green-ring' },
    refunded:     { label: 'Remboursé',    cls: 'bg-status-yellow-bg text-status-yellow-text ring-1 ring-status-yellow-ring' },
    open:         { label: 'Ouverte',      cls: 'bg-status-green-bg text-status-green-text ring-1 ring-status-green-ring' },
    closed:       { label: 'Fermée',       cls: 'bg-surface-container-high text-on-surface-variant ring-1 ring-outline/20' },
    approved:     { label: 'Approuvée',    cls: 'bg-status-green-bg text-status-green-text ring-1 ring-status-green-ring' },
    rejected:     { label: 'Rejetée',      cls: 'bg-error-container text-on-error-container ring-1 ring-error/20' },
    reconciled:   { label: 'Rapproché',    cls: 'bg-status-green-bg text-status-green-text ring-1 ring-status-green-ring' },
    discrepancy:  { label: 'Écart',        cls: 'bg-status-yellow-bg text-status-yellow-text ring-1 ring-status-yellow-ring' },
    termine:      { label: 'Terminé',      cls: 'bg-status-green-bg text-status-green-text ring-1 ring-status-green-ring' },
};

export default function StatusBadge({ status }: { status: Status }) {
    const config = MAP[status] ?? { label: status, cls: 'bg-status-slate-bg text-status-slate-text ring-1 ring-status-slate-ring' };
    return (
        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold', config.cls)}>
            {config.label}
        </span>
    );
}
