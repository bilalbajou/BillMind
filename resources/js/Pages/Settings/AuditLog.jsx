import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(str) {
    if (!str) return '—';
    return new Date(str).toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function subjectLabel(type) {
    if (!type) return '—';
    const parts = type.split('\\');
    return parts[parts.length - 1];
}

const EVENT_BADGE = {
    created: 'bg-green-50 text-green-700 ring-green-200',
    updated: 'bg-blue-50  text-blue-700  ring-blue-200',
    deleted: 'bg-red-50   text-red-700   ring-red-200',
};

// ─── Filters bar ───────────────────────────────────────────────────────────────

function FiltersBar({ users, filters }) {
    const [form, setForm] = useState({
        user_id:   filters.user_id   ?? '',
        date_from: filters.date_from ?? '',
        date_to:   filters.date_to   ?? '',
    });

    const apply = useCallback(() => {
        router.get(route('settings.audit-log'), form, { preserveState: true, replace: true });
    }, [form]);

    const reset = () => {
        const empty = { user_id: '', date_from: '', date_to: '' };
        setForm(empty);
        router.get(route('settings.audit-log'), empty, { preserveState: false, replace: true });
    };

    const handleKey = (e) => { if (e.key === 'Enter') apply(); };

    const inputCls =
        'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition';

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-end">
            {/* User */}
            <div className="flex flex-col gap-1 min-w-[180px]">
                <label className="text-xs font-medium text-gray-500">Utilisateur</label>
                <select
                    className={inputCls}
                    value={form.user_id}
                    onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                    onKeyDown={handleKey}
                >
                    <option value="">Tous les utilisateurs</option>
                    {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>
            </div>

            {/* Date from */}
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Du</label>
                <input
                    type="date"
                    className={inputCls}
                    value={form.date_from}
                    onChange={(e) => setForm({ ...form, date_from: e.target.value })}
                    onKeyDown={handleKey}
                />
            </div>

            {/* Date to */}
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Au</label>
                <input
                    type="date"
                    className={inputCls}
                    value={form.date_to}
                    onChange={(e) => setForm({ ...form, date_to: e.target.value })}
                    onKeyDown={handleKey}
                />
            </div>

            <button
                onClick={apply}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
            >
                Filtrer
            </button>
            <button
                onClick={reset}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
            >
                Réinitialiser
            </button>
        </div>
    );
}

// ─── Properties diff ───────────────────────────────────────────────────────────

function PropertiesDiff({ properties }) {
    if (!properties) return null;

    const old = properties.old ?? null;
    const next = properties.attributes ?? null;

    if (!old && !next) return null;

    // For created/deleted events only `attributes` or `old` exists
    if (!old) {
        const entries = Object.entries(next ?? {});
        if (!entries.length) return null;
        return (
            <ul className="mt-1 space-y-0.5 text-xs text-gray-500">
                {entries.map(([k, v]) => (
                    <li key={k}><span className="font-medium text-gray-700">{k}:</span> {String(v ?? '—')}</li>
                ))}
            </ul>
        );
    }

    // Updated: show changed fields only
    const changedKeys = Object.keys(next ?? {}).filter((k) => String(old[k]) !== String((next ?? {})[k]));
    if (!changedKeys.length) return null;

    return (
        <table className="mt-1 text-xs w-full">
            <thead>
                <tr className="text-gray-400">
                    <th className="text-left pr-4 font-medium">Champ</th>
                    <th className="text-left pr-4 font-medium">Avant</th>
                    <th className="text-left font-medium">Après</th>
                </tr>
            </thead>
            <tbody>
                {changedKeys.map((k) => (
                    <tr key={k} className="text-gray-600">
                        <td className="pr-4 font-medium text-gray-700">{k}</td>
                        <td className="pr-4 text-red-500 line-through">{String(old[k] ?? '—')}</td>
                        <td className="text-green-600">{String((next ?? {})[k] ?? '—')}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

// ─── Activity row ──────────────────────────────────────────────────────────────

function ActivityRow({ activity }) {
    const [expanded, setExpanded] = useState(false);
    const event = activity.event ?? 'updated';
    const badgeCls = EVENT_BADGE[event] ?? 'bg-gray-50 text-gray-600 ring-gray-200';

    const hasDetails =
        activity.properties &&
        (activity.properties.old || activity.properties.attributes);

    return (
        <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors align-top">
            {/* Date */}
            <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                {formatDate(activity.created_at)}
            </td>

            {/* Utilisateur */}
            <td className="px-4 py-3 text-sm">
                {activity.causer ? (
                    <div>
                        <p className="font-medium text-gray-900">{activity.causer.name}</p>
                        <p className="text-xs text-gray-400">{activity.causer.email}</p>
                    </div>
                ) : (
                    <span className="text-gray-400 italic">Système</span>
                )}
            </td>

            {/* Événement */}
            <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${badgeCls}`}>
                    {event}
                </span>
            </td>

            {/* Modèle */}
            <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                {subjectLabel(activity.subject_type)}
                {activity.subject_id && (
                    <span className="ml-1 text-xs text-gray-400">#{activity.subject_id}</span>
                )}
            </td>

            {/* Description + diff */}
            <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                <p className="leading-snug">{activity.description}</p>
                {hasDetails && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="mt-1 text-xs text-indigo-600 hover:underline"
                    >
                        {expanded ? 'Masquer les détails' : 'Voir les détails'}
                    </button>
                )}
                {expanded && <PropertiesDiff properties={activity.properties} />}
            </td>
        </tr>
    );
}

// ─── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ meta, links }) {
    if (!meta || meta.last_page <= 1) return null;

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
                {meta.from}–{meta.to} sur {meta.total} entrées
            </p>
            <div className="flex gap-1">
                {links.map((link, i) => (
                    link.url ? (
                        <Link
                            key={i}
                            href={link.url}
                            preserveState
                            className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                                link.active
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span
                            key={i}
                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-100 text-gray-300"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    )
                ))}
            </div>
        </div>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AuditLog({ activities, users, filters }) {
    return (
        <AppLayout>
            <Head title="Journal d'audit" />

            <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Journal d'audit</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Historique complet des créations, modifications et suppressions.
                    </p>
                </div>

                {/* Filters */}
                <FiltersBar users={users} filters={filters} />

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    {activities.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-sm font-medium">Aucune activité trouvée</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Événement</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Modèle</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activities.data.map((activity) => (
                                            <ActivityRow key={activity.id} activity={activity} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination meta={activities.meta} links={activities.links} />
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
