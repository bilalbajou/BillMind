import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex font-sans bg-white selection:bg-indigo-100 selection:text-indigo-900">
            <Head title="Log in" />

            {/* LEFT SIDE (40% width on large screens) */}
            <div className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-[#4F46E5] to-[#818CF8] relative overflow-hidden flex-col justify-between p-12">
                {/* Subtle geometric grid lines pattern overlay */}
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                ></div>

                {/* Top Section */}
                <div className="relative z-10 flex flex-col items-start">
                    {/* Logo */}
                    {/* <Link href="/" className="flex items-center gap-2 mb-16 text-white group">
                        <div className="p-2 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                            <img src="/logo.png" alt="BillMind" className="h-20 lg:h-24 w-auto object-contain" />
                        </div>
                    </Link> */}

                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">
                        Welcome back.
                    </h1>
                    <p className="text-indigo-100 text-lg max-w-sm leading-relaxed">
                        Sign in to manage your invoices with AI.
                    </p>
                </div>

                {/* Testimonials */}
                <div className="relative z-10 space-y-4 max-w-sm">
                    {/* Testimonial 1 */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl shadow-indigo-900/20 transform hover:-translate-y-1 transition-transform">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase overflow-hidden">
                                <img src="https://ui-avatars.com/api/?name=Sarah+J&background=c7d2fe&color=3730a3" alt="Avatar" />
                            </div>
                            <div>
                                <p className="text-white text-sm font-semibold">Sarah Alami</p>
                                <p className="text-indigo-200 text-xs text-opacity-80">Financial Controller</p>
                            </div>
                        </div>
                        <p className="text-white text-sm opacity-90 leading-relaxed font-light">"BillMind cut our monthly invoice processing time by 80%. It's like magic."</p>
                    </div>
                    {/* Testimonial 2 */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl shadow-indigo-900/20 transform hover:-translate-y-1 transition-transform ml-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase overflow-hidden">
                                <img src="https://ui-avatars.com/api/?name=Omar+F&background=c7d2fe&color=3730a3" alt="Avatar" />
                            </div>
                            <div>
                                <p className="text-white text-sm font-semibold">Omar Farooq</p>
                                <p className="text-indigo-200 text-xs text-opacity-80">Freelance Designer</p>
                            </div>
                        </div>
                        <p className="text-white text-sm opacity-90 leading-relaxed font-light">"Finally a tool that accurately reads Arabic invoices. Absolute game changer."</p>
                    </div>
                    {/* Testimonial 3 */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl shadow-indigo-900/20 transform hover:-translate-y-1 transition-transform">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase overflow-hidden">
                                <img src="https://ui-avatars.com/api/?name=Elena+R&background=c7d2fe&color=3730a3" alt="Avatar" />
                            </div>
                            <div>
                                <p className="text-white text-sm font-semibold">Elena Rostova</p>
                                <p className="text-indigo-200 text-xs text-opacity-80">Agency Owner</p>
                            </div>
                        </div>
                        <p className="text-white text-sm opacity-90 leading-relaxed font-light">"Clean UI, fast extraction, zero headaches. Highly recommended."</p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE (60% width) */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-white">
                <div className="w-full max-w-[500px]">
                    {/* Logo (Centered on mobile, left-aligned on desktop to match form) */}
                    <Link href="/" className="flex items-center justify-center lg:justify-start mb-8 text-indigo-600 group">
                        <div className="p-1 rounded-2xl transition-colors">
                            <img src="/logo.png" alt="BillMind" className="h-24 lg:h-28 w-auto object-contain" />
                        </div>
                    </Link>

                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-[26px] font-bold text-[#0f172a] mb-2 tracking-tight">Sign in to your account</h2>
                        <p className="text-sm text-gray-500 font-medium">Please enter your details to continue.</p>
                    </div>

                    {status && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-sm font-medium text-emerald-600 border border-emerald-100 flex items-start gap-3">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-[#0f172a] mb-1.5">Email</label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within/input:text-[#4F46E5] transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2.5 bg-white border ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5]/20'} rounded-xl text-sm transition-all shadow-sm outline-none`}
                                    autoComplete="username"
                                    autoFocus
                                    placeholder="name@company.com"
                                />
                            </div>
                            {errors.email && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email}</p>}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-[#0f172a] mb-1.5">Password</label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within/input:text-[#4F46E5] transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={`w-full pl-10 pr-11 py-2.5 bg-white border ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5]/20'} rounded-xl text-sm transition-all shadow-sm outline-none`}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password}</p>}
                        </div>

                        {/* Remember & Forgot Password */}
                        <div className="flex items-center justify-between mt-6">
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 rounded text-[#4F46E5] border-gray-300 focus:ring-[#4F46E5] cursor-pointer"
                                />
                                <span className="ml-2.5 text-sm text-[#0f172a] font-medium group-hover:text-indigo-600 transition-colors">Remember me</span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm font-semibold text-[#4F46E5] hover:text-indigo-500 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        {/* Sign In Button */}
                        <div className="mt-6 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 px-4 bg-[#4F46E5] text-white text-sm font-bold rounded-xl hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group shadow-sm"
                            >
                                Sign In
                                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>

                        {/* Register Link */}
                        <p className="mt-8 text-center text-[15px] text-gray-500 font-medium">
                            Don't have an account?{' '}
                            <Link href={route('register')} className="text-[#4F46E5] font-bold hover:text-indigo-500 transition-colors">
                                Start free trial
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
