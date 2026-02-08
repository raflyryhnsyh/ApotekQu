'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-sm text-gray-600">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Selamat Datang di{" "}
                <span className="text-blue-600">Apotek Qu</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Sistem manajemen apotek modern yang memudahkan pengelolaan
                inventori obat, penjualan, dan administrasi apotek Anda.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Manajemen Obat</h3>
                    <p className="text-gray-600 text-sm">Kelola stok dan informasi obat dengan mudah</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Laporan Penjualan</h3>
                    <p className="text-gray-600 text-sm">Monitor performa bisnis secara real-time</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Kelola Pegawai</h3>
                    <p className="text-gray-600 text-sm">Atur hak akses dan manajemen karyawan</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Pengadaan</h3>
                    <p className="text-gray-600 text-sm">Kelola pemesanan dan supplier dengan efisien</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 text-lg font-semibold shadow-lg hover:shadow-xl"
              >
                <span>Learn More</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative z-10">
              <Image
                src="/picture-login.png"
                alt="Apotek Qu Dashboard Preview"
                width={600}
                height={500}
                className="rounded-2xl shadow-2xl"
                priority
              />
            </div>
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-green-500 rounded-2xl transform rotate-6 scale-105 opacity-10"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
