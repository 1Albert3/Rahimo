import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';

import { FormEventHandler } from 'react';
import { useForm } from '@/hooks/useForm';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/email/verification-notification');
    };

    document.title = 'Email Verification';
    return (
        <GuestLayout>

            <div className="mb-4 text-sm text-on-surface-variant">
                Thanks for signing up! Before getting started, could you verify
                your email address by clicking on the link we just emailed to
                you? If you didn't receive the email, we will gladly send you
                another.
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-medium text-status-green-text">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between">
                    <PrimaryButton disabled={processing}>
                        Resend Verification Email
                    </PrimaryButton>

                    <form method="POST" action="/logout">
                        <button
                            type="submit"
                            className="rounded-md text-sm text-on-surface-variant underline hover:text-slate-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                            Log Out
                        </button>
                    </form>
                </div>
            </form>
        </GuestLayout>
    );
}
