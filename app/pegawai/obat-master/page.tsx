"use client";

import { DataTableDemo } from '@/components/obat-master/data-table';
import { DataAdd } from '@/components/obat-master/data-add';
import { useEffect, useState } from 'react';
import { fetchObat, ObatResponse, ObatFilters } from '@/lib/api/obat-management';

export default function ObatMasterPage() {
    const [loading, setLoading] = useState(false);
    const [obatData, setObatData] = useState<ObatResponse[]>([]);
    const [totalData, setTotalData] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<ObatFilters>({
        page: 1,
        limit: 10
    });

    const fetchObatData = async () => {
        try {
            setLoading(true);
            console.log('Fetching obat data with filters:', filters);

            const response = await fetchObat(filters);

            console.log('Obat API response:', response);
            setObatData(response.data);
            setTotalData(response.total);
            setCurrentPage(response.page);
        } catch (error) {
            console.error('Error fetching obat data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchObatData();
    }, [filters]);

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const handleSearch = (search: string) => {
        setFilters(prev => ({ ...prev, search, page: 1 }));
    };

    const handleFilterChange = (newFilters: Partial<ObatFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handleObatAdd = (newObat: ObatResponse) => {
        setObatData(prev => [newObat, ...prev]);
        setTotalData(prev => prev + 1);
        // Refresh data to get updated list
        fetchObatData();
    };

    if (loading && obatData.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-lg">Loading obat data...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="container mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Master Data Obat</h1>
                        <p className="text-gray-600">Kelola data obat dan informasi stok</p>
                    </div>
                    <DataAdd onAdd={handleObatAdd} />
                </div>

                <DataTableDemo
                    data={obatData}
                    total={totalData}
                    currentPage={currentPage}
                    loading={loading}
                    onPageChange={handlePageChange}
                    onSearch={handleSearch}
                    onFilterChange={handleFilterChange}
                    onRefresh={fetchObatData}
                />
            </div>
        </div>
    );
}
