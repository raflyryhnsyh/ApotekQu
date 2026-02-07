import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// POST - Create new detail_barang_diterima
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const {
            id_barang_diterima,
            id_pp,
            jumlah_diterima,
            nomor_batch
        } = body;

        // Validation
        if (!id_barang_diterima || !id_pp || !jumlah_diterima) {
            return NextResponse.json(
                { error: 'ID barang diterima, ID PP, dan jumlah harus diisi' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('detail_barang_diterima')
            .insert({
                id_diterima: id_barang_diterima,
                id_pp,
                jumlah_diterima,
                nomor_batch: nomor_batch || null
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating detail_barang_diterima:', error);
            return NextResponse.json(
                { error: 'Gagal membuat detail barang diterima', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data
        });

    } catch (error) {
        console.error('Error in POST /api/detail-barang-diterima:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
