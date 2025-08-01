'use client'

import { useState, useEffect } from 'react'
import { obatService, type Obat, type PaginatedResponse } from '@/lib/api'

export function ObatList() {
    const [obatData, setObatData] = useState<PaginatedResponse<Obat> | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)

    const fetchObat = async () => {
        setLoading(true)
        setError(null)

        const result = await obatService.getAll({
            page,
            limit: 10,
            search: search || undefined
        })

        if (result.success && result.data) {
            setObatData(result.data)
        } else {
            setError(result.error || 'Failed to fetch data')
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchObat()
    }, [page, search])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        fetchObat()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">Error: {error}</p>
                <button
                    onClick={fetchObat}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    placeholder="Search medicines..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Search
                </button>
            </form>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nama Obat
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Komposisi
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kategori
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {obatData?.data.map((obat) => (
                            <tr key={obat.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {obat.nama_obat}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {obat.komposisi}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {obat.kategori}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {obatData?.pagination && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                        Showing {((obatData.pagination.page - 1) * obatData.pagination.limit) + 1} to{' '}
                        {Math.min(obatData.pagination.page * obatData.pagination.limit, obatData.pagination.total)} of{' '}
                        {obatData.pagination.total} results
                    </p>

                    <div className="flex space-x-2">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page <= 1}
                            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Previous
                        </button>

                        <span className="px-3 py-1">
                            Page {page} of {obatData.pagination.totalPages}
                        </span>

                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page >= obatData.pagination.totalPages}
                            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
