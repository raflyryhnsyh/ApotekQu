import { SupplierResponse } from '@/app/api/suppliers/route';

const API_BASE_URL = '/api';

export interface SupplierApiResponse {
    success: boolean;
    data: SupplierResponse[];
}

// Get all suppliers
export async function getSuppliers(): Promise<SupplierApiResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/suppliers`, {
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
        console.error('Error fetching suppliers:', error);
        throw error;
    }
}
