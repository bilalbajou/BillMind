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
                <main className="flex flex-col items-center justify-center px-6 pt-10 lg:pt-32 pb-[30px] text-center bg-gradient-to-b from-[#f4f7fb] to-white relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-1/4 -mt-20 -mr-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply blur-3xl opacity-50"></div>
                    <div className="absolute top-0 left-1/4 -mt-20 -ml-20 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply blur-3xl opacity-50"></div>

                    <div className="relative z-10 max-w-4xl mx-auto">
                        <h1 className="text-5xl font-extrabold tracking-tight text-[#0f172a] sm:text-6xl lg:text-7xl mb-6 leading-tight">
                            Stop Processing Invoices Manually.<br />
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
                                <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                Trusted by 200+ finance teams
                            </span>
                            <span className="hidden md:inline text-gray-300">&bull;</span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                98% extraction accuracy
                            </span>
                            <span className="hidden md:inline text-gray-300">&bull;</span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" /></svg>
                                Setup in under 5 minutes
                            </span>
                        </div>
                    </div>
                </main>

                {/* Features Section */}
                <section id="features" className="relative pt-10 pb-10 sm:pt-10 sm:pb-10">
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
                                        <li className="flex items-start gap-2"><svg className="w-4 h-4 text-[#009b93] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Invoice number & dates</li>
                                        <li className="flex items-start gap-2"><svg className="w-4 h-4 text-[#009b93] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Supplier data & IBAN</li>
                                        <li className="flex items-start gap-2"><svg className="w-4 h-4 text-[#009b93] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Line items & quantities</li>
                                        <li className="flex items-start gap-2"><svg className="w-4 h-4 text-[#009b93] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>HT, VAT rate, TTC total</li>
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
                <section id="how-it-works" className="py-24 sm:py-32 relative overflow-hidden bg-white border-y border-gray-100 z-10">
                    {/* Decorative blur */}
                    <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-gray-50/80 to-transparent pointer-events-none"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[1000px] h-[600px] bg-indigo-50/50 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

                    <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                        <div className="mx-auto max-w-2xl lg:text-center mb-20 sm:mb-28">
                            <h2 className="text-sm font-extrabold tracking-widest uppercase text-indigo-600 mb-4">How It Works</h2>
                            <p className="text-4xl font-extrabold tracking-tight text-[#0f172a] sm:text-5xl lg:text-5xl mb-6 leading-tight">
                                Automate your accounting <br className="hidden sm:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">in 3 simple steps</span>
                            </p>
                            <p className="text-lg leading-8 text-gray-500 font-medium">
                                Turn messy documents into structured, actionable data in seconds. No training required.
                            </p>
                        </div>

                        <div className="flex flex-col gap-16 lg:gap-32 max-w-5xl mx-auto pb-10">
                            {/* Step 1 */}
                            <div className="relative group flex flex-col md:flex-row items-center gap-10 lg:gap-20">
                                <div className="md:w-1/2 order-2 md:order-1 relative w-full">
                                    <div className="absolute inset-0 bg-blue-400 rounded-3xl blur-2xl opacity-10 group-hover:opacity-30 transition-opacity duration-700"></div>
                                    <div className="relative bg-white border border-gray-100 shadow-2xl shadow-gray-200/40 rounded-3xl p-6 lg:p-10 flex items-center justify-center aspect-[4/3] overflow-hidden hover:-translate-y-1 transition-transform duration-500 group-hover:ring-1 group-hover:ring-blue-100">
                                        {/* Mockup or Illustration for Step 1 */}
                                        <div className="w-full h-full bg-gray-50/80 rounded-2xl border border-gray-100 shadow-inner flex flex-col items-center justify-center relative overflow-hidden group-hover:bg-blue-50/30 transition-colors duration-500">
                                            <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center mb-5 z-10 group-hover:scale-110 transition-transform duration-500">
                                                <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                            </div>
                                            <span className="text-[15px] font-bold text-gray-400 z-10">Drag & Drop Invoices Here</span>
                                            {/* Decorative files floating */}
                                            <div className="absolute top-6 left-6 w-16 h-20 bg-white border border-gray-200 rounded-lg shadow-sm rotate-[-12deg] opacity-60 group-hover:-translate-y-2 group-hover:-rotate-[15deg] transition-all duration-700"></div>
                                            <div className="absolute bottom-6 right-6 w-16 h-20 bg-white border border-gray-200 rounded-lg shadow-sm rotate-[12deg] opacity-60 group-hover:translate-y-2 group-hover:rotate-[15deg] transition-all duration-700"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:w-1/2 order-1 md:order-2 text-left">
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 font-extrabold text-2xl mb-8 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">1</div>
                                    <h3 className="text-3xl lg:text-4xl font-extrabold text-[#0f172a] mb-5 tracking-tight group-hover:text-blue-600 transition-colors duration-300">Upload your documents</h3>
                                    <p className="text-lg text-gray-500 leading-relaxed font-medium">
                                        Drag and drop your invoices — PDFs, scans, or photos. You can upload them one at a time or process batches of up to <strong className="text-gray-900 font-bold">50 documents</strong> simultaneously.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative group flex flex-col md:flex-row items-center gap-10 lg:gap-20 md:flex-row-reverse">
                                <div className="md:w-1/2 order-2 md:order-1 relative w-full">
                                    <div className="absolute inset-0 bg-indigo-500 rounded-3xl blur-2xl opacity-10 group-hover:opacity-30 transition-opacity duration-700"></div>
                                    <div className="relative bg-[#0b1120] shadow-2xl p-6 lg:p-10 rounded-3xl flex items-center justify-center aspect-[4/3] overflow-hidden hover:-translate-y-1 transition-transform duration-500 border border-gray-800 group-hover:ring-1 group-hover:ring-indigo-500/50">
                                        {/* Mockup for Step 2 */}
                                        <div className="w-full h-full font-mono text-sm flex flex-col">
                                            <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-4">
                                                <div className="flex gap-1.5">
                                                    <div className="w-3.5 h-3.5 rounded-full bg-red-500"></div>
                                                    <div className="w-3.5 h-3.5 rounded-full bg-yellow-500"></div>
                                                    <div className="w-3.5 h-3.5 rounded-full bg-green-500"></div>
                                                </div>
                                                <span className="text-gray-500 text-[13px] ml-3 font-semibold tracking-wider">AI Pipeline</span>
                                            </div>
                                            <div className="space-y-4 flex-1">
                                                <p className="text-emerald-400 flex items-center gap-3"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Extracting text via OCR...</p>
                                                <p className="text-emerald-400 flex items-center gap-3 opacity-90"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Classifying vendor data...</p>
                                                <p className="text-emerald-400 flex items-center gap-3 opacity-80"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Validating amounts (HT, TTC)...</p>
                                                <p className="text-indigo-400 flex items-center gap-3 mt-4 font-bold"><span className="w-4 flex justify-center">⟳</span> Detecting anomalies...</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:w-1/2 order-1 md:order-2 text-left">
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 font-extrabold text-2xl mb-8 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">2</div>
                                    <h3 className="text-3xl lg:text-4xl font-extrabold text-[#0f172a] mb-5 tracking-tight group-hover:text-indigo-600 transition-colors duration-300">Intelligent Processing</h3>
                                    <p className="text-lg text-gray-500 leading-relaxed font-medium">
                                        Our AI pipeline kicks in instantly. It extracts text via OCR, classifies the vendor, and identifies anomalies — <strong className="text-gray-900 font-bold">handling all the heavy lifting</strong> automatically.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative group flex flex-col md:flex-row items-center gap-10 lg:gap-20">
                                <div className="md:w-1/2 order-2 md:order-1 relative w-full">
                                    <div className="absolute inset-0 bg-emerald-400 rounded-3xl blur-2xl opacity-10 group-hover:opacity-30 transition-opacity duration-700"></div>
                                    <div className="relative bg-white border border-gray-100 shadow-2xl shadow-gray-200/40 rounded-3xl p-6 lg:p-10 flex flex-col items-center justify-center aspect-[4/3] overflow-hidden hover:-translate-y-1 transition-transform duration-500 group-hover:ring-1 group-hover:ring-emerald-100">
                                        {/* Mockup for Step 3 */}
                                        <div className="w-full flex-1 bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden flex flex-col group-hover:shadow-lg transition-shadow duration-500">
                                            <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                                                <span className="font-bold text-gray-800 text-[15px]">Analytics overview</span>
                                                <span className="text-xs bg-emerald-100 text-emerald-800 font-black px-3 py-1.5 rounded-md uppercase tracking-wide">Export CSV</span>
                                            </div>
                                            <div className="p-5 flex-1 flex flex-col gap-5 justify-center">
                                                <div className="flex justify-between items-end border-b border-gray-100 pb-5">
                                                    <div>
                                                        <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Spending</p>
                                                        <p className="text-3xl font-black text-gray-900 tracking-tight flex items-baseline gap-1">12,450 <span className="text-sm font-bold text-gray-500">MAD</span></p>
                                                    </div>
                                                    <div className="flex gap-1.5 items-end h-10 group-hover:scale-110 origin-bottom transition-transform duration-500">
                                                        <div className="w-4 bg-emerald-200 rounded-t-sm h-4"></div>
                                                        <div className="w-4 bg-emerald-300 rounded-t-sm h-6"></div>
                                                        <div className="w-4 bg-emerald-400 rounded-t-sm h-5"></div>
                                                        <div className="w-4 bg-emerald-500 rounded-t-sm h-10"></div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">IT</div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between text-xs mb-1 font-bold">
                                                                <span className="text-gray-700">IT Services</span>
                                                                <span className="text-gray-500">45%</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-indigo-500 rounded-full w-[45%]"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-[10px]">OFF</div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between text-xs mb-1 font-bold">
                                                                <span className="text-gray-700">Office Supplies</span>
                                                                <span className="text-gray-500">20%</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-blue-400 rounded-full w-[20%]"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:w-1/2 order-1 md:order-2 text-left">
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 font-extrabold text-2xl mb-8 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-500">3</div>
                                    <h3 className="text-3xl lg:text-4xl font-extrabold text-[#0f172a] mb-5 tracking-tight group-hover:text-emerald-600 transition-colors duration-300">Analyze & Export</h3>
                                    <p className="text-lg text-gray-500 leading-relaxed font-medium">
                                        Review the extracted data with crystal clarity. Gain insights with the <strong className="text-gray-900 font-bold">built-in analytics dashboard</strong> and export your ready-to-use reports in one click.
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

                {/* FAQ Section */}
                <section id="faq" className="bg-[#f8fafc] py-24 sm:py-32 border-b border-gray-100 relative z-10">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-4xl lg:text-center mb-16">
                            <h2 className="text-sm font-bold tracking-widest uppercase text-indigo-600 mb-3">Frequently Asked Questions</h2>
                            <p className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl lg:text-5xl">
                                Everything You Need to Know
                            </p>
                        </div>
                        <div className="mx-auto max-w-3xl divide-y divide-gray-900/10">
                            <dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
                                {/* FAQ 1 */}
                                <div className="pt-6 text-left">
                                    <dt className="text-lg font-bold leading-7 text-gray-900">
                                        What file formats does BillMind support?
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-gray-600">
                                        BillMind supports PDF, JPG, PNG, and TIFF files. Both native digital PDFs and scanned documents are handled automatically. Maximum file size is 10 MB.
                                    </dd>
                                </div>
                                {/* FAQ 2 */}
                                <div className="pt-6 text-left">
                                    <dt className="text-lg font-bold leading-7 text-gray-900">
                                        What languages does BillMind work with?
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-gray-600">
                                        BillMind extracts data from invoices written in French, Arabic, and English. It also supports Moroccan-specific fields like ICE numbers and MAD currency.
                                    </dd>
                                </div>
                                {/* FAQ 3 */}
                                <div className="pt-6 text-left">
                                    <dt className="text-lg font-bold leading-7 text-gray-900">
                                        How accurate is the data extraction?
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-gray-600">
                                        Our AI achieves 98% accuracy on standard invoices. Accuracy depends on document quality — high-resolution scans and native PDFs always yield the best results.
                                    </dd>
                                </div>
                                {/* FAQ 4 */}
                                <div className="pt-6 text-left">
                                    <dt className="text-lg font-bold leading-7 text-gray-900">
                                        Is my data secure?
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-gray-600">
                                        Yes. All files are encrypted at rest and in transit. Access is protected by session authentication and role-based permissions. We never share your data with third parties.
                                    </dd>
                                </div>
                                {/* FAQ 5 */}
                                <div className="pt-6 text-left">
                                    <dt className="text-lg font-bold leading-7 text-gray-900">
                                        Can I correct extraction errors?
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-gray-600">
                                        Absolutely. You can edit any extracted field directly from the invoice detail page. Your corrections are saved and used to improve the model's accuracy over time.
                                    </dd>
                                </div>
                                {/* FAQ 6 */}
                                <div className="pt-6 text-left">
                                    <dt className="text-lg font-bold leading-7 text-gray-900">
                                        Do I need technical skills to use BillMind?
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-gray-600">
                                        None at all. BillMind is designed for accountants and finance teams, not developers. If you can upload a file and read a dashboard, you're ready.
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                            <div className="space-y-8 xl:col-span-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-gray-900 tracking-tight">
                                        BillMind
                                    </span>
                                </div>
                                <p className="text-sm leading-6 text-gray-600 max-w-xs">
                                    AI-Powered Invoice Intelligence
                                </p>
                                <div className="flex space-x-6">
                                    <a href="#" className="text-gray-400 hover:text-[#1da1f2] transition">
                                        <span className="sr-only">Twitter</span>
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-[#0a66c2] transition">
                                        <span className="sr-only">LinkedIn</span>
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
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
                                            <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition">Changelog</a></li>
                                        </ul>
                                    </div>
                                    <div className="mt-10 md:mt-0">
                                        <h3 className="text-sm font-semibold leading-6 text-gray-900">Company</h3>
                                        <ul role="list" className="mt-6 space-y-4">
                                            <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition">About</a></li>
                                            <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition">Contact</a></li>
                                            <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition">Privacy Policy</a></li>
                                            <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition">Terms of Service</a></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="md:grid md:grid-cols-2 md:gap-8">
                                    <div>
                                        <h3 className="text-sm font-semibold leading-6 text-gray-900">Resources</h3>
                                        <ul role="list" className="mt-6 space-y-4">
                                            <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition">Documentation</a></li>
                                            <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition">API Reference</a></li>
                                            <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition">Blog</a></li>
                                            <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition">Support</a></li>
                                        </ul>
                                    </div>
                                    <div className="mt-10 md:mt-0">
                                        <h3 className="text-sm font-semibold leading-6 text-gray-900">Contact</h3>
                                        <ul role="list" className="mt-6 space-y-4">
                                            <li><a href="mailto:contact@billmind.ma" className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition">contact@billmind.ma</a></li>
                                            <li><span className="text-sm leading-6 text-gray-600">Fès, Morocco</span></li>
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
