import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-primary text-slate-dark focus:border-primary'
                    : 'border-transparent text-on-surface-variant hover:border-outline hover:text-slate-dark focus:border-outline focus:text-slate-dark') +
                className
            }
        >
            {children}
        </Link>
    );
}
