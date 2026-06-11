import { useState, FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import GuestLayout from '@/Layouts/GuestLayout';
import api from '@/api/client';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';


export default function ResetPassword() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        token: params.get('token') ?? '',
        email: params.get('email') ?? '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [field]: e.target.value }));

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({});
        setProcessing(true);
        try {
            await api.post('/auth/reset-password', form);
            navigate('/login?reset=1', { replace: true });
        } catch (err: any) {
            setErrors(err.response?.data?.errors ?? { general: err.response?.data?.message ?? 'Erreur.' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <GuestLayout>
            <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 sm:p-8">
                    <h1 className="text-xl font-black text-slate-dark mb-6">Réinitialiser le mot de passe</h1>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput id="email" type="email" value={form.email} className="mt-1 block w-full" onChange={set('email')} />
                            <InputError message={errors.email} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="password" value="Nouveau mot de passe" />
                            <TextInput id="password" type="password" value={form.password} className="mt-1 block w-full" isFocused autoComplete="new-password" onChange={set('password')} />
                            <InputError message={errors.password} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Confirmer" />
                            <TextInput id="password_confirmation" type="password" value={form.password_confirmation} className="mt-1 block w-full" autoComplete="new-password" onChange={set('password_confirmation')} />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>
                        {errors.general && <p className="text-sm text-status-red-text">{errors.general}</p>}
                        <div className="flex justify-end pt-2">
                            <PrimaryButton disabled={processing}>{processing ? 'Réinitialisation...' : 'Réinitialiser'}</PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}
