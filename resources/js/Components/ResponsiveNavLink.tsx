import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-primary bg-primary/10 text-primary focus:border-primary focus:bg-primary/10 focus:text-primary'
                    : 'border-transparent text-on-surface-variant hover:border-outline hover:bg-gris-surface hover:text-slate-dark focus:border-outline focus:bg-gris-surface focus:text-slate-dark'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
