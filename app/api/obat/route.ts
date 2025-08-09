import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export interface ObatResponse {
    id: string;
    nama_obat: string;
    kategori: string;
    komposisi?: string;
    satuan?: string;
    harga_jual?: number;
    detail_obat: DetailObatResponse[];
}

export interface DetailObatResponse {
    nomor_batch: string;
    kadaluarsa: string;
    stok_sekarang: number;
    satuan: string;
    harga_jual: number;
    id_obat: string;
    dibuat_pada: string;
    diedit_pada: string;
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const searchParams = request.nextUrl.searchParams;

        // Optional filters
        const kategori = searchParams.get('kategori');
        const supplier_id = searchParams.get('supplier_id');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        // Build base query for obat - only use existing columns
        let obatQuery = supabase
            .from('obat')
            .select(`
                id,
                nama_obat,
                komposisi,
                kategori
            `)
            .order('nama_obat', { ascending: true });

        // Apply filters
        if (kategori) {
            obatQuery = obatQuery.eq('kategori', kategori);
        }

        if (supplier_id) {
            obatQuery = obatQuery.eq('supplier_id', supplier_id);
        }

        if (search) {
            obatQuery = obatQuery.ilike('nama_obat', `%${search}%`);
        }

        // Apply pagination
        obatQuery = obatQuery.range(offset, offset + limit - 1);

        const { data: obatData, error: obatError } = await obatQuery;

        if (obatError) {
            console.error('Error fetching obat:', obatError);
            return NextResponse.json(
                { error: 'Gagal mengambil data obat', details: obatError.message },
                { status: 500 }
            );
        }

        if (!obatData || obatData.length === 0) {
            return NextResponse.json({
                success: true,
                data: [],
                total: 0,
                page,
                limit,
                totalPages: 0
            });
        }

        // Get obat IDs for fetching detail_obat
        const obatIds = obatData.map(obat => obat.id);

        // Fetch detail_obat - use correct column names
        const { data: detailObatData, error: detailError } = await supabase
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
            .in('id_obat', obatIds)
            .order('kadaluarsa', { ascending: true });

        if (detailError) {
            console.error('Error fetching detail obat:', detailError);
            return NextResponse.json(
                { error: 'Gagal mengambil detail obat', details: detailError.message },
                { status: 500 }
            );
        }

        // Group detail_obat by id_obat
        const detailByObatId = (detailObatData || []).reduce((acc: Record<string, unknown[]>, detail: Record<string, unknown>) => {
            const id_obat = detail.id_obat as string;
            if (!acc[id_obat]) {
                acc[id_obat] = [];
            }
            acc[id_obat].push({
                nomor_batch: detail.nomor_batch,
                kadaluarsa: detail.kadaluarsa ? new Date(detail.kadaluarsa as string).toLocaleDateString('id-ID') : '',
                stok_sekarang: detail.stok_sekarang,
                satuan: detail.satuan,
                harga_jual: detail.harga_jual,
                id_obat: detail.id_obat,
                dibuat_pada: detail.dibuat_pada ? new Date(detail.dibuat_pada as string).toLocaleDateString('id-ID') : '',
                diedit_pada: detail.diedit_pada ? new Date(detail.diedit_pada as string).toLocaleDateString('id-ID') : ''
            });
            return acc;
        }, {});

        // Format response data
        const formattedData = obatData.map((obat: Record<string, unknown>) => {
            const detailObat = detailByObatId[obat.id as string] || [];
            const firstDetail = detailObat[0] as Record<string, unknown>; // Ambil detail pertama untuk satuan dan harga

            return {
                id: obat.id,
                nama_obat: obat.nama_obat,
                komposisi: obat.komposisi,
                kategori: obat.kategori,
                satuan: firstDetail?.satuan || '',
                harga_jual: firstDetail?.harga_jual || 0,
                detail_obat: detailObat
            };
        });

        // Get total count for pagination
        const { count: totalCount } = await supabase
            .from('obat')
            .select('*', { count: 'exact', head: true });

        const totalPages = Math.ceil((totalCount || 0) / limit);

        return NextResponse.json({
            success: true,
            data: formattedData,
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
            satuan,
            harga_jual,
            nomor_batch = 'DEFAULT-001',
            kadaluarsa = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
            stok_sekarang = 0
        } = body;

        // Validation
        if (!nama_obat || !kategori || !satuan || !harga_jual) {
            return NextResponse.json(
                { error: 'Nama obat, kategori, satuan, dan harga jual harus diisi' },
                { status: 400 }
            );
        }

        // Insert obat
        const { data: obatData, error: obatError } = await supabase
            .from('obat')
            .insert({
                nama_obat,
                komposisi,
                kategori
            })
            .select(`
                id,
                nama_obat,
                komposisi,
                kategori
            `)
            .single();

        if (obatError) {
            console.error('Error creating obat:', obatError);
            return NextResponse.json(
                { error: 'Gagal membuat obat baru', details: obatError.message },
                { status: 500 }
            );
        }

        // Insert detail_obat
        const { data: detailObatData, error: detailError } = await supabase
            .from('detail_obat')
            .insert({
                id_obat: obatData.id,
                nomor_batch,
                kadaluarsa,
                stok_sekarang,
                satuan,
                harga_jual,
                dibuat_pada: new Date().toISOString(),
                diedit_pada: new Date().toISOString()
            })
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
            .single();

        if (detailError) {
            // Rollback obat creation if detail_obat fails
            await supabase.from('obat').delete().eq('id', obatData.id);
            console.error('Error creating detail_obat:', detailError);
            return NextResponse.json(
                { error: 'Gagal membuat detail obat', details: detailError.message },
                { status: 500 }
            );
        }

        // Format response
        const formattedObat: ObatResponse = {
            id: obatData.id,
            nama_obat: obatData.nama_obat,
            komposisi: obatData.komposisi,
            kategori: obatData.kategori,
            satuan: detailObatData.satuan,
            harga_jual: detailObatData.harga_jual,
            detail_obat: [detailObatData]
        };

        return NextResponse.json({
            success: true,
            data: formattedObat,
            message: 'Obat berhasil dibuat'
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
