"use client";

import * as React from "react";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CompleteDetailModal } from "./complete-detail-modal";
import { DataAdd } from "./data-add";
import { DataEdit } from "./data-edit";
import { DataDelete } from "./data-delete";
import { Toast, ToastType } from "@/components/ui/toast";

type DetailObat = {
    nomor_batch: string;
    id_obat: string;
    nama_obat: string;
    stok_sekarang: number;
    satuan: string;
    harga_jual: number;
    kadaluarsa: string;
    nama_supplier: string;
};

export function PengelolaanObatNew() {
    const [data, setData] = React.useState<DetailObat[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [showCompleteModal, setShowCompleteModal] = React.useState(false);
    const [incompleteCount, setIncompleteCount] = React.useState(0);
    const [expiredPage, setExpiredPage] = React.useState(1);
    const [activePage, setActivePage] = React.useState(1);
    const [showToast, setShowToast] = React.useState(false);
    const [toastType, setToastType] = React.useState<ToastType>("success");
    const [toastMessage, setToastMessage] = React.useState("");
    
    const EXPIRED_PER_PAGE = 3;
    const ACTIVE_PER_PAGE = 10;

    const checkIncompleteItems = React.useCallback(async () => {
        try {
            const response = await fetch('/api/incomplete-medicines');
            
            if (response.ok) {
                const result = await response.json();
                const count = result.data?.length || 0;
                setIncompleteCount(count);
            }
        } catch (error) {
            console.error('Error checking incomplete items:', error);
        }
    }, []);

    // Fetch data from API
    const fetchData = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Add timestamp to prevent caching
            const timestamp = new Date().getTime();
            const response = await fetch(`/api/kelola-obat?_t=${timestamp}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            if (!response.ok) throw new Error('Gagal memuat data');
            
            const result = await response.json();
            
            // Transform kelola-obat response to match expected format
            const transformedData = (result.data || []).map((item: any) => ({
                nomor_batch: item.noBatch,
                id_obat: item.id_obat,
                nama_obat: item.nama,
                stok_sekarang: item.totalStok,
                satuan: item.satuan,
                harga_jual: item.harga_jual,
                kadaluarsa: item.tanggalExpired,
                nama_supplier: item.supplier
            }));
            
            setData(transformedData);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Gagal memuat data obat');
        } finally {
            setLoading(false);
        }
    }, []);

    // Load data and check incomplete items on mount
    React.useEffect(() => {
        const loadData = async () => {
            await fetchData();
            await checkIncompleteItems();
        };
        loadData();
    }, [fetchData, checkIncompleteItems]);

    // Calculate days until expiry
    const getDaysUntilExpiry = (expiryDate: string) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Categorize medicines into 2 sections: Expired and Active
    const expiredMedicines = data.filter(obat => getDaysUntilExpiry(obat.kadaluarsa) < 0);
    const activeMedicines = data.filter(obat => getDaysUntilExpiry(obat.kadaluarsa) >= 0);

    // Pagination for expired medicines
    const totalExpiredPages = Math.ceil(expiredMedicines.length / EXPIRED_PER_PAGE);
    const paginatedExpired = expiredMedicines.slice(
        (expiredPage - 1) * EXPIRED_PER_PAGE,
        expiredPage * EXPIRED_PER_PAGE
    );

    // Pagination for active medicines
    const totalActivePages = Math.ceil(activeMedicines.length / ACTIVE_PER_PAGE);
    const paginatedActive = activeMedicines.slice(
        (activePage - 1) * ACTIVE_PER_PAGE,
        activePage * ACTIVE_PER_PAGE
    );

    // Format date
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Success handlers
    const handleAddSuccess = async () => {
        await fetchData();
        setToastType("success");
        setToastMessage("Obat berhasil ditambahkan!");
        setShowToast(true);
    };

    const handleEditSuccess = async () => {
        await fetchData();
        setToastType("success");
        setToastMessage("Obat berhasil diupdate!");
        setShowToast(true);
    };

    const handleDeleteSuccess = async () => {
        await fetchData();
        setToastType("success");
        setToastMessage("Obat berhasil dihapus!");
        setShowToast(true);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-600">Memuat data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    const renderTable = (medicines: DetailObat[], emptyMessage: string, showActions: boolean = false) => {
        if (medicines.length === 0) {
            return (
                <div className="text-center py-8 text-gray-500">
                    {emptyMessage}
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No. Batch</TableHead>
                            <TableHead>Nama Obat</TableHead>
                            <TableHead>Stok</TableHead>
                            <TableHead>Satuan</TableHead>
                            <TableHead>Harga Jual</TableHead>
                            <TableHead>Kadaluarsa</TableHead>
                            <TableHead>Supplier</TableHead>
                            {showActions && <TableHead className="text-center">Aksi</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {medicines.map((obat) => (
                            <TableRow key={obat.nomor_batch}>
                                <TableCell className="font-medium">{obat.nomor_batch}</TableCell>
                                <TableCell>{obat.nama_obat}</TableCell>
                                <TableCell>
                                    <span className={obat.stok_sekarang <= 10 ? "text-red-600 font-semibold" : ""}>
                                        {obat.stok_sekarang}
                                    </span>
                                </TableCell>
                                <TableCell>{obat.satuan}</TableCell>
                                <TableCell>{formatCurrency(obat.harga_jual)}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{formatDate(obat.kadaluarsa)}</span>
                                        <span className="text-xs text-gray-500">
                                            ({getDaysUntilExpiry(obat.kadaluarsa)} hari)
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>{obat.nama_supplier}</TableCell>
                                {showActions && (
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-2">
                                            <DataEdit data={obat} onSuccess={handleEditSuccess} />
                                            <DataDelete data={obat} onSuccess={handleDeleteSuccess} />
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    };

    return (
        <>
            <div className="container mx-auto py-6 space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">Pengelolaan Obat</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowCompleteModal(true)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                        >
                            Obat Perlu Dilengkapi
                        </button>
                        <DataAdd onSuccess={handleAddSuccess} />
                    </div>
                </div>

                {/* Section 1: Expired Medicines */}
                <div className="bg-white rounded-lg border shadow-sm">
                    <div className="border-b bg-red-50 p-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                            <div>
                                <h2 className="text-xl font-semibold text-red-700">Obat Expired</h2>
                                <p className="text-sm text-red-600">
                                    Obat yang sudah melewati tanggal kadaluarsa
                                </p>
                            </div>
                            <Badge variant="destructive" className="ml-auto">
                                {expiredMedicines.length} Item
                            </Badge>
                        </div>
                    </div>
                    <div className="p-4">
                        {renderTable(paginatedExpired, "Tidak ada obat yang kadaluarsa", true)}
                        {expiredMedicines.length > EXPIRED_PER_PAGE && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="text-sm text-gray-600">
                                    Menampilkan {((expiredPage - 1) * EXPIRED_PER_PAGE) + 1} - {Math.min(expiredPage * EXPIRED_PER_PAGE, expiredMedicines.length)} dari {expiredMedicines.length} item
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setExpiredPage(prev => Math.max(1, prev - 1))}
                                        disabled={expiredPage === 1}
                                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-3 py-1">
                                        {expiredPage} / {totalExpiredPages}
                                    </span>
                                    <button
                                        onClick={() => setExpiredPage(prev => Math.min(totalExpiredPages, prev + 1))}
                                        disabled={expiredPage === totalExpiredPages}
                                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 2: Active Medicines */}
                <div className="bg-white rounded-lg border shadow-sm">
                    <div className="border-b bg-green-50 p-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                            <div>
                                <h2 className="text-xl font-semibold text-green-700">Obat Aktif</h2>
                                <p className="text-sm text-green-600">
                                    Obat yang belum kadaluarsa dan masih dapat digunakan
                                </p>
                            </div>
                            <Badge variant="outline" className="ml-auto bg-green-100 text-green-700 border-green-300">
                                {activeMedicines.length} Item
                            </Badge>
                        </div>
                    </div>
                    <div className="p-4">
                        {renderTable(paginatedActive, "Tidak ada obat aktif", true)}
                        {activeMedicines.length > ACTIVE_PER_PAGE && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="text-sm text-gray-600">
                                    Menampilkan {((activePage - 1) * ACTIVE_PER_PAGE) + 1} - {Math.min(activePage * ACTIVE_PER_PAGE, activeMedicines.length)} dari {activeMedicines.length} item
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setActivePage(prev => Math.max(1, prev - 1))}
                                        disabled={activePage === 1}
                                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-3 py-1">
                                        {activePage} / {totalActivePages}
                                    </span>
                                    <button
                                        onClick={() => setActivePage(prev => Math.min(totalActivePages, prev + 1))}
                                        disabled={activePage === totalActivePages}
                                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for completing incomplete items */}
            <CompleteDetailModal
                isOpen={showCompleteModal}
                onClose={() => setShowCompleteModal(false)}
                onSuccess={async () => {
                    setShowCompleteModal(false);
                    await fetchData(); // Refresh data after completing details
                    await checkIncompleteItems(); // Re-check for any remaining incomplete items
                }}
            />

            {/* Toast Notification */}
            <Toast
                isOpen={showToast}
                onClose={() => setShowToast(false)}
                type={toastType}
                title={toastType === "success" ? "Berhasil!" : "Gagal!"}
            >
                <p>{toastMessage}</p>
            </Toast>
        </>
    );
}
