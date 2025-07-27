"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { ConfirmationDialog } from '@/components/ui/confirmationdialog'; // Pastikan path ini benar
import { SuccessToast } from '@/components/ui/successalert';

interface TerimaBarangButtonProps {
    status: string;
    orderId: string;
}

export function TerimaBarangButton({ status, orderId }: TerimaBarangButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const isDisabled = status !== 'dikirim' || isLoading;
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    const handleConfirmReceive = async () => {
        setIsLoading(true);
        setIsDialogOpen(false);
        const supabase = createClient();

        try {
            // Dapatkan ID pengguna yang sedang login untuk dicatat
            // const { data: { user } } = await supabase.auth.getUser();
            // if (!user) throw new Error("Pengguna tidak terautentikasi.");
            const user_id = "f7e7e2ad-ce8a-49a7-8813-384310284d86"; // Ganti dengan ID pengguna yang sesuai

            // Panggil FUNGSI TUNGGAL di Supabase yang melakukan semua pekerjaan
            const { error } = await supabase.rpc('terima_barang_po', {
                po_id: orderId,
                // user_id: user.id
                user_id: user_id
            });

            if (error) throw error;

            // Refresh data di halaman untuk menampilkan status baru
            router.refresh();
            setShowSuccessToast(true);

        } catch (error) {
            console.error("Gagal memproses penerimaan barang:", error);
            alert("Terjadi kesalahan saat memproses penerimaan barang.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsDialogOpen(true)} // Tombol ini HANYA membuka dialog
                disabled={isDisabled}
                className="rounded-lg bg-green-100 px-3 py-2 text-xs font-semibold text-green-800 transition hover:bg-green-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
                {isLoading ? 'Memproses...' : 'Terima Barang'}
            </button>
        
            <ConfirmationDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={handleConfirmReceive} // Aksi utama dijalankan saat dikonfirmasi
                title="Konfirmasi Penerimaan Barang"
            >
                <p>Apakah Anda yakin ingin mengonfirmasi penerimaan barang untuk pesanan ini?</p>
            </ConfirmationDialog>

            <SuccessToast
                isOpen={showSuccessToast}
                onClose={() => setShowSuccessToast(false)}
            >
                <p>Status pesanan berhasil diperbarui!</p>
            </SuccessToast>
        </>
    );
}