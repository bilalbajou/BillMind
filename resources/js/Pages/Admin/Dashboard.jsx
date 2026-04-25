import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(str) {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDatetime(str) {
    if (!str) return '—';
    return new Date(str).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function subjectLabel(type) {
    if (!type) return '—';
    return type.split('\\').pop();
}

const EVENT_COLOR = {
    created: 'text-green-600 bg-green-50',
    updated: 'text-blue-600 bg-blue-50',
    deleted: 'text-red-600 bg-red-50',
};

const STATUS_COLOR = {
    processed:  'bg-green-50 text-green-700 ring-green-200',
    pending:    'bg-yellow-50 text-yellow-700 ring-yellow-200',
    processing: 'bg-blue-50 text-blue-700 ring-blue-200',
    error:      'bg-red-50 text-red-700 ring-red-200',
};

// ─── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = 'indigo', icon }) {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-600',
        green:  'bg-green-50  text-green-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        red:    'bg-red-50    text-red-600',
        blue:   'bg-blue-50   text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
    };
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
            <div className={`p-2.5 rounded-lg ${colors[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ─── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
            </div>
            {children}
        </div>
    );
}

// ─── Tenants table ─────────────────────────────────────────────────────────────

function TenantsTable({ tenants }) {
    return (
        <Section title={`Tenants — ${tenants.length} total`}>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {['Entreprise', 'Plan', 'Utilisateurs', 'Factures', 'Traitées', 'Créé le', 'Statut'].map(h => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tenants.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">Aucun tenant</td>
                            </tr>
                        ) : tenants.map(tenant => (
                            <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-gray-900">{tenant.company_name ?? '—'}</p>
                                    <p className="text-xs text-gray-400">{tenant.email}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${
                                        tenant.plan === 'trial'
                                            ? 'bg-yellow-50 text-yellow-700 ring-yellow-200'
                                            : 'bg-indigo-50 text-indigo-700 ring-indigo-200'
                                    }`}>
                                        {tenant.plan ?? 'trial'}
                                    </span>
                                    {tenant.plan === 'trial' && tenant.trial_ends_at && (
                                        <p className="text-xs text-gray-400 mt-0.5">expires {fmt(tenant.trial_ends_at)}</p>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center font-medium text-gray-700">
                                    {tenant.users_count}
                                </td>
                                <td className="px-4 py-3 text-center font-medium text-gray-700">
                                    {tenant.invoice_total}
                                </td>
                                <td className="px-4 py-3 text-center text-green-600 font-medium">
                                    {tenant.invoice_processed}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                    {fmt(tenant.created_at)}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${
                                        tenant.is_active
                                            ? 'bg-green-50 text-green-700 ring-green-200'
                                            : 'bg-gray-100 text-gray-500 ring-gray-200'
                                    }`}>
                                        {tenant.is_active ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Section>
    );
}

// ─── Recent activity ───────────────────────────────────────────────────────────

function RecentActivity({ activities }) {
    return (
        <Section title="Activité récente">
            {activities.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-gray-400">Aucune activité enregistrée.</p>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {activities.map(a => (
                        <li key={a.id} className="px-5 py-3 flex items-start gap-3 hover:bg-gray-50">
                            <span className={`mt-0.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${EVENT_COLOR[a.event] ?? 'text-gray-600 bg-gray-100'}`}>
                                {a.event ?? 'updated'}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-700 truncate">{a.description}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {a.causer?.name ?? 'Système'} · {subjectLabel(a.subject_type)} · {fmtDatetime(a.created_at)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </Section>
    );
}

// ─── Signups chart (simple bar) ────────────────────────────────────────────────

function SignupsChart({ signupsPerMonth }) {
    const entries = Object.entries(signupsPerMonth);
    if (!entries.length) return null;
    const max = Math.max(...entries.map(([, v]) => v), 1);

    return (
        <Section title="Nouveaux tenants (6 derniers mois)">
            <div className="px-5 py-4 flex items-end gap-3 h-36">
                {entries.map(([month, count]) => (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-semibold text-gray-700">{count}</span>
                        <div
                            className="w-full rounded-t bg-indigo-500 transition-all"
                            style={{ height: `${Math.round((count / max) * 80)}px`, minHeight: count > 0 ? '4px' : '0' }}
                        />
                        <span className="text-xs text-gray-400">{month.slice(5)}</span>
                    </div>
                ))}
            </div>
        </Section>
    );
}

// ─── Invoices by status ────────────────────────────────────────────────────────

function InvoiceStatusBreakdown({ invoicesByStatus }) {
    const total = Object.values(invoicesByStatus).reduce((s, v) => s + v, 0) || 1;
    const items = [
        { key: 'processed',  label: 'Traitées',    color: 'bg-green-500'  },
        { key: 'pending',    label: 'En attente',  color: 'bg-yellow-400' },
        { key: 'processing', label: 'En cours',    color: 'bg-blue-500'   },
        { key: 'error',      label: 'Erreur',      color: 'bg-red-500'    },
    ];

    return (
        <Section title="Factures par statut">
            <div className="px-5 py-4 space-y-3">
                {items.map(({ key, label, color }) => {
                    const count = invoicesByStatus[key] ?? 0;
                    const pct = Math.round((count / total) * 100);
                    return (
                        <div key={key}>
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>{label}</span>
                                <span className="font-semibold">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </Section>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminDashboard({ stats, tenants, recentActivity, invoicesByStatus, signupsPerMonth }) {
    return (
        <AppLayout>
            <Head title="Super Admin — Dashboard" />

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-600">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
                        <p className="text-sm text-gray-500">Vue globale de la plateforme</p>
                    </div>
                </div>

                {/* Stat grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <StatCard
                        label="Tenants"
                        value={stats.totalTenants}
                        sub={`${stats.activeTenants} actifs · ${stats.trialTenants} trial`}
                        color="indigo"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M9 8h1m-1 4h1m4-4h1m-1 4h1M6 21V5a2 2 0 012-2h8a2 2 0 012 2v16" /></svg>}
                    />
                    <StatCard
                        label="Utilisateurs"
                        value={stats.totalUsers}
                        sub={`${stats.activeUsers} actifs`}
                        color="purple"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-5a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                    />
                    <StatCard
                        label="Factures"
                        value={stats.totalInvoices}
                        sub={`${stats.processedInvoices} traitées`}
                        color="blue"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                    />
                    <StatCard
                        label="En attente"
                        value={stats.pendingInvoices}
                        color="yellow"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <StatCard
                        label="Erreurs"
                        value={stats.errorInvoices}
                        color="red"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                    />
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SignupsChart signupsPerMonth={signupsPerMonth} />
                    <InvoiceStatusBreakdown invoicesByStatus={invoicesByStatus} />
                </div>

                {/* Tenants list */}
                <TenantsTable tenants={tenants} />

                {/* Recent activity */}
                <RecentActivity activities={recentActivity} />

            </div>
        </AppLayout>
    );
}
