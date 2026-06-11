import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus } from 'lucide-react';
import { login } from '@/api/auth';
import { useAuth } from '@/hooks/useAuth';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from 'react-router-dom';

export default function Login() {
    const { setUser } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const [processing, setProcessing] = useState(false);

    const ADMIN_ROLES = ['directeur_general','responsable_flotte','comptable','chef_garde','guichetiere','agent_police','bagagiste'];

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({});
        setProcessing(true);
        try {
            const { user } = await login(email, password);
            setUser(user);
            if (ADMIN_ROLES.includes(user.role)) navigate('/admin/dashboard', { replace: true });
            else if (user.role === 'chauffeur') navigate('/chauffeur/trajets', { replace: true });
            else navigate('/mon-espace', { replace: true });
        } catch (err: any) {
            const data = err.response?.data;
            if (data?.errors) setErrors(data.errors);
            else setErrors({ general: data?.message ?? 'Identifiants invalides.' });
            setPassword('');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <GuestLayout>
            <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-8 sm:py-12">
                <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 sm:p-8">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Bus size={28} className="text-white" />
                        </div>
                        <h1 className="text-xl font-black text-slate-dark">Rahimo Transport</h1>
                        <p className="text-sm text-on-surface-variant mt-1">Connectez-vous à votre espace</p>
                    </div>

                    {errors.general && (
                        <div className="mb-4 text-sm font-medium text-status-red-text bg-status-red-bg/30 px-4 py-3 rounded-lg">
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput id="email" type="email" value={email} className="mt-1.5 block w-full"
                                autoComplete="username" isFocused onChange={(e) => setEmail(e.target.value)} />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Mot de passe" />
                            <TextInput id="password" type="password" value={password} className="mt-1.5 block w-full"
                                autoComplete="current-password" onChange={(e) => setPassword(e.target.value)} />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                                    className="rounded border-gray-300 text-primary shadow-sm" />
                                <span className="text-sm text-on-surface-variant">Se souvenir de moi</span>
                            </label>
                            <Link to="/mot-de-passe-oublie" className="text-sm text-tertiary hover:text-tertiary-container underline">
                                Mot de passe oublié ?
                            </Link>
                        </div>

                        <PrimaryButton className="w-full justify-center" disabled={processing}>
                            {processing ? 'Connexion...' : 'Se connecter'}
                        </PrimaryButton>

                        <p className="text-center text-sm text-on-surface-variant">
                            Pas encore de compte ?{' '}
                            <Link to="/register" className="text-primary hover:brightness-110 font-semibold">S'inscrire</Link>
                        </p>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}
