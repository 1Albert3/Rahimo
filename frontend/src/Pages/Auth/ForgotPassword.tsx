import { useState, FormEvent } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import api from '@/api/client';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setError(''); setStatus('');
        setProcessing(true);
        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            setStatus(data.message ?? 'Un lien de réinitialisation a été envoyé.');
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Erreur lors de l\'envoi.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <GuestLayout>
            <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 sm:p-8">
                    <h1 className="text-xl font-black text-slate-dark mb-4">Mot de passe oublié</h1>
                    <p className="text-sm text-on-surface-variant mb-6">
                        Entrez votre email et nous vous enverrons un lien de réinitialisation.
                    </p>
                    {status && <div className="mb-4 text-sm font-medium text-status-green-text">{status}</div>}
                    <form onSubmit={submit} className="space-y-4">
                        <TextInput id="email" type="email" value={email} className="block w-full" isFocused
                            onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" />
                        <InputError message={error} />
                        <div className="flex justify-end">
                            <PrimaryButton disabled={processing}>{processing ? 'Envoi...' : 'Envoyer le lien'}</PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}
