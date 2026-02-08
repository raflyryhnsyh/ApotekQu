"use client";

import React from 'react';
import { createPortal } from 'react-dom';

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
}

export function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    children,
}: ConfirmationDialogProps) {
    if (!isOpen) {
        return null;
    }

    // Use portal to render outside of table structure
    return createPortal(
        // Latar belakang overlay dengan backdrop blur
        <div
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            {/* Konten Dialog dengan animasi */}
            <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Judul (rata kiri secara default) */}
                <h2 className="text-lg font-bold text-gray-900 break-words text-left">{title}</h2>

                {/* Deskripsi (rata kiri secara default) */}
                <div className="mt-2 text-sm text-gray-600 break-words whitespace-normal text-left">
                    {children}
                </div>

                {/* Area Tombol Aksi (didorong ke kanan) */}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-gray-200 active:scale-95"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        className="rounded-lg bg-green-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-600 active:scale-95"
                    >
                        Yakin
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}