import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import Swal from 'sweetalert2';

// ─── Available icons & colors ─────────────────────────────────────────────────
const ICONS = [
    'Monitor', 'Cloud', 'KeyRound', 'Paperclip', 'Building2', 'Zap', 'Wrench',
    'Users', 'Handshake', 'GraduationCap', 'Plane', 'Car', 'Megaphone',
    'TrendingUp', 'Scale', 'BarChart2', 'Factory', 'Package', 'Settings2',
    'ShieldCheck', 'Landmark', 'LayoutGrid', 'Briefcase', 'Receipt',
    'ShoppingCart', 'Truck', 'Globe', 'HeartPulse', 'Home', 'Leaf',
];

const COLORS = [
    { name: 'indigo',  bg: 'bg-indigo-100',  text: 'text-indigo-600',  dot: 'bg-indigo-500' },
    { name: 'sky',     bg: 'bg-sky-100',     text: 'text-sky-600',     dot: 'bg-sky-500' },
    { name: 'violet',  bg: 'bg-violet-100',  text: 'text-violet-600',  dot: 'bg-violet-500' },
    { name: 'blue',    bg: 'bg-blue-100',    text: 'text-blue-600',    dot: 'bg-blue-500' },
    { name: 'cyan',    bg: 'bg-cyan-100',    text: 'text-cyan-600',    dot: 'bg-cyan-500' },
    { name: 'teal',    bg: 'bg-teal-100',    text: 'text-teal-600',    dot: 'bg-teal-500' },
    { name: 'emerald', bg: 'bg-emerald-100', text: 'text-emerald-600', dot: 'bg-emerald-500' },
    { name: 'green',   bg: 'bg-green-100',   text: 'text-green-600',   dot: 'bg-green-500' },
    { name: 'lime',    bg: 'bg-lime-100',    text: 'text-lime-600',    dot: 'bg-lime-500' },
    { name: 'yellow',  bg: 'bg-yellow-100',  text: 'text-yellow-600',  dot: 'bg-yellow-500' },
    { name: 'amber',   bg: 'bg-amber-100',   text: 'text-amber-600',   dot: 'bg-amber-500' },
    { name: 'orange',  bg: 'bg-orange-100',  text: 'text-orange-600',  dot: 'bg-orange-500' },
    { name: 'red',     bg: 'bg-red-100',     text: 'text-red-600',     dot: 'bg-red-500' },
    { name: 'rose',    bg: 'bg-rose-100',    text: 'text-rose-600',    dot: 'bg-rose-500' },
    { name: 'pink',    bg: 'bg-pink-100',    text: 'text-pink-600',    dot: 'bg-pink-500' },
    { name: 'slate',   bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-500' },
    { name: 'gray',    bg: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-500' },
    { name: 'zinc',    bg: 'bg-zinc-100',    text: 'text-zinc-600',    dot: 'bg-zinc-500' },
    { name: 'stone',   bg: 'bg-stone-100',   text: 'text-stone-600',   dot: 'bg-stone-500' },
];

function getColor(name) {
    return COLORS.find(c => c.name === name) ?? COLORS.find(c => c.name === 'gray');
}

// ─── Category icon bubble ─────────────────────────────────────────────────────
function CategoryIcon({ icon, color, size = 18 }) {
    const IconComponent = icon ? LucideIcons[icon] : null;
    const c = getColor(color);
    return (
        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${c.bg} ${c.text} shrink-0`}>
            {IconComponent
                ? <IconComponent size={size} strokeWidth={1.75} />
                : <LucideIcons.Tag size={size} strokeWidth={1.75} />
            }
        </span>
    );
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function Input({ className = '', ...props }) {
    return (
        <input
            className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition ${className}`}
            {...props}
        />
    );
}

function StatusBadge({ active }) {
    return active ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Active
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Inactive
        </span>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Categories({ categories }) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name:        '',
        description: '',
        icon:        'Tag',
        color:       'indigo',
        is_active:   true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('settings.categories.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowForm(false);
                Swal.fire({
                    icon: 'success',
                    title: 'Category created!',
                    text: 'The new category is now available for invoice classification.',
                    confirmButtonText: 'Got it',
                    confirmButtonColor: '#4F46E5',
                });
            },
        });
    };

    const handleToggle = (category) => {
        router.patch(route('settings.categories.toggle', category.id), {}, { preserveScroll: true });
    };

    const handleDelete = (category) => {
        Swal.fire({
            title: 'Delete category?',
            text: `"${category.name}" will be removed. Invoices already classified under it won't be affected.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('settings.categories.destroy', category.id), { preserveScroll: true });
            }
        });
    };

    const selectedColor = getColor(data.color);

    return (
        <AppLayout>
            <Head title="Categories" />

            <div className="py-8 px-4 sm:px-6">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage invoice categories used for AI classification.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
                    >
                        <LucideIcons.Plus size={16} strokeWidth={2.5} />
                        Add Category
                    </button>
                </div>

                {/* ── Add Category Form ── */}
                {showForm && (
                    <div className="mb-6 bg-white rounded-xl border border-indigo-100 shadow-sm p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-50 text-indigo-600">
                                <LucideIcons.Plus size={14} strokeWidth={2.5} />
                            </span>
                            New Category
                        </h2>

                        <form onSubmit={submit} className="space-y-5">
                            {/* Name + Status */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field label="Name *" error={errors.name}>
                                    <Input
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="e.g. IT & Telecom"
                                        autoFocus
                                    />
                                </Field>

                                <Field label="Status">
                                    <div className="flex items-center h-9">
                                        <button
                                            type="button"
                                            onClick={() => setData('is_active', !data.is_active)}
                                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                                                data.is_active ? 'bg-indigo-600' : 'bg-gray-300'
                                            }`}
                                        >
                                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                                data.is_active ? 'translate-x-5' : 'translate-x-1'
                                            }`} />
                                        </button>
                                        <span className="ml-2.5 text-sm text-gray-600">
                                            {data.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </Field>

                                <div className="sm:col-span-2">
                                    <Field label="Description" error={errors.description}>
                                        <textarea
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            rows={2}
                                            placeholder="Brief description to help the AI classify invoices correctly…"
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition resize-none"
                                        />
                                    </Field>
                                </div>
                            </div>

                            {/* Color picker */}
                            <Field label="Color" error={errors.color}>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {COLORS.map(c => (
                                        <button
                                            key={c.name}
                                            type="button"
                                            title={c.name}
                                            onClick={() => setData('color', c.name)}
                                            className={`w-6 h-6 rounded-full ${c.dot} transition-transform hover:scale-110 ${
                                                data.color === c.name
                                                    ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                                                    : ''
                                            }`}
                                        />
                                    ))}
                                </div>
                            </Field>

                            {/* Icon picker */}
                            <Field label="Icon" error={errors.icon}>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {ICONS.map(name => {
                                        const Ic = LucideIcons[name];
                                        if (!Ic) return null;
                                        const selected = data.icon === name;
                                        return (
                                            <button
                                                key={name}
                                                type="button"
                                                title={name}
                                                onClick={() => setData('icon', name)}
                                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                                    selected
                                                        ? `${selectedColor.bg} ${selectedColor.text} ring-2 ring-offset-1 ring-current`
                                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                                }`}
                                            >
                                                <Ic size={18} strokeWidth={1.75} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </Field>

                            {/* Preview */}
                            {data.name && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl w-fit">
                                    <CategoryIcon icon={data.icon} color={data.color} />
                                    <span className="text-sm font-semibold text-gray-800">{data.name}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-3 pt-1">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 transition"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Saving…
                                        </>
                                    ) : 'Save Category'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { reset(); setShowForm(false); }}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── Categories list ── */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {categories.length === 0 ? (
                        <div className="text-center py-16">
                            <LucideIcons.Tag className="mx-auto w-10 h-10 text-gray-300 mb-3" strokeWidth={1.5} />
                            <p className="text-sm font-medium text-gray-500">No categories yet</p>
                            <p className="text-xs text-gray-400 mt-1">Click "Add Category" to create your first one.</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <CategoryIcon icon={category.icon} color={category.color} />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{category.name}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{category.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <p className="text-sm text-gray-500 max-w-xs truncate">
                                                {category.description || <span className="text-gray-300 italic">—</span>}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge active={category.is_active} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggle(category)}
                                                    title={category.is_active ? 'Deactivate' : 'Activate'}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                >
                                                    {category.is_active ? (
                                                        <LucideIcons.CircleSlash size={16} strokeWidth={2} />
                                                    ) : (
                                                        <LucideIcons.CircleCheck size={16} strokeWidth={2} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category)}
                                                    title="Delete"
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <LucideIcons.Trash2 size={16} strokeWidth={2} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <p className="mt-3 text-xs text-gray-400 text-right">
                    {categories.length} {categories.length === 1 ? 'category' : 'categories'}
                </p>
            </div>
        </AppLayout>
    );
}
