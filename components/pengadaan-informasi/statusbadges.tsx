import React from 'react';

// Tentukan tipe untuk props yang diterima
interface StatusBadgeProps {
    status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    let colorClasses = '';
    let statusText = status;

    // Logika untuk menentukan warna berdasarkan nilai status
    switch (status.toLowerCase()) {
        case 'diterima':
            colorClasses = 'bg-green-100 text-green-800';
            statusText = 'Diterima';
            break;
        case 'dikirim':
            colorClasses = 'bg-blue-100 text-blue-800';
            statusText = 'Dikirim';
            break;
        case 'ditolak':
            colorClasses = 'bg-red-100 text-red-800';
            statusText = 'Ditolak';
            break;
        default:
            colorClasses = 'bg-gray-100 text-gray-800';
            statusText = status; // Tampilkan apa adanya jika tidak cocok
    }

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold leading-5 ${colorClasses}`}
        >
            {statusText}
        </span>
    );
}