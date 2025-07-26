'use client';

import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';

export default function PegawaiPage() {
    const { user, profile, error, signOut } = useAuth();

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

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!user) {
        return <div>Please login</div>;
    }

    if (!profile) {
        return <div>Loading profile...</div>;
    }

    return (
        <div className="min-h-screen items-center justify-center flex flex-col">
            <p>Welcome {profile.full_name}</p>
            <p>Role: {profile.role}</p>
            <button onClick={signOut}>Logout</button>
        </div>
    );
}