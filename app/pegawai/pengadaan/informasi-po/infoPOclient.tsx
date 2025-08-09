"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { PurchaseOrderRow } from "@/components/pengadaan-informasi/infoporow"; // Komponen baris yang sudah kita buat
import { PurchaseOrder } from "./type";
import { RincianPOModal } from "@/components/pengadaan-informasi/rincianPOmodal";

interface PurchaseOrderClientProps {
    orders: PurchaseOrder[];
    totalPages: number;
    currentPage: number;
}

// Tipe untuk data yang sudah diformat dan akan ditampilkan
type FormattedDetail = {
    nama_obat: string;
    jumlah: number;
    harga: number;
};

export default function PurchaseOrderClient({ orders, totalPages, currentPage }: PurchaseOrderClientProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
    const [details, setDetails] = useState<FormattedDetail[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fungsi untuk membuka modal dan mengambil data detail
    const handleViewDetails = async (order: PurchaseOrder) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
        setIsLoading(true);
        const supabase = createClient();

        try {
            const { data, error } = await supabase
                .from('detail_purchase_order')
                .select(`
                jumlah,
                harga,
                penyedia_produk:id_pp ( obat:id_obat ( nama_obat ) )
            `)
                .eq('id_po', order.id);

            if (error) throw error;
            if (!data) return;

            const formattedDetails: FormattedDetail[] = (data as Array<{
                jumlah: number;
                harga: number;
                penyedia_produk?: {
                    obat?: {
                        nama_obat: string;
                    };
                };
            }>).map(d => ({
                jumlah: d.jumlah,
                harga: d.harga,
                nama_obat: d.penyedia_produk?.obat?.nama_obat || 'N/A',
            }));

            setDetails(formattedDetails);

        } catch (error) {
            console.error("Gagal mengambil detail PO:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const createPageURL = (pageNumber: number) => {
        return `/pengadaan/informasi-po?page=${pageNumber}`;
    };

    return (
        <>
            <div className="flex flex-col gap-8 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800">Purchase Orders</h1>

                <div className="w-full overflow-hidden rounded-lg border bg-[#F7FCFA] shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">Nomor PO</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">Dibuat Pada</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">Nama Supplier</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">Petugas Apotik</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-black">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-black">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-300">
                            {orders.map((order) => (
                                <PurchaseOrderRow
                                    key={order.id}
                                    order={order}
                                    onViewDetails={handleViewDetails} // Kirim fungsi sebagai prop
                                />
                            ))}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-300 bg-slate-50 px-4 py-3">
                            {/* Tombol Previous */}
                            <Link
                                href={createPageURL(currentPage - 1)}
                                // Logika untuk menonaktifkan tombol
                                className={`rounded-md px-4 py-2 text-sm font-medium ${currentPage <= 1
                                    ? "pointer-events-none bg-gray-100 text-gray-400"
                                    : "hover:bg-gray-100 text-gray-700"
                                    }`}
                            >
                                Previous
                            </Link>

                            <span className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>

                            {/* Tombol Next */}
                            <Link
                                href={createPageURL(currentPage + 1)}
                                // Logika untuk menonaktifkan tombol
                                className={`rounded-md px-4 py-2 text-sm font-medium ${currentPage >= totalPages
                                    ? "pointer-events-none bg-gray-100 text-gray-400"
                                    : "hover:bg-gray-100 text-gray-700"
                                    }`}
                            >
                                Next
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal di-render di sini */}
            <RincianPOModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder ? {
                    id: selectedOrder.id,
                    dibuat_pada: selectedOrder.dibuat_pada,
                    supplier: selectedOrder.supplier?.[0]?.nama_supplier || 'N/A'
                } : null}
                details={details}
                isLoading={isLoading}
            />
        </>
    );
}