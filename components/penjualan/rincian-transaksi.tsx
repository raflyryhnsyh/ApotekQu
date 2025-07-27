"use client";

interface TransactionDetailProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: {
        id: string;
        date: string;
        pharmacist: string;
        items: Array<{
            name: string;
            quantity: number;
            price: number;
        }>;
    } | null;
}

export default function TransactionDetailModal({ isOpen, onClose, transaction }: TransactionDetailProps) {
    if (!isOpen || !transaction) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">Rincian Transaksi</h2>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Transaction Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ID Transaksi</label>
                            <p className="text-gray-900 font-medium">{transaction.id}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                            <p className="text-gray-900">{transaction.date}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Petugas Apotik</label>
                            <p className="text-gray-900">{transaction.pharmacist}</p>
                        </div>
                    </div>

                    {/* Medicine List */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Obat-Obatan</h3>
                        <div className="space-y-4">
                            {transaction.items.map((item, index) => (
                                <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                                            <p className="text-sm text-gray-600">Jumlah: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900">Rp {item.price.toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}