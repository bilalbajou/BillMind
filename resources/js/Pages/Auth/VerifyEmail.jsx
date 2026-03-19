import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center font-sans bg-[#F9FAFB] selection:bg-indigo-100 selection:text-indigo-900 relative p-6">
            <Head title="Email Verification" />

            {/* Faint dot grid pattern background */}
            <div 
                className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}
            ></div>

            {/* Center Card */}
            <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100 p-8 sm:p-10 relative z-10 text-center">
                
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2 group text-indigo-600">
                        <div className="p-1 rounded-2xl shadow-sm">
                            <img src="/logo.png" alt="BillMind" className="h-24 w-auto object-contain" />
                        </div>
                    </Link>
                </div>

                {/* Mail Icon */}
                <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-indigo-50/50 relative">
                    <svg className="w-7 h-7 text-[#4F46E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {/* Small Check badge */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                </div>

                {/* Titles */}
                <div className="mb-8">
                    <h2 className="text-[22px] font-bold text-[#0f172a] mb-2 tracking-tight">Verify your email</h2>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed px-2">
                        Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you?
                    </p>
                </div>

                {status === 'verification-link-sent' && (
                    <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-sm font-medium text-emerald-600 border border-emerald-100 flex items-start text-left gap-3">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                        A new verification link has been sent to the email address you provided during registration.
                    </div>
                )}

                <form onSubmit={submit} className="flex flex-col gap-4">
                    {/* Resend Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3 sm:py-3.5 px-4 bg-[#4F46E5] text-white text-[15px] font-bold rounded-xl hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group shadow-sm"
                    >
                        Resend Verification Email
                    </button>
                    
                    {/* Log Out */}
                    <div className="mt-2 text-center">
                        <Link 
                            href={route('logout')} 
                            method="post" 
                            as="button"
                            className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors underline-offset-4 hover:underline"
                        >
                            Log Out
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
