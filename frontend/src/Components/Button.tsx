import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  asLink?: boolean;
};

export default function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all';
  const variantClass = variant === 'primary'
    ? '' // use inline style for primary to ensure token color
    : variant === 'secondary'
      ? 'bg-gray-100 text-slate-dark hover:bg-gray-200'
      : 'bg-transparent text-slate-dark hover:bg-gray-50';

  const style = variant === 'primary' ? { backgroundColor: 'var(--brand-red)', color: 'white' } : undefined;

  return (
    <button className={`${base} ${variantClass} ${className}`} style={style} {...props}>
      {children}
    </button>
  );
}
