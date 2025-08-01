import { apiClient } from './client'

// Types
export interface Obat {
    id: string
    nama_obat: string
    komposisi: string
    kategori: string
}

export interface ObatWithSupplier extends Obat {
    penyedia_produk: Array<{
        id: string
        harga_beli: number
        supplier: {
            id: string
            nama_supplier: string
            alamat: string
        }
    }>
}

export interface PaginationParams {
    page?: number
    limit?: number
    search?: string
    kategori?: string
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

// Obat API services
export const obatService = {
    // Get all medicines with pagination and filters
    async getAll(params: PaginationParams = {}) {
        const queryParams: Record<string, string> = {}

        if (params.page) queryParams.page = params.page.toString()
        if (params.limit) queryParams.limit = params.limit.toString()
        if (params.search) queryParams.search = params.search
        if (params.kategori) queryParams.kategori = params.kategori

        return apiClient.get<PaginatedResponse<Obat>>('/obat', queryParams)
    },

    // Get specific medicine by ID
    async getById(id: string) {
        return apiClient.get<ObatWithSupplier>(`/obat/${id}`)
    },

    // Create new medicine
    async create(data: Omit<Obat, 'id'>) {
        return apiClient.post<Obat>('/obat', data)
    },

    // Update medicine
    async update(id: string, data: Omit<Obat, 'id'>) {
        return apiClient.put<Obat>(`/obat/${id}`, data)
    },

    // Delete medicine
    async delete(id: string) {
        return apiClient.delete(`/obat/${id}`)
    }
}
