import PengadaanClient from "./poclient"
import { createClient } from "@/utils/supabase/client";

interface KatalogItem {
    id: string;
    nama: string;
    harga: number;
    supplier: string;
    gambar: string;
    id_supplier: string;
}

type KatalogRpcResult = {
    id: string;
    harga_beli: number;
    nama_obat: string;
    nama_supplier: string;
    id_supplier: string;
}

export default async function PengadaanPage() {

    // Panggil fungsi RPC yang sudah dibuat
    const { data, error } = await createClient()
        .rpc('get_katalog_pengadaan');

    if (error || !data) {
        console.error("Error calling RPC function:", error);
        return <p>Gagal memuat data katalog. Silakan coba lagi.</p>;
    }

    // Data dari RPC sudah "flat", tinggal di-map untuk path gambar
    // Group by obat ID untuk menghindari duplikasi, ambil yang harga termurah
    const uniqueData = (data as KatalogRpcResult[]).reduce((acc, item) => {
        const existingItem = acc.find(i => i.nama_obat === item.nama_obat);
        if (!existingItem || item.harga_beli < existingItem.harga_beli) {
            const filtered = acc.filter(i => i.nama_obat !== item.nama_obat);
            return [...filtered, item];
        }
        return acc;
    }, [] as KatalogRpcResult[]);

    const katalog: KatalogItem[] = uniqueData.map(item => {
        const namaObat = item.nama_obat;
        // Remove dosis/ukuran dan kata seperti Inhaler
        const namaDasarObat = namaObat
            .replace(/\s+\d+.*mg/i, '')
            .replace(/\s+Inhaler/i, '')
            .trim();
        const namaFolder = `${namaDasarObat} obat`;

        // Logika untuk menentukan ekstensi file
        const ekstensi = namaDasarObat === 'Paracetamol' ? '.png' : '.jpg';

        return {
            id: item.id,
            nama: namaObat,
            harga: item.harga_beli,
            supplier: item.nama_supplier,
            id_supplier: item.id_supplier,
            gambar: `/obat/gambar_obat/${namaFolder}/Image_1${ekstensi}`,
        };
    });

    return <PengadaanClient initialKatalog={katalog} />;
}