"use client";

import { DataTableDemo } from '@/components/kelola-obat/data-table';
import { useEffect, useState } from 'react';

export default function PengelolaanPage() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const initializePage = async () => {
            setLoading(true);

            // Simulasi fetch data atau operasi lainnya
            await new Promise(resolve => setTimeout(resolve, 1000));

            setLoading(false);
        };

        initializePage();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-lg text-gray-700">Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="container">
                <DataTableDemo />
            </div>
        </div>
    );
}