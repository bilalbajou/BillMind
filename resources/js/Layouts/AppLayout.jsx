import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
    dashboard: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    invoices: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    upload: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
    ),
    pending: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    anomaly: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    chart: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    report: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
    ),
    supplier: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
    users: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ),
    invite: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
    ),
    audit: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
    ),
    ai: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    ),
    profile: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    company: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M9 8h1m-1 4h1m4-4h1m-1 4h1M6 21V5a2 2 0 012-2h8a2 2 0 012 2v16" />
        </svg>
    ),
    billing: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    ),
    categories: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
        </svg>
    ),
};

// ─── Nav structure ─────────────────────────────────────────────────────────────
const navSections = [
    {
        label: null,
        items: [
            { label: 'Dashboard', href: '/dashboard', routeName: 'dashboard', icon: Icon.dashboard },
        ],
    },
    {
        label: 'Invoices',
        items: [
            { label: 'All Invoices', href: '/invoices', routeName: 'invoices.index', icon: Icon.invoices },
            { label: 'Upload', href: '/invoices/upload', routeName: 'invoices.upload', icon: Icon.upload },
            { label: 'Anomalies', href: '/invoices/anomalies', routeName: 'invoices.anomalies', icon: Icon.anomaly, badge: 0 },
        ],
    },
    {
        label: 'Analytics',
        items: [
            { label: 'Overview', href: '/analytics', routeName: 'analytics.index', icon: Icon.chart },
        ],
    },
    {
        label: 'Administration',
        adminOnly: true,
        items: [
            { label: 'Users', href: '/admin/users', routeName: 'admin.users', icon: Icon.users },
            { label: 'Invitations', href: '/admin/invitations', routeName: 'admin.invitations', icon: Icon.invite },
            { label: 'Audit Log', href: '/admin/audit', routeName: 'admin.audit', icon: Icon.audit },
            { label: 'AI Model', href: '/admin/ai-model', routeName: 'admin.ai', icon: Icon.ai },
        ],
    },
    {
        label: 'Settings',
        items: [
            { label: 'My Profile', href: '/profile', routeName: 'profile.edit', icon: Icon.profile },
            { label: 'Company', href: '/settings/company', routeName: 'settings.company', icon: Icon.company },
            { label: 'Categories', href: '/settings/categories', routeName: 'settings.categories', icon: Icon.categories },
            { label: 'Subscription', href: '/settings/billing', routeName: 'settings.billing', icon: Icon.billing },
        ],
    },
];

// ─── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({ item, active, onClick }) {
    return (
        <li>
            <Link
                href={item.href}
                onClick={onClick}
                className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg group transition-colors ${
                    active
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
                <div className="flex items-center gap-3">
                    <span className={active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'}>
                        {item.icon}
                    </span>
                    {item.label}
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                        {item.badge}
                    </span>
                )}
            </Link>
        </li>
    );
}

// ─── Main Layout ───────────────────────────────────────────────────────────────
export default function AppLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const isAdmin = user.role === 'admin';

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    const isActive = (routeName) => {
        if (!routeName) return false;
        try { return route().current(routeName); } catch { return false; }
    };

    const initials = user.name
        ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const roleName = user.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
        : 'Utilisateur';

    const companyName = user.tenant?.name ?? 'Mon entreprise';

    return (
        <div className="antialiased bg-gray-50 min-h-screen">

            {/* ── Mobile top bar ──────────────────────────────────────── */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                </button>
                <img src="/logo.png" className="h-12" alt="BillMind" onError={(e) => { e.target.style.display = 'none'; }} />
                <div className="w-9" />
            </div>

            {/* ── Sidebar ─────────────────────────────────────────────── */}
            <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0 bg-white border-r border-gray-200 flex flex-col`}>

                {/* Header: Logo */}
                <div className="border-b border-gray-100">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <img
                            src="/logo.png"d
                            className="h-20 w-auto"
                            alt="BillMind"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </Link>

                    {/* Profile card
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                    {roleName}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 truncate mt-0.5">{companyName}</p>
                        </div>
                    </div> */}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 sidebar-scroll">
                    {navSections.map((section) => {
                        if (section.adminOnly && !isAdmin) return null;
                        return (
                            <div key={section.label ?? 'main'}>
                                {section.label && (
                                    <p className="px-3 mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        {section.label}
                                    </p>
                                )}
                                <ul className="space-y-0.5">
                                    {section.items.map((item) => (
                                        <NavItem
                                            key={item.label}
                                            item={item}
                                            active={isActive(item.routeName)}
                                            onClick={() => setSidebarOpen(false)}
                                        />
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </nav>

                {/* Footer: Plan card */}
                <div className="p-4 border-t border-gray-100">
                    <div className="p-3 bg-indigo-50 rounded-xl">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-indigo-900">Trial · 14 days left</span>
                        </div>
                        <div className="w-full bg-indigo-200 rounded-full h-1.5 mb-3">
                            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '8%' }} />
                        </div>
                        <button className="w-full text-center text-xs font-semibold text-white bg-indigo-600 rounded-lg px-3 py-2 hover:bg-indigo-700 transition-colors">
                            Upgrade
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-gray-900/50 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Top navbar (desktop) ─────────────────────────────────── */}
            <div className="hidden md:flex fixed top-0 left-64 right-0 z-30 h-14 bg-white border-b border-gray-200 items-center justify-end px-6">
                <div className="relative">
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                            {initials}
                        </div>
                        <span>{user.name}</span>
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {userMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg z-20 border border-gray-100 py-1">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                                <Link
                                    href={route('profile.edit')}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    onClick={() => setUserMenuOpen(false)}
                                >
                                    {Icon.profile}
                                    My Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sign out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Main content ─────────────────────────────────────────── */}
            <main className="md:ml-64 pt-14 min-h-screen">
                <div className="p-6">
                    {header && <div className="mb-6">{header}</div>}
                    {children}
                </div>
            </main>
        </div>
    );
}
