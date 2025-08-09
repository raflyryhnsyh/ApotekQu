"use client";

import { DataTableDemo } from '@/components/kelola-obat/data-table';

export default function PengelolaanPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="container mx-auto py-6">
                <DataTableDemo />
            </div>
        </div>
    );
}