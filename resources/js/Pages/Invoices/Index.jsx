import CategoryIcon from '@/Components/CategoryIcon';
import { Sparkles, RotateCcw, Loader2 } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'processed', label: 'Processed' },
    { value: 'validated', label: 'Validated' },
    { value: 'archived', label: 'Archived' },
    { value: 'error', label: 'Error' },
];

const STATUS_BADGE = {
    pending: 'bg-yellow-50 text-yellow-700 ring-yellow-200',
    processing: 'bg-blue-50 text-blue-700 ring-blue-200',
    processed: 'bg-green-50 text-green-700 ring-green-200',
    validated: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    archived: 'bg-gray-100 text-gray-600 ring-gray-200',
    error: 'bg-red-50 text-red-700 ring-red-200',
};

function decodeHtml(str) {
    if (!str || typeof str !== 'string') return str;
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
}

function formatSize(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(str) {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatAmount(amount, currency = 'MAD') {
    if (amount == null) return '—';
    return new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2 }).format(amount) + ' ' + currency;
}

function DetailRow({ label, value, className = '' }) {
    return (
        <div className={className}>
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-900">{decodeHtml(value) || '—'}</p>
        </div>
    );
}

function DetailSection({ title, children }) {
    return (
        <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
            {children}
        </div>
    );
}

