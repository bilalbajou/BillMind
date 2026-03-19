import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (status && !canResend) {
            if (timeLeft > 0) {
                const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
                return () => clearTimeout(timerId);
            } else {
                setCanResend(true);
            }
        }
    }, [status, timeLeft, canResend]);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'), {
            onSuccess: () => {
                setTimeLeft(60);
                setCanResend(false);
            }
        });
    };

    const resendEmail = () => {
        post(route('password.email'), {
            onSuccess: () => {
                setTimeLeft(60);
                setCanResend(false);
            }
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center font-sans bg-[#F9FAFB] selection:bg-indigo-100 selection:text-indigo-900 relative p-6">
            <Head title="Forgot Password" />

            {/* Faint dot grid pattern background */}
            <div 
                className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}
            ></div>

            {/* Center Card */}
            <div className={`w-full ${status ? 'max-w-[440px]' : 'max-w-[420px]'} bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100 p-8 sm:p-10 relative z-10 transition-all duration-500`}>
                
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-[#4F46E5] p-2 rounded-xl group-hover:bg-indigo-700 transition-colors shadow-sm">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-[#0f172a]">BillMind</span>
                    </Link>
                </div>

                {!status ? (
                    // ----------------------------------------
                    // DEFAULT FORGOT PASSWORD FORM
                    // ----------------------------------------
                    <>
                        {/* Lock Icon */}
                        <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-indigo-50/50 relative">
                            <svg className="w-7 h-7 text-[#4F46E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11V7" />
                            </svg>
                            {/* Small Question mark badge */}
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#4F46E5] rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                                <span className="text-white text-xs font-bold leading-none">?</span>
                            </div>
                        </div>

                        {/* Titles */}
                        <div className="text-center mb-8">
                            <h2 className="text-[22px] font-bold text-[#0f172a] mb-2 tracking-tight">Forgot your password?</h2>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed px-2">Enter your email and we'll send you a reset link.</p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within/input:text-[#4F46E5] transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-3 bg-gray-50/50 border ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5]/20'} rounded-xl text-sm transition-all focus:bg-white shadow-sm outline-none`}
                                        placeholder="your@email.com"
                                        autoFocus
                                        required
                                    />
                                </div>
                                {errors.email && <p className="mt-1.5 text-xs text-red-500 font-medium px-1">{errors.email}</p>}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 px-4 bg-[#4F46E5] text-white text-[15px] font-bold rounded-xl hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group shadow-sm"
                            >
                                Send Reset Link
                                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </form>
                    </>
                ) : (
                    // ----------------------------------------
                    // SUCCESS: CHECK YOUR EMAIL
                    // ----------------------------------------
                    <div className="text-center animate-in fade-in zoom-in duration-300">
                        {/* Animated Envelope Illustration */}
                        <div className="relative w-24 h-24 mx-auto mb-8">
                            <div className="absolute inset-0 bg-sky-100 rounded-full animate-pulse opacity-60"></div>
                            <div className="absolute inset-2 bg-indigo-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                                <svg className="w-10 h-10 text-[#4F46E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            {/* Sparkles */}
                            <div className="absolute top-1 right-2 w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce"></div>
                            <div className="absolute bottom-3 left-1 w-2 h-2 bg-indigo-400 rounded-full animate-ping opacity-75"></div>
                            <div className="absolute top-6 -left-1 w-3 h-3 bg-indigo-200 rounded-full"></div>
                        </div>

                        <h2 className="text-[26px] font-bold text-[#0f172a] mb-3 tracking-tight">Check your inbox</h2>
                        <p className="text-[15px] text-gray-500 font-medium leading-relaxed mb-8 px-2">
                            We sent a password reset link to <span className="font-bold text-gray-800">{data.email || 'your email address'}</span>. The link expires in 24 hours.
                        </p>

                        <div className="space-y-3 mb-8">
                            <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" className="w-full py-3 px-4 border-2 border-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all flex items-center justify-center gap-3">
                                {/* Gmail Logo */}
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#EA4335" d="M2.2 6.8c.2-.2.5-.2.8 0l9 6.8 9-6.8c.3-.2.6-.2.8 0 .2.2.3.4.3.7v10.1c0 .7-.6 1.3-1.3 1.3H18V10.2l-6 4.6-6-4.6v8.4H3.1c-.7 0-1.3-.6-1.3-1.3V7.5c0-.3.1-.5.4-.7z"/>
                                    <path fill="#FBBC04" d="M18 10.2v8.4h2.8c.7 0 1.3-.6 1.3-1.3V7.5l-4.1 2.7z"/>
                                    <path fill="#4285F4" d="M12 14.8l6-4.6V7.5L12 12l-6-4.5v2.7l6 4.6z"/>
                                    <path fill="#34A853" d="M6 10.2v8.4H3.1c-.7 0-1.3-.6-1.3-1.3V7.5l4.2 2.7z"/>
                                </svg>
                                Open Gmail
                            </a>
                            <a href="https://outlook.live.com" target="_blank" rel="noopener noreferrer" className="w-full py-3 px-4 border-2 border-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all flex items-center justify-center gap-3">
                                {/* Outlook Logo */}
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#0078D4" d="M13 3l-8.5 2.5v13.2l8.5 2.5V3z" />
                                    <path fill="#28A8EA" d="M21 5.3L13 3v18.2l8-2V5.3z" />
                                    <path fill="#FFF" d="M9.1 7.2c.4 0 .7.1 1.1.2v1.6c-.3-.1-.5-.2-.8-.2-.5 0-.7.3-.7 1s.3 1 .8 1c.3 0 .6-.1.8-.2v1.6c-.3.1-.6.2-1.1.2-.9 0-1.6-.3-2.1-.8-.5-.5-.8-1.2-.8-2s.3-1.5.8-2c.5-.4 1.1-.6 2-.6zm3.3.2h1.6v6H12v-6h.4z"/>
                                </svg>
                                Open Outlook
                            </a>
                        </div>

                        {/* Divider */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                        </div>

                        <div className="text-sm text-gray-500 font-medium mb-3">
                            Didn't receive the email?
                        </div>
                        
                        {canResend ? (
                            <button 
                                type="button" 
                                onClick={resendEmail}
                                disabled={processing} 
                                className="text-[#4F46E5] font-bold hover:text-indigo-600 transition-colors flex items-center justify-center gap-1.5 mx-auto outline-none"
                            >
                                <svg className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Resend email
                            </button>
                        ) : (
                            <div className="text-xs font-bold text-gray-400 bg-gray-50 inline-block px-3 py-1.5 rounded-full border border-gray-100">
                                Resend available in {timeLeft}s
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Form Actions */}
            <div className="mt-8 text-center relative z-10 w-full">
                {!status ? (
                    <p className="text-[15px] text-gray-500 font-medium">
                        Remember your password?{' '}
                        <Link href={route('login')} className="text-[#4F46E5] font-bold hover:text-indigo-600 transition-colors">
                            Sign in
                        </Link>
                    </p>
                ) : (
                    <Link href={route('login')} className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors group">
                        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to login
                    </Link>
                )}
            </div>
        </div>
    );
}
