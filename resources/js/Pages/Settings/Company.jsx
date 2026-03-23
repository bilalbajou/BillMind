import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

const INDUSTRIES = [
    'Technology', 'Finance & Banking', 'Healthcare', 'Retail & E-commerce',
    'Manufacturing', 'Construction', 'Real Estate', 'Education',
    'Hospitality & Tourism', 'Transportation & Logistics', 'Media & Entertainment',
    'Professional Services', 'Agriculture', 'Energy & Utilities', 'Other',
];

const CURRENCIES = [
    { code: 'USD', label: 'USD — US Dollar' },
    { code: 'EUR', label: 'EUR — Euro' },
    { code: 'GBP', label: 'GBP — British Pound' },
    { code: 'MAD', label: 'MAD — Moroccan Dirham' },
    { code: 'CAD', label: 'CAD — Canadian Dollar' },
    { code: 'AED', label: 'AED — UAE Dirham' },
    { code: 'SAR', label: 'SAR — Saudi Riyal' },
];

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

function Select({ className = '', children, ...props }) {
    return (
        <select
            className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition ${className}`}
            {...props}
        >
            {children}
        </select>
    );
}

export default function Company({ tenant }) {
    const { data, setData, patch, processing, errors } = useForm({
        company_name: tenant?.company_name ?? '',
        email:        tenant?.email ?? '',
        phone:        tenant?.phone ?? '',
        website:      tenant?.website ?? '',
        address:      tenant?.address ?? '',
        city:         tenant?.city ?? '',
        postal_code:  tenant?.postal_code ?? '',
        country:      tenant?.country ?? '',
        industry:     tenant?.industry ?? '',
        tax_id:       tenant?.tax_id ?? '',
        currency:     tenant?.currency ?? 'USD',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('settings.company.update'), {
            preserveScroll: true,
            onSuccess: () => Swal.fire({
                icon: 'success',
                title: 'Changes saved!',
                text: 'Your company information has been updated successfully.',
                confirmButtonText: 'Got it',
                confirmButtonColor: '#4F46E5',
                borderRadius: '12px',
            }),
        });
    };

    return (
        <AppLayout>
            <Head title="Company Settings" />

            <div className="py-8 px-4 sm:px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Company</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your company profile and billing information.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* General Info */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-50 text-indigo-600">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </span>
                            General Information
                        </h2>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <Field label="Company Name *" error={errors.company_name}>
                                    <Input
                                        value={data.company_name}
                                        onChange={e => setData('company_name', e.target.value)}
                                    />
                                </Field>
                            </div>

                            <Field label="Industry" error={errors.industry}>
                                <Select value={data.industry} onChange={e => setData('industry', e.target.value)}>
                                    <option value="">Select industry</option>
                                    {INDUSTRIES.map(i => (
                                        <option key={i} value={i}>{i}</option>
                                    ))}
                                </Select>
                            </Field>

                            <Field label="Tax ID / VAT Number" error={errors.tax_id}>
                                <Input
                                    value={data.tax_id}
                                    onChange={e => setData('tax_id', e.target.value)}
                                    placeholder=""
                                />
                            </Field>

                            <Field label="Currency" error={errors.currency}>
                                <Select value={data.currency} onChange={e => setData('currency', e.target.value)}>
                                    {CURRENCIES.map(c => (
                                        <option key={c.code} value={c.code}>{c.label}</option>
                                    ))}
                                </Select>
                            </Field>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-50 text-indigo-600">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </span>
                            Contact Details
                        </h2>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="Email" error={errors.email}>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder=""
                                />
                            </Field>

                            <Field label="Phone" error={errors.phone}>
                                <Input
                                    type="tel"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    placeholder=""
                                />
                            </Field>

                            <div className="sm:col-span-2">
                                <Field label="Website" error={errors.website}>
                                    <Input
                                        type="url"
                                        value={data.website}
                                        onChange={e => setData('website', e.target.value)}
                                        placeholder=""
                                    />
                                </Field>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-50 text-indigo-600">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </span>
                            Address
                        </h2>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <Field label="Street Address" error={errors.address}>
                                    <Input
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        placeholder=""
                                    />
                                </Field>
                            </div>

                            <Field label="City" error={errors.city}>
                                <Input
                                    value={data.city}
                                    onChange={e => setData('city', e.target.value)}
                                    placeholder=""
                                />
                            </Field>

                            <Field label="Postal Code" error={errors.postal_code}>
                                <Input
                                    value={data.postal_code}
                                    onChange={e => setData('postal_code', e.target.value)}
                                    placeholder=""
                                />
                            </Field>

                            <div className="sm:col-span-2">
                                <Field label="Country" error={errors.country}>
                                    <Input
                                        value={data.country}
                                        onChange={e => setData('country', e.target.value)}
                                        placeholder=""
                                    />
                                </Field>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            disabled={processing}
                            className="ml-auto inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 transition"
                        >
                            {processing ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Saving...
                                </>
                            ) : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
