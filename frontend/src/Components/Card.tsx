import React from 'react';

type CardProps = {
    title: string;
    description?: string;
    children?: React.ReactNode;
    className?: string;
}

export default function Card({ title, description, children, className = '' }: CardProps) {
    const base = 'bg-white p-5 sm:p-6 rounded-xl shadow-card';
    return (
        <div className={`${base} ${className}`}>
            <h3 className="text-lg font-bold text-slate-dark mb-2">{title}</h3>
            {description && <p className="text-on-surface-variant mb-3">{description}</p>}
            {children}
        </div>
    );
}
