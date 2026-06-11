import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '@/api/auth';
import { useAuth } from '@/hooks/useAuth';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from 'react-router-dom';

export default function Register() {
    const { setUser } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [field]: e.target.value }));

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({});
        setProcessing(true);
        try {
            const { user } = await register(form);
            setUser(user);
            navigate('/mon-espace', { replace: true });
        } catch (err: any) {
            const data = err.response?.data;
            setErrors(data?.errors ?? { general: data?.message ?? 'Erreur lors de l\'inscription.' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <GuestLayout>
            <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-8 sm:py-12">
                <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 sm:p-8">
                    <h1 className="text-xl font-black text-slate-dark text-center mb-6">Créer un compte</h1>

                    {errors.general && (
                        <div className="mb-4 text-sm text-status-red-text bg-status-red-bg/30 px-4 py-3 rounded-lg">{errors.general}</div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nom complet" />
                            <TextInput id="name" value={form.name} className="mt-1 block w-full" isFocused autoComplete="name" onChange={set('name')} required />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput id="email" type="email" value={form.email} className="mt-1 block w-full" autoComplete="username" onChange={set('email')} required />
                            <InputError message={errors.email} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="password" value="Mot de passe" />
                            <TextInput id="password" type="password" value={form.password} className="mt-1 block w-full" autoComplete="new-password" onChange={set('password')} required />
                            <InputError message={errors.password} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Confirmer le mot de passe" />
                            <TextInput id="password_confirmation" type="password" value={form.password_confirmation} className="mt-1 block w-full" autoComplete="new-password" onChange={set('password_confirmation')} required />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <Link to="/login" className="text-sm text-on-surface-variant underline hover:text-slate-dark">Déjà inscrit ?</Link>
                            <PrimaryButton disabled={processing}>{processing ? 'Inscription...' : 'S\'inscrire'}</PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}
