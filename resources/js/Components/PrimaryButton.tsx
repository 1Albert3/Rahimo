import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-xl bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-on-primary transition duration-150 ease-in-out hover:bg-kinetic-red-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:brightness-90 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
