"use client";

import React, { useEffect } from 'react';

interface SuccessToastProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export function SuccessToast({ isOpen, onClose, children }: SuccessToastProps) {
    // Efek untuk menutup toast secara otomatis setelah 3 detik
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 4000); // 3000 milidetik = 3 detik

            // Membersihkan timer jika komponen di-unmount atau ditutup manual
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        // Kontainer toast yang posisinya fixed di atas tengah layar
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm">
            <div className="flex items-center gap-4 rounded-lg bg-green-100 p-4 text-green-800 shadow-lg">
                {/* Ikon Checklist */}
                <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                </div>
                {/* Pesan Sukses */}
                <div className="flex-1 text-sm font-medium">
                    {children}
                </div>
                {/* Tombol Tutup Manual */}
                <button onClick={onClose} className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    );
}