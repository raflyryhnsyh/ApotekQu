'use client';

import { usePathname } from 'next/navigation';
import NavbarPage from './navbar';

export const ConditionalNavbar = () => {
    const pathname = usePathname();

    // Daftar route yang MENAMPILKAN navbar (whitelist approach)
    const showNavbarRoutes = [
        // APA routes
        '/APA',
        '/APA/kelola-pegawai',
        '/APA/laporan-obat',
        '/APA/laporan',
        // Pegawai routes
        '/pegawai',
        '/pegawai/obat-master',
        '/pegawai/pengadaan/buat-po',
        '/pegawai/pengadaan/informasi-po',
        '/pegawai/pengelolaan',
        '/pegawai/penjualan'
    ];

    // Cek apakah current path ada dalam daftar yang diizinkan
    const shouldShowNavbar = showNavbarRoutes.includes(pathname);

    // Hanya tampilkan navbar jika route ada dalam daftar
    if (!shouldShowNavbar) {
        return null;
    }

    return <NavbarPage />;
};