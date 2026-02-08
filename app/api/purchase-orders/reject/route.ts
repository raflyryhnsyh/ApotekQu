import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const { id_po } = body;

        // Validation
        if (!id_po) {
            return NextResponse.json(
                { error: 'ID PO harus diisi' },
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

        // Check if PO exists and has status 'dikirim'
        const { data: po, error: poCheckError } = await supabase
            .from('purchase_order')
            .select('status')
            .eq('id', id_po)
            .single();

        if (poCheckError || !po) {
            return NextResponse.json(
                { error: 'Purchase Order tidak ditemukan' },
                { status: 404 }
            );
        }

        if (po.status !== 'dikirim') {
            return NextResponse.json(
                { error: 'Hanya PO dengan status "dikirim" yang dapat ditolak' },
                { status: 400 }
            );
        }

        // Update PO status to 'ditolak'
        const { error: updateError } = await supabase
            .from('purchase_order')
            .update({ status: 'ditolak' })
            .eq('id', id_po);

        if (updateError) {
            console.error('Error updating PO status to ditolak:', updateError);
            return NextResponse.json(
                { error: 'Gagal menolak PO', details: updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            message: 'Purchase Order berhasil ditolak',
            id_po 
        });

    } catch (error) {
        console.error('Error in PATCH /api/purchase-orders/reject:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
