import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/reports/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(request.url)

        // Date filters
        const startDate = searchParams.get('start_date') || new Date(new Date().setDate(1)).toISOString().split('T')[0] // First day of current month
        const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0] // Today

        // Get total sales
        const { data: salesData, error: salesError } = await supabase
            .from('penjualan')
            .select('total')
            .gte('dibuat_pada', startDate)
            .lte('dibuat_pada', endDate + 'T23:59:59')

        if (salesError) {
            console.error('Sales query error:', salesError)
        }

        const totalSales = salesData?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0

        // Get total purchases
        const { data: purchaseData, error: purchaseError } = await supabase
            .from('purchase_order')
            .select('total_bayar')
            .gte('dibuat_pada', startDate)
            .lte('dibuat_pada', endDate + 'T23:59:59')

        if (purchaseError) {
            console.error('Purchase query error:', purchaseError)
        }

        const totalPurchases = purchaseData?.reduce((sum, purchase) => sum + (purchase.total_bayar || 0), 0) || 0

        // Get medicines sold count
        const { data: medicinesSoldData, error: medicinesSoldError } = await supabase
            .from('detail_penjualan')
            .select(`
        jumlah_terjual,
        penjualan!inner(dibuat_pada)
      `)
            .gte('penjualan.dibuat_pada', startDate)
            .lte('penjualan.dibuat_pada', endDate + 'T23:59:59')

        if (medicinesSoldError) {
            console.error('Medicines sold query error:', medicinesSoldError)
        }

        const totalMedicinesSold = medicinesSoldData?.reduce((sum, detail) => sum + (detail.jumlah_terjual || 0), 0) || 0

        // Get medicines expiring within 30 days
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

        const { data: expiringMedicines, error: expiringError } = await supabase
            .from('detail_obat')
            .select(`
                id_obat,
                nomor_batch,
                kadaluarsa,
                stok_sekarang,
                obat!inner(nama_obat)
            `)
            .lte('kadaluarsa', thirtyDaysFromNow.toISOString().split('T')[0])
            .gte('kadaluarsa', new Date().toISOString().split('T')[0])
            .gt('stok_sekarang', 0)
            .limit(10)

        if (expiringError) {
            console.error('Expiring medicines query error:', expiringError)
        }

        // Get low stock medicines (stock < 10)
        const { data: lowStockMedicines, error: lowStockError } = await supabase
            .from('detail_obat')
            .select(`
                id_obat,
                nomor_batch,
                stok_sekarang,
                obat!inner(nama_obat)
            `)
            .lt('stok_sekarang', 10)
            .gt('stok_sekarang', 0)
            .limit(10)

        if (lowStockError) {
            console.error('Low stock medicines query error:', lowStockError)
        }

        // Calculate profit (simplified calculation)
        const estimatedProfit = totalSales * 0.3 // Assuming 30% profit margin

        return NextResponse.json({
            success: true,
            data: {
                period: {
                    start_date: startDate,
                    end_date: endDate
                },
                statistics: {
                    total_sales: totalSales,
                    total_purchases: totalPurchases,
                    total_medicines_sold: totalMedicinesSold,
                    estimated_profit: estimatedProfit,
                    expiring_medicines_count: expiringMedicines?.length || 0,
                    low_stock_medicines_count: lowStockMedicines?.length || 0
                },
                expiring_medicines: expiringMedicines || [],
                low_stock_medicines: lowStockMedicines || []
            }
        })

    } catch (error) {
        console.error('Dashboard statistics error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
