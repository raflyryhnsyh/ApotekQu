import { apiClient } from './client'
import type { PurchaseOrder, DetailPurchaseOrder, ApiResponse, PaginatedResponse, PaginationParams } from '@/types/database'

export interface CreatePurchaseOrderData {
    id_supplier: string
    dibuat_oleh: string
    total: number
    total_bayar: number
    nomor_batch?: string
    items: Array<{
        id_obat: string
        jumlah: number
        harga: number
    }>
}

export const purchaseOrderApi = {
    // Get all purchase orders with pagination
    getAll: async (params?: PaginationParams) => {
        const searchParams = new URLSearchParams()

        if (params?.page) searchParams.set('page', params.page.toString())
        if (params?.limit) searchParams.set('limit', params.limit.toString())
        if (params?.search) searchParams.set('search', params.search)
        if (params?.sortBy) searchParams.set('sortBy', params.sortBy)
        if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder)

        const query = searchParams.toString()
        const endpoint = query ? `/reports/purchase?${query}` : '/reports/purchase'

        return apiClient.get<PaginatedResponse<any>>(endpoint)
    },

    // Create new purchase order
    create: async (data: CreatePurchaseOrderData) => {
        return apiClient.post<any>('/reports/purchase', data)
    },

    // Get purchase order by ID
    getById: async (id: string) => {
        return apiClient.get<any>(`/reports/purchase/${id}`)
    }
}
