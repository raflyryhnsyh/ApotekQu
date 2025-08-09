import { KelolaObatResponse } from '@/app/api/kelola-obat/route';

const API_BASE_URL = '/api';

export interface KelolaObatData {
    nama_obat: string;
    komposisi?: string;
    kategori?: string;
    nomor_batch: string;
    kadaluarsa: string;
    stok_sekarang: number;
    satuan: string;
    harga_jual: number;
    supplier_id: string;
}

export interface KelolaObatUpdateData {
    nama_obat: string;
    komposisi?: string;
    kategori?: string;
    kadaluarsa: string;
    stok_sekarang: number;
    satuan: string;
    harga_jual: number;
    supplier_id?: string;
}

export interface KelolaObatApiResponse {
    success: boolean;
    data: KelolaObatResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface KelolaObatSingleResponse {
    success: boolean;
    data: unknown;
    message?: string;
    error?: string;
}

// Get all kelola obat data
export async function getKelolaObatData(params?: {
    search?: string;
    kategori?: string;
    supplier_id?: string;
    page?: number;
    limit?: number;
}): Promise<KelolaObatApiResponse> {
    try {
        const searchParams = new URLSearchParams();

        if (params?.search) searchParams.append('search', params.search);
        if (params?.kategori) searchParams.append('kategori', params.kategori);
        if (params?.supplier_id) searchParams.append('supplier_id', params.supplier_id);
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());

        const response = await fetch(`${API_BASE_URL}/kelola-obat?${searchParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching kelola obat data:', error);
        throw error;
    }
}

// Get individual kelola obat data by nomor_batch
export async function getKelolaObatByBatch(noBatch: string): Promise<KelolaObatSingleResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/kelola-obat/${encodeURIComponent(noBatch)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching kelola obat by batch:', error);
        throw error;
    }
}

// Create new kelola obat
export async function createKelolaObat(data: KelolaObatData): Promise<KelolaObatSingleResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/kelola-obat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error creating kelola obat:', error);
        throw error;
    }
}

// Update kelola obat
export async function updateKelolaObat(noBatch: string, data: KelolaObatUpdateData): Promise<KelolaObatSingleResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/kelola-obat/${encodeURIComponent(noBatch)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error updating kelola obat:', error);
        throw error;
    }
}

// Delete kelola obat
export async function deleteKelolaObat(noBatch: string): Promise<KelolaObatSingleResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/kelola-obat/${encodeURIComponent(noBatch)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error deleting kelola obat:', error);
        throw error;
    }
}
