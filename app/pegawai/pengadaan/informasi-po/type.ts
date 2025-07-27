export type PurchaseOrder = {
    id: string;
    dibuat_pada: string;
    total_bayar: number;
    status: string;
    supplier: { nama_supplier: string }[]; // Ini adalah ARRAY
    pengguna: { full_name: string }[]; // Ini adalah ARRAY
};