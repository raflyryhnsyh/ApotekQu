"use client";

import { DataTableDemo } from '@/components/obat-master/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ObatMasterPage() {
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
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-lg">Loading...</p>
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
