import CategoryIcon from '@/Components/CategoryIcon';
import ChatSlideOver from '@/Components/ChatSlideOver';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { FileText, DollarSign, Clock, Tag, CalendarDays, Building2, Users, Receipt, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

// --- Date helpers ---
function fmt(date) {
    return format(date, 'yyyy-MM-dd');
}

const PRESETS = [
    {
        key: 'all_time',
        label: 'All Time',
        from: () => 'all',
        to: () => 'all',
    },
    {
        key: 'this_month',
        label: 'This Month',
        from: () => { const d = new Date(); d.setDate(1); return fmt(d); },
        to: () => { const d = new Date(); d.setMonth(d.getMonth() + 1, 0); return fmt(d); },
    },
    {
        key: 'last_month',
        label: 'Last Month',
        from: () => { const d = new Date(); d.setMonth(d.getMonth() - 1, 1); return fmt(d); },
        to: () => { const d = new Date(); d.setDate(0); return fmt(d); },
    },
    {
        key: 'last_3_months',
        label: 'Last 3 Months',
        from: () => { const d = new Date(); d.setMonth(d.getMonth() - 3, 1); return fmt(d); },
        to: () => fmt(new Date()),
    },
    {
        key: 'this_year',
        label: 'This Year',
        from: () => `${new Date().getFullYear()}-01-01`,
        to: () => `${new Date().getFullYear()}-12-31`,
    },
];

function detectPreset(dateFrom, dateTo) {
    for (const p of PRESETS) {
        if (p.from() === dateFrom && p.to() === dateTo) return p.key;
    }
    return 'custom';
}

function DateRangeFilter({ dateFrom, dateTo }) {
    const activePreset = detectPreset(dateFrom, dateTo);
    const initialStart = dateFrom === 'all' ? null : parseISO(dateFrom);
    const initialEnd = dateTo === 'all' ? null : parseISO(dateTo);
    const [range, setRange] = useState([initialStart, initialEnd]);
    const [startDate, endDate] = range;

    useEffect(() => {
        setRange([dateFrom === 'all' ? null : parseISO(dateFrom), dateTo === 'all' ? null : parseISO(dateTo)]);
    }, [dateFrom, dateTo]);

    function applyPreset(preset) {
        router.get('/dashboard', { date_from: preset.from(), date_to: preset.to() }, {
            preserveState: true, preserveScroll: true, replace: true,
        });
    }

    function handleRangeChange(dates) {
        const [start, end] = dates;
        setRange(dates);
        if (start && end) {
            router.get('/dashboard', { date_from: fmt(start), date_to: fmt(end) }, {
                preserveState: true, preserveScroll: true, replace: true,
            });
        }
    }

    const rangeLabel = startDate && endDate
        ? `${format(startDate, 'dd MMM yyyy')} → ${format(endDate, 'dd MMM yyyy')}`
        : (activePreset === 'all_time' ? 'All Time' : 'Select range');

    return (
        <div className="flex flex-wrap items-center gap-2">
            {PRESETS.map((p) => (
                <button
                    key={p.key}
                    onClick={() => applyPreset(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activePreset === p.key
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    {p.label}
                </button>
            ))}
            <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={handleRangeChange}
                dateFormat="dd MMM yyyy"
                popperPlacement="bottom-end"
                customInput={
                    <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${activePreset === 'custom'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}>
                        <CalendarDays className="w-3.5 h-3.5" />
                        {rangeLabel}
                    </button>
                }
            />
        </div>
    );
}

// --- Stats ---
const buildStats = (totalInvoices, totalRevenue, totalRevenueCurrency, pendingInvoices, suppliersCount, customersCount, categories) => [
    {
        label: 'Total Invoices',
        value: totalInvoices.toString(),
        change: 'In selected period',
        icon: <FileText className="w-6 h-6 text-indigo-600" />,
        bg: 'bg-indigo-100',
    },
    {
        label: 'Revenue (TTC)',
        value: new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2 }).format(totalRevenue) + ' ' + totalRevenueCurrency,
        change: 'All processed invoices',
        icon: <DollarSign className="w-6 h-6 text-green-600" />,
        bg: 'bg-green-100',
    },
    {
        label: 'Pending Invoices',
        value: pendingInvoices.toString(),
        change: 'Awaiting extraction',
        icon: <Clock className="w-6 h-6 text-yellow-600" />,
        bg: 'bg-yellow-100',
    },
    {
        label: 'Active Categories',
        value: categories.length.toString(),
        change: 'Invoice categories',
        icon: <Tag className="w-6 h-6 text-purple-600" />,
        bg: 'bg-purple-100',
    },
    {
        label: 'Suppliers',
        value: suppliersCount.toString(),
        change: 'Registered suppliers',
        icon: <Building2 className="w-6 h-6 text-sky-600" />,
        bg: 'bg-sky-100',
    },
    {
        label: 'Customers',
        value: customersCount.toString(),
        change: 'Registered customers',
        icon: <Users className="w-6 h-6 text-orange-600" />,
        bg: 'bg-orange-100',
    },
];

const STATUS_STYLES = {
    pending: 'bg-gray-100 text-gray-600',
    processing: 'bg-blue-100 text-blue-700',
    processed: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
};

function formatAmount(amount, currency = 'MAD') {
    if (amount == null) return '—';
    return new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2 }).format(amount) + ' ' + currency;
}

