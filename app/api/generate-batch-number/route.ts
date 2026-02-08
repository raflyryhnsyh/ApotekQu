import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { id_obat } = await request.json();

        if (!id_obat) {
            return NextResponse.json(
                { error: 'ID obat diperlukan' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Ambil nama obat untuk mendapatkan kode obat
        const { data: obatData, error: obatError } = await supabase
            .from('obat')
            .select('nama_obat')
            .eq('id', id_obat)
            .single();

        if (obatError || !obatData) {
            console.error('Error fetching obat:', obatError);
            return NextResponse.json(
                { error: 'Obat tidak ditemukan' },
                { status: 404 }
            );
        }

        // Generate kode obat dari 4 huruf pertama nama obat (uppercase, tanpa spasi)
        const kodeObat = obatData.nama_obat
            .replace(/\s+/g, '')  // Hapus spasi
            .substring(0, 4)       // Ambil 4 karakter pertama
            .toUpperCase();        // Uppercase

        // Format: KODE-YYYY-XXX (contoh: AMOX-2024-001)
        const year = new Date().getFullYear();
        const prefix = `${kodeObat}-${year}`;
        
        // Cari nomor batch terakhir dengan kode obat dan tahun yang sama
        const { data: existingBatches, error: fetchError } = await supabase
            .from('detail_obat')
            .select('nomor_batch')
            .eq('id_obat', id_obat)
            .like('nomor_batch', `${prefix}%`)
            .order('nomor_batch', { ascending: false })
            .limit(1);

        if (fetchError) {
            console.error('Error fetching existing batches:', fetchError);
            return NextResponse.json(
                { error: 'Gagal generate nomor batch' },
                { status: 500 }
            );
        }

        let sequence = 1;
        
        if (existingBatches && existingBatches.length > 0) {
            // Extract sequence dari batch terakhir (format: KODE-YYYY-XXX)
            const lastBatch = existingBatches[0].nomor_batch;
            const parts = lastBatch.split('-');
            const lastSequence = parseInt(parts[2]) || 0;
            sequence = lastSequence + 1;
        }

        // Format sequence dengan 3 digit (001, 002, dst)
        const sequenceStr = sequence.toString().padStart(3, '0');
        const batchNumber = `${prefix}-${sequenceStr}`;

        return NextResponse.json({ batch_number: batchNumber });

    } catch (error) {
        console.error('Error generating batch number:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