function AnomalyBadge({ active, label, color }) {
    if (!active) return null;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${color}`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
            {label}
        </span>
    );
}

function InvoiceDetailPanel({ invoice, onClose }) {
    if (!invoice) return null;

    const hasAnomalies = invoice.is_duplicate || invoice.amount_anomaly || invoice.vat_mismatch || invoice.date_anomaly || invoice.new_supplier;

    return (
        <>
            <div className="fixed inset-0 bg-black/30 z-40 transition-opacity" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-3xl bg-white shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        {invoice.category && (
                            <CategoryIcon icon={invoice.category.icon} color={invoice.category.color} size={20} />
                        )}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {decodeHtml(invoice.number) ?? <span className="italic text-gray-400">N/A</span>}
                            </h2>
                            <p className="text-sm text-gray-500">{decodeHtml(invoice.supplier_name) ?? '—'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${STATUS_BADGE[invoice.status] ?? 'bg-gray-50 text-gray-600 ring-gray-200'}`}>
                            {invoice.status}
                        </span>
                        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    {/* Key Info */}
                    <DetailSection title="Invoice Information">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 border border-gray-100 rounded-lg p-4">
                            <DetailRow label="Issue Date" value={formatDate(invoice.issue_date)} />
                            <DetailRow label="Due Date" value={formatDate(invoice.due_date)} />
                            <DetailRow label="PO Reference" value={invoice.po_reference} />
                            <DetailRow label="Currency" value={invoice.currency} />
                            <DetailRow label="Category" value={invoice.category?.name} />
                            {invoice.category_corrected_id && invoice.corrected_category && (
                                <DetailRow label="Corrected Category" value={invoice.corrected_category.name} />
                            )}
                            {invoice.category_score != null && (
                                <DetailRow label="Category Score" value={`${Number(invoice.category_score).toFixed(0)}%`} />
                            )}
                            {invoice.extraction_score != null && (
                                <DetailRow label="Extraction Score" value={`${Number(invoice.extraction_score).toFixed(0)}%`} />
                            )}
                        </div>
                    </DetailSection>

                    {/* Supplier Details */}
                    <DetailSection title="Supplier">
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <DetailRow label="Name" value={invoice.supplier_name} />
                            <DetailRow label="Address" value={invoice.supplier_address} className="col-span-2" />
                            <DetailRow label="ICE" value={invoice.supplier_ice} />
                            <DetailRow label="IF" value={invoice.supplier_if} />
                            <DetailRow label="RC" value={invoice.supplier_rc} />
                            <DetailRow label="Phone" value={invoice.supplier_phone} />
                            <DetailRow label="Email" value={invoice.supplier_email} />
                            <DetailRow label="RIB" value={invoice.supplier_rib} />
                        </div>
                    </DetailSection>

                    {/* Customer Details */}
                    {(invoice.customer_name || invoice.customer_address || invoice.customer_ice || invoice.customer_if) && (
                        <DetailSection title="Customer">
                            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <DetailRow label="Name" value={invoice.customer_name} />
                                <DetailRow label="Address" value={invoice.customer_address} className="col-span-2" />
                                <DetailRow label="ICE" value={invoice.customer_ice} />
                                <DetailRow label="IF" value={invoice.customer_if} />
                            </div>
                        </DetailSection>
                    )}

                    {/* Line Items */}
                    <DetailSection title="Line Items">
                        <div className="border border-gray-100 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-3 py-2 font-medium text-gray-500 text-xs text-center whitespace-nowrap">#</th>
                                            <th className="px-3 py-2 font-medium text-gray-500 text-xs text-center">Description</th>
                                            <th className="px-3 py-2 font-medium text-gray-500 text-xs text-center whitespace-nowrap">Qté</th>
                                            <th className="px-3 py-2 font-medium text-gray-500 text-xs text-center whitespace-nowrap">P.U. HT</th>
                                            <th className="px-3 py-2 font-medium text-gray-500 text-xs text-center whitespace-nowrap">Rem.</th>
                                            <th className="px-3 py-2 font-medium text-gray-500 text-xs text-center whitespace-nowrap">HT</th>
                                            <th className="px-3 py-2 font-medium text-gray-500 text-xs text-center whitespace-nowrap">TVA %</th>
                                            <th className="px-3 py-2 font-medium text-gray-500 text-xs text-center whitespace-nowrap">TVA</th>
                                            <th className="px-3 py-2 font-medium text-gray-500 text-xs text-center whitespace-nowrap">TTC</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {invoice.items && invoice.items.length > 0 ? invoice.items.map((item, idx) => {
                                            const vatAmount = item.vat_amount != null
                                                ? Number(item.vat_amount)
                                                : Math.round(Number(item.amount_ht) * Number(item.vat_rate) / 100 * 100) / 100;
                                            const cur = invoice.currency ?? 'MAD';
                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-3 py-2.5 text-center text-gray-400 text-xs">{idx + 1}</td>
                                                    <td className="px-3 py-2.5 text-gray-800 max-w-[180px]">
                                                        <div className="truncate">{decodeHtml(item.description)}</div>
                                                        {item.sub_description && <div className="text-xs text-gray-400 mt-0.5 truncate">{decodeHtml(item.sub_description)}</div>}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center text-gray-600 text-xs whitespace-nowrap">
                                                        {Number(item.quantity) !== 0 ? Number(item.quantity) : ''}{item.unit && item.unit !== 'piece' && item.unit !== 'other' ? ` ${item.unit}` : ''}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center text-gray-600 text-xs whitespace-nowrap">{formatAmount(item.unit_price, cur)}</td>
                                                    <td className="px-3 py-2.5 text-center text-gray-500 text-xs whitespace-nowrap">
                                                        {Number(item.discount_rate) > 0 ? `${Number(item.discount_rate)}%` : '—'}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center text-gray-600 text-xs whitespace-nowrap">{formatAmount(item.amount_ht, cur)}</td>
                                                    <td className="px-3 py-2.5 text-center text-xs whitespace-nowrap">
                                                        {Number(item.vat_rate) > 0
                                                            ? <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 font-medium">{Number(item.vat_rate)}%</span>
                                                            : <span className="text-gray-400">—</span>
                                                        }
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center text-indigo-600 text-xs font-medium whitespace-nowrap">{formatAmount(vatAmount, cur)}</td>
                                                    <td className="px-3 py-2.5 text-center text-gray-800 text-xs font-semibold whitespace-nowrap">{formatAmount(item.amount_ttc, cur)}</td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr><td colSpan="9" className="px-4 py-6 text-center text-gray-400 text-sm">No items found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </DetailSection>

                    {/* Financial Summary */}
                    <DetailSection title="Financial Summary">
                        {(() => {
                            const totalVat = (invoice.items ?? []).reduce((sum, item) => {
                                const vatAmount = item.vat_amount != null
                                    ? Number(item.vat_amount)
                                    : Math.round(Number(item.amount_ht) * Number(item.vat_rate) / 100 * 100) / 100;
                                return sum + (vatAmount || 0);
                            }, 0);
                            const cur = invoice.currency ?? 'MAD';
                            return (
                                <div className="flex justify-end">
                                    <div className="w-72 space-y-2 bg-gray-50 rounded-lg p-4 border border-gray-100">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Sous-total HT</span>
                                            <span>{formatAmount(invoice.subtotal_ht, cur)}</span>
                                        </div>
                                        {Number(invoice.discount_rate) > 0 && (
                                            <div className="flex justify-between text-sm text-red-600">
                                                <span>Remise ({Number(invoice.discount_rate)}%)</span>
                                                <span>- {formatAmount(invoice.discount_amount, cur)}</span>
                                            </div>
                                        )}
                                        {invoice.taxable_amount != null && Number(invoice.subtotal_ht) !== Number(invoice.taxable_amount) && (
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Montant imposable</span>
                                                <span>{formatAmount(invoice.taxable_amount, cur)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Total TVA</span>
                                            <span className="font-medium text-indigo-600">{formatAmount(totalVat, cur)}</span>
                                        </div>
                                        <div className="flex justify-between text-base font-semibold text-gray-900 border-t border-gray-200 pt-2 mt-2">
                                            <span>Total TTC</span>
                                            <span>{formatAmount(invoice.total_ttc, cur)}</span>
                                        </div>
                                        {invoice.amount_in_words && (
                                            <p className="text-xs text-gray-400 italic pt-1">{invoice.amount_in_words}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </DetailSection>

                    {/* Payment Info */}
                    {(invoice.payment_method || invoice.payment_terms || invoice.payment_reference || invoice.late_penalty || invoice.bank_name || invoice.bank_iban) && (
                        <DetailSection title="Payment">
                            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <DetailRow label="Method" value={invoice.payment_method} />
                                <DetailRow label="Terms" value={invoice.payment_terms} />
                                <DetailRow label="Reference" value={invoice.payment_reference} />
                                <DetailRow label="Bank" value={invoice.bank_name} />
                                <DetailRow label="IBAN" value={invoice.bank_iban} className="col-span-2" />
                                {invoice.late_penalty && (
                                    <DetailRow label="Late Penalty" value={invoice.late_penalty} className="col-span-3" />
                                )}
                            </div>
                        </DetailSection>
                    )}

                    {/* Anomaly Flags */}
                    {hasAnomalies && (
                        <DetailSection title="Anomaly Flags">
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex flex-wrap gap-2">
                                <AnomalyBadge active={invoice.is_duplicate} label="Duplicate" color="bg-amber-100 text-amber-700 ring-1 ring-amber-200" />
                                <AnomalyBadge active={invoice.amount_anomaly} label="Amount Mismatch" color="bg-red-100 text-red-700 ring-1 ring-red-200" />
                                <AnomalyBadge active={invoice.vat_mismatch} label="VAT Mismatch" color="bg-orange-100 text-orange-700 ring-1 ring-orange-200" />
                                <AnomalyBadge active={invoice.date_anomaly} label="Date Anomaly" color="bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200" />
                                <AnomalyBadge active={invoice.new_supplier} label="New Supplier" color="bg-blue-100 text-blue-700 ring-1 ring-blue-200" />
                            </div>
                        </DetailSection>
                    )}

                    {/* File Info */}
                    <DetailSection title="File Information">
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <DetailRow label="Filename" value={invoice.original_filename} className="col-span-2" />
                            <DetailRow label="Type" value={invoice.file_type?.toUpperCase()} />
                            <DetailRow label="Size" value={formatSize(invoice.file_size)} />
                            <DetailRow label="MIME" value={invoice.mime_type} />
                            <DetailRow label="Uploaded By" value={invoice.uploaded_by?.name ?? invoice.uploaded_by} />
                            <DetailRow label="Uploaded At" value={formatDate(invoice.created_at)} className="col-span-2" />
                        </div>
                    </DetailSection>
                </div>
            </div>
        </>
    );
}


export default function Index() {
    const { invoices, categories, filters } = usePage().props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [categoryId, setCategoryId] = useState(filters.category_id ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ? new Date(filters.date_from) : null);
    const [dateTo, setDateTo] = useState(filters.date_to ? new Date(filters.date_to) : null);
    const [selected, setSelected] = useState([]);
    const [liveStatuses, setLiveStatuses] = useState({}); // { [id]: { status, error_message } }
    const [loadingIds, setLoadingIds] = useState({}); // { [id]: true } while request in-flight
    const [detailedInvoice, setDetailedInvoice] = useState(null);
    const [loadingDetailsId, setLoadingDetailsId] = useState(null);
    const pollingRef = useRef(null);

    // Poll every 4s while any invoice on this page is still processing
    useEffect(() => {
        const processingIds = invoices.data
            .filter(inv => (liveStatuses[inv.id]?.status ?? inv.status) === 'processing')
            .map(inv => inv.id);

        if (processingIds.length === 0) {
            clearInterval(pollingRef.current);
            return;
        }

        pollingRef.current = setInterval(async () => {
            try {
                const params = new URLSearchParams();
                processingIds.forEach(id => params.append('ids[]', id));
                const { data } = await axios.get(route('invoices.statuses') + '?' + params.toString());

                setLiveStatuses(prev => {
                    const next = { ...prev };
                    Object.entries(data).forEach(([id, row]) => { next[id] = row; });
                    return next;
                });
            } catch (_) { /* silently ignore network blips */ }
        }, 4000);

        return () => clearInterval(pollingRef.current);
    }, [invoices.data, liveStatuses]);

    const allIds = invoices.data.map(i => i.id);
    const allSelected = allIds.length > 0 && allIds.every(id => selected.includes(id));
    const someSelected = selected.length > 0;

    const toggleAll = () => setSelected(allSelected ? [] : allIds);
    const toggleOne = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const applyFilters = useCallback((overrides = {}) => {
        const params = {
            search: overrides.search ?? search,
            status: overrides.status ?? status,
            category_id: overrides.category_id ?? categoryId,
            date_from: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : '',
            date_to: dateTo ? format(dateTo, 'yyyy-MM-dd') : '',
        };
        // Remove empty params
        Object.keys(params).forEach(k => !params[k] && delete params[k]);
        router.get(route('invoices.index'), params, { preserveState: true, replace: true });
    }, [search, status, categoryId, dateFrom, dateTo]);

    const handleDelete = async (id, name) => {
        const { isConfirmed } = await Swal.fire({
            title: 'Delete invoice?',
            text: `"${name}" will be moved to trash.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel',
        });
        if (!isConfirmed) return;
        router.delete(route('invoices.destroy', id), { preserveScroll: true, onSuccess: () => setSelected(prev => prev.filter(x => x !== id)) });
    };

    const handleBulkDelete = async () => {
        const count = selected.length;
        const { isConfirmed } = await Swal.fire({
            title: `Delete ${count} invoice${count > 1 ? 's' : ''}?`,
            text: 'They will be moved to trash.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete all',
            cancelButtonText: 'Cancel',
        });
        if (!isConfirmed) return;
        router.post(route('invoices.bulk-destroy'), { ids: selected }, { preserveScroll: true, onSuccess: () => setSelected([]) });
    };

    const handleBulkExtract = async () => {
        const count = selected.length;
        const { isConfirmed } = await Swal.fire({
            title: `Extract ${count} invoice${count > 1 ? 's' : ''}?`,
            text: 'AI extraction will be queued for the selected invoices.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, extract',
            cancelButtonText: 'Cancel',
        });
        if (!isConfirmed) return;
        router.post(route('invoices.bulk-extract'), { ids: selected }, { preserveScroll: true, onSuccess: () => setSelected([]) });
    };

    const handleExtract = async (inv) => {
        const { isConfirmed } = await Swal.fire({
            title: 'Start extraction?',
            text: `AI will extract data from "${inv.original_filename}".`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, extract',
            cancelButtonText: 'Cancel',
        });
        if (!isConfirmed) return;
        setLoadingIds(p => ({ ...p, [inv.id]: true }));
        router.post(route('invoices.extract', inv.id), {}, {
            preserveScroll: true,
            onFinish: () => setLoadingIds(p => { const n = { ...p }; delete n[inv.id]; return n; }),
        });
    };

    const handleRetry = async (inv) => {
        const { isConfirmed } = await Swal.fire({
            title: 'Retry extraction?',
            text: `Re-run AI extraction for "${inv.original_filename}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, retry',
            cancelButtonText: 'Cancel',
        });
        if (!isConfirmed) return;
        setLoadingIds(p => ({ ...p, [inv.id]: true }));
        router.post(route('invoices.extract', inv.id), {}, {
            preserveScroll: true,
            onFinish: () => setLoadingIds(p => { const n = { ...p }; delete n[inv.id]; return n; }),
        });
    };

    const handleShowDetails = async (inv) => {
        setLoadingDetailsId(inv.id);
        try {
            const { data } = await axios.get(route('invoices.show', inv.id));
            setDetailedInvoice(data);
        } catch (e) {
            console.error(e);
            Swal.fire('Error', 'Failed to load invoice details', 'error');
        } finally {
            setLoadingDetailsId(null);
        }
    };

    const clearFilters = () => {
        setSearch(''); setStatus(''); setCategoryId(''); setDateFrom(null); setDateTo(null);
        router.get(route('invoices.index'), {}, { preserveState: true, replace: true });
    };

    const hasFilters = search || status || categoryId || dateFrom || dateTo;

    return (
        <AppLayout>
            <Head title="All Invoices" />

            <div className="py-8 px-4 sm:px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">All Invoices</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {invoices.total} invoice{invoices.total !== 1 ? 's' : ''} total
                        </p>
                    </div>
                    <Link
                        href={route('invoices.upload')}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4 space-y-3">
                    {/* Row 1 — Search */}
                    <div className="flex">
                        <div className="relative w-full">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by filename, number, supplier..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Row 2 — Status + Category + Dates + Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                        >
                            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>

                        <select
                            value={categoryId}
                            onChange={e => setCategoryId(e.target.value)}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <DatePicker
                            selected={dateFrom}
                            onChange={date => setDateFrom(date)}
                            selectsStart
                            startDate={dateFrom}
                            endDate={dateTo}
                            placeholderText="From date"
                            dateFormat="dd MMM yyyy"
                            isClearable
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white w-36"
                        />

                        <span className="text-gray-300 text-sm">→</span>

                        <DatePicker
                            selected={dateTo}
                            onChange={date => setDateTo(date)}
                            selectsEnd
                            startDate={dateFrom}
                            endDate={dateTo}
                            minDate={dateFrom}
                            placeholderText="To date"
                            dateFormat="dd MMM yyyy"
                            isClearable
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white w-36"
                        />

                        <div className="flex items-center gap-2 ml-auto">
                            {hasFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-700 transition"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear all
                                </button>
                            )}
                            <button
                                onClick={() => applyFilters()}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                                </svg>
                                Apply Filters
                            </button>
                            <a
                                href={route('invoices.export', {
                                    search: search || undefined,
                                    status: status || undefined,
                                    category_id: categoryId || undefined,
                                    date_from: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
                                    date_to: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined
                                })}
                                download
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Export
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions Bar */}
                {someSelected && (
                    <div className="flex items-center justify-between bg-indigo-600 text-white rounded-xl px-5 py-3 mb-3">
                        <span className="text-sm font-medium">{selected.length} invoice{selected.length > 1 ? 's' : ''} selected</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleBulkExtract}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/20 hover:bg-white/30 transition"
                            >
                                <Sparkles className="w-4 h-4" />
                                Extract All
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete All
                            </button>
                            <button onClick={() => setSelected([])} className="p-1.5 rounded-lg hover:bg-white/20 transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="px-4 py-3 text-left w-10">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleAll}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-5 py-3 text-left">File</th>
                                    <th className="px-5 py-3 text-left">Category</th>
                                    <th className="px-5 py-3 text-left">Supplier</th>
                                    <th className="px-5 py-3 text-left">Date</th>
                                    <th className="px-5 py-3 text-right">Size</th>
                                    <th className="px-5 py-3 text-center">Status</th>
                                    <th className="px-5 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {invoices.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-16 text-center text-gray-400">
                                            <svg className="mx-auto w-10 h-10 mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            No invoices found.
                                        </td>
                                    </tr>
                                ) : invoices.data.map(inv => (
                                    <tr key={inv.id} className={`hover:bg-gray-50 transition-colors ${selected.includes(inv.id) ? 'bg-indigo-50/50' : ''}`}>
                                        {/* Checkbox */}
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selected.includes(inv.id)}
                                                onChange={() => toggleOne(inv.id)}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            />
                                        </td>

                                        {/* File */}
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <FileIcon mime={inv.mime_type} />
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-800 truncate max-w-[200px]">{inv.original_filename}</p>
                                                    {inv.number && (
                                                        <p className="text-xs text-gray-400">{inv.number}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="px-5 py-3">
                                            {inv.category ? (
                                                <div className="flex items-center gap-1.5">
                                                    <CategoryIcon icon={inv.category.icon} color={inv.category.color} size={14} />
                                                    <span className="text-gray-700">{inv.category.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">—</span>
                                            )}
                                        </td>

                                        {/* Supplier */}
                                        <td className="px-5 py-3 text-gray-600">{decodeHtml(inv.supplier_name) ?? '—'}</td>

                                        {/* Date */}
                                        <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(inv.created_at)}</td>

                                        {/* Size */}
                                        <td className="px-5 py-3 text-right text-gray-500 whitespace-nowrap">{formatSize(inv.file_size)}</td>

                                        {/* Status */}
                                        <td className="px-5 py-3 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${STATUS_BADGE[liveStatuses[inv.id]?.status ?? inv.status] ?? 'bg-gray-50 text-gray-600 ring-gray-200'}`}>
                                                {liveStatuses[inv.id]?.status ?? inv.status}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {/* Download */}
                                                <a
                                                    href={route('invoices.download', inv.id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                                    title="View"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </a>
                                                {/* Extract / Retry / Processing spinner */}
                                                {(() => {
                                                    const currentStatus = liveStatuses[inv.id]?.status ?? inv.status;

                                                    const isLoading = loadingIds[inv.id];
                                                    const isLoadingDetails = loadingDetailsId === inv.id;

                                                    if (currentStatus === 'processing' || isLoading || isLoadingDetails) {
                                                        return (
                                                            <span className="p-1.5 text-blue-400">
                                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                            </span>
                                                        );
                                                    }
                                                    if (currentStatus === 'processed') {
                                                        return (
                                                            <button
                                                                onClick={() => handleShowDetails(inv)}
                                                                className="p-1.5 rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50 transition"
                                                                title="View Details"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </button>
                                                        );
                                                    }
                                                    if (currentStatus === 'pending') {
                                                        return (
                                                            <button
                                                                onClick={() => handleExtract(inv)}
                                                                className="p-1.5 rounded-md text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition"
                                                                title="Extract"
                                                            >
                                                                <Sparkles className="w-5 h-5" />
                                                            </button>
                                                        );
                                                    }
                                                    if (currentStatus === 'error') {
                                                        return (
                                                            <button
                                                                onClick={() => handleRetry(inv)}
                                                                className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition"
                                                                title="Retry extraction"
                                                            >
                                                                <RotateCcw className="w-5 h-5" />
                                                            </button>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                                {/* Delete */}
                                                <button
                                                    onClick={() => handleDelete(inv.id, inv.original_filename)}
                                                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                                                    title="Delete"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {invoices.last_page > 1 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
                            <p className="text-xs text-gray-500">
                                Showing {invoices.from}–{invoices.to} of {invoices.total}
                            </p>
                            <div className="flex items-center gap-1">
                                {invoices.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        preserveState
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition ${link.active
                                            ? 'bg-indigo-600 text-white'
                                            : link.url
                                                ? 'text-gray-600 hover:bg-gray-100'
                                                : 'text-gray-300 cursor-not-allowed'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <InvoiceDetailPanel invoice={detailedInvoice} onClose={() => setDetailedInvoice(null)} />
        </AppLayout>
    );
}

function FileIcon({ mime }) {
    const isPdf = mime === 'application/pdf';
    const isImg = mime?.startsWith('image/');

    if (isPdf) return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 text-xs font-bold shrink-0">PDF</span>
    );
    if (isImg) return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-sky-50 text-sky-600 text-xs font-bold shrink-0">IMG</span>
    );
    return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-500 text-xs font-bold shrink-0">FILE</span>
    );
}
