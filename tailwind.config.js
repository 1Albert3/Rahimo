import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                // ── Charte simplifiée Rahimo Transport ──
                'primary':          '#E60000',
                'on-primary':       '#FFFFFF',
                'kinetic-red':      '#E60000',
                'kinetic-red-hover':'#C20000',

                'sahel-yellow':     '#FFD700',
                'on-sahel-yellow':  '#1E293B',

                'deep-black':       '#000000',
                'slate-dark':       '#0F172A',
                'gris-surface':     '#F9F9F9',
                'background':       '#FFFFFF',
                'on-background':    '#475569',
                'surface':          '#FFFFFF',
                'on-surface':       '#475569',
                'surface-variant':  '#F9F9F9',
                'on-surface-variant': '#64748B',
                'outline':          '#F1F5F9',
                'outline-variant':  '#E2E8F0',
                'inverse-surface':  '#1E293B',
                'inverse-on-surface': '#FFFFFF',

                'error':            '#E60000',
                'on-error':         '#FFFFFF',

                status: {
                    'green-bg':   '#F0FDF4',
                    'green-text': '#166534',
                    'green-ring': '#86EFAC',
                    'yellow-bg':  '#FEFCE8',
                    'yellow-text':'#854D0E',
                    'yellow-ring':'#FDE68A',
                    'red-bg':     '#FEF2F2',
                    'red-text':   '#DC2626',
                    'red-ring':   '#FECACA',
                    'blue-bg':    '#EFF6FF',
                    'blue-text':  '#1E40AF',
                    'blue-ring':  '#BFDBFE',
                    'slate-bg':   '#F8FAFC',
                    'slate-text': '#475569',
                    'slate-ring': '#CBD5E1',
                },

                'admin': {
                    'bg':     '#0F172A',
                    'card':   '#1E293B',
                    'border': '#334155',
                    'text':   '#E2E8F0',
                    'muted':  '#64748B',
                },
            },
            borderRadius: {
                md:      '6px',
                lg:      '8px',
                xl:      '12px',
                full:    '9999px',
            },
            boxShadow: {
                sm:    '0 1px 2px rgba(0,0,0,0.05)',
                md:    '0 4px 6px rgba(0,0,0,0.05)',
                lg:    '0 10px 15px rgba(0,0,0,0.05)',
                xl:    '0 20px 40px rgba(0,0,0,0.08)',
            },
        },
    },
    plugins: [forms],
};
