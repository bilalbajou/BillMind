import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

export default function Customers({ customers = { data: [] } }) {
    return (
        <AppLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your customers and generated revenue.</p>
                    </div>
                </div>
            }
        >
            <Head title="Customers" />

            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Customer</th>
                                <th scope="col" className="px-6 py-3">ICE</th>
                                <th scope="col" className="px-6 py-3">Invoices</th>
                                <th scope="col" className="px-6 py-3">Latest Invoice</th>
                                <th scope="col" className="px-6 py-3">Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!customers.data || customers.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <p className="text-gray-500 font-medium">No customers yet</p>
                                            <p className="text-sm text-gray-400">They will be automatically extracted and created when processing your sales invoices.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                customers.data.map((customer) => (
                                    <tr key={customer.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <div className="flex flex-col">
                                                <span>{customer.name}</span>
                                                {(customer.email || customer.phone) && (
                                                    <span className="text-xs text-gray-500">
                                                        {customer.email}{customer.email && customer.phone ? ' • ' : ''}{customer.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 uppercase">{customer.ice || '-'}</td>
                                        <td className="px-6 py-4 font-medium">{customer.invoices_count || 0}</td>
                                        <td className="px-6 py-4">
                                            {customer.latest_invoice 
                                                ? new Date(customer.latest_invoice).toLocaleDateString('en-US')
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            {customer.total_spend ? Number(customer.total_spend).toLocaleString('en-US', { style: 'currency', currency: 'MAD' }) : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {customers.last_page > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                        <p className="text-xs text-gray-500">
                            Showing {customers.from}–{customers.to} of {customers.total}
                        </p>
                        <div className="flex items-center gap-1">
                            {customers.links.map((link, i) => (
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
