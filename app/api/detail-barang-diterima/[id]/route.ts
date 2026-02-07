import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// PATCH - Update detail_barang_diterima
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const { id } = await params;

        const { nomor_batch } = body;

        if (!nomor_batch) {
            return NextResponse.json(
                { error: 'Nomor batch harus diisi' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('detail_barang_diterima')
            .update({ nomor_batch })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating detail_barang_diterima:', error);
            return NextResponse.json(
                { error: 'Gagal update detail barang diterima', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data
        });

    } catch (error) {
        console.error('Error in PATCH /api/detail-barang-diterima/[id]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
