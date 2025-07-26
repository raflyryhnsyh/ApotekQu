"use client";

import { useEffect, useState } from 'react';

export default function KelolaPegawaiPage() {
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
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-gray-600">
            <h1>Kelola Pegawai Page!</h1>
        </div>
    );
}
