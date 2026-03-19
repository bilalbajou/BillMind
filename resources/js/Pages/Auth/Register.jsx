import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        company_name: '', // Added for UI completeness as requested
    });

    const [passwordStrength, setPasswordStrength] = useState(0); // 0=weak, 1=medium, 2=strong, 3=very strong

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setData('password', val);

        let strength = 0;
        if (val.length >= 8) strength += 1;
        if (val.match(/[A-Z]/) && val.match(/[a-z]/)) strength += 1;
        if (val.match(/[0-9]/) || val.match(/[^a-zA-Z0-9]/)) strength += 1;
        setPasswordStrength(strength);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen flex font-sans bg-white selection:bg-indigo-100 selection:text-indigo-900">
            <Head title="Register" />

            {/* LEFT SIDE (40% width on large screens) */}
            <div className="hidden lg:flex lg:w-[40%] bg-[#F0EFFF] relative overflow-hidden flex-col justify-between p-12 lg:p-16 border-r border-indigo-50">

                {/* Top: Logo & Stepper */}
                <div>
                    {/* Logo */}
                    <Link href="/" className="flex items-center justify-center lg:justify-start mb-8 text-indigo-600 group">
                        <div className="p-1 rounded-2xl transition-colors">
                            <img src="/logo.png" alt="BillMind" className="h-24 lg:h-28 w-auto object-contain" />
                        </div>
                    </Link>


                    {/* Features Checklist */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                                <svg className="w-3 h-3 text-[#4F46E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <span className="text-[15px] text-[#0f172a] font-medium">14-day free trial</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                                <svg className="w-3 h-3 text-[#4F46E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <span className="text-[15px] text-[#0f172a] font-medium">No credit card required</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                                <svg className="w-3 h-3 text-[#4F46E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <span className="text-[15px] text-[#0f172a] font-medium">Setup in under 5 minutes</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                                <svg className="w-3 h-3 text-[#4F46E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <span className="text-[15px] text-[#0f172a] font-medium">Cancel anytime</span>
                        </div>
                    </div>
                </div>


            </div>

            {/* RIGHT SIDE (60% width) */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-white">
                <div className="w-full max-w-[440px]">
                    {/* Mobile top logo */}
                    <Link href="/" className="lg:hidden flex items-center justify-center mb-8 group">
                        <div className="p-1 rounded-2xl transition-colors">
                            <img src="/logo.png" alt="BillMind" className="h-20 w-auto object-contain" />
                        </div>
                    </Link>

                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-extrabold text-[#0f172a] mb-2 tracking-tight">Create your account</h2>
                        <p className="text-[15px] text-gray-500 font-medium">Start your 14-day free trial.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Full Name */}
                            <div className="md:col-span-2">
                                <label htmlFor="name" className="block text-sm font-semibold text-[#0f172a] mb-1.5">Full Name</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within/input:text-[#4F46E5] transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2.5 bg-white border ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5]/20'} rounded-xl text-sm transition-all shadow-sm outline-none`}
                                        autoComplete="name"
                                        autoFocus
                                        placeholder="John Doe"
                                    />
                                </div>
                                {errors.name && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.name}</p>}
                            </div>

                            {/* Work Email */}
                            <div className="md:col-span-2">
                                <label htmlFor="email" className="block text-sm font-semibold text-[#0f172a] mb-1.5">Work Email</label>
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
                                        className={`w-full pl-10 pr-4 py-2.5 bg-white border ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5]/20'} rounded-xl text-sm transition-all shadow-sm outline-none`}
                                        autoComplete="email"
                                        placeholder="name@company.com"
                                    />
                                </div>
                                {errors.email && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email}</p>}
                            </div>

                            {/* Company Name */}
                            <div className="md:col-span-2">
                                <label htmlFor="company_name" className="block text-sm font-semibold text-[#0f172a] mb-1.5">Company Name</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within/input:text-[#4F46E5] transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    </div>
                                    <input
                                        id="company_name"
                                        type="text"
                                        name="company_name"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5]/20 rounded-xl text-sm transition-all shadow-sm outline-none"
                                        placeholder="Wayne Enterprises"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="md:col-span-2">
                                <label htmlFor="password" className="block text-sm font-semibold text-[#0f172a] mb-1.5">Password</label>
                                <div className="relative group/input mb-2">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within/input:text-[#4F46E5] transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        onChange={handlePasswordChange}
                                        className={`w-full pl-10 pr-4 py-2.5 bg-white border ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5]/20'} rounded-xl text-sm transition-all shadow-sm outline-none`}
                                        autoComplete="new-password"
                                        placeholder="Create a strong password"
                                    />
                                </div>

                                {/* Strength Indicator */}
                                {data.password.length > 0 && (
                                    <div className="flex gap-1.5 mt-2">
                                        <div className={`h-1.5 flex-1 rounded-full ${passwordStrength >= 1 ? 'bg-red-400' : 'bg-gray-200'} transition-colors duration-300`}></div>
                                        <div className={`h-1.5 flex-1 rounded-full ${passwordStrength >= 2 ? 'bg-amber-400' : 'bg-gray-200'} transition-colors duration-300`}></div>
                                        <div className={`h-1.5 flex-1 rounded-full ${passwordStrength >= 3 ? 'bg-emerald-400' : 'bg-gray-200'} transition-colors duration-300`}></div>
                                    </div>
                                )}
                                {errors.password && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div className="md:col-span-2">
                                <label htmlFor="password_confirmation" className="block text-sm font-semibold text-[#0f172a] mb-1.5">Confirm Password</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within/input:text-[#4F46E5] transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <input
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2.5 bg-white border ${errors.password_confirmation ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5]/20'} rounded-xl text-sm transition-all shadow-sm outline-none`}
                                        autoComplete="new-password"
                                        placeholder="Confirm your password"
                                    />
                                </div>
                                {errors.password_confirmation && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password_confirmation}</p>}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-8 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 px-4 bg-[#4F46E5] text-white text-sm font-bold rounded-xl hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group shadow-sm"
                            >
                                Create Account
                                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>

                        {/* Login Link */}
                        <p className="mt-6 text-center text-[15px] text-gray-500 font-medium pb-4 border-b border-gray-100">
                            Already have an account?{' '}
                            <Link href={route('login')} className="text-[#4F46E5] font-bold hover:text-indigo-500 transition-colors">
                                Sign in
                            </Link>
                        </p>

                        {/* TOS Note */}
                        <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
                            By creating an account, you agree to our{' '}
                            <a href="#" className="underline hover:text-gray-600">Terms of Service</a> and{' '}
                            <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
