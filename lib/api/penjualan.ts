import { apiClient } from './client';

// Types for sales/penjualan
export interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    kategori?: string;
    komposisi?: string;
}

export interface CartItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    nomor_batch?: string;
}

export interface Transaction {
    id: string;
    date: string;
    pharmacist: string;
    total: number;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
}

export interface CreateSaleRequest {
    diproses_oleh: string;
    items: Array<{
        id_obat: string;
        jumlah_terjual: number;
        harga: number;
        nomor_batch: string;
    }>;
}

export interface SaleDetail {
    id: string;
    jumlah_terjual: number;
    harga: number;
    nomor_batch: string;
    obat: {
        id: string;
        nama_obat: string;
        kategori: string;
    };
}

export interface Sale {
    id: string;
    dibuat_pada: string;
    total: number;
    pengguna: {
        id: string;
        full_name: string;
    };
    detail_penjualan: SaleDetail[];
}

export interface PaginatedSales {
    data: Sale[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Sales API client
class PenjualanAPI {
    // Get all products/obat for sales
    async getProducts() {
        return apiClient.get<Product[]>('/obat');
    }

    // Get product by ID
    async getProductById(id: string) {
        return apiClient.get<Product>(`/obat/${id}`);
    }

    // Create a new sale transaction
    async createSale(saleData: CreateSaleRequest) {
        return apiClient.post<{
            penjualan: Sale;
            details: SaleDetail[];
            stock_updates: Array<{
                nomor_batch: string;
                old_stock: number;
                new_stock: number;
                difference: number;
            }>;
        }>('/reports/sales', saleData);
    }

    // Get sales transactions with pagination and filters
    async getSales(params?: {
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
        userId?: string;
    }) {
        const queryParams: Record<string, string> = {};

        if (params?.page) queryParams.page = params.page.toString();
        if (params?.limit) queryParams.limit = params.limit.toString();
        if (params?.startDate) queryParams.startDate = params.startDate;
        if (params?.endDate) queryParams.endDate = params.endDate;
        if (params?.userId) queryParams.userId = params.userId;

        return apiClient.get<PaginatedSales>('/reports/sales', queryParams);
    }

    // Get sale by ID
    async getSaleById(id: string) {
        return apiClient.get<Sale>(`/reports/sales/${id}`);
    }

    // Get products with stock details (for checking available batches)
    async getProductsWithStock() {
        return apiClient.get<Array<{
            noBatch: string;
            nama: string;
            totalStok: number;
            satuan: string;
            tanggalExpired: string;
            supplier: string;
            harga_jual?: number;
            kategori?: string;
            komposisi?: string;
            id_obat?: string;
        }>>('/kelola-obat');
    }

    // Search products by name
    async searchProducts(query: string) {
        return apiClient.get<Product[]>('/obat', { search: query });
    }
}

export const penjualanAPI = new PenjualanAPI();
