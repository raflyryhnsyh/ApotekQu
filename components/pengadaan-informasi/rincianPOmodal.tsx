"use client";

import React from 'react';

// Tipe data untuk props
interface RincianPOModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: {
        id: string;
        dibuat_pada: string;
        supplier: string;
    } | null;
    details: {
        nama_obat: string;
        jumlah: number;
        harga: number;
    }[];
    isLoading: boolean;
}

export function RincianPOModal({ isOpen, onClose, order, details, isLoading }: RincianPOModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-900">Rincian PO</h2>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-sm text-gray-600">Memuat data...</p>
                    </div>
                ) : (
                    <>
                        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <p className="font-semibold text-gray-600">Nomor PO</p>
                            <p className="text-gray-800">{order?.id.substring(0, 8).toUpperCase()}</p>

                            <p className="font-semibold text-gray-600">Tanggal</p>
                            <p className="text-gray-800">{order ? new Date(order.dibuat_pada).toLocaleDateString('id-ID') : ''}</p>

                            <p className="font-semibold text-gray-600">Supplier</p>
                            <p className="text-gray-800">{order?.supplier}</p>
                        </div>

                        <hr className="my-4" />

                        <h3 className="font-bold text-gray-800">Obat-Obatan</h3>
                        <div className="mt-2 max-h-60 overflow-y-auto pr-2">
                            {details.map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.nama_obat}</p>
                                        <p className="text-xs text-gray-500">Jumlah: {item.jumlah}</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">
                                        {item.harga.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={onClose}
                                className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-gray-200"
                            >
                                Tutup
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}