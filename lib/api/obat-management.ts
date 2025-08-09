// API functions for obat management

export interface ObatResponse {
    id: string;
    nama_obat: string;
    kategori: string;
    komposisi?: string;
    satuan?: string;
    harga_jual?: number;
    detail_obat: DetailObatResponse[];
}

export interface DetailObatResponse {
    nomor_batch: string;
    kadaluarsa: string;
    stok_sekarang: number;
    satuan: string;
    harga_jual: number;
    id_obat: string;
    dibuat_pada: string;
    diedit_pada: string;
}

export interface CreateObatData {
    nama_obat: string;
    komposisi?: string;
    kategori: string;
}

export interface UpdateObatData {
    nama_obat?: string;
    komposisi?: string;
    kategori?: string;
}

export interface CreateDetailObatData {
    id_obat: string;
    nomor_batch: string;
    kadaluarsa: string;
    stok_sekarang: number;
    satuan: string;
    harga_jual: number;
}

export interface ObatFilters {
    kategori?: string;
    supplier_id?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface ObatListResponse {
    success: boolean;
    data: ObatResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Fetch obat with optional filters and pagination
export const fetchObat = async (filters?: ObatFilters): Promise<ObatListResponse> => {
    try {
        const url = new URL('/api/obat', window.location.origin);

        if (filters) {
            if (filters.kategori) url.searchParams.append('kategori', filters.kategori);
            if (filters.supplier_id) url.searchParams.append('supplier_id', filters.supplier_id);
            if (filters.search) url.searchParams.append('search', filters.search);
            if (filters.page) url.searchParams.append('page', filters.page.toString());
            if (filters.limit) url.searchParams.append('limit', filters.limit.toString());
        }

        const response = await fetch(url.toString());

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch obat');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching obat:', error);
        throw error;
    }
};

// Fetch single obat by ID
export const fetchObatById = async (id: string): Promise<ObatResponse> => {
    try {
        const response = await fetch(`/api/obat/${id}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch obat');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error fetching obat by ID:', error);
        throw error;
    }
};

// Create new obat
export const createObat = async (obatData: CreateObatData): Promise<ObatResponse> => {
    try {
        const response = await fetch('/api/obat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(obatData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create obat');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error creating obat:', error);
        throw error;
    }
};

// Update obat
export const updateObat = async (id: string, obatData: UpdateObatData): Promise<ObatResponse> => {
    try {
        const response = await fetch(`/api/obat/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(obatData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update obat');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error updating obat:', error);
        throw error;
    }
};

// Delete obat
export const deleteObat = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`/api/obat/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete obat');
        }
    } catch (error) {
        console.error('Error deleting obat:', error);
        throw error;
    }
};

// Get obat categories (helper function)
export const getObatCategories = (): string[] => {
    return [
        'Antibiotik',
        'Analgesik',
        'Antihistamin',
        'Antasida',
        'Vitamin',
        'Suplemen',
        'Obat Batuk',
        'Obat Demam',
        'Obat Maag',
        'Obat Diare',
        'Obat Luar',
        'Lainnya'
    ];
};

// Calculate total stok from detail_obat
export const calculateTotalStok = (detailObat: DetailObatResponse[]): number => {
    return detailObat.reduce((total, detail) => total + detail.stok_sekarang, 0);
};

// Check if obat is expired or near expiry
export const checkObatExpiry = (detailObat: DetailObatResponse[]): {
    hasExpired: boolean;
    nearExpiry: boolean;
    expiredBatches: DetailObatResponse[];
    nearExpiryBatches: DetailObatResponse[];
} => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const expiredBatches: DetailObatResponse[] = [];
    const nearExpiryBatches: DetailObatResponse[] = [];

    detailObat.forEach(detail => {
        const expiryDate = new Date(detail.kadaluarsa.split('/').reverse().join('-'));

        if (expiryDate < now) {
            expiredBatches.push(detail);
        } else if (expiryDate <= thirtyDaysFromNow) {
            nearExpiryBatches.push(detail);
        }
    });

    return {
        hasExpired: expiredBatches.length > 0,
        nearExpiry: nearExpiryBatches.length > 0,
        expiredBatches,
        nearExpiryBatches
    };
};

// Check if obat stok is below minimum (using a default minimum of 10)
export const isStokBelowMinimum = (obat: ObatResponse, minimumStok: number = 10): boolean => {
    const totalStok = calculateTotalStok(obat.detail_obat);
    return totalStok < minimumStok;
};
