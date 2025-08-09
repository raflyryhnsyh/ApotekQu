"use client";

import { DataTableDemo } from '@/components/kelola-obat/data-table';

export default function PengelolaanPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="container mx-auto py-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Kelola Obat</h1>
                    <p className="text-gray-600 mt-2">Kelola stok dan data obat di apotek</p>
                </div>
                <DataTableDemo />
            </div>
        </div>
    );
}