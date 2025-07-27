import PurchaseOrderClient from "./infoPOclient";
import { createClient } from "@/utils/supabase/client";
import { PurchaseOrder } from "./type";

type RpcResult = {
    id: string;
    dibuat_pada: string;
    total_bayar: number;
    status: string;
    nama_supplier: string | null;
    nama_pengguna: string | null;
}

const ITEMS_PER_PAGE = 8; // Jumlah item per halaman

// Hapus 'searchParams' dari parameter fungsi
export default async function InformasiPOPage({ searchParams }: { searchParams?: { page?: string }; }) {
    const supabase = createClient();
    const currentPage = Number(searchParams?.page) || 1;

    // Langsung panggil RPC untuk mengambil semua data
    const { data: allOrders, error } = await supabase
        .rpc('get_all_purchase_orders');

    if (error || !allOrders) {
        console.error("Error calling RPC:", error);
        return <p className="p-8">Terjadi kesalahan saat memuat data.</p>;
    }

    allOrders.sort((a: RpcResult, b: RpcResult) => {
        // Aturan 1: Status 'diterima' selalu di bawah
        if (a.status === 'diterima' && b.status !== 'diterima') return 1;
        if (a.status !== 'diterima' && b.status === 'diterima') return -1;

        // Aturan 2: Urutkan berdasarkan tanggal terbaru
        return new Date(b.dibuat_pada).getTime() - new Date(a.dibuat_pada).getTime();
    });

    // Lakukan pagination di kode setelah semua data didapat
    const totalPages = Math.ceil(allOrders.length / ITEMS_PER_PAGE);
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE;
    const paginatedOrders = allOrders.slice(from, to);

    // Tidak ada lagi logika pagination, langsung map semua data
    const orders: PurchaseOrder[] = paginatedOrders.map((order: RpcResult) => ({
        id: order.id,
        dibuat_pada: order.dibuat_pada,
        total_bayar: order.total_bayar,
        status: order.status,
        supplier: order.nama_supplier ? [{ nama_supplier: order.nama_supplier }] : null,
        pengguna: order.nama_pengguna ? [{ full_name: order.nama_pengguna }] : null,
    }));

    // Hanya kirim 'orders' sebagai prop
    return (
        <PurchaseOrderClient orders={orders} totalPages={totalPages} currentPage={currentPage} />
    );
}