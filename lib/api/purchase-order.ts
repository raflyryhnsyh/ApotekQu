import { apiClient } from './client'

// Types
export interface PurchaseOrder {
    id: string
    dibuat_pada: string
    total_bayar: number
    status: string
    supplier?: {
        id: string
        nama_supplier: string
        alamat: string
    }
    pengguna?: {
        id: string
        full_name: string
        email: string
    }
    detail_purchase_order?: Array<{
        id: string
        jumlah: number
        harga: number
        penyedia_produk: {
            id: string
            harga_beli: number
            obat: {
                id: string
                nama_obat: string
                komposisi: string
                kategori: string
            }
        }
    }>
}

export interface CreatePurchaseOrder {
    id_supplier: string
    total_bayar?: number
    items: Array<{
        id_pp: string
        jumlah: number
        harga: number
    }>
}

export interface PurchaseOrderParams {
    page?: number
    limit?: number
    status?: string
    supplier_id?: string
}

// Purchase Order API services
export const purchaseOrderService = {
    // Get all purchase orders
    async getAll(params: PurchaseOrderParams = {}) {
        const queryParams: Record<string, string> = {}

        if (params.page) queryParams.page = params.page.toString()
        if (params.limit) queryParams.limit = params.limit.toString()
        if (params.status) queryParams.status = params.status
        if (params.supplier_id) queryParams.supplier_id = params.supplier_id

        return apiClient.get<{
            data: PurchaseOrder[]
            pagination: {
                page: number
                limit: number
                total: number
                totalPages: number
            }
        }>('/purchase-orders', queryParams)
    },

    // Create new purchase order
    async create(data: CreatePurchaseOrder) {
        return apiClient.post<{
            purchase_order: PurchaseOrder
            details: any[]
        }>('/purchase-orders', data)
    }
}
