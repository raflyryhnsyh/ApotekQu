// Database schema types based on Supabase structure

export interface Kategori {
    id: string
    kadaluarsa?: string
    stok_sekarang?: string
    stok_minimum?: string
    harga_jual?: string
    id_obat?: string
}

export interface Obat {
    id: string
    nama_obat: string
    kategori: string
    komposisi: string
}

export interface Supplier {
    id: string
    nama_supplier: string
    alamat: string
}

export interface Pengguna {
    id: string
    email: string
    full_name: string
    dibuat_pada: string
    role: string
}

export interface PurchaseOrder {
    id: string
    dibuat_pada: string
    total_bayar: number
    id_supplier: string
    dibuat_oleh: string
    status?: string
}

export interface DetailPurchaseOrder {
    id: string
    jumlah: number
    harga: number
    id_po: string // FK to purchase_order
    id_pp: string // FK to penyedia_produk (bukan langsung ke obat!)
}export interface Penjualan {
    id: string
    dibuat_pada: string
    total: number
    diproses_oleh: string
}

export interface DetailPenjualan {
    id: string
    jumlah_terjual: number
    harga: number
    id_penjualan: string
    id_obat: string
    nomor_batch?: string
}

// Extended types for API responses with joins
export interface PenjualanWithDetails extends Penjualan {
    pengguna?: {
        id: string;
        full_name: string;
    };
    detail_penjualan?: Array<DetailPenjualan & {
        obat?: {
            id: string;
            nama_obat: string;
            kategori: string;
        };
    }>;
}

export interface BarangDiterima {
    // Based on the visible fields in the image
    // Add specific fields as needed
}

export interface PenyesuaianProduk {
    id: string
    dibuat_pada: string
    total: number
    diproses_oleh: string
}

export interface Komposisi {
    id: string
    // Add specific fields based on your requirements
}

// Response types for API
export interface ApiResponse<T> {
    success: boolean
    data: T | null
    error: string | null
    message?: string
}

// Pagination types
export interface PaginationParams {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

// Purchase Order Request/Response types
export interface CreatePurchaseOrderRequest {
    id_supplier: string;
    dibuat_oleh: string;
    total_bayar: number;
    status?: string;
    items: Array<{
        id_pp: string;
        jumlah: number;
        harga: number;
    }>;
}

export interface CreatePurchaseOrderResponse extends ApiResponse<{
    purchase_order: PurchaseOrder;
    details: DetailPurchaseOrder[];
}> { }

// Sales Request/Response types
export interface CreateSaleRequest {
    diproses_oleh: string;
    items: Array<{
        id_obat: string;
        jumlah_terjual: number;
        harga: number;
        nomor_batch: string;
    }>;
}

export interface CreateSaleResponse extends ApiResponse<{
    penjualan: Penjualan;
    details: DetailPenjualan[];
    stock_updates: Array<{
        nomor_batch: string;
        old_stock: number;
        new_stock: number;
        difference: number;
    }>;
}> { }
