import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        // Get PO details with related data
        const { data: details, error } = await supabase
            .from('detail_purchase_order')
            .select(`
                id_pp,
                jumlah,
                harga,
                penyedia_produk:id_pp (
                    id_obat,
                    obat:id_obat (
                        nama_obat
                    )
                )
            `)
            .eq('id_po', id);

        if (error) {
            console.error('Error fetching PO details:', error);
            return NextResponse.json(
                { error: 'Gagal mengambil detail PO' },
                { status: 500 }
            );
        }

        // Format the response
        const formattedDetails = details.map((item: any) => ({
            id_pp: item.id_pp,
            id_obat: item.penyedia_produk?.id_obat || null,
            nama_obat: item.penyedia_produk?.obat?.nama_obat || 'N/A',
            jumlah: item.jumlah,
            harga: item.harga
        }));

        return NextResponse.json({
            success: true,
            details: formattedDetails
        });

    } catch (error) {
        console.error('Error in GET /api/purchase-orders/[id]/details:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
