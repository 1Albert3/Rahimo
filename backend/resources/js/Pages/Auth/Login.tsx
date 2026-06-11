import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Bus } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Connexion" />

            <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-8 sm:py-12">
                <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 sm:p-8">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Bus size={28} className="text-white" />
                        </div>
                        <h1 className="text-xl font-black text-slate-dark">Rahimo Transport</h1>
                        <p className="text-sm text-on-surface-variant mt-1">Connectez-vous à votre espace</p>
                    </div>

                    {status && (
                        <div className="mb-4 text-sm font-medium text-status-green-text bg-status-green-bg/30 px-4 py-3 rounded-lg">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1.5 block w-full"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Mot de passe" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1.5 block w-full"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData(
                                            'remember',
                                            (e.target.checked || false) as false,
                                        )
                                    }
                                />
                                <span className="text-sm text-on-surface-variant">Se souvenir de moi</span>
                            </label>

                            {canResetPassword && (
                                <Link href={route('password.request')} className="text-sm text-tertiary hover:text-tertiary-container underline">
                                    Mot de passe oublié ?
                                </Link>
                            )}
                        </div>

                        <PrimaryButton className="w-full justify-center" disabled={processing}>
                            {processing ? 'Connexion...' : 'Se connecter'}
                        </PrimaryButton>

                        <p className="text-center text-sm text-on-surface-variant">
                            Pas encore de compte ?{' '}
                            <Link href={route('register')} className="text-primary hover:brightness-110 font-semibold">
                                S'inscrire
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}
