"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TransactionDetailModal from "@/components/penjualan/rincian-transaksi";
import PaymentSuccessModal from "@/components/penjualan/pembayaran";
import { DataTable, Column } from "@/components/penjualan/data-table";
import { penjualanAPI, Product, CartItem, Transaction, Sale } from "@/lib/api/penjualan";
import { useAuth } from "@/hooks/use-auth";

export default function PenjualanPage() {
    const { user, profile, loading: authLoading, error: authError } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [productsLoading, setProductsLoading] = useState(false);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [productsWithStock, setProductsWithStock] = useState<any[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [showTransactionDetail, setShowTransactionDetail] = useState(false);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
    const [cashAmount, setCashAmount] = useState("");
    const [error, setError] = useState("");

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
        // Check authentication first
        if (!authLoading && (!user || authError)) {
            router.push('/login');
            return;
        }

        // Only load data if user is authenticated
        if (user && !authLoading) {
            const initializePage = async () => {
                setLoading(true);
                await Promise.all([
                    loadProducts(),
                    loadTransactions()
                ]);
                setLoading(false);
            };
            initializePage();
        }
    }, [user, authLoading, authError, router]);

    // Load products from API
    const loadProducts = async () => {
        try {
            setProductsLoading(true);
            setError(""); // Clear previous errors

            // Try to get products with stock first
            let response = await penjualanAPI.getProductsWithStock();

            if (response.success && response.data) {
                setProductsWithStock(response.data);

                // Transform kelola-obat data to simple product list for dropdown
                const productMap = new Map();

                response.data.forEach((item: any) => {
                    if (!productMap.has(item.id_obat)) {
                        productMap.set(item.id_obat, {
                            id: item.id_obat,
                            name: item.nama,
                            price: item.harga_jual || 0,
                            stock: 0,
                            kategori: item.kategori,
                            komposisi: item.komposisi,
                            batches: []
                        });
                    }

                    const product = productMap.get(item.id_obat);
                    product.stock += item.totalStok || 0;
                    product.batches.push({
                        nomor_batch: item.noBatch,
                        stok_sekarang: item.totalStok,
                        kadaluarsa: item.tanggalExpired,
                        harga_jual: item.harga_jual
                    });
                });

                const transformedProducts: Product[] = Array.from(productMap.values());
                setProducts(transformedProducts);
                console.log("Products loaded successfully:", transformedProducts.length);
            } else {
                // Fallback to basic products endpoint
                console.log("Trying fallback endpoint /obat");
                const basicResponse = await penjualanAPI.getProducts();

                if (basicResponse.success && basicResponse.data) {
                    // Use basic product data without detailed stock info
                    const basicProducts = basicResponse.data.map((item: any) => ({
                        id: item.id,
                        name: item.nama_obat,
                        price: item.harga || 0,
                        stock: 100, // Default stock for basic products
                        kategori: item.kategori,
                        komposisi: item.komposisi
                    }));

                    setProducts(basicProducts);
                    setProductsWithStock([]); // No detailed stock info
                    console.log("Basic products loaded:", basicProducts.length);
                } else {
                    console.error("Failed to load products:", basicResponse.error);

                    // Ultimate fallback: use dummy data
                    console.log("Using dummy data as fallback");
                    const dummyProducts: Product[] = [
                        { id: "MED-001", name: "Paracetamol 500mg", price: 5000, stock: 100 },
                        { id: "MED-002", name: "Ibuprofen 200mg", price: 4000, stock: 50 },
                        { id: "MED-003", name: "Amoxicillin 250mg", price: 8000, stock: 30 },
                        { id: "MED-004", name: "Cetirizine 10mg", price: 3500, stock: 75 },
                        { id: "MED-005", name: "Aspirin", price: 50000, stock: 200 },
                        { id: "MED-006", name: "Acetaminophen", price: 100000, stock: 150 },
                    ];

                    setProducts(dummyProducts);
                    setError('Menggunakan data demo - API tidak tersedia');
                }
            }
        } catch (error) {
            console.error('Error loading products:', error);
            setError('Gagal memuat data obat: ' + (error instanceof Error ? error.message : 'Network error'));
        } finally {
            setProductsLoading(false);
        }
    };    // Load transactions from API
    const loadTransactions = async () => {
        try {
            setTransactionsLoading(true);
            const response = await penjualanAPI.getSales({
                page: 1,
                limit: 10
            });

            if (response.success && response.data) {
                // Transform API data to match component interface
                const transformedTransactions: Transaction[] = response.data.data.map((sale: Sale) => ({
                    id: sale.id,
                    date: new Date(sale.dibuat_pada).toISOString().split('T')[0],
                    pharmacist: sale.pengguna.full_name,
                    total: sale.total,
                    items: sale.detail_penjualan?.map(detail => ({
                        name: detail.obat?.nama_obat || 'Unknown Product',
                        quantity: detail.jumlah_terjual,
                        price: detail.harga
                    })) || []
                }));

                console.log('Loaded transactions:', transformedTransactions);
                setTransactions(transformedTransactions);
            } else {
                console.error('Failed to load transactions:', response.error);
                setError(response.error || 'Gagal memuat data transaksi');
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            setError('Gagal memuat data transaksi: ' + (error instanceof Error ? error.message : 'Network error'));
        } finally {
            setTransactionsLoading(false);
        }
    };

    const addToCart = () => {
        const selectedProduct = products.find(p => p.id === selectedProductId);
        if (!selectedProduct) {
            setError('Produk tidak ditemukan');
            return;
        }

        if (quantity <= 0) {
            setError('Jumlah harus lebih dari 0');
            return;
        }

        // Check if there's enough stock (considering existing cart items)
        const existingCartQuantity = cart.find(item => item.id === selectedProduct.id)?.quantity || 0;
        const totalRequestedQuantity = existingCartQuantity + quantity;

        if (totalRequestedQuantity > selectedProduct.stock) {
            setError(`Stok tidak mencukupi. Tersedia: ${selectedProduct.stock}, Di keranjang: ${existingCartQuantity}, Diminta: ${quantity}`);
            return;
        }

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
        setError(""); // Clear any previous errors

        console.log(`Added to cart: ${selectedProduct.name}, Quantity: ${quantity}, Available stock: ${selectedProduct.stock}`);
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

    const handlePayment = async () => {
        // Prevent double submission
        if (loading) {
            console.log('Payment already in progress, ignoring duplicate request');
            return;
        }

        // Double check authentication before payment
        if (!user?.id || !profile) {
            setError('User tidak terautentikasi. Silakan login ulang.');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
            return;
        }

        const total = getTotalAmount();
        const cash = parseFloat(cashAmount) || 0;

        if (cash < total) {
            setError("Jumlah uang tidak mencukupi!");
            return;
        }

        if (cart.length === 0) {
            setError("Keranjang kosong!");
            return;
        }

        if (cash >= total && cart.length > 0) {
            try {
                setLoading(true);
                setError(""); // Clear previous errors

                // Validate all cart items have valid batches before sending
                const invalidItems: string[] = [];

                // Prepare sale data for API with better batch validation
                const saleItems = cart.map(item => {
                    // Find available batches for this product
                    const availableBatches = productsWithStock.filter(p =>
                        p.id_obat === item.id &&
                        p.totalStok > 0
                    );

                    if (availableBatches.length === 0) {
                        invalidItems.push(`${item.name} (tidak ada batch tersedia)`);
                        return null;
                    }

                    // Sort by expiry date (closest to expire first) to use FIFO
                    availableBatches.sort((a, b) => new Date(a.tanggalExpired).getTime() - new Date(b.tanggalExpired).getTime());

                    // Find a batch with sufficient stock
                    let selectedBatch = null;
                    let remainingQuantity = item.quantity;

                    for (const batch of availableBatches) {
                        if (batch.totalStok >= remainingQuantity) {
                            selectedBatch = batch;
                            break;
                        }
                    }

                    if (!selectedBatch) {
                        const totalAvailableStock = availableBatches.reduce((sum, b) => sum + b.totalStok, 0);
                        invalidItems.push(`${item.name} (stok tidak mencukupi: diminta ${item.quantity}, tersedia ${totalAvailableStock})`);
                        return null;
                    }

                    console.log(`Item: ${item.name}, Product ID: ${item.id}, Selected Batch: ${selectedBatch.noBatch}, Available Stock: ${selectedBatch.totalStok}, Quantity: ${item.quantity}`);

                    return {
                        id_obat: item.id,
                        jumlah_terjual: item.quantity,
                        harga: item.price,
                        nomor_batch: selectedBatch.noBatch
                    };
                }).filter(item => item !== null);

                // Check if there are any invalid items
                if (invalidItems.length > 0) {
                    setError(`Tidak dapat memproses penjualan: ${invalidItems.join(', ')}`);
                    setLoading(false);
                    return;
                }

                const saleData = {
                    diproses_oleh: user.id,
                    items: saleItems
                };

                console.log('Sending sale data:', saleData);

                const response = await penjualanAPI.createSale(saleData);

                if (response.success && response.data) {
                    // Create transaction for display
                    const newTransaction: Transaction = {
                        id: response.data.penjualan.id,
                        date: new Date(response.data.penjualan.dibuat_pada).toISOString().split('T')[0],
                        pharmacist: profile?.full_name || 'Unknown',
                        total: response.data.penjualan.total,
                        items: cart.map(item => ({
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    };

                    setCurrentTransaction(newTransaction);
                    setTransactions([newTransaction, ...transactions]);
                    setShowPaymentSuccess(true);
                    setCart([]);
                    setCashAmount("");

                    console.log('Transaction created successfully:', newTransaction);

                    // Reload products to update stock and transactions
                    await Promise.all([
                        loadProducts(),
                        loadTransactions()
                    ]);
                } else {
                    setError(response.error || 'Gagal memproses pembayaran');
                }
            } catch (error) {
                console.error('Error processing payment:', error);
                setError('Gagal memproses pembayaran');
            } finally {
                setLoading(false);
            }
        } else {
            setError("Jumlah uang tidak mencukupi atau keranjang kosong!");
        }
    };

    // Show authentication loading
    if (authLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-lg">Memverifikasi autentikasi...</p>
            </div>
        );
    }

    // Show authentication error
    if (authError || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-4">
                    <h3 className="text-lg font-semibold">Autentikasi Diperlukan</h3>
                    <p className="text-sm mt-2">
                        {authError || 'Anda harus login untuk mengakses halaman ini.'}
                    </p>
                </div>
                <button
                    onClick={() => router.push('/login')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Ke Halaman Login
                </button>
            </div>
        );
    }

    // Show loading for data fetching
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-lg">Memuat data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Penjualan Obat</h1>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm">{error}</p>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    onClick={() => setError("")}
                                    className="text-red-400 hover:text-red-600"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                                <p className="font-medium">{profile?.full_name || 'Loading...'}</p>
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
                                disabled={productsLoading}
                            >
                                <option value="">
                                    {productsLoading ? 'Loading...' : 'Pilih obat'}
                                </option>
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
                        disabled={!selectedProductId || quantity <= 0 || productsLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {productsLoading ? 'Loading...' : 'Tambah'}
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
                                disabled={cart.length === 0 || loading}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Processing...' : 'Bayar'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Riwayat Transaksi */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Riwayat Transaksi</h3>
                    {transactionsLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <DataTable
                            data={transactions}
                            columns={transactionColumns}
                            emptyMessage="Belum ada transaksi"
                        />
                    )}
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