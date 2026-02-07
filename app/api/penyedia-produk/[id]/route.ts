import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        // Get penyedia_produk data
        const { data, error } = await supabase
            .from('penyedia_produk')
            .select('id_obat, id_supplier')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching penyedia_produk:', error);
            return NextResponse.json(
                { error: 'Gagal mengambil data penyedia produk' },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: 'Data tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            id_obat: data.id_obat,
            id_supplier: data.id_supplier
        });

    } catch (error) {
        console.error('Error in GET /api/penyedia-produk/[id]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
