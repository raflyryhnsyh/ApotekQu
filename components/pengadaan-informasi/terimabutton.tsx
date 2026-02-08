"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmationDialog } from '@/components/ui/confirmationdialog';
import { Toast, ToastType } from '@/components/ui/toast';

interface TerimaBarangButtonProps {
    status: string;
    orderId: string;
}

export function TerimaBarangButton({ status, orderId }: TerimaBarangButtonProps) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<ToastType>("success");
    const [toastMessage, setToastMessage] = useState("");
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

            setToastType("success");
            setToastMessage("Barang berhasil diterima!");
            setShowToast(true);
            router.refresh();
        } catch (error) {
            console.error('Error receiving goods:', error);
            setToastType("error");
            setToastMessage(error instanceof Error ? error.message : "Gagal menerima barang");
            setShowToast(true);
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
                {isLoading ? 'Memproses...' : 'Terima'}
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