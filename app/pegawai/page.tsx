'use client';

import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import { DataTable, Column } from "@/components/ui/data-table";

interface ExpiredMedicine {
    nama: string;
    nomorBatch: string;
    tanggalExpire: string;
    total: number;
}

interface LowStockMedicine {
    nama: string;
    nomorBatch: string;
    total: number;
}

export default function PegawaiPage() {
    const { user, profile, error, signOut, loading } = useAuth();
    const [dataLoading, setDataLoading] = useState(false);

    // Data untuk obat mendekati expire
    const [expiredMedicines, setExpiredMedicines] = useState<ExpiredMedicine[]>([
        { nama: "PainRelief", nomorBatch: "B12345", tanggalExpire: "2024-08-15", total: 50 },
        { nama: "CoughSyrup", nomorBatch: "C67890", tanggalExpire: "2024-08-20", total: 30 },
        { nama: "AllergyTabs", nomorBatch: "A11223", tanggalExpire: "2024-08-25", total: 20 },
    ]);

    // Data untuk re-stok obat
    const [lowStockMedicines, setLowStockMedicines] = useState<LowStockMedicine[]>([
        { nama: "AntibioticX", nomorBatch: "X98765", total: 15 },
        { nama: "AntacidY", nomorBatch: "Y54321", total: 10 },
        { nama: "VitaminZ", nomorBatch: "Z10111", total: 5 },
    ]);

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
            header: "Tanggal Expire"
        },
        {
            key: "total",
            header: "Total"
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
            header: "Total"
        }
    ];

    useEffect(() => {
        const initializePage = async () => {
            setDataLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setDataLoading(false);
        };

        initializePage();
    }, []);

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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Selamat Datang, {profile.full_name || 'Ratu'}
                    </h1>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Jumlah Obat Terjual */}
                    <div className="bg-green-100 rounded-lg p-6 border border-green-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Jumlah Obat Terjual</h3>
                        <p className="text-3xl font-bold text-gray-900">125</p>
                    </div>

                    {/* Total Penjualan */}
                    <div className="bg-green-100 rounded-lg p-6 border border-green-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Total Penjualan</h3>
                        <p className="text-3xl font-bold text-gray-900">Rp 5.250.000</p>
                    </div>

                    {/* Total Keuntungan */}
                    <div className="bg-green-100 rounded-lg p-6 border border-green-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Total Keuntungan</h3>
                        <p className="text-3xl font-bold text-gray-900">Rp 1.575.000</p>
                    </div>

                    {/* Total Pengeluaran */}
                    <div className="bg-green-100 rounded-lg p-6 border border-green-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Total Pengeluaran</h3>
                        <p className="text-3xl font-bold text-gray-900">Rp 1.575.000</p>
                    </div>
                </div>

                {/* Tables Section */}
                <div className="space-y-8">
                    {/* Obat Mendekati Expire */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-semibold mb-6 text-gray-900">Obat Mendekati Expire</h2>
                        <DataTable
                            data={expiredMedicines}
                            columns={expiredColumns}
                            emptyMessage="Tidak ada obat yang mendekati expire"
                        />
                    </div>

                    {/* Re-Stok Obat */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-semibold mb-6 text-gray-900">Re-Stok Obat</h2>
                        <DataTable
                            data={lowStockMedicines}
                            columns={lowStockColumns}
                            emptyMessage="Semua obat memiliki stok yang cukup"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}