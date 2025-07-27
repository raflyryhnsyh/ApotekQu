"use client";

import { useState, FormEvent, useEffect } from "react";
import { useCartStore } from "@/lib/store/usecartstore";
import ObatCard from "@/components/pengadaan-katalog/obatcard";
import { CartItemCard } from "@/components/pengadaan-cart/cartitem";
import { ConfirmationDialog } from "@/components/ui/confirmationdialog";
import { SuccessToast } from "@/components/ui/successalert";
import { createClient } from "@/utils/supabase/client";


// Definisikan tipe untuk data yang diterima dari Server Component
interface Product {
    id: string;
    nama: string;
    harga: number;
    supplier: string;
    gambar: string;
    id_supplier: string; // Pastikan properti ini ada
}

interface PengadaanClientProps {
    initialKatalog: Product[];
}

export default function PengadaanClient({ initialKatalog }: PengadaanClientProps) {
    // STATE MANAGEMENT
    const { cart, addToCart, increment, decrement, clearCart } = useCartStore();
    const [namaApotik, setNamaApotik] = useState("");
    const [alamatApotik, setAlamatApotik] = useState("");
    const [errors, setErrors] = useState<{ namaApotik?: boolean; alamatApotik?: boolean; cart?: boolean }>({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // EFEK
    useEffect(() => {
        if (cart.length > 0 && errors.cart) {
            setErrors(prevErrors => ({ ...prevErrors, cart: false }));
        }
    }, [cart.length, errors.cart]);

    // LOGIC
    const totalHarga = cart.reduce((total, item) => total + item.harga * item.quantity, 0);

    const handleConfirmSubmit = async () => {
        setIsSubmitting(true);
        setIsDialogOpen(false);

        const groupedBySupplier = cart.reduce((acc, item) => {
            const supplierId = item.id_supplier;
            if (!acc[supplierId]) acc[supplierId] = [];
            acc[supplierId].push(item);
            return acc;
        }, {} as Record<string, typeof cart>);

        const supabase = createClient();

        try {
            await Promise.all(
                Object.values(groupedBySupplier).map(async (items) => {
                    const supplierId = items[0].id_supplier;
                    const totalBayarGroup = items.reduce((total, item) => total + item.harga * item.quantity, 0);

                    const { data: poData, error: poError } = await supabase
                        .from('purchase_order')
                        .insert({ id_supplier: supplierId, total_bayar: totalBayarGroup, status: 'diproses', dibuat_pada: new Date().toISOString() })
                        .select('id').single();

                    if (poError) throw poError;

                    const purchaseOrderId = poData.id;
                    const detailItems = items.map(item => ({
                        id_po: purchaseOrderId,
                        id_pp: item.id,
                        jumlah: item.quantity,
                        harga: item.harga,
                    }));

                    const { error: detailError } = await supabase.from('detail_purchase_order').insert(detailItems);
                    if (detailError) throw detailError;
                })
            );

            clearCart();
            setNamaApotik("");
            setAlamatApotik("");
            setShowSuccessToast(true);

        } catch (error) {
            console.error("Gagal menyimpan Purchase Order:", error);
            alert("Terjadi kesalahan saat menyimpan pesanan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        const newErrors: { namaApotik?: boolean; alamatApotik?: boolean; cart?: boolean } = {};
        if (!namaApotik.trim()) newErrors.namaApotik = true;
        if (!alamatApotik.trim()) newErrors.alamatApotik = true;
        if (cart.length === 0) newErrors.cart = true;

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        setIsDialogOpen(true);
    };

    return (
        <>
            <div className="flex items-start gap-8">
                {/* Kolom Kiri: Katalog */}
                <div className="w-3/4 flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <h1 className="text-3xl font-bold text-gray-800">Pengadaan Obat</h1>
                        <h2 className="text-2xl font-semibold text-gray-700">Katalog Obat</h2>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                        {initialKatalog.map((item) => {
                            const itemInCart = cart.find((c) => c.id === item.id);
                            const quantity = itemInCart ? itemInCart.quantity : 0;
                            return (
                                <ObatCard
                                    key={item.id}
                                    nama={item.nama}
                                    harga={item.harga}
                                    supplier={item.supplier}
                                    gambar={item.gambar}
                                    quantity={quantity}
                                    onAddToCart={() => addToCart({ ...item, id_supplier: item.id_supplier })} // Pastikan id_supplier ikut ke keranjang
                                    onIncrement={() => increment(item.id)}
                                    onDecrement={() => decrement(item.id)}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Kolom Kanan: Sidebar */}
                <form onSubmit={handleSubmit} className="w-1/4 sticky top-20 h-[calc(100vh-10rem)] flex flex-col gap-4 rounded-xl bg-white p-6 shadow-md border">
                    <h2 className="text-xl font-bold">Ringkasan Pembelian</h2>
                    <div className="rounded border bg-gray-50 p-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="namaApotik" className="font-bold text-sm">Nama Apotek:</label>
                            <input
                                id="namaApotik"
                                type="text"
                                placeholder="Nama Apotik"
                                className={`border p-2 rounded text-sm ${errors.namaApotik ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                                value={namaApotik}
                                onChange={(e) => {
                                    setNamaApotik(e.target.value);
                                    if (errors.namaApotik) setErrors({ ...errors, namaApotik: false });
                                }}
                            />
                            <label htmlFor="alamatApotik" className="font-bold text-sm mt-2">Alamat:</label>
                            <input
                                id="alamatApotik"
                                type="text"
                                placeholder="Alamat Apotik"
                                className={`border p-2 rounded text-sm ${errors.alamatApotik ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                                value={alamatApotik}
                                onChange={(e) => {
                                    setAlamatApotik(e.target.value);
                                    if (errors.alamatApotik) setErrors({ ...errors, alamatApotik: false });
                                }}
                            />
                            <p className="text-xs text-red-500 mt-1">*Wajib diisi</p>
                        </div>
                    </div>
                    <div className={`flex flex-col flex-1 overflow-y-auto rounded-md border ${errors.cart ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}>
                        {cart.length === 0 ? (
                            <div className="flex h-full items-center justify-center p-2">
                                <p className="text-gray-500 text-sm">Keranjang masih kosong</p>
                            </div>
                        ) : (
                            <div className="p-2">
                                {cart.map((item) => (
                                    <CartItemCard
                                        key={item.id}
                                        id={item.id}
                                        supplier={item.supplier}
                                        name={item.nama}
                                        price={item.harga}
                                        quantity={item.quantity}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="rounded border bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-base font-semibold text-gray-700">Total Harga:</p>
                            <p className="text-xl font-bold text-black">Rp{totalHarga.toLocaleString()}</p>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-2 w-full rounded-xl bg-green-100 py-3 text-sm font-semibold text-black shadow-sm transition hover:bg-green-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Ajukan Pengadaan'}
                        </button>
                    </div>
                </form>
            </div>

            <ConfirmationDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={handleConfirmSubmit}
                title="Konfirmasi Pengadaan"
            >
                <p>Apakah Anda yakin ingin mengajukan semua item di keranjang?</p>
            </ConfirmationDialog>

            <SuccessToast
                isOpen={showSuccessToast}
                onClose={() => setShowSuccessToast(false)}
            >
                <p>Purchase Order berhasil dibuat!</p>
            </SuccessToast>
        </>
    );
}