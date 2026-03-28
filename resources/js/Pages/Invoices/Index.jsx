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
    { value: 'pending',    label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'processed',  label: 'Processed' },
    { value: 'validated',  label: 'Validated' },
    { value: 'archived',   label: 'Archived' },
    { value: 'error',      label: 'Error' },
];

const STATUS_BADGE = {
    pending:    'bg-yellow-50 text-yellow-700 ring-yellow-200',
    processing: 'bg-blue-50 text-blue-700 ring-blue-200',
    processed:  'bg-green-50 text-green-700 ring-green-200',
    validated:  'bg-indigo-50 text-indigo-700 ring-indigo-200',
    archived:   'bg-gray-100 text-gray-600 ring-gray-200',
    error:      'bg-red-50 text-red-700 ring-red-200',
};

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

export default function Index() {
    const { invoices, categories, filters } = usePage().props;

    const [search, setSearch]         = useState(filters.search ?? '');
    const [status, setStatus]         = useState(filters.status ?? '');
    const [categoryId, setCategoryId] = useState(filters.category_id ?? '');
    const [dateFrom, setDateFrom]     = useState(filters.date_from ? new Date(filters.date_from) : null);
    const [dateTo, setDateTo]         = useState(filters.date_to ? new Date(filters.date_to) : null);
    const [selected, setSelected]         = useState([]);
    const [liveStatuses, setLiveStatuses] = useState({}); // { [id]: { status, error_message } }
    const [loadingIds, setLoadingIds]     = useState({}); // { [id]: true } while request in-flight
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

    const allIds      = invoices.data.map(i => i.id);
    const allSelected = allIds.length > 0 && allIds.every(id => selected.includes(id));
    const someSelected = selected.length > 0;

    const toggleAll = () => setSelected(allSelected ? [] : allIds);
    const toggleOne = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const applyFilters = useCallback((overrides = {}) => {
        const params = {
            search:      overrides.search      ?? search,
            status:      overrides.status      ?? status,
            category_id: overrides.category_id ?? categoryId,
            date_from:   dateFrom ? format(dateFrom, 'yyyy-MM-dd') : '',
            date_to:     dateTo   ? format(dateTo,   'yyyy-MM-dd') : '',
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
                                        <td className="px-5 py-3 text-gray-600">{inv.supplier_name ?? '—'}</td>

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

                                                    if (currentStatus === 'processing' || isLoading) {
                                                        return (
                                                            <span className="p-1.5 text-blue-400">
                                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                            </span>
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
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                                            link.active
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
