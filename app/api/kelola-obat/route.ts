import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export interface KelolaObatResponse {
    noBatch: string;
    nama: string;
    totalStok: number;
    satuan: string;
    tanggalExpired: string;
    supplier: string;
    harga_jual?: number;
    kategori?: string;
    komposisi?: string;
    id_obat?: string;
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const searchParams = request.nextUrl.searchParams;

        // Optional filters
        const search = searchParams.get('search');
        const kategori = searchParams.get('kategori');
        const supplier_id = searchParams.get('supplier_id');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;

        // Query dengan JOIN untuk mendapatkan data dari semua tabel yang diperlukan
        let query = supabase
            .from('detail_obat')
            .select(`
                nomor_batch,
                kadaluarsa,
                stok_sekarang,
                satuan,
                harga_jual,
                id_obat,
                obat:id_obat (
                    id,
                    nama_obat,
                    komposisi,
                    kategori,
                    penyedia_produk (
                        id_supplier,
                        supplier (
                            id,
                            nama_supplier
                        )
                    )
                )
            `)
            .order('kadaluarsa', { ascending: true });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data: detailObatData, error } = await query;

        if (error) {
            console.error('Error fetching kelola obat data:', error);
            return NextResponse.json(
                { error: 'Gagal mengambil data kelola obat', details: error.message },
                { status: 500 }
            );
        }

        if (!detailObatData || detailObatData.length === 0) {
            return NextResponse.json({
                success: true,
                data: [],
                total: 0,
                page,
                limit,
                totalPages: 0
            });
        }

        // Format response data
        const formattedData: KelolaObatResponse[] = detailObatData
            .filter(detail => detail.obat) // Pastikan ada data obat
            .map((detail: any) => {
                const obat = detail.obat;
                // Ambil supplier pertama jika ada multiple supplier
                const penyediaFirst = obat.penyedia_produk?.[0];
                const supplierName = penyediaFirst?.supplier?.nama_supplier || 'Tidak ada supplier';

                return {
                    noBatch: detail.nomor_batch || '',
                    nama: obat.nama_obat || '',
                    totalStok: detail.stok_sekarang || 0,
                    satuan: detail.satuan || '',
                    tanggalExpired: detail.kadaluarsa
                        ? new Date(detail.kadaluarsa).toISOString().split('T')[0]
                        : '',
                    supplier: supplierName,
                    harga_jual: detail.harga_jual || 0,
                    kategori: obat.kategori || '',
                    komposisi: obat.komposisi || '',
                    id_obat: obat.id || ''
                };
            });

        // Apply additional filters on formatted data
        let filteredData = formattedData;

        if (search) {
            filteredData = filteredData.filter(item =>
                item.nama.toLowerCase().includes(search.toLowerCase()) ||
                item.noBatch.toLowerCase().includes(search.toLowerCase()) ||
                item.supplier.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (kategori) {
            filteredData = filteredData.filter(item =>
                item.kategori === kategori
            );
        }

        // Get total count for pagination
        const { count: totalCount } = await supabase
            .from('detail_obat')
            .select('*', { count: 'exact', head: true });

        const totalPages = Math.ceil((totalCount || 0) / limit);

        return NextResponse.json({
            success: true,
            data: filteredData,
            total: totalCount || 0,
            page,
            limit,
            totalPages
        });

    } catch (error) {
        console.error('API error:', error);
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
            nama_obat,
            komposisi,
            kategori,
            nomor_batch,
            kadaluarsa,
            stok_sekarang,
            satuan,
            harga_jual,
            supplier_id
        } = body;

        // Validation
        if (!nama_obat || !nomor_batch || !kadaluarsa || !satuan || !supplier_id) {
            return NextResponse.json(
                { error: 'Nama obat, nomor batch, tanggal expired, satuan, dan supplier harus diisi' },
                { status: 400 }
            );
        }

        // Cek apakah nomor batch sudah ada
        const { data: existingBatch } = await supabase
            .from('detail_obat')
            .select('nomor_batch')
            .eq('nomor_batch', nomor_batch)
            .single();

        if (existingBatch) {
            return NextResponse.json(
                { error: 'Nomor batch sudah ada' },
                { status: 400 }
            );
        }

        // Cek atau buat obat baru
        let obatId: string;
        const { data: existingObat } = await supabase
            .from('obat')
            .select('id')
            .eq('nama_obat', nama_obat)
            .single();

        if (existingObat) {
            obatId = existingObat.id;
        } else {
            // Buat obat baru
            const { data: newObat, error: obatError } = await supabase
                .from('obat')
                .insert({
                    nama_obat,
                    komposisi: komposisi || null,
                    kategori: kategori || null
                })
                .select('id')
                .single();

            if (obatError) {
                console.error('Error creating obat:', obatError);
                return NextResponse.json(
                    { error: 'Gagal membuat obat baru', details: obatError.message },
                    { status: 500 }
                );
            }

            obatId = newObat.id;

            // Buat relasi dengan supplier
            const { error: penyediaError } = await supabase
                .from('penyedia_produk')
                .insert({
                    id_obat: obatId,
                    id_supplier: supplier_id
                });

            if (penyediaError) {
                console.error('Error creating penyedia_produk:', penyediaError);
                // Tidak perlu rollback, karena obat bisa ada tanpa supplier
            }
        }

        // Insert detail_obat
        const { data: detailObatData, error: detailError } = await supabase
            .from('detail_obat')
            .insert({
                id_obat: obatId,
                nomor_batch,
                kadaluarsa,
                stok_sekarang: parseInt(stok_sekarang) || 0,
                satuan,
                harga_jual: parseFloat(harga_jual) || 0,
                dibuat_pada: new Date().toISOString(),
                diedit_pada: new Date().toISOString()
            })
            .select(`
                nomor_batch,
                kadaluarsa,
                stok_sekarang,
                satuan,
                harga_jual
            `)
            .single();

        if (detailError) {
            console.error('Error creating detail_obat:', detailError);
            return NextResponse.json(
                { error: 'Gagal membuat detail obat', details: detailError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: detailObatData,
            message: 'Data obat berhasil ditambahkan'
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
