import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Live Validation
    const reqLength = data.password.length >= 8;
    const reqUpper = /[A-Z]/.test(data.password);
    const reqNumber = /[0-9]/.test(data.password);
    const reqSpecial = /[^A-Za-z0-9]/.test(data.password);

    const strengthScore = [reqLength, reqUpper, reqNumber, reqSpecial].filter(Boolean).length;

    const getStrengthColor = (index) => {
        if (strengthScore <= index) return 'bg-gray-200';
        if (strengthScore === 1) return 'bg-red-500';
        if (strengthScore === 2) return 'bg-orange-400';
        if (strengthScore === 3) return 'bg-yellow-400';
        return 'bg-emerald-500';
    };

    const isMatch = data.password.length > 0 && data.password === data.password_confirmation;
    const isReadyToSubmit = strengthScore === 4 && isMatch;

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    // Helper for checklist icons
    const CheckIcon = ({ passed }) => (
        <svg className={`w-4 h-4 flex-shrink-0 ${passed ? 'text-emerald-500' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center font-sans bg-[#F9FAFB] selection:bg-indigo-100 selection:text-indigo-900 relative p-6">
            <Head title="Reset Password" />

            {/* Faint dot grid pattern background */}
            <div
                className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}
            ></div>

            {/* Center Card */}
            <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100 p-8 sm:p-10 relative z-10">

                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-1 rounded-2xl shadow-sm">
                            <img src="/logo.png" alt="BillMind" className="h-16 w-auto object-contain" />
                        </div>
                    </Link>
                </div>


                {/* Titles */}
                <div className="text-center mb-8">
                    <h2 className="text-[22px] font-bold text-[#0f172a] mb-2 tracking-tight">Set a new password</h2>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed px-2">Your new password must be different from previous ones.</p>
                </div>

                {errors.email && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 text-sm font-medium text-red-600 border border-red-100">
                        {errors.email}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    {/* Hidden inputs required for reset */}
                    <input type="hidden" name="token" value={data.token} />
                    <input type="hidden" name="email" value={data.email} />

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-semibold text-[#0f172a] mb-1.5 flex justify-between items-center">
                            New password
                            {strengthScore === 4 && <span className="text-xs font-bold text-emerald-500">Strong</span>}
                        </label>
                        <div className="relative group/input">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={`w-full pl-4 pr-12 py-3 bg-gray-50/50 border ${errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5]/20'} rounded-xl text-sm transition-all focus:bg-white shadow-sm outline-none`}
                                placeholder="Enter new password"
                                autoComplete="new-password"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-3-7C6.477 5 2 12 2 12s4.477 7 10 7 10-7 10-7-4.477-7-10-7z" /></svg>
                                )}
                            </button>
                        </div>
                        {errors.password && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password}</p>}
                    </div>

                    {/* Strength Bar */}
                    <div className="flex gap-1">
                        <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(0)}`}></div>
                        <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(1)}`}></div>
                        <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(2)}`}></div>
                        <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(3)}`}></div>
                    </div>

                    {/* Password Requirements Checklist */}
                    <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 mt-4">
                        <div className="flex items-center gap-1.5">
                            <CheckIcon passed={reqLength} />
                            <span className={`text-xs font-semibold ${reqLength ? 'text-gray-700' : 'text-gray-400'}`}>At least 8 characters</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckIcon passed={reqUpper} />
                            <span className={`text-xs font-semibold ${reqUpper ? 'text-gray-700' : 'text-gray-400'}`}>One uppercase letter</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckIcon passed={reqNumber} />
                            <span className={`text-xs font-semibold ${reqNumber ? 'text-gray-700' : 'text-gray-400'}`}>One number</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckIcon passed={reqSpecial} />
                            <span className={`text-xs font-semibold ${reqSpecial ? 'text-gray-700' : 'text-gray-400'}`}>One special character</span>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="pt-2">
                        <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">Confirm new password</label>
                        <div className="relative group/input">
                            <input
                                id="password_confirmation"
                                type={showConfirm ? 'text' : 'password'}
                                name="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className={`w-full pl-4 pr-12 py-3 bg-gray-50/50 border ${errors.password_confirmation ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5]/20'} rounded-xl text-sm transition-all focus:bg-white shadow-sm outline-none`}
                                placeholder="Confirm new password"
                                autoComplete="new-password"
                            />

                            {/* Eye Toggle OR Checkmark */}
                            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                                {isMatch ? (
                                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                    >
                                        {showConfirm ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-3-7C6.477 5 2 12 2 12s4.477 7 10 7 10-7 10-7-4.477-7-10-7z" /></svg>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                        {errors.password_confirmation && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password_confirmation}</p>}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={!isReadyToSubmit || processing}
                            className="w-full py-3.5 px-4 bg-[#4F46E5] text-white text-[15px] font-bold rounded-xl hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group shadow-sm"
                        >
                            Reset Password
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
