import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { PurchaseOrder, DetailPurchaseOrder, ApiResponse, PaginatedResponse } from '@/types/database'

// GET - Fetch all purchase orders with details
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(request.url)

        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''
        const sortBy = searchParams.get('sortBy') || 'dibuat_pada'
        const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'

        let query = supabase
            .from('purchase_order')
            .select(`
        *,
        supplier(nama_supplier, alamat),
        pengguna:dibuat_oleh(full_name),
        detail_purchase_order(
          *,
          penyedia_produk:id_pp(
            *,
            obat:id_obat(id, nama_obat, kategori)
          )
        )
      `, { count: 'exact' })

        // Add search filter
        if (search) {
            query = query.or(`id.ilike.%${search}%`)
        }

        // Add sorting
        query = query.order(sortBy, { ascending: sortOrder === 'asc' })

        // Add pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)

        const { data, error, count } = await query

        if (error) {
            return NextResponse.json(
                { success: false, data: null, error: error.message },
                { status: 500 }
            )
        }

        const response: PaginatedResponse<any> = {
            data: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        }

        return NextResponse.json({ success: true, data: response, error: null })
    } catch (error) {
        return NextResponse.json(
            { success: false, data: null, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST - Create new purchase order with details
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const body = await request.json()

        const {
            id_supplier,
            dibuat_oleh,
            total_bayar,
            items // Array of detail purchase order items
        } = body

        // Validation
        if (!id_supplier || !dibuat_oleh || !total_bayar || !items || items.length === 0) {
            return NextResponse.json(
                { success: false, data: null, error: 'Data purchase order tidak lengkap' },
                { status: 400 }
            )
        }

        // Start transaction
        const { data: poData, error: poError } = await supabase
            .from('purchase_order')
            .insert([{
                id_supplier,
                dibuat_oleh,
                total_bayar,
                dibuat_pada: new Date().toISOString()
            }])
            .select()
            .single()

        if (poError) {
            return NextResponse.json(
                { success: false, data: null, error: poError.message },
                { status: 500 }
            )
        }

        // Insert detail items
        const detailItems = items.map((item: any) => ({
            ...item,
            id_po: poData.id
        }))

        const { data: detailData, error: detailError } = await supabase
            .from('detail_purchase_order')
            .insert(detailItems)
            .select()

        if (detailError) {
            // Rollback: delete the created PO
            await supabase.from('purchase_order').delete().eq('id', poData.id)

            return NextResponse.json(
                { success: false, data: null, error: detailError.message },
                { status: 500 }
            )
        }

        const response: ApiResponse<any> = {
            success: true,
            data: {
                purchase_order: poData,
                details: detailData
            },
            error: null,
            message: 'Purchase order berhasil dibuat'
        }

        return NextResponse.json(response, { status: 201 })
    } catch (error) {
        return NextResponse.json(
            { success: false, data: null, error: 'Internal server error' },
            { status: 500 }
        )
    }
}