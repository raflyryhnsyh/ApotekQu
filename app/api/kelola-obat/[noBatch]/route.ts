import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface RouteParams {
    params: {
        noBatch: string;
    };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const supabase = await createClient();
        const { noBatch } = await params;

        // Get detail_obat data with related obat and supplier information
        const { data, error } = await supabase
            .from('detail_obat')
            .select(`
                *,
                obat:id_obat (
                    id,
                    nama_obat,
                    komposisi,
                    kategori,
                    penyedia_produk (
                        id_supplier,
                        supplier:id_supplier (
                            id,
                            nama_supplier,
                            alamat
                        )
                    )
                )
            `)
            .eq('nomor_batch', noBatch)
            .single();

        if (error || !data) {
            return NextResponse.json(
                { error: 'Data obat tidak ditemukan' },
                { status: 404 }
            );
        }

        // Format the response to match the structure expected by the frontend
        const formattedData = {
            nomor_batch: data.nomor_batch,
            nama_obat: data.obat?.nama_obat || '',
            komposisi: data.obat?.komposisi || '',
            kategori: data.obat?.kategori || '',
            kadaluarsa: data.kadaluarsa,
            stok_sekarang: data.stok_sekarang,
            satuan: data.satuan,
            harga_jual: data.harga_jual || 0,
            supplier_id: data.obat?.penyedia_produk?.[0]?.supplier?.id || '',
            supplier_name: data.obat?.penyedia_produk?.[0]?.supplier?.nama_supplier || '',
            supplier_alamat: data.obat?.penyedia_produk?.[0]?.supplier?.alamat || ''
        };

        return NextResponse.json({
            success: true,
            data: formattedData
        });

    } catch (error) {
        console.error('Error fetching kelola obat data:', error);
        return NextResponse.json(
            { error: 'Gagal mengambil data obat' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const supabase = await createClient();
        const { noBatch } = await params;
        const body = await request.json();

        const {
            nama_obat,
            komposisi,
            kategori,
            kadaluarsa,
            stok_sekarang,
            satuan,
            harga_jual,
            supplier_id
        } = body;

        // Validation
        if (!nama_obat || !kadaluarsa || !satuan) {
            return NextResponse.json(
                { error: 'Nama obat, tanggal expired, dan satuan harus diisi' },
                { status: 400 }
            );
        }

        // Get current detail_obat data to get id_obat
        const { data: currentDetail, error: detailError } = await supabase
            .from('detail_obat')
            .select('id_obat')
            .eq('nomor_batch', noBatch)
            .single();

        if (detailError || !currentDetail) {
            return NextResponse.json(
                { error: 'Data obat tidak ditemukan' },
                { status: 404 }
            );
        }

        // Update obat data
        const { error: obatUpdateError } = await supabase
            .from('obat')
            .update({
                nama_obat,
                komposisi: komposisi || null,
                kategori: kategori || null
            })
            .eq('id', currentDetail.id_obat);

        if (obatUpdateError) {
            console.error('Error updating obat:', obatUpdateError);
            return NextResponse.json(
                { error: 'Gagal mengupdate data obat', details: obatUpdateError.message },
                { status: 500 }
            );
        }

        // Update detail_obat
        const { data: updatedDetail, error: updateError } = await supabase
            .from('detail_obat')
            .update({
                kadaluarsa,
                stok_sekarang: parseInt(stok_sekarang) || 0,
                satuan,
                harga_jual: parseFloat(harga_jual) || 0,
                diedit_pada: new Date().toISOString()
            })
            .eq('nomor_batch', noBatch)
            .select(`
                nomor_batch,
                kadaluarsa,
                stok_sekarang,
                satuan,
                harga_jual
            `)
            .single();

        if (updateError) {
            console.error('Error updating detail_obat:', updateError);
            return NextResponse.json(
                { error: 'Gagal mengupdate detail obat', details: updateError.message },
                { status: 500 }
            );
        }

        // Update supplier relationship if provided
        if (supplier_id) {
            // Delete existing relationship
            await supabase
                .from('penyedia_produk')
                .delete()
                .eq('id_obat', currentDetail.id_obat);

            // Create new relationship
            const { error: penyediaError } = await supabase
                .from('penyedia_produk')
                .insert({
                    id_obat: currentDetail.id_obat,
                    id_supplier: supplier_id
                });

            if (penyediaError) {
                console.error('Error updating penyedia_produk:', penyediaError);
                // Continue even if supplier relationship fails
            }
        }

        return NextResponse.json({
            success: true,
            data: updatedDetail,
            message: 'Data obat berhasil diupdate'
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const supabase = await createClient();
        const { noBatch } = await params;

        // Get detail_obat data to get id_obat
        const { data: detailData, error: detailError } = await supabase
            .from('detail_obat')
            .select('id_obat')
            .eq('nomor_batch', noBatch)
            .single();

        if (detailError || !detailData) {
            return NextResponse.json(
                { error: 'Data obat tidak ditemukan' },
                { status: 404 }
            );
        }

        // Check if this is the last detail for this obat
        const { data: otherDetails, error: countError } = await supabase
            .from('detail_obat')
            .select('nomor_batch')
            .eq('id_obat', detailData.id_obat)
            .neq('nomor_batch', noBatch);

        if (countError) {
            console.error('Error checking other details:', countError);
            return NextResponse.json(
                { error: 'Gagal memeriksa data terkait' },
                { status: 500 }
            );
        }

        // Delete detail_obat
        const { error: deleteDetailError } = await supabase
            .from('detail_obat')
            .delete()
            .eq('nomor_batch', noBatch);

        if (deleteDetailError) {
            console.error('Error deleting detail_obat:', deleteDetailError);
            return NextResponse.json(
                { error: 'Gagal menghapus detail obat', details: deleteDetailError.message },
                { status: 500 }
            );
        }

        // If this was the last detail, also delete obat and penyedia_produk
        if (!otherDetails || otherDetails.length === 0) {
            // Delete penyedia_produk relationships
            await supabase
                .from('penyedia_produk')
                .delete()
                .eq('id_obat', detailData.id_obat);

            // Delete obat
            const { error: deleteObatError } = await supabase
                .from('obat')
                .delete()
                .eq('id', detailData.id_obat);

            if (deleteObatError) {
                console.error('Error deleting obat:', deleteObatError);
                // Continue even if obat deletion fails
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Data obat berhasil dihapus'
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
