"use client";

import React from 'react';

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode; // Menggunakan children agar deskripsi lebih fleksibel
}

export function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    children,
}: ConfirmationDialogProps) {
    if (!isOpen) {
        return null; // Jika tidak terbuka, jangan render apapun
    }

    return (
        // Overlay (latar belakang gelap)
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose} // Menutup dialog saat overlay diklik
        >
            {/* Konten Dialog */}
            <div 
                className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
                onClick={(e) => e.stopPropagation()} // Mencegah dialog tertutup saat di dalam dialog diklik
            >
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                <div className="mt-2 text-sm text-gray-600">
                    {children}
                </div>
                
                {/* Area Tombol */}
                <div className="mt-6 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-200"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        className="rounded-lg bg-green-100 px-5 py-2 text-sm font-medium text-green-800 transition hover:bg-green-200"
                    >
                        Yakin
                    </button>
                </div>
            </div>
        </div>
    );
}