import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';

import { FormEventHandler } from 'react';
import { useForm } from '@/hooks/useForm';
import { useAuth } from '@/hooks/useAuth';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const { user } = useAuth();
    const userName = (user as { name?: string })?.name ?? '';
    const userEmail = (user as { email?: string })?.email ?? '';

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: userName,
            email: userEmail,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch('/profile');
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-slate-dark">
                    Profile Information
                </h2>

                <p className="mt-1 text-sm text-on-surface-variant">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && (user as { email_verified_at?: string | null })?.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-slate-dark">
                            Your email address is unverified.
                            <form
                                method="POST"
                                action="/email/verification-notification"
                                className="inline"
                            >
                                <button
                                    type="submit"
                                    className="rounded-md text-sm text-on-surface-variant underline hover:text-slate-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                >
                                    Click here to re-send the verification email.
                                </button>
                            </form>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-status-green-text">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-on-surface-variant">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
