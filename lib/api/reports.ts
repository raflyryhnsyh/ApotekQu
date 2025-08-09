import { apiClient } from './client'

// Types
export interface DashboardStats {
    period: {
        start_date: string
        end_date: string
    }
    statistics: {
        total_sales: number
        total_purchases: number
        total_medicines_sold: number
        estimated_profit: number
        expiring_medicines_count: number
        low_stock_medicines_count: number
    }
    expiring_medicines: Array<{
        id: string;
        nama_obat: string;
        tanggal_expired: string;
        stok_sekarang: number;
    }>
    low_stock_medicines: Array<{
        id: string;
        nama_obat: string;
        stok_sekarang: number;
        stok_minimum: number;
    }>
}

export interface SalesReport {
    data: Array<{
        id: string;
        dibuat_pada: string;
        total: number;
        diproses_oleh: string;
    }>
    summary: {
        total_revenue: number
        total_transactions: number
        total_items_sold: number
        average_transaction: number
    }
    grouped_data: Record<string, any>
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export interface ReportParams {
    start_date?: string
    end_date?: string
    page?: number
    limit?: number
    group_by?: 'daily' | 'monthly' | 'yearly'
}

// Reports API services
export const reportsService = {
    // Get dashboard statistics
    async getDashboard(params: Pick<ReportParams, 'start_date' | 'end_date'> = {}) {
        const queryParams: Record<string, string> = {}

        if (params.start_date) queryParams.start_date = params.start_date
        if (params.end_date) queryParams.end_date = params.end_date

        return apiClient.get<DashboardStats>('/reports/dashboard', queryParams)
    },

    // Get sales report
    async getSales(params: ReportParams = {}) {
        const queryParams: Record<string, string> = {}

        if (params.page) queryParams.page = params.page.toString()
        if (params.limit) queryParams.limit = params.limit.toString()
        if (params.start_date) queryParams.start_date = params.start_date
        if (params.end_date) queryParams.end_date = params.end_date
        if (params.group_by) queryParams.group_by = params.group_by

        return apiClient.get<SalesReport>('/reports/sales', queryParams)
    }
}
