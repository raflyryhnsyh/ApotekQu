"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/pengadaan-informasi/statusbadges';
import { TerimaBarangButton } from './terimabutton';
import { PurchaseOrder } from '@/app/pegawai/pengadaan/informasi-po/type'; // Impor tipe data terpusat
import { ConfirmationDialog } from '@/components/ui/confirmationdialog';
import { Toast, ToastType } from '@/components/ui/toast';

interface PurchaseOrderRowProps {
    order: PurchaseOrder;
    onViewDetails: (order: PurchaseOrder) => void; // Prop baru untuk mengirim event klik
}

export function PurchaseOrderRow({ order, onViewDetails }: PurchaseOrderRowProps) {
    const router = useRouter();
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<ToastType>("success");
    const [toastMessage, setToastMessage] = useState("");

    const handleTolak = (orderId: string) => {
        setIsRejectDialogOpen(true);
    };

    const handleConfirmReject = async () => {
        setIsRejecting(true);
        setIsRejectDialogOpen(false);

        try {
            const response = await fetch('/api/purchase-orders/reject', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_po: order.id })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Gagal menolak PO');
            }

            setToastType("success");
            setToastMessage("Purchase Order berhasil ditolak!");
            setShowToast(true);
            
            setTimeout(() => {
                router.refresh();
            }, 1000);
        } catch (error) {
            console.error('Error rejecting PO:', error);
            setToastType("error");
            setToastMessage(error instanceof Error ? error.message : "Gagal menolak PO");
            setShowToast(true);
        } finally {
            setIsRejecting(false);
        }
    };

    return (
        <>
            <tr className="hover:bg-gray-50">
                {/* Nomor PO (diperbaiki) */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id.substring(0, 8).toUpperCase()}
                </td>
                {/* Dibuat Pada */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.dibuat_pada).toLocaleDateString('id-ID', { /* ... */ })}
                </td>
                {/* Nama Supplier (diperbaiki dengan akses array [0]) */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.supplier?.[0]?.nama_supplier}
                </td>
                {/* Total Bayar */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.total_bayar.toLocaleString('id-ID', { /* ... */ })}
                </td>
                {/* Petugas Apotik (diperbaiki dengan akses array [0]) */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.pengguna?.[0]?.full_name}
                </td>
                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                </td>

                {/* Aksi */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <TerimaBarangButton status={order.status} orderId={order.id} />
                    {order.status === 'dikirim' && (
                        <button
                            onClick={() => handleTolak(order.id)}
                            disabled={isRejecting}
                            className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-800 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            {isRejecting ? 'Memproses...' : 'Tolak'}
                        </button>
                    )}
                    {/* Tombol ini sekarang memanggil fungsi dari props */}
                    <button onClick={() => onViewDetails(order)} className="text-green-800 hover:text-green-950">
                        Lihat Rincian
                    </button>
                </td>
            </tr>

            <ConfirmationDialog
                isOpen={isRejectDialogOpen}
                onClose={() => setIsRejectDialogOpen(false)}
                onConfirm={handleConfirmReject}
                title="Konfirmasi Penolakan PO"
            >
                <p>Apakah Anda yakin ingin menolak Purchase Order ini?</p>
                <p className="text-sm text-gray-600 mt-2">PO yang ditolak tidak dapat diterima kembali.</p>
            </ConfirmationDialog>

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