"use client";

import { useEffect, useState } from "react";
import TransactionDetailModal from "@/components/penjualan/rincian-transaksi";
import PaymentSuccessModal from "@/components/penjualan/pembayaran";
import { DataTable, Column } from "@/components/penjualan/data-table";
import { CartItem, Product, Transaction } from "@/types/pegawai";

export default function PenjualanPage() {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([
        { id: "MED-001", name: "Paracetamol 500mg", price: 5000, stock: 100 },
        { id: "MED-002", name: "Ibuprofen 200mg", price: 4000, stock: 50 },
        { id: "MED-003", name: "Amoxicillin 250mg", price: 8000, stock: 30 },
        { id: "MED-004", name: "Cetirizine 10mg", price: 3500, stock: 75 },
        { id: "MED-005", name: "Aspirin", price: 50000, stock: 200 },
        { id: "MED-006", name: "Acetaminophen", price: 100000, stock: 150 },
    ]);

    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [cashback, setCashback] = useState(0);
    const [showTransactionDetail, setShowTransactionDetail] = useState(false);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([
        {
            id: "SALES-00123",
            date: "2024-01-20",
            pharmacist: "Ratu",
            total: 5000,
            items: [
                { name: "Paracetamol 500mg", quantity: 1, price: 5000 }
            ]
        },
        {
            id: "SALES-00124",
            date: "2024-01-20",
            pharmacist: "Ratu",
            total: 4000,
            items: [
                { name: "Ibuprofen 200mg", quantity: 1, price: 4000 }
            ]
        },
        {
            id: "SALES-00125",
            date: "2024-01-20",
            pharmacist: "Ratu",
            total: 8000,
            items: [
                { name: "Amoxicillin 250mg", quantity: 1, price: 8000 }
            ]
        },
        {
            id: "SALES-00126",
            date: "2024-01-20",
            pharmacist: "Sarah",
            total: 3500,
            items: [
                { name: "Cetirizine 10mg", quantity: 1, price: 3500 }
            ]
        },
    ]);
    const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
    const [cashAmount, setCashAmount] = useState("");

    // Define cart columns
    const cartColumns: Column<CartItem>[] = [
        {
            key: "index",
            header: "No",
            render: (_, index) => <span>{index + 1}</span>
        },
        {
            key: "id",
            header: "ID"
        },
        {
            key: "name",
            header: "Nama Obat"
        },
        {
            key: "quantity",
            header: "Jumlah"
        },
        {
            key: "price",
            header: "Harga",
            render: (item) => `Rp ${item.price.toLocaleString('id-ID')}`
        },
        {
            key: "subtotal",
            header: "Subtotal",
            render: (item) => `Rp ${item.subtotal.toLocaleString('id-ID')}`
        },
        {
            key: "actions",
            header: "",
            render: (item) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.id);
                    }}
                    className="text-red-600 hover:text-red-800 p-1"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </button>
            )
        }
    ];

    // Define transaction columns
    const transactionColumns: Column<Transaction>[] = [
        {
            key: "index",
            header: "No",
            render: (_, index) => <span>{index + 1}</span>
        },
        {
            key: "id",
            header: "ID Transaksi"
        },
        {
            key: "date",
            header: "Dibuat Pada"
        },
        {
            key: "pharmacist",
            header: "Petugas Apotik"
        },
        {
            key: "total",
            header: "Total",
            render: (item) => `Rp ${item.total.toLocaleString('id-ID')}`
        },
        {
            key: "actions",
            header: "",
            render: (item) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setCurrentTransaction(item);
                        setShowTransactionDetail(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    Lihat Rincian
                </button>
            )
        }
    ];

    useEffect(() => {
        const initializePage = async () => {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setLoading(false);
        };
        initializePage();
    }, []);

    const addToCart = () => {
        const selectedProduct = products.find(p => p.id === selectedProductId);
        if (selectedProduct && quantity > 0 && quantity <= selectedProduct.stock) {
            const existingItem = cart.find(item => item.id === selectedProduct.id);

            if (existingItem) {
                setCart(cart.map(item =>
                    item.id === selectedProduct.id
                        ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * item.price }
                        : item
                ));
            } else {
                setCart([...cart, {
                    id: selectedProduct.id,
                    name: selectedProduct.name,
                    quantity: quantity,
                    price: selectedProduct.price,
                    subtotal: quantity * selectedProduct.price
                }]);
            }
            setSelectedProductId("");
            setQuantity(1);
        }
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const getTotalAmount = () => {
        return cart.reduce((total, item) => total + item.subtotal, 0);
    };

    const getKembalian = () => {
        const cash = parseFloat(cashAmount) || 0;
        const total = getTotalAmount();
        return cash >= total ? cash - total : 0;
    };

    const handlePayment = () => {
        const total = getTotalAmount();
        const cash = parseFloat(cashAmount) || 0;

        if (cash >= total && cart.length > 0) {
            const newTransaction = {
                id: `SALES-${String(Date.now()).slice(-5)}`,
                date: new Date().toISOString().split('T')[0],
                pharmacist: "Ratu",
                total: total,
                items: cart.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.subtotal
                }))
            };

            setCurrentTransaction(newTransaction);
            setTransactions([newTransaction, ...transactions]);
            setShowPaymentSuccess(true);
            setCart([]);
            setCashAmount("");
            setCashback(0);
        } else {
            alert("Jumlah uang tidak mencukupi atau keranjang kosong!");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Penjualan Obat</h1>

                {/* Detail Transaksi */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Detail Transaksi</h2>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <div>
                                <span className="text-gray-600 text-sm">Tanggal</span>
                                <p className="font-medium">{new Date().toLocaleDateString('en-CA')}</p>
                            </div>
                            <div>
                                <span className="text-gray-600 text-sm">ID Transaksi</span>
                                <p className="font-medium">SALES-{String(Date.now()).slice(-5)}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <span className="text-gray-600 text-sm">Waktu</span>
                                <p className="font-medium">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div>
                                <span className="text-gray-600 text-sm">Petugas Apotik</span>
                                <p className="font-medium">Ratu</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Produk */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Produk</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Obat</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                            >
                                <option value="">Masukkan kode atau nama produk</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} - Rp {product.price.toLocaleString('id-ID')} (Stok: {product.stock})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                            <input
                                type="number"
                                placeholder="Jumlah"
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            />
                        </div>
                    </div>
                    <button
                        onClick={addToCart}
                        disabled={!selectedProductId || quantity <= 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Tambah
                    </button>

                    {/* Cart Table */}
                    <div className="mt-6">
                        <DataTable
                            data={cart}
                            columns={cartColumns}
                            emptyMessage="Tidak ada produk dalam keranjang"
                        />
                    </div>

                    {/* Total dan Kembalian */}
                    <div className="mt-6 space-y-4">
                        <div className="flex justify-between items-center text-lg font-semibold">
                            <span>Total</span>
                            <span>Rp {getTotalAmount().toLocaleString('id-ID')}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Kembalian</span>
                            <span className="font-medium">Rp {getKembalian().toLocaleString('id-ID')}</span>
                        </div>

                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <input
                                    type="number"
                                    placeholder="Masukkan Nominal Pembayaran"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    value={cashAmount}
                                    onChange={(e) => setCashAmount(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handlePayment}
                                disabled={cart.length === 0 || !cashAmount || parseFloat(cashAmount) < getTotalAmount()}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                Bayar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Riwayat Transaksi */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Riwayat Transaksi</h2>
                    <DataTable
                        data={transactions}
                        columns={transactionColumns}
                        emptyMessage="Belum ada transaksi"
                    />
                </div>
            </div>

            {/* Modals */}
            <TransactionDetailModal
                isOpen={showTransactionDetail}
                onClose={() => setShowTransactionDetail(false)}
                transaction={currentTransaction}
            />

            <PaymentSuccessModal
                isOpen={showPaymentSuccess}
                onClose={() => setShowPaymentSuccess(false)}
            />
        </div>
    );
}