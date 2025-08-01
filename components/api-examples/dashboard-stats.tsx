'use client'

import { useState, useEffect } from 'react'
import { reportsService, type DashboardStats } from '@/lib/api'

export function DashboardStatsWidget() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true)
            setError(null)

            const result = await reportsService.getDashboard()

            if (result.success && result.data) {
                setStats(result.data)
            } else {
                setError(result.error || 'Failed to fetch dashboard stats')
            }

            setLoading(false)
        }

        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">Error loading dashboard: {error}</p>
            </div>
        )
    }

    if (!stats) return null

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(value)
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Total Penjualan</h3>
                    <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(stats.statistics.total_sales)}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Total Pembelian</h3>
                    <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(stats.statistics.total_purchases)}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Obat Terjual</h3>
                    <p className="text-3xl font-bold text-gray-900">
                        {stats.statistics.total_medicines_sold.toLocaleString()}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Estimasi Keuntungan</h3>
                    <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(stats.statistics.estimated_profit)}
                    </p>
                </div>
            </div>

            {/* Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.statistics.expiring_medicines_count > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                            Obat Mendekati Expired
                        </h3>
                        <p className="text-yellow-700">
                            {stats.statistics.expiring_medicines_count} obat akan expired dalam 30 hari ke depan
                        </p>
                    </div>
                )}

                {stats.statistics.low_stock_medicines_count > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-red-800 mb-2">
                            Stok Menipis
                        </h3>
                        <p className="text-red-700">
                            {stats.statistics.low_stock_medicines_count} obat memerlukan restok
                        </p>
                    </div>
                )}
            </div>

            {/* Period Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                    Data periode: {new Date(stats.period.start_date).toLocaleDateString('id-ID')} - {new Date(stats.period.end_date).toLocaleDateString('id-ID')}
                </p>
            </div>
        </div>
    )
}