function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Dashboard() {
    const { auth, categories = [], totalInvoices = 0, totalRevenue = 0, totalRevenueCurrency = 'MAD', pendingInvoices = 0, recentInvoices = [], suppliersCount = 0, customersCount = 0, monthlyRevenue = [], topSuppliers = [], topCustomers = [], spendByCategory = [], anomalyFlags = [], dateFrom, dateTo } = usePage().props;
    const [isChatOpen, setIsChatOpen] = useState(false);
    const user = auth.user;
    const stats = buildStats(totalInvoices, totalRevenue, totalRevenueCurrency, pendingInvoices, suppliersCount, customersCount, categories);

    return (
        <AppLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Welcome back, {user.name.split(' ')[0]} 👋
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Here's what's happening with your invoices today.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">

                        <DateRangeFilter dateFrom={dateFrom} dateTo={dateTo} />
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat) => {
                    const inner = (
                        <>
                            <div className={`p-3 rounded-full ${stat.bg} shrink-0`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                {stat.change && <p className="text-xs text-gray-400 mt-0.5">{stat.change}</p>}
                            </div>
                        </>
                    );
                    return stat.href ? (
                        <Link key={stat.label} href={stat.href} className="bg-white rounded-lg shadow p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                            {inner}
                        </Link>
                    ) : (
                        <div key={stat.label} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                            {inner}
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/invoices/upload"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        Upload Invoice
                    </Link>
                    <Link
                        href="/settings/categories"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        Add Invoice Category
                    </Link>
                </div>
            </div>

            {/* Monthly Revenue Chart */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Monthly Revenue</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Selected period · {totalRevenueCurrency}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-500">
                        {monthlyRevenue.filter(m => m.total > 0).length} active months
                    </span>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={monthlyRevenue} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                            width={40}
                        />
                        <Tooltip
                            cursor={{ fill: '#f5f3ff' }}
                            content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null;
                                return (
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
                                        <p className="font-semibold text-gray-700 mb-1">{label}</p>
                                        <p className="text-indigo-600 font-bold">
                                            {new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2 }).format(payload[0].value)} {totalRevenueCurrency}
                                        </p>
                                    </div>
                                );
                            }}
                        />
                        <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={48} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Analytics Row: Top Suppliers, Top Customers, Anomaly Flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                {/* Top 5 Suppliers */}
                <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Top 5 Suppliers</h2>
                        <Link href="/suppliers" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                            View All &rarr;
                        </Link>
                    </div>
                    <div className="flex-1 space-y-4 mt-2">
                        {topSuppliers.length > 0 ? topSuppliers.map((supplier, index) => {
                            const maxVal = topSuppliers[0].total;
                            const pct = maxVal > 0 ? (supplier.total / maxVal) * 100 : 0;
                            return (
                                <div key={index}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="font-medium text-gray-700 truncate pr-2" title={supplier.name}>{supplier.name}</span>
                                        <span className="text-gray-900 font-semibold whitespace-nowrap">{formatAmount(supplier.total, totalRevenueCurrency)}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="flex items-center justify-center h-full text-sm text-gray-400">No data available</div>
                        )}
                    </div>
                </div>

                {/* Top 5 Customers */}
                <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Top 5 Customers</h2>
                        <Link href="/customers" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                            View All &rarr;
                        </Link>
                    </div>
                    <div className="flex-1 space-y-4 mt-2">
                        {topCustomers.length > 0 ? topCustomers.map((customer, index) => {
                            const maxVal = topCustomers[0].total;
                            const pct = maxVal > 0 ? (customer.total / maxVal) * 100 : 0;
                            return (
                                <div key={index}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="font-medium text-gray-700 truncate pr-2" title={customer.name}>{customer.name}</span>
                                        <span className="text-gray-900 font-semibold whitespace-nowrap">{formatAmount(customer.total, totalRevenueCurrency)}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-sky-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="flex items-center justify-center h-full text-sm text-gray-400">No data available</div>
                        )}
                    </div>
                </div>
                {/* Anomaly Flags */}
                <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Anomaly Flags</h2>
                        <Link href="/invoices" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                            View All &rarr;
                        </Link>
                    </div>
                    <div className="flex-1 space-y-4 mt-2">
                        {anomalyFlags.length > 0 ? anomalyFlags.map((flag, index) => {
                            const maxVal = anomalyFlags[0].count;
                            const pct = maxVal > 0 ? (flag.count / maxVal) * 100 : 0;
                            return (
                                <div key={index}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="font-medium text-gray-700 truncate pr-2" title={flag.label}>{flag.label}</span>
                                        <span className="text-gray-900 font-semibold whitespace-nowrap">{flag.count}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="flex items-center justify-center h-full text-sm text-gray-400">No data available</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Invoices by Category</h2>
                    <span className="text-xs text-gray-400">{categories.length} categories</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3 text-center">Invoices</th>
                                <th className="px-6 py-3">Distribution</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categories.map((cat) => {
                                const total = categories.reduce((s, c) => s + c.invoices_count, 0);
                                const pct = total > 0 ? Math.round((cat.invoices_count / total) * 100) : 0;
                                return (
                                    <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <CategoryIcon icon={cat.icon} color={cat.color} size={15} />
                                                <span className="font-medium text-gray-800">{cat.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                                                {cat.invoices_count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 w-48">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${pct}%`,
                                                            backgroundColor: cat.color ?? '#6366f1',
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-400">
                                        No categories found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Invoices Table */}
            <div className="bg-white rounded-lg shadow">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
                    <Link href="/invoices" className="text-sm font-medium text-indigo-600 hover:underline">
                        View all
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Invoice</th>
                                <th className="px-6 py-3 hidden md:table-cell">Supplier</th>
                                <th className="px-6 py-3 hidden sm:table-cell">Date</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-gray-500 font-medium">No invoices yet</p>
                                            <p className="text-sm text-gray-400">Upload your first invoice to get started.</p>
                                            <Link href="/invoices/upload" className="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                                                Upload Invoice
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                recentInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3">
                                            <p className="font-semibold text-gray-900">
                                                {invoice.number ?? <span className="italic text-gray-400 font-normal">No number</span>}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[160px]">
                                                {invoice.original_filename}
                                            </p>
                                        </td>
                                        <td className="px-6 py-3 hidden md:table-cell">
                                            <p className="text-gray-700 max-w-[180px] truncate">
                                                {invoice.supplier_name ?? <span className="text-gray-300 italic">—</span>}
                                            </p>
                                        </td>
                                        <td className="px-6 py-3 hidden sm:table-cell text-gray-500">
                                            {formatDate(invoice.issue_date)}
                                        </td>
                                        <td className="px-6 py-3 text-right font-semibold text-gray-900">
                                            {formatAmount(invoice.total_ttc, invoice.currency)}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[invoice.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ChatSlideOver isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} context="dashboard" />
        </AppLayout>
    );
}
