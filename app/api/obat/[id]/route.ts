import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { ObatResponse } from '@/lib/api/obat-management';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'ID obat harus disediakan' },
                { status: 400 }
            );
        }

        // Fetch obat data
        const { data: obatData, error: obatError } = await supabase
            .from('obat')
            .select(`
                id,
                nama_obat,
                komposisi,
                kategori,
                satuan,
                harga_jual
            `)
            .eq('id', id)
            .single();

        if (obatError) {
            console.error('Error fetching obat:', obatError);
            if (obatError.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Obat tidak ditemukan' },
                    { status: 404 }
                );
            }
            return NextResponse.json(
                { error: 'Gagal mengambil data obat', details: obatError.message },
                { status: 500 }
            );
        }

        // Fetch detail_obat for this obat
        const { data: detailObatData, error: detailError } = await supabase
            .from('detail_obat')
            .select(`
                id,
                batch_number,
                tanggal_kadaluarsa,
                stok,
                harga_beli,
                supplier_id,
                tanggal_masuk,
                supplier:supplier_id (
                    id,
                    nama_supplier
                )
            `)
            .eq('obat_id', id)
            .order('tanggal_kadaluarsa', { ascending: true });

        if (detailError) {
            console.error('Error fetching detail obat:', detailError);
            return NextResponse.json(
                { error: 'Gagal mengambil detail obat', details: detailError.message },
                { status: 500 }
            );
        }

        // Format detail_obat
        const formattedDetailObat = (detailObatData || []).map((detail: Record<string, unknown>) => ({
            id: detail.id,
            batch_number: detail.batch_number,
            tanggal_kadaluarsa: new Date(detail.tanggal_kadaluarsa as string).toLocaleDateString('id-ID'),
            stok: detail.stok,
            harga_beli: detail.harga_beli,
            supplier_id: detail.supplier_id,
            supplier_nama: (detail.supplier as Record<string, unknown>)?.nama_supplier || '',
            tanggal_masuk: new Date(detail.tanggal_masuk as string).toLocaleDateString('id-ID')
        }));

        // Format response
        const formattedObat = {
            id: obatData.id,
            nama_obat: obatData.nama_obat,
            komposisi: obatData.komposisi,
            kategori: obatData.kategori,
            detail_obat: formattedDetailObat
        };

        return NextResponse.json({
            success: true,
            data: formattedObat
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;
        const body = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: 'ID obat harus disediakan' },
                { status: 400 }
            );
        }

        const {
            nama_obat,
            komposisi,
            kategori,
            satuan,
            harga_jual,
            nomor_batch,
            kadaluarsa,
            stok_sekarang
        } = body;

        // Validation
        if (!nama_obat || !kategori) {
            return NextResponse.json(
                { error: 'Nama obat dan kategori harus diisi' },
                { status: 400 }
            );
        }

        // Update obat
        const { error: obatError } = await supabase
            .from('obat')
            .update({
                nama_obat,
                komposisi,
                kategori
            })
            .eq('id', id);

        if (obatError) {
            console.error('Error updating obat:', obatError);
            return NextResponse.json(
                { error: 'Gagal mengupdate obat', details: obatError.message },
                { status: 500 }
            );
        }

        // Update detail_obat if provided
        if (satuan || harga_jual || nomor_batch || kadaluarsa || stok_sekarang !== undefined) {
            const updateData: Record<string, unknown> = {};
            if (satuan) updateData.satuan = satuan;
            if (harga_jual) updateData.harga_jual = harga_jual;
            if (nomor_batch) updateData.nomor_batch = nomor_batch;
            if (kadaluarsa) updateData.kadaluarsa = kadaluarsa;
            if (stok_sekarang !== undefined) updateData.stok_sekarang = stok_sekarang;

            const { error: detailError } = await supabase
                .from('detail_obat')
                .update(updateData)
                .eq('id_obat', id);

            if (detailError) {
                console.error('Error updating detail_obat:', detailError);
                return NextResponse.json(
                    { error: 'Gagal mengupdate detail obat', details: detailError.message },
                    { status: 500 }
                );
            }
        }

        // Fetch updated data with detail_obat
        const { data: updatedObat, error: fetchError } = await supabase
            .from('obat')
            .select(`
                id,
                nama_obat,
                komposisi,
                kategori
            `)
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Error fetching updated obat:', fetchError);
            return NextResponse.json(
                { error: 'Gagal mengambil data obat yang diupdate' },
                { status: 500 }
            );
        }

        // Fetch detail_obat
        const { data: detailObatData, error: detailFetchError } = await supabase
            .from('detail_obat')
            .select(`
                nomor_batch,
                kadaluarsa,
                stok_sekarang,
                satuan,
                harga_jual,
                id_obat,
                dibuat_pada,
                diedit_pada
            `)
            .eq('id_obat', id);

        if (detailFetchError) {
            console.error('Error fetching detail_obat:', detailFetchError);
        }

        // Format response
        const formattedObat: ObatResponse = {
            id: updatedObat.id,
            nama_obat: updatedObat.nama_obat,
            komposisi: updatedObat.komposisi,
            kategori: updatedObat.kategori,
            satuan: detailObatData?.[0]?.satuan,
            harga_jual: detailObatData?.[0]?.harga_jual,
            detail_obat: detailObatData || []
        };

        return NextResponse.json({
            success: true,
            data: formattedObat,
            message: 'Obat berhasil diupdate'
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'ID obat harus disediakan' },
                { status: 400 }
            );
        }

        // Check if there are any detail_obat records
        const { data: detailObat, error: detailCheckError } = await supabase
            .from('detail_obat')
            .select('nomor_batch')
            .eq('id_obat', id);

        if (detailCheckError) {
            console.error('Error checking detail obat:', detailCheckError);
            return NextResponse.json(
                { error: 'Gagal mengecek detail obat', details: detailCheckError.message },
                { status: 500 }
            );
        }

        // Delete detail_obat records first (cascade delete)
        if (detailObat && detailObat.length > 0) {
            const { error: deleteDetailError } = await supabase
                .from('detail_obat')
                .delete()
                .eq('id_obat', id);

            if (deleteDetailError) {
                console.error('Error deleting detail_obat:', deleteDetailError);
                return NextResponse.json(
                    { error: 'Gagal menghapus detail obat', details: deleteDetailError.message },
                    { status: 500 }
                );
            }
        }

        // Delete obat
        const { error: deleteError } = await supabase
            .from('obat')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Error deleting obat:', deleteError);
            return NextResponse.json(
                { error: 'Gagal menghapus obat', details: deleteError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Obat dan semua detail stok berhasil dihapus'
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
