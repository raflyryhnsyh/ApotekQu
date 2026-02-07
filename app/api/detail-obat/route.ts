import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET - Fetch all detail_obat with related data
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // First, get all detail_obat with obat info
        const { data: detailData, error: detailError } = await supabase
            .from('detail_obat')
            .select(`
                nomor_batch,
                id_obat,
                kadaluarsa,
                stok_sekarang,
                satuan,
                harga_jual,
                obat:id_obat (
                    nama_obat
                )
            `)
            .order('kadaluarsa', { ascending: true });

        if (detailError) {
            console.error('Error fetching detail_obat:', detailError);
            return NextResponse.json(
                { error: 'Gagal mengambil data obat' },
                { status: 500 }
            );
        }

        // For each detail, get the supplier info from detail_barang_diterima
        const formattedData = await Promise.all(detailData.map(async (item: any) => {
            let supplierName = 'N/A';
            
            try {
                // Get supplier from detail_barang_diterima -> barang_diterima -> purchase_order -> supplier
                const { data: detailBarang, error: detailError } = await supabase
                    .from('detail_barang_diterima')
                    .select('id_diterima')
                    .eq('nomor_batch', item.nomor_batch)
                    .single();

                if (!detailError && detailBarang) {
                    const { data: barangDiterima } = await supabase
                        .from('barang_diterima')
                        .select(`
                            id_po,
                            purchase_order:id_po (
                                id_supplier,
                                supplier:id_supplier (
                                    nama_supplier
                                )
                            )
                        `)
                        .eq('id', detailBarang.id_diterima)
                        .single();

                    // Handle the nested structure
                    const purchaseOrder = barangDiterima?.purchase_order as any;
                    if (purchaseOrder?.supplier?.nama_supplier) {
                        supplierName = purchaseOrder.supplier.nama_supplier;
                    }
                }
            } catch (error) {
                console.error(`Error fetching supplier for batch ${item.nomor_batch}:`, error);
            }

            return {
                nomor_batch: item.nomor_batch,
                id_obat: item.id_obat,
                nama_obat: item.obat?.nama_obat || 'N/A',
                stok_sekarang: item.stok_sekarang,
                satuan: item.satuan,
                harga_jual: item.harga_jual,
                kadaluarsa: item.kadaluarsa,
                nama_supplier: supplierName
            };
        }));

        return NextResponse.json({
            success: true,
            data: formattedData
        });

    } catch (error) {
        console.error('Error in GET /api/detail-obat:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const {
            nomor_batch,
            id_obat,
            kadaluarsa,
            stok_sekarang,
            satuan,
            harga_jual
        } = body;

        // Validation
        if (!nomor_batch || !id_obat || !kadaluarsa || !satuan || !harga_jual || stok_sekarang === undefined) {
            return NextResponse.json(
                { error: 'Semua field harus diisi' },
                { status: 400 }
            );
        }

        // Check if nomor_batch already exists
        const { data: existingBatch, error: checkError } = await supabase
            .from('detail_obat')
            .select('nomor_batch, stok_sekarang')
            .eq('nomor_batch', nomor_batch)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking existing batch:', checkError);
            return NextResponse.json(
                { error: 'Gagal memeriksa nomor batch', details: checkError.message },
                { status: 500 }
            );
        }

        if (existingBatch) {
            // Update existing batch - add to stock
            const newStok = existingBatch.stok_sekarang + stok_sekarang;
            
            const { error: updateError } = await supabase
                .from('detail_obat')
                .update({
                    stok_sekarang: newStok,
                    diedit_pada: new Date().toISOString().split('T')[0]
                })
                .eq('nomor_batch', nomor_batch);

            if (updateError) {
                console.error('Error updating detail_obat:', updateError);
                return NextResponse.json(
                    { error: 'Gagal mengupdate stok obat', details: updateError.message },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: 'Stok obat berhasil ditambahkan',
                data: {
                    nomor_batch,
                    stok_lama: existingBatch.stok_sekarang,
                    stok_ditambah: stok_sekarang,
                    stok_baru: newStok
                }
            });
        } else {
            // Insert new batch
            const { data, error: insertError } = await supabase
                .from('detail_obat')
                .insert({
                    nomor_batch,
                    id_obat,
                    kadaluarsa,
                    stok_sekarang,
                    satuan,
                    harga_jual,
                    dibuat_pada: new Date().toISOString().split('T')[0],
                    diedit_pada: new Date().toISOString().split('T')[0]
                })
                .select()
                .single();

            if (insertError) {
                console.error('Error creating detail_obat:', insertError);
                return NextResponse.json(
                    { error: 'Gagal membuat detail obat', details: insertError.message },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: 'Detail obat berhasil dibuat',
                data
            });
        }

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
