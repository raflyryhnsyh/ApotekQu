"use client";

import { StatusBadge } from '@/components/pengadaan-informasi/statusbadges';
import { TerimaBarangButton } from './terimabutton';
import { PurchaseOrder } from '@/app/pegawai/pengadaan/informasi-po/type'; // Impor tipe data terpusat

interface PurchaseOrderRowProps {
    order: PurchaseOrder;
    onViewDetails: (order: PurchaseOrder) => void; // Prop baru untuk mengirim event klik
}

export function PurchaseOrderRow({ order, onViewDetails }: PurchaseOrderRowProps) {
    // Semua state dan fungsi untuk modal sudah dihapus dari sini
    return (
        // Tidak perlu lagi Fragment (<>), langsung return <tr>
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
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                <TerimaBarangButton status={order.status} orderId={order.id} />
                {/* Tombol ini sekarang memanggil fungsi dari props */}
                <button onClick={() => onViewDetails(order)} className="text-green-800 hover:text-green-950">
                    Lihat Rincian
                </button>
            </td>
        </tr>
    );
}