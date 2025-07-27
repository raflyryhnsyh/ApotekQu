"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
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
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                <p className="mt-4 text-lg text-gray-600">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-2xl font-bold text-gray-900">Home</h1>
        </div>
    );
}