import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="bg-gray-50 text-gray-900 min-h-screen font-sans selection:bg-[#FF2D20] selection:text-white">
                {/* Navbar */}
                <header className="flex items-center justify-between px-6 lg:px-12 bg-[#f4f7fb]">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="BillMind" className="h-20 lg:h-24 w-auto object-contain" />
                    </div>

                    <nav className="hidden lg:flex flex-1 items-center justify-center gap-8">
                        <a href="#features" className="text-[20px] font-medium text-[#3b475e] hover:text-gray-900 transition flex items-center">
                            Features
                        </a>
                        <a href="#how-it-works" className="text-[20px] font-medium text-[#3b475e] hover:text-gray-900 transition flex items-center">
                            How It Works
                        </a>
                        <a href="#pricing" className="text-[20px] font-medium text-[#3b475e] hover:text-gray-900 transition flex items-center">
                            Pricing
                        </a>
                        <a href="#faq" className="text-[20px] font-medium text-[#3b475e] hover:text-gray-900 transition flex items-center">
                            FAQ
                        </a>
                    </nav>

                    <div className="flex items-center justify-end gap-3">
                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="text-[15px] font-medium border border-gray-300 rounded px-5 py-2 hover:bg-white transition text-[#1b2a4e]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="hidden sm:inline-flex text-[15px] font-semibold border border-[#d1d5db] bg-transparent rounded px-5 py-1.5 hover:bg-white transition text-[#111827]"
                                >
                                    Login
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="text-[15px] font-semibold px-5 py-1.5 bg-[#1b61ff] rounded hover:bg-[#124ce0] transition text-white shadow-sm flex items-center gap-1"
                                >
                                    Get Started Free &rarr;
                                </Link>
                            </>
                        )}
                    </div>
                </header>

                {/* Hero Section */}
                <main className="flex flex-col items-center justify-center px-6 py-10 lg:py-32 text-center bg-gradient-to-b from-[#f4f7fb] to-white relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-1/4 -mt-20 -mr-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply blur-3xl opacity-50"></div>
                    <div className="absolute top-0 left-1/4 -mt-20 -ml-20 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply blur-3xl opacity-50"></div>

                    <div className="relative z-10 max-w-4xl mx-auto">
                        <h1 className="text-5xl font-extrabold tracking-tight text-[#0f172a] sm:text-6xl lg:text-7xl mb-6 leading-tight">
                            Stop Processing Invoices Manually.<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                Let AI Do It in Seconds.
                            </span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-[#475569]">
                            BillMind automatically extracts, classifies, and analyzes your invoices — from any format, in any language. Save hours every week and eliminate human errors from your accounting workflow.
                        </p>
                        
                        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="flex flex-col items-center">
                                <Link
                                    href={route('register')}
                                    className="rounded-lg bg-[#1b61ff] px-8 py-4 text-[17px] font-bold text-white shadow-lg hover:bg-[#124ce0] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                                >
                                    Start Free Trial &rarr;
                                </Link>
                                <span className="text-sm text-gray-500 mt-2 font-medium">No credit card required</span>
                            </div>
                            
                            <div className="flex flex-col items-center sm:-mt-7">
                                <a
                                    href="#demo"
                                    className="rounded-lg bg-white border-2 border-gray-200 px-8 py-4 text-[17px] font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                    Watch Demo
                                </a>
                            </div>
                        </div>

                        {/* Social Proof */}
                        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-wrap justify-center items-center gap-x-6 gap-y-4 text-sm font-semibold text-[#64748b]">
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> 
                                Trusted by 200+ finance teams
                            </span>
                            <span className="hidden md:inline text-gray-300">&bull;</span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                98% extraction accuracy
                            </span>
                            <span className="hidden md:inline text-gray-300">&bull;</span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                                Setup in under 5 minutes
                            </span>
                        </div>
                    </div>
                </main>

                {/* Features Section */}
                <section id="features" className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#f4f7fb]"></div>
                    <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-3xl lg:text-center mb-20">
                            <h2 className="text-sm font-bold tracking-widest uppercase text-indigo-600 mb-3">Features</h2>
                            <p className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl lg:text-5xl">
                                Everything You Need to Process Invoices at Scale
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="flex flex-col p-10 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 rounded-sm">
                                <div className="mb-8 text-[#009b93]">
                                    <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <h3 className="text-[22px] font-extrabold text-[#2d3748] mb-4">Smart OCR Extraction</h3>
                                <p className="text-[15px] text-[#718096] leading-relaxed mb-6">
                                    BillMind's AI engine extracts data from PDFs, scanned documents, photos, and images with 98% accuracy. It handles French, Arabic, and English invoices out of the box.
                                </p>
                                <div className="mt-auto pt-6 border-t border-gray-50">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Extracted fields:</p>
                                    <ul className="space-y-3 text-[14px] text-[#718096]">
                                        <li className="flex items-start gap-2"><svg className="w-4 h-4 text-[#009b93] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Invoice number & dates</li>
                                        <li className="flex items-start gap-2"><svg className="w-4 h-4 text-[#009b93] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Supplier data & IBAN</li>
                                        <li className="flex items-start gap-2"><svg className="w-4 h-4 text-[#009b93] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Line items & quantities</li>
                                        <li className="flex items-start gap-2"><svg className="w-4 h-4 text-[#009b93] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>HT, VAT rate, TTC total</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="flex flex-col p-10 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 rounded-sm">
                                <div className="mb-8 text-[#009b93]">
                                    <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                </div>
                                <h3 className="text-[22px] font-extrabold text-[#2d3748] mb-4">Automatic Classification</h3>
                                <p className="text-[15px] text-[#718096] leading-relaxed mb-6">
                                    Our machine learning model classifies each invoice into the right spending category — IT, Transport, Office Supplies, Professional Services — with a confidence score for every prediction.
                                </p>
                               
                            </div>

                            {/* Feature 3 */}
                            <div className="flex flex-col p-10 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 rounded-sm">
                                <div className="mb-8 text-[#009b93]">
                                    <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                <h3 className="text-[22px] font-extrabold text-[#2d3748] mb-4">Anomaly Detection</h3>
                                <p className="text-[15px] text-[#718096] leading-relaxed mb-6">
                                    BillMind automatically flags suspicious data before it enters your accounting system.
                                </p>
                                <div className="mt-auto pt-6 border-t border-gray-50">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">System Flags:</p>
                                    <ul className="space-y-3 text-[14px] text-[#718096]">
                                        <li className="flex items-start gap-2"><svg className="w-4 h-4 text-[#e53e3e] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Duplicates (same supplier + num)</li>
                                        <li className="flex items-start gap-2"><svg className="w-4 h-4 text-[#e53e3e] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Math errors (HT + VAT ≠ TTC)</li>
                                        <li className="flex items-start gap-2"><svg className="w-4 h-4 text-[#e53e3e] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Invalid or future dates</li>
                                        <li className="flex items-start gap-2"><svg className="w-4 h-4 text-[#e53e3e] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Unknown suppliers</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Feature 4 */}
                            <div className="flex flex-col p-10 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 rounded-sm">
                                <div className="mb-8 text-[#009b93]">
                                    <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                </div>
                                <h3 className="text-[22px] font-extrabold text-[#2d3748] mb-4">Live Analytics Dashboard</h3>
                                <p className="text-[15px] text-[#718096] leading-relaxed mt-auto">
                                    An interactive dashboard gives you real-time visibility into your spending — by category, by supplier, by period. Filter, drill down, and compare — no Excel required.
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="flex flex-col p-10 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 rounded-sm">
                                <div className="mb-8 text-[#009b93]">
                                    <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <h3 className="text-[22px] font-extrabold text-[#2d3748] mb-4">Export & Reporting</h3>
                                <p className="text-[15px] text-[#718096] leading-relaxed mt-auto">
                                    Export your invoice data to CSV, Excel, or PDF with one click. Generate professional monthly reports automatically, delivered to your inbox on the first of every month.
                                </p>
                            </div>

                            {/* Feature 6 */}
                            <div className="flex flex-col p-10 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 rounded-sm">
                                <div className="mb-8 text-[#009b93]">
                                    <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <h3 className="text-[22px] font-extrabold text-[#2d3748] mb-4">Role-Based Access</h3>
                                <p className="text-[15px] text-[#718096] leading-relaxed mt-auto">
                                    Assign roles to your team — Admin, Accountant, or Observer. Every action is logged in a full audit trail so you always know who did what and when.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" className="bg-[#f8fafc] py-24 sm:py-32 border-y border-gray-100 relative z-10">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-3xl lg:text-center mb-16 sm:mb-24">
                            <h2 className="text-sm font-bold tracking-widest uppercase text-indigo-600 mb-3">How It Works</h2>
                            <p className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
                                From Upload to Insight in 3 Simple Steps
                            </p>
                        </div>

                        <div className="mx-auto max-w-5xl">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                                {/* Connecting line for desktop */}
                                <div className="hidden md:block absolute top-[3.5rem] left-[16%] right-[16%] h-[2px] bg-indigo-100"></div>

                                {/* Step 1 */}
                                <div className="relative flex flex-col items-center text-center">
                                    <div className="z-10 bg-[#f8fafc] px-4">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl ring-8 ring-[#f8fafc] mb-6 mx-auto">
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#0f172a] mb-2">Step 1 — Upload</h3>
                                    <p className="text-[15px] text-[#475569] leading-relaxed">
                                        Drag and drop your invoices — PDFs, scans, or photos. Upload one at a time or process up to 50 in a single batch.
                                    </p>
                                </div>

                                {/* Step 2 */}
                                <div className="relative flex flex-col items-center text-center">
                                    <div className="z-10 bg-[#f8fafc] px-4">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl ring-8 ring-[#f8fafc] mb-6 mx-auto">
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#0f172a] mb-2">Step 2 — AI Processes</h3>
                                    <p className="text-[15px] text-[#475569] leading-relaxed">
                                        BillMind's pipeline kicks in automatically:<br/> 
                                        <span className="font-medium text-indigo-500">OCR → Extraction → Classification → Anomaly Detection.</span><br/> 
                                        Results are ready in seconds.
                                    </p>
                                </div>

                                {/* Step 3 */}
                                <div className="relative flex flex-col items-center text-center">
                                    <div className="z-10 bg-[#f8fafc] px-4">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl ring-8 ring-[#f8fafc] mb-6 mx-auto">
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#0f172a] mb-2">Step 3 — Analyze & Export</h3>
                                    <p className="text-[15px] text-[#475569] leading-relaxed">
                                        Review extracted data, correct if needed, explore your dashboard, and export reports in the format you need.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="bg-[#0f172a] py-16 sm:py-24 relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply blur-[100px] opacity-30"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply blur-[100px] opacity-30"></div>
                    
                    <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                        <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-4">
                            <div className="mx-auto flex max-w-xs flex-col gap-y-3">
                                <dt className="text-[15px] font-medium leading-7 text-indigo-200 uppercase tracking-widest">Invoice extraction accuracy</dt>
                                <dd className="order-first text-5xl font-extrabold tracking-tight text-white mb-2">98%</dd>
                            </div>
                            <div className="mx-auto flex max-w-xs flex-col gap-y-3">
                                <dt className="text-[15px] font-medium leading-7 text-indigo-200 uppercase tracking-widest">Faster than manual processing</dt>
                                <dd className="order-first text-5xl font-extrabold tracking-tight text-white mb-2">10x</dd>
                            </div>
                            <div className="mx-auto flex max-w-xs flex-col gap-y-3">
                                <dt className="text-[15px] font-medium leading-7 text-indigo-200 uppercase tracking-widest">Finance teams using BillMind</dt>
                                <dd className="order-first text-5xl font-extrabold tracking-tight text-white mb-2">200+</dd>
                            </div>
                            <div className="mx-auto flex max-w-xs flex-col gap-y-3">
                                <dt className="text-[15px] font-medium leading-7 text-indigo-200 uppercase tracking-widest">Invoices processed per batch</dt>
                                <dd className="order-first text-5xl font-extrabold tracking-tight text-white mb-2">50</dd>
                            </div>
                        </dl>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                            <div className="space-y-8">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-gray-900 tracking-tight">
                                        BillMind
                                    </span>
                                </div>
                                <p className="text-sm leading-6 text-gray-600 max-w-xs">
                                    The automated invoice processing engine for modern finance teams. Save time, reduce errors, and scale your accounting workflow.
                                </p>
                                <div className="flex space-x-6">
                                    <a href="#" className="text-gray-400 hover:text-[#1da1f2] transition">
                                        <span className="sr-only">Twitter</span>
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-[#0a66c2] transition">
                                        <span className="sr-only">LinkedIn</span>
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"/></svg>
                                    </a>
                                </div>
                            </div>
                            <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                                <div className="md:grid md:grid-cols-2 md:gap-8">
                                    <div>
                                        <h3 className="text-sm font-semibold leading-6 text-gray-900">Product</h3>
                                        <ul role="list" className="mt-6 space-y-4">
                                            <li><a href="#features" className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition">Features</a></li>
                                            <li><a href="#how-it-works" className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition">How It Works</a></li>
                                            <li><a href="#pricing" className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition">Pricing</a></li>
                                            <li><a href="#faq" className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition">FAQ</a></li>
                                        </ul>
                                    </div>
                                    <div className="mt-10 md:mt-0">
                                        <h3 className="text-sm font-semibold leading-6 text-gray-900">Company</h3>
                                        <ul role="list" className="mt-6 space-y-4">
                                            <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition">About Us</a></li>
                                            <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition">Blog</a></li>
                                            <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition">Careers</a></li>
                                            <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition">Contact</a></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="md:grid md:grid-cols-2 md:gap-8">
                                    <div>
                                        <h3 className="text-sm font-semibold leading-6 text-gray-900">Legal</h3>
                                        <ul role="list" className="mt-6 space-y-4">
                                            <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition">Privacy Policy</a></li>
                                            <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition">Terms of Service</a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-16 border-t border-gray-100 pt-8 sm:mt-20 lg:mt-24">
                            <p className="text-sm leading-5 text-gray-500">
                                &copy; {new Date().getFullYear()} BillMind. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
