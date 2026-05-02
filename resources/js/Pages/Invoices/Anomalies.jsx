import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

// ─── Anomaly badge definitions ────────────────────────────────────────────────
const ANOMALY_TYPES = [
    {
        key: 'is_duplicate',
        label: 'Duplicate',
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-500',
        description: 'Same invoice number and supplier already exists.',
    },
    {
        key: 'amount_anomaly',
        label: 'Amount Error',
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        dot: 'bg-orange-500',
        description: 'Total TTC ≠ Subtotal HT + VAT amount.',
    },
    {
        key: 'vat_mismatch',
        label: 'VAT Mismatch',
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        dot: 'bg-yellow-500',
        description: 'Declared VAT amount doesn\'t match rate × subtotal.',
    },
    {
        key: 'date_anomaly',
        label: 'Date Error',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
        description: 'Due date is before issue date.',
    },
    {
        key: 'new_supplier',
        label: 'New Supplier',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        description: 'Supplier has never appeared in any previous invoice.',
    },
];

function AnomalyBadge({ type }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${type.bg} ${type.text} ${type.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${type.dot}`} />
            {type.label}
        </span>
    );
}

function formatAmount(amount, currency = 'MAD') {
    if (amount == null) return '—';
    return new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2 }).format(amount) + ' ' + currency;
}

function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Per-anomaly detail renderer ──────────────────────────────────────────────
function AnomalyDetail({ type, invoice }) {
    const cur = invoice.currency ?? 'MAD';

    if (type.key === 'amount_anomaly') {
        const expected = ((+invoice.subtotal_ht || 0) + (+invoice.vat_amount || 0)).toFixed(2);
        const actual = (+invoice.total_ttc || 0).toFixed(2);
        return (
            <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                    The declared total TTC does not equal Subtotal HT + VAT Amount.
                </p>
                <div className="rounded-lg overflow-hidden border border-orange-100">
                    <table className="w-full text-xs">
                        <tbody>
                            <tr className="bg-orange-50">
                                <td className="px-3 py-2 text-gray-500 w-1/2">Subtotal HT</td>
                                <td className="px-3 py-2 font-mono text-right text-gray-800">{formatAmount(invoice.subtotal_ht, cur)}</td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2 text-gray-500">VAT Amount</td>
                                <td className="px-3 py-2 font-mono text-right text-gray-800">{formatAmount(invoice.vat_amount, cur)}</td>
                            </tr>
                            <tr className="bg-green-50 border-t border-orange-100">
                                <td className="px-3 py-2 text-green-700 font-medium">Expected Total TTC</td>
                                <td className="px-3 py-2 font-mono text-right font-semibold text-green-700">{formatAmount(expected, cur)}</td>
                            </tr>
                            <tr className="bg-orange-100 border-t border-orange-200">
                                <td className="px-3 py-2 text-orange-700 font-medium">Declared Total TTC</td>
                                <td className="px-3 py-2 font-mono text-right font-semibold text-orange-700">{formatAmount(actual, cur)}</td>
                            </tr>
                            <tr className="border-t border-orange-200">
                                <td className="px-3 py-2 text-gray-500">Difference</td>
                                <td className="px-3 py-2 font-mono text-right font-bold text-red-600">
                                    {formatAmount(Math.abs(actual - expected).toFixed(2), cur)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (type.key === 'vat_mismatch') {
        const rate = +invoice.vat_rate || 0;
        const ht = +invoice.subtotal_ht || 0;
        const expected = (Math.round(ht * rate / 100 * 100) / 100).toFixed(2);
        const actual = (+invoice.vat_amount || 0).toFixed(2);
        return (
            <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                    The declared VAT amount doesn't match the VAT rate applied to the subtotal.
                </p>
                <div className="rounded-lg overflow-hidden border border-yellow-100">
                    <table className="w-full text-xs">
                        <tbody>
                            <tr className="bg-yellow-50">
                                <td className="px-3 py-2 text-gray-500 w-1/2">Subtotal HT</td>
                                <td className="px-3 py-2 font-mono text-right text-gray-800">{formatAmount(invoice.subtotal_ht, cur)}</td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2 text-gray-500">VAT Rate</td>
                                <td className="px-3 py-2 font-mono text-right text-gray-800">{rate}%</td>
                            </tr>
                            <tr className="bg-green-50 border-t border-yellow-100">
                                <td className="px-3 py-2 text-green-700 font-medium">Expected VAT ({rate}% × HT)</td>
                                <td className="px-3 py-2 font-mono text-right font-semibold text-green-700">{formatAmount(expected, cur)}</td>
                            </tr>
                            <tr className="bg-yellow-100 border-t border-yellow-200">
                                <td className="px-3 py-2 text-yellow-700 font-medium">Declared VAT Amount</td>
                                <td className="px-3 py-2 font-mono text-right font-semibold text-yellow-700">{formatAmount(actual, cur)}</td>
                            </tr>
                            <tr className="border-t border-yellow-200">
                                <td className="px-3 py-2 text-gray-500">Difference</td>
                                <td className="px-3 py-2 font-mono text-right font-bold text-red-600">
                                    {formatAmount(Math.abs(actual - expected).toFixed(2), cur)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (type.key === 'date_anomaly') {
        return (
            <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                    The due date is earlier than the issue date, which is logically impossible.
                </p>
                <div className="rounded-lg overflow-hidden border border-purple-100">
                    <table className="w-full text-xs">
                        <tbody>
                            <tr className="bg-purple-50">
                                <td className="px-3 py-2 text-gray-500 w-1/2">Issue Date</td>
                                <td className="px-3 py-2 font-mono text-right text-gray-800">{formatDate(invoice.issue_date)}</td>
                            </tr>
                            <tr className="bg-purple-100 border-t border-purple-200">
                                <td className="px-3 py-2 text-purple-700 font-medium">Due Date</td>
                                <td className="px-3 py-2 font-mono text-right font-semibold text-purple-700">{formatDate(invoice.due_date)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (type.key === 'is_duplicate') {
        return (
            <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                    Another invoice with the same number and supplier, or the same file content, already exists in your account.
                </p>
                <div className="rounded-lg overflow-hidden border border-red-100">
                    <table className="w-full text-xs">
                        <tbody>
                            <tr className="bg-red-50">
                                <td className="px-3 py-2 text-gray-500 w-1/2">Invoice Number</td>
                                <td className="px-3 py-2 font-mono text-right text-gray-800">{invoice.number ?? '—'}</td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2 text-gray-500">Supplier</td>
                                <td className="px-3 py-2 text-right text-gray-800">{invoice.supplier_name ?? '—'}</td>
                            </tr>
                            <tr className="border-t border-red-100 bg-red-50">
                                <td className="px-3 py-2 text-gray-500">File</td>
                                <td className="px-3 py-2 text-right text-gray-600 text-xs truncate max-w-[200px]">{invoice.original_filename}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (type.key === 'new_supplier') {
        return (
            <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                    This supplier has never appeared in any previously processed invoice. Verify it's not a typo or an unauthorized vendor.
                </p>
                <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs">
                    <span className="text-blue-700 font-semibold">{invoice.supplier_name}</span>
                    <span className="text-blue-500 ml-2">— first occurrence</span>
                </div>
            </div>
        );
    }

    return null;
}

// ─── Detail slide-over ────────────────────────────────────────────────────────
function DetailPanel({ invoice, onClose }) {
    if (!invoice) return null;

    const activeAnomalies = ANOMALY_TYPES.filter(t => invoice[t.key]);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            Invoice {invoice.number ?? <span className="italic text-gray-400">No number</span>}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">{invoice.supplier_name ?? '—'}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                    {/* Summary row */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-3">
                            <p className="text-xs text-gray-400 mb-1">Issue Date</p>
                            <p className="text-sm font-semibold text-gray-800">{formatDate(invoice.issue_date)}</p>
                        </div>
                        <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-3">
                            <p className="text-xs text-gray-400 mb-1">Due Date</p>
                            <p className={`text-sm font-semibold ${invoice.date_anomaly ? 'text-purple-600' : 'text-gray-800'}`}>
                                {formatDate(invoice.due_date)}
                            </p>
                        </div>
                        <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-3">
                            <p className="text-xs text-gray-400 mb-1">Total TTC</p>
                            <p className={`text-sm font-semibold ${invoice.amount_anomaly || invoice.vat_mismatch ? 'text-orange-600' : 'text-gray-800'}`}>
                                {formatAmount(invoice.total_ttc, invoice.currency)}
                            </p>
                        </div>
                    </div>

                    {/* Financial breakdown */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Financial Summary</h3>
                        <div className="rounded-lg border border-gray-100 overflow-hidden">
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-gray-50">
                                    <tr>
                                        <td className="px-4 py-2.5 text-gray-500">Subtotal HT</td>
                                        <td className="px-4 py-2.5 text-right font-mono text-gray-800">{formatAmount(invoice.subtotal_ht, invoice.currency)}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2.5 text-gray-500">
                                            VAT {invoice.vat_rate != null ? `(${invoice.vat_rate}%)` : ''}
                                        </td>
                                        <td className={`px-4 py-2.5 text-right font-mono ${invoice.vat_mismatch ? 'text-yellow-600 font-semibold' : 'text-gray-800'}`}>
                                            {formatAmount(invoice.vat_amount, invoice.currency)}
                                        </td>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="px-4 py-2.5 text-gray-700 font-medium">Total TTC</td>
                                        <td className={`px-4 py-2.5 text-right font-mono font-semibold ${invoice.amount_anomaly ? 'text-orange-600' : 'text-gray-900'}`}>
                                            {formatAmount(invoice.total_ttc, invoice.currency)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Anomaly details */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Detected Anomalies ({activeAnomalies.length})
                        </h3>
                        <div className="space-y-4">
                            {activeAnomalies.map(type => (
                                <div key={type.key} className={`rounded-xl border p-4 ${type.bg} ${type.border}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`w-2 h-2 rounded-full ${type.dot}`} />
                                        <span className={`text-sm font-semibold ${type.text}`}>{type.label}</span>
                                    </div>
                                    <AnomalyDetail type={type} invoice={invoice} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* File info */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Source File</h3>
                        <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-600 break-all">
                            {invoice.original_filename}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Anomalies({ invoices }) {
    const { data: rows, links, from, to, total } = invoices;
    const [selected, setSelected] = useState(null);

    const activeAnomalies = (invoice) =>
        ANOMALY_TYPES.filter(t => invoice[t.key]);

    return (
        <AppLayout>
            <Head title="Anomalies" />

            <div className="py-8 px-4 sm:px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Anomalies</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Invoices flagged automatically during extraction that require your attention.
                    </p>
                </div>

                {/* Legend */}
                <div className="mb-6 flex flex-wrap gap-3">
                    {ANOMALY_TYPES.map(t => (
                        <div key={t.key} className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-xs ${t.bg} ${t.border}`}>
                            <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${t.dot}`} />
                            <div>
                                <p className={`font-semibold ${t.text}`}>{t.label}</p>
                                <p className="text-gray-500 mt-0.5">{t.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {rows.length === 0 ? (
                        <div className="text-center py-20">
                            <svg className="mx-auto w-12 h-12 text-green-300 mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-base font-semibold text-gray-600">No anomalies detected</p>
                            <p className="text-sm text-gray-400 mt-1">All processed invoices are coherent.</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Supplier</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Anomalies</th>
                                    <th className="px-6 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {rows.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {invoice.number ?? <span className="text-gray-400 italic">No number</span>}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[160px]">
                                                {invoice.original_filename}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <p className="text-sm text-gray-700 max-w-[180px] truncate">
                                                {invoice.supplier_name ?? <span className="text-gray-300 italic">—</span>}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <p className="text-sm text-gray-600">{formatDate(invoice.issue_date)}</p>
                                            {invoice.due_date && (
                                                <p className={`text-xs mt-0.5 ${invoice.date_anomaly ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>
                                                    Due: {formatDate(invoice.due_date)}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right hidden sm:table-cell">
                                            <p className={`text-sm font-semibold ${invoice.amount_anomaly || invoice.vat_mismatch ? 'text-orange-600' : 'text-gray-900'}`}>
                                                {formatAmount(invoice.total_ttc, invoice.currency)}
                                            </p>
                                            {invoice.subtotal_ht && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    HT: {formatAmount(invoice.subtotal_ht, invoice.currency)}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {activeAnomalies(invoice).map(t => (
                                                    <AnomalyBadge key={t.key} type={t} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelected(invoice)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
                                                    <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {links && links.length > 3 && (
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            Showing {from}–{to} of {total} invoices
                        </p>
                        <div className="flex gap-1">
                            {links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    preserveScroll
                                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${link.active
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : link.url
                                            ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                            : 'border-gray-100 text-gray-300 cursor-not-allowed'
                                        }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <p className="mt-3 text-xs text-gray-400 text-right">
                    {rows.length} anomalous {rows.length === 1 ? 'invoice' : 'invoices'} displayed
                </p>
            </div>

            {/* Detail slide-over */}
            <DetailPanel invoice={selected} onClose={() => setSelected(null)} />
        </AppLayout>
    );
}
