import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

export default function Suppliers({ suppliers = { data: [] } }) {
    return (
        <AppLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your suppliers and total spend.</p>
                    </div>
                </div>
            }
        >
            <Head title="Suppliers" />

            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Supplier</th>
                                <th scope="col" className="px-6 py-3">ICE</th>
                                <th scope="col" className="px-6 py-3">Invoices</th>
                                <th scope="col" className="px-6 py-3">Latest Invoice</th>
                                <th scope="col" className="px-6 py-3">Total Spend</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!suppliers.data || suppliers.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <p className="text-gray-500 font-medium">No suppliers yet</p>
                                            <p className="text-sm text-gray-400">They will be automatically extracted and created when processing your invoices.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                suppliers.data.map((supplier) => (
                                    <tr key={supplier.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <div className="flex flex-col">
                                                <span>{supplier.name}</span>
                                                {(supplier.email || supplier.phone) && (
                                                    <span className="text-xs text-gray-500">
                                                        {supplier.email}{supplier.email && supplier.phone ? ' • ' : ''}{supplier.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 uppercase">{supplier.ice || '-'}</td>
                                        <td className="px-6 py-4 font-medium">{supplier.invoices_count || 0}</td>
                                        <td className="px-6 py-4">
                                            {supplier.latest_invoice 
                                                ? new Date(supplier.latest_invoice).toLocaleDateString('en-US')
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            {supplier.total_spend ? Number(supplier.total_spend).toLocaleString('en-US', { style: 'currency', currency: 'MAD' }) : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {suppliers.last_page > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                        <p className="text-xs text-gray-500">
                            Showing {suppliers.from}–{suppliers.to} of {suppliers.total}
                        </p>
                        <div className="flex items-center gap-1">
                            {suppliers.links.map((link, i) => (
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
        </AppLayout>
    );
}
