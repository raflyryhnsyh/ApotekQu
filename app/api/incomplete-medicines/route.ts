import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET - Fetch incomplete medicines from barang_diterima that don't have detail_obat yet
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get all purchase_order with status 'diterima'
        const { data: purchaseOrders, error: poError } = await supabase
            .from('purchase_order')
            .select(`
                id,
                id_supplier,
                supplier:id_supplier (
                    nama_supplier
                ),
                barang_diterima (
                    id,
                    tiba_pada
                )
            `)
            .eq('status', 'diterima');

        if (poError) {
            console.error('Error fetching purchase orders:', poError);
            return NextResponse.json(
                { error: 'Gagal mengambil data purchase order' },
                { status: 500 }
            );
        }

        if (!purchaseOrders || purchaseOrders.length === 0) {
            return NextResponse.json({
                success: true,
                data: []
            });
        }

        const incompleteItems = [];

        // For each PO, get detail_purchase_order and check if detail_obat exists
        for (const po of purchaseOrders) {
            const { data: poDetails, error: detailError } = await supabase
                .from('detail_purchase_order')
                .select(`
                    id_pp,
                    jumlah,
                    harga,
                    penyedia_produk:id_pp (
                        id_obat,
                        obat:id_obat (
                            nama_obat,
                            kategori,
                            komposisi
                        )
                    )
                `)
                .eq('id_po', po.id);

            if (detailError) {
                continue;
            }
            if (!poDetails) {
                continue;
            }
            
            // For each item in PO, check if it has detail_obat
            for (const detail of poDetails) {
                const penyediaProduk = detail.penyedia_produk as any;
                const id_obat = penyediaProduk?.id_obat;
                if (!id_obat) continue;

                const supplier = po.supplier as any;

                // Check if this obat from this PO already has detail_obat
                // We check by looking for detail_barang_diterima with this PO's barang_diterima
                const barangDiterimaId = po.barang_diterima?.[0]?.id;
                if (!barangDiterimaId) {
                    // No barang_diterima yet for this PO
                    incompleteItems.push({
                        id_barang_diterima: null,
                        id_detail_barang_diterima: null,
                        id_pp: detail.id_pp,
                        id_obat: id_obat,
                        nama_obat: penyediaProduk?.obat?.nama_obat || 'N/A',
                        kategori: penyediaProduk?.obat?.kategori || '',
                        komposisi: penyediaProduk?.obat?.komposisi || '',
                        harga_satuan: detail.harga || 0,
                        jumlah_diterima: detail.jumlah,
                        nomor_batch: null,
                        tiba_pada: new Date().toISOString().split('T')[0],
                        id_supplier: po.id_supplier,
                        nama_supplier: supplier?.nama_supplier || 'N/A'
                    });
                    continue;
                }

                // Check detail_barang_diterima - if ANY exists, this item is complete
                const { data: detailBarangList, error: detailBarangError } = await supabase
                    .from('detail_barang_diterima')
                    .select('id, nomor_batch, jumlah_diterima')
                    .eq('id_diterima', barangDiterimaId)
                    .eq('id_obat', id_obat)
                    .limit(1);

                const detailBarang = detailBarangList && detailBarangList.length > 0 ? detailBarangList[0] : null;

                if (!detailBarang) {
                    // No detail_barang_diterima yet
                    incompleteItems.push({
                        id_barang_diterima: barangDiterimaId,
                        id_detail_barang_diterima: null,
                        id_pp: detail.id_pp,
                        id_obat: id_obat,
                        nama_obat: penyediaProduk?.obat?.nama_obat || 'N/A',
                        kategori: penyediaProduk?.obat?.kategori || '',
                        komposisi: penyediaProduk?.obat?.komposisi || '',
                        harga_satuan: detail.harga || 0,
                        jumlah_diterima: detail.jumlah,
                        nomor_batch: null,
                        tiba_pada: po.barang_diterima[0].tiba_pada,
                        id_supplier: po.id_supplier,
                        nama_supplier: supplier?.nama_supplier || 'N/A'
                    });
                } else if (!detailBarang.nomor_batch) {
                    // Has detail_barang_diterima but no batch number
                    incompleteItems.push({
                        id_barang_diterima: barangDiterimaId,
                        id_detail_barang_diterima: detailBarang.id,
                        id_pp: detail.id_pp,
                        id_obat: id_obat,
                        nama_obat: penyediaProduk?.obat?.nama_obat || 'N/A',
                        kategori: penyediaProduk?.obat?.kategori || '',
                        komposisi: penyediaProduk?.obat?.komposisi || '',
                        harga_satuan: detail.harga || 0,
                        jumlah_diterima: detailBarang.jumlah_diterima,
                        nomor_batch: null,
                        tiba_pada: po.barang_diterima[0].tiba_pada,
                        id_supplier: po.id_supplier,
                        nama_supplier: supplier?.nama_supplier || 'N/A'
                    });
                } else {
                    // Has batch number, check if detail_obat exists
                    const { data: detailObat } = await supabase
                        .from('detail_obat')
                        .select('nomor_batch')
                        .eq('nomor_batch', detailBarang.nomor_batch)
                        .maybeSingle();

                    if (!detailObat) {
                        // No detail_obat yet
                        incompleteItems.push({
                            id_barang_diterima: barangDiterimaId,
                            id_detail_barang_diterima: detailBarang.id,
                            id_pp: detail.id_pp,
                            id_obat: id_obat,
                            nama_obat: penyediaProduk?.obat?.nama_obat || 'N/A',
                            jumlah_diterima: detailBarang.jumlah_diterima,
                            nomor_batch: detailBarang.nomor_batch,
                            tiba_pada: po.barang_diterima[0].tiba_pada,
                            nama_supplier: supplier?.nama_supplier || 'N/A'
                        });
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            data: incompleteItems,
            count: incompleteItems.length
        });

    } catch (error) {
        console.error('Error in GET /api/incomplete-medicines:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
