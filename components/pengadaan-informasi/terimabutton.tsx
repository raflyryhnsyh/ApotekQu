"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmationDialog } from '@/components/ui/confirmationdialog';
import { SuccessToast } from '@/components/ui/successalert';

interface TerimaBarangButtonProps {
    status: string;
    orderId: string;
}

export function TerimaBarangButton({ status, orderId }: TerimaBarangButtonProps) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const isDisabled = status !== 'dikirim' || isLoading;

    const handleConfirmReceive = async () => {
        setIsLoading(true);
        setIsDialogOpen(false);

        try {
            const response = await fetch('/api/barang-diterima', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_po: orderId,
                    tiba_pada: new Date().toISOString().split('T')[0],
                    items: [] // Empty items - detail will be filled in Pengelolaan page
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Gagal menerima barang');
            }

            setShowSuccessToast(true);
            router.refresh();
        } catch (error) {
            console.error('Error receiving goods:', error);
            alert(error instanceof Error ? error.message : 'Gagal menerima barang');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsDialogOpen(true)}
                disabled={isDisabled}
                className="rounded-lg bg-green-100 px-3 py-2 text-xs font-semibold text-green-800 transition hover:bg-green-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
                {isLoading ? 'Memproses...' : 'Terima Barang'}
            </button>
        
            <ConfirmationDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={handleConfirmReceive}
                title="Konfirmasi Penerimaan Barang"
            >
                <p>Apakah Anda yakin ingin mengonfirmasi penerimaan barang untuk pesanan ini?</p>
                <p className="text-sm text-gray-600 mt-2">Anda dapat melengkapi detail obat nanti di halaman Pengelolaan Obat.</p>
            </ConfirmationDialog>

            <SuccessToast
                isOpen={showSuccessToast}
                onClose={() => setShowSuccessToast(false)}
            >
                <p>Barang berhasil diterima! Silakan cek Pengelolaan Obat untuk melengkapi detail.</p>
            </SuccessToast>
        </>
    );
}