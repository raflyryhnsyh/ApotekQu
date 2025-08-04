'use client';

import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import { DataTable, Column } from "@/components/ui/data-table";

interface ExpiredMedicine {
    nama: string;
    nomorBatch: string;
    tanggalExpire?: string;
    total?: number;
}

interface LowStockMedicine {
    nama: string;
    nomorBatch: string;
    total: number;
}

interface DashboardStats {
    total_sales: number;
    total_purchases: number;
    total_medicines_sold: number;
    estimated_profit: number;
    expiring_medicines_count: number;
    low_stock_medicines_count: number;
}

interface DashboardData {
    period: {
        start_date: string;
        end_date: string;
    };
    statistics: DashboardStats;
    expiring_medicines: any[];
    low_stock_medicines: any[];
}

export default function PegawaiPage() {
    const { user, profile, error, signOut, loading } = useAuth();

    const [dataLoading, setDataLoading] = useState(false);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    // Data untuk obat mendekati expire (akan diupdate dari API)
    const [expiredMedicines, setExpiredMedicines] = useState<ExpiredMedicine[]>([]);

    // Data untuk re-stok obat (akan diupdate dari API)
    const [lowStockMedicines, setLowStockMedicines] = useState<LowStockMedicine[]>([]);

    // Define columns for expired medicines
    const expiredColumns: Column<ExpiredMedicine>[] = [
        {
            key: "nama",
            header: "Nama Obat"
        },
        {
            key: "nomorBatch",
            header: "Nomor Batch"
        },
        {
            key: "tanggalExpire",
            header: "Tanggal Kadaluarsa"
        },
        {
            key: "total",
            header: "Stok Tersisa"
        }
    ];

    // Define columns for low stock medicines
    const lowStockColumns: Column<LowStockMedicine>[] = [
        {
            key: "nama",
            header: "Nama Obat"
        },
        {
            key: "nomorBatch",
            header: "Nomor Batch"
        },
        {
            key: "total",
            header: "Stok Tersisa"
        }
    ];

    // Function to fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            setDataLoading(true);
            setApiError(null);

            const response = await fetch('/api/reports/dashboard');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setDashboardData(result.data);

                // Transform expiring medicines data
                const transformedExpiring = result.data.expiring_medicines.map((item: any) => ({
                    nama: item.obat?.nama_obat || 'Unknown',
                    nomorBatch: item.nomor_batch || 'N/A',
                    tanggalExpire: item.kadaluarsa ? new Date(item.kadaluarsa).toLocaleDateString('id-ID') : 'N/A',
                    total: item.stok_sekarang || 0
                }));
                setExpiredMedicines(transformedExpiring);

                // Transform low stock medicines data
                const transformedLowStock = result.data.low_stock_medicines.map((item: any) => ({
                    nama: item.obat?.nama_obat || 'Unknown',
                    nomorBatch: item.nomor_batch || 'N/A',
                    total: item.stok_sekarang || 0
                }));
                setLowStockMedicines(transformedLowStock);
            } else {
                throw new Error('Failed to fetch dashboard data');
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setApiError(error instanceof Error ? error.message : 'Unknown error occurred');

            // Fallback to default data if API fails
            setExpiredMedicines([
                { nama: "PainRelief", nomorBatch: "B12345", tanggalExpire: "2024-08-15", total: 50 },
                { nama: "CoughSyrup", nomorBatch: "C67890", tanggalExpire: "2024-08-20", total: 30 },
            ]);
            setLowStockMedicines([
                { nama: "AntibioticX", nomorBatch: "X98765", total: 15 },
                { nama: "VitaminZ", nomorBatch: "Z10111", total: 5 },
            ]);
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        if (user && profile) {
            fetchDashboardData();
        }
    }, [user, profile]);

    // Format currency function
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Show loading while auth is being checked
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">Error: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Check if user is authenticated AND has profile data
    if (!user || !profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Please login to continue</p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Selamat Datang, {profile.full_name || 'Ratu'}
                    </h1>
                </div>

                {/* API Error Alert */}
                {apiError && (
                    <div className="mb-6 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                        <p className="font-medium">API Warning:</p>
                        <p className="text-sm">{apiError}. Showing fallback data.</p>
                    </div>
                )}

                {/* Period Info */}
                {dashboardData && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-700">
                            Data periode: {new Date(dashboardData.period.start_date).toLocaleDateString('id-ID')} - {new Date(dashboardData.period.end_date).toLocaleDateString('id-ID')}
                        </p>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Jumlah Obat Terjual */}
                    <div className="bg-green-100 rounded-lg p-6 border border-green-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Jumlah Obat Terjual</h3>
                        <p className="text-3xl font-bold text-gray-900">
                            {dataLoading ? (
                                <div className="animate-pulse bg-gray-300 h-8 w-16 rounded"></div>
                            ) : (
                                dashboardData?.statistics.total_medicines_sold || 0
                            )}
                        </p>
                    </div>

                    {/* Total Penjualan */}
                    <div className="bg-green-100 rounded-lg p-6 border border-green-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Total Penjualan</h3>
                        <p className="text-3xl font-bold text-gray-900">
                            {dataLoading ? (
                                <div className="animate-pulse bg-gray-300 h-8 w-32 rounded"></div>
                            ) : (
                                formatCurrency(dashboardData?.statistics.total_sales || 0)
                            )}
                        </p>
                    </div>

                    {/* Total Keuntungan */}
                    <div className="bg-green-100 rounded-lg p-6 border border-green-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Total Keuntungan</h3>
                        <p className="text-3xl font-bold text-gray-900">
                            {dataLoading ? (
                                <div className="animate-pulse bg-gray-300 h-8 w-32 rounded"></div>
                            ) : (
                                formatCurrency(dashboardData?.statistics.estimated_profit || 0)
                            )}
                        </p>
                    </div>

                    {/* Total Pengeluaran */}
                    <div className="bg-green-100 rounded-lg p-6 border border-green-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Total Pengeluaran</h3>
                        <p className="text-3xl font-bold text-gray-900">
                            {dataLoading ? (
                                <div className="animate-pulse bg-gray-300 h-8 w-32 rounded"></div>
                            ) : (
                                formatCurrency(dashboardData?.statistics.total_purchases || 0)
                            )}
                        </p>
                    </div>
                </div>

                {/* Tables Section */}
                <div className="space-y-8">
                    {/* Obat Mendekati Expire */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Obat Mendekati Expire</h2>
                            <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                {dashboardData?.statistics.expiring_medicines_count || 0} item
                            </span>
                        </div>
                        {dataLoading ? (
                            <div className="animate-pulse space-y-4">
                                <div className="h-4 bg-gray-300 rounded w-full"></div>
                                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                            </div>
                        ) : (
                            <DataTable
                                data={expiredMedicines}
                                columns={expiredColumns}
                                emptyMessage="Tidak ada obat yang mendekati expire"
                            />
                        )}
                    </div>

                    {/* Re-Stok Obat */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Re-Stok Obat</h2>
                            <span className="bg-orange-100 text-orange-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                {dashboardData?.statistics.low_stock_medicines_count || 0} item
                            </span>
                        </div>
                        {dataLoading ? (
                            <div className="animate-pulse space-y-4">
                                <div className="h-4 bg-gray-300 rounded w-full"></div>
                                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                            </div>
                        ) : (
                            <DataTable
                                data={lowStockMedicines}
                                columns={lowStockColumns}
                                emptyMessage="Semua obat memiliki stok yang cukup"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}