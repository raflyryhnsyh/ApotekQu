import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export interface SupplierResponse {
    id: string;
    nama_supplier: string;
    alamat?: string;
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: supplierData, error } = await supabase
            .from('supplier')
            .select(`
                id,
                nama_supplier,
                alamat
            `)
            .order('nama_supplier', { ascending: true });

        if (error) {
            console.error('Error fetching suppliers:', error);
            return NextResponse.json(
                { error: 'Gagal mengambil data supplier', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: supplierData || []
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}