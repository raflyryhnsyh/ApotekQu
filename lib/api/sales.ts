import {
    Penjualan,
    PenjualanWithDetails,
    DetailPenjualan,
    CreateSaleRequest,
    CreateSaleResponse,
    ApiResponse,
    PaginatedResponse
} from '@/types/database';

class SalesAPI {
    private baseUrl = '/api/reports/sales';

    // Get all sales with pagination and filters
    async getSales(params?: {
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
        userId?: string;
    }): Promise<ApiResponse<PaginatedResponse<PenjualanWithDetails>>> {
        try {
            const searchParams = new URLSearchParams();

            if (params?.page) searchParams.set('page', params.page.toString());
            if (params?.limit) searchParams.set('limit', params.limit.toString());
            if (params?.startDate) searchParams.set('startDate', params.startDate);
            if (params?.endDate) searchParams.set('endDate', params.endDate);
            if (params?.userId) searchParams.set('userId', params.userId);

            const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch sales');
            }

            return data;
        } catch (error) {
            console.error('Error fetching sales:', error);
            throw error;
        }
    }

    // Get single sale by ID
    async getSaleById(id: string): Promise<ApiResponse<Penjualan>> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch sale');
            }

            return data;
        } catch (error) {
            console.error('Error fetching sale:', error);
            throw error;
        }
    }

    // Create new sale
    async createSale(saleData: CreateSaleRequest): Promise<CreateSaleResponse> {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(saleData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create sale');
            }

            return data;
        } catch (error) {
            console.error('Error creating sale:', error);
            throw error;
        }
    }

    // Update sale (if needed)
    async updateSale(id: string, updates: Partial<Penjualan>): Promise<ApiResponse<Penjualan>> {
        try {
            const response = await fetch(`${this.baseUrl}?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update sale');
            }

            return data;
        } catch (error) {
            console.error('Error updating sale:', error);
            throw error;
        }
    }

    // Delete sale (admin only)
    async deleteSale(id: string): Promise<ApiResponse<null>> {
        try {
            const response = await fetch(`${this.baseUrl}?id=${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete sale');
            }

            return data;
        } catch (error) {
            console.error('Error deleting sale:', error);
            throw error;
        }
    }

    // Get sales summary for dashboard
    async getSalesSummary(params?: {
        startDate?: string;
        endDate?: string;
        userId?: string;
    }): Promise<{
        totalSales: number;
        totalRevenue: number;
        averageOrderValue: number;
        topSellingProducts: Array<{
            nama_obat: string;
            kategori: string;
            total_terjual: number;
            total_revenue: number;
        }>;
    }> {
        try {
            const sales = await this.getSales({
                limit: 1000, // Get all sales for summary
                ...params
            });

            if (!sales.success || !sales.data?.data) {
                throw new Error('Failed to fetch sales data');
            }

            const salesData = sales.data.data;

            // Calculate summary metrics
            const totalSales = salesData.length;
            const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total, 0);
            const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

            // Calculate top selling products
            const productSales = new Map<string, {
                nama_obat: string;
                kategori: string;
                total_terjual: number;
                total_revenue: number;
            }>();

            salesData.forEach(sale => {
                sale.detail_penjualan?.forEach((detail: any) => {
                    if (!detail.obat) return;

                    const key = detail.obat.id;
                    const existing = productSales.get(key) || {
                        nama_obat: detail.obat.nama_obat,
                        kategori: detail.obat.kategori,
                        total_terjual: 0,
                        total_revenue: 0
                    };

                    existing.total_terjual += detail.jumlah_terjual;
                    existing.total_revenue += detail.jumlah_terjual * detail.harga;

                    productSales.set(key, existing);
                });
            });

            const topSellingProducts = Array.from(productSales.values())
                .sort((a, b) => b.total_terjual - a.total_terjual)
                .slice(0, 10);

            return {
                totalSales,
                totalRevenue,
                averageOrderValue,
                topSellingProducts
            };
        } catch (error) {
            console.error('Error getting sales summary:', error);
            throw error;
        }
    }

    // Search products for sale (helper method)
    async searchProductsForSale(query: string): Promise<ApiResponse<Array<{
        id: string;
        nama_obat: string;
        kategori: string;
        available_batches: Array<{
            nomor_batch: string;
            stok: number;
            harga_jual: number;
            tanggal_expired: string;
        }>;
    }>>> {
        try {
            const response = await fetch(`/api/obat?search=${encodeURIComponent(query)}&includeStock=true`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to search products');
            }

            return data;
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }

    // Validate sale before creating (check stock availability)
    async validateSale(items: Array<{
        id_obat: string;
        nomor_batch: string;
        jumlah_terjual: number;
    }>): Promise<{
        valid: boolean;
        errors: Array<{
            id_obat: string;
            nomor_batch: string;
            error: string;
            available_stock?: number;
        }>;
    }> {
        try {
            const errors: Array<{
                id_obat: string;
                nomor_batch: string;
                error: string;
                available_stock?: number;
            }> = [];

            // Check each item's stock availability
            for (const item of items) {
                const response = await fetch(`/api/obat/${item.id_obat}/stock?batch=${item.nomor_batch}`);
                const stockData = await response.json();

                if (!response.ok) {
                    errors.push({
                        id_obat: item.id_obat,
                        nomor_batch: item.nomor_batch,
                        error: 'Failed to check stock'
                    });
                    continue;
                }

                const availableStock = stockData.data?.stok || 0;

                if (availableStock < item.jumlah_terjual) {
                    errors.push({
                        id_obat: item.id_obat,
                        nomor_batch: item.nomor_batch,
                        error: `Insufficient stock. Available: ${availableStock}, Requested: ${item.jumlah_terjual}`,
                        available_stock: availableStock
                    });
                }
            }

            return {
                valid: errors.length === 0,
                errors
            };
        } catch (error) {
            console.error('Error validating sale:', error);
            return {
                valid: false,
                errors: [{
                    id_obat: '',
                    nomor_batch: '',
                    error: 'Validation failed'
                }]
            };
        }
    }
}

// Export singleton instance
export const salesAPI = new SalesAPI();
export default salesAPI;
