import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const {
            id_po,
            tiba_pada,
            items // Array of { id_pp, jumlah } - can be empty now
        } = body;

        // Validation
        if (!id_po || !tiba_pada) {
            return NextResponse.json(
                { error: 'ID PO dan tanggal tiba harus diisi' },
                { status: 400 }
            );
        }

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Insert into barang_diterima
        const { data: barangDiterima, error: barangError } = await supabase
            .from('barang_diterima')
            .insert({
                id_po,
                tiba_pada,
                diverifikasi_oleh: user.id
            })
            .select('id')
            .single();

        if (barangError) {
            console.error('Error creating barang_diterima:', barangError);
            return NextResponse.json(
                { error: 'Gagal membuat barang diterima', details: barangError.message },
                { status: 500 }
            );
        }

        // Only insert detail if items provided
        if (items && items.length > 0) {
            // Get detail_purchase_order untuk mendapatkan jumlah yang dipesan
            const { data: poDetails, error: poError } = await supabase
                .from('detail_purchase_order')
                .select('id_pp, jumlah')
                .eq('id_po', id_po);

            if (poError) {
                console.error('Error fetching PO details:', poError);
                return NextResponse.json(
                    { error: 'Gagal mengambil detail PO' },
                    { status: 500 }
                );
            }

            const detailInserts = items.map((item: { id_pp: string; jumlah: number; nomor_batch?: string }) => {
                const poDetail = poDetails?.find(pd => pd.id_pp === item.id_pp);
                return {
                    id_diterima: barangDiterima.id,
                    id_pp: item.id_pp,
                    jumlah_diterima: item.jumlah || poDetail?.jumlah || 0,
                    nomor_batch: item.nomor_batch || null
                };
            });

            const { error: detailError } = await supabase
                .from('detail_barang_diterima')
                .insert(detailInserts);

            if (detailError) {
                // Rollback barang_diterima if detail fails
                await supabase.from('barang_diterima').delete().eq('id', barangDiterima.id);
                console.error('Error creating detail_barang_diterima:', detailError);
                return NextResponse.json(
                    { error: 'Gagal membuat detail barang diterima', details: detailError.message },
                    { status: 500 }
                );
            }
        }

        // Update PO status to 'diterima'
        const { error: updatePOError } = await supabase
            .from('purchase_order')
            .update({ status: 'diterima' })
            .eq('id', id_po);

        if (updatePOError) {
            console.error('Error updating PO status:', updatePOError);
            // Don't fail the request, just log the error
        }

        return NextResponse.json({
            success: true,
            data: {
                id: barangDiterima.id,
                id_po,
                tiba_pada
            },
            message: 'Barang berhasil diterima'
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
