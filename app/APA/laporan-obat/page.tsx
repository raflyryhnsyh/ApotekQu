"use client";
import React, { useState, useEffect } from "react";
import { X, Download, Calendar, Loader2 } from "lucide-react";

// Import API clients
import { salesAPI } from "@/lib/api/sales";
import { purchaseOrderApi } from "@/lib/api/purchase-orders";
import { reportsService } from "@/lib/api/reports";
import { PenjualanWithDetails, DetailPenjualan } from "@/types/database";

// UI Interface types
interface PenjualanItem {
  no: number;
  nama: string;
  kategori: string;
  terjual: number;
  satuan: string;
  totalPenjualan: number;
  keuntungan: number;
  id_obat: string;
}

interface PembelianItem {
  no: number;
  nama: string;
  jumlah: number;
  satuan: string;
  totalPembelian: number;
  id_obat: string;
}

interface PenjualanDetail {
  no: number;
  tanggal: string;
  idTransaksi: string;
  jumlah: number;
  total: number;
  petugas: string;
}

interface PembelianDetail {
  no: number;
  tanggal: string;
  nomorPO: string;
  jumlah: number;
  hargaBeli: number;
  total: number;
  supplier: string;
  petugas: string;
}

interface ModalState {
  type: 'penjualan' | 'pembelian' | null;
  isOpen: boolean;
  data: PenjualanDetail[] | PembelianDetail[];
  productName: string;
}

interface DateFilter {
  startDate: string;
  endDate: string;
}

// Modal Component for Penjualan
interface PenjualanModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PenjualanDetail[];
  productName: string;
}

const PenjualanModal: React.FC<PenjualanModalProps> = ({ isOpen, onClose, data, productName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Detail Penjualan</h2>
            <p className="text-sm font-medium text-gray-700 mt-1">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-auto max-h-[60vh]">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Petugas</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.no} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.no}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.tanggal}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.idTransaksi}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.jumlah}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Rp {item.total.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.petugas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Modal Component for Pembelian
interface PembelianModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PembelianDetail[];
  productName: string;
}

const PembelianModal: React.FC<PembelianModalProps> = ({ isOpen, onClose, data, productName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Detail Pembelian</h2>
            <p className="text-sm font-medium text-gray-700 mt-1">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-auto max-h-[60vh]">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor PO</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Beli</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Petugas</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.no} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.no}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.tanggal}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.nomorPO}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.jumlah}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Rp {item.hargaBeli.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Rp {item.total.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.supplier}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.petugas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function LaporanPage() {
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [penjualanData, setPenjualanData] = useState<PenjualanItem[]>([]);
  const [pembelianData, setPembelianData] = useState<PembelianItem[]>([]);
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    isOpen: false,
    data: [],
    productName: ''
  });

  // Date filter state
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    startDate: `${new Date().getFullYear()}-01-01`,
    endDate: new Date().toISOString().split('T')[0]
  });

  // Fetch detailed data for specific product
  const fetchPenjualanDetails = async (productId: string, productName: string) => {
    try {
      const response = await salesAPI.getSales({
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
        limit: 1000
      });

      if (response.success && response.data?.data) {
        const details: PenjualanDetail[] = [];
        let counter = 1;

        response.data.data.forEach((sale: PenjualanWithDetails) => {
          sale.detail_penjualan?.forEach((detail) => {
            if (detail.obat?.id === productId) {
              details.push({
                no: counter++,
                tanggal: new Date(sale.dibuat_pada).toLocaleDateString('id-ID'),
                idTransaksi: `SALE-${sale.id.slice(-8)}`,
                jumlah: detail.jumlah_terjual,
                total: detail.jumlah_terjual * detail.harga,
                petugas: sale.pengguna?.full_name || 'Unknown'
              });
            }
          });
        });

        setModalState({
          type: 'penjualan',
          isOpen: true,
          data: details,
          productName
        });
      }
    } catch (error) {
      console.error('Error fetching penjualan details:', error);
    }
  };

  const fetchPembelianDetails = async (productId: string, productName: string) => {
    try {
      const response = await purchaseOrderApi.getAll({
        limit: 1000
      });

      if (response.success && response.data?.data) {
        const details: PembelianDetail[] = [];
        let counter = 1;

        response.data.data.forEach((purchase: any) => {
          purchase.detail_purchase_order?.forEach((detail: any) => {
            // Check multiple possible data structures for product ID
            let matchesProduct = false;

            if (detail.penyedia_produk?.obat?.id === productId) {
              matchesProduct = true;
            } else if (detail.penyedia_produk?.id_obat === productId) {
              matchesProduct = true;
            }

            if (matchesProduct) {
              details.push({
                no: counter++,
                tanggal: new Date(purchase.dibuat_pada).toLocaleDateString('id-ID'),
                nomorPO: `PO-${purchase.id.slice(-8)}`,
                jumlah: detail.jumlah,
                hargaBeli: detail.harga,
                total: detail.jumlah * detail.harga,
                supplier: purchase.supplier?.nama_supplier || 'Unknown',
                petugas: purchase.pengguna?.full_name || 'Unknown'
              });
            }
          });
        });

        setModalState({
          type: 'pembelian',
          isOpen: true,
          data: details,
          productName
        });
      }
    } catch (error) {
      console.error('Error fetching pembelian details:', error);
    }
  };

  // Fetch data functions
  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getSales({
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
        limit: 1000
      });

      if (response.success && response.data?.data) {
        // Aggregate sales data by product
        const salesByProduct = new Map<string, {
          nama: string;
          kategori: string;
          totalTerjual: number;
          totalPenjualan: number;
          keuntungan: number;
        }>();

        response.data.data.forEach((sale: PenjualanWithDetails) => {
          sale.detail_penjualan?.forEach((detail) => {
            if (detail.obat?.id) {
              const productId = detail.obat.id;
              const existing = salesByProduct.get(productId) || {
                nama: detail.obat.nama_obat || 'Unknown',
                kategori: detail.obat.kategori || 'Unknown',
                totalTerjual: 0,
                totalPenjualan: 0,
                keuntungan: 0
              };

              existing.totalTerjual += detail.jumlah_terjual;
              existing.totalPenjualan += detail.jumlah_terjual * detail.harga;
              // Assume 10% profit margin for demo
              existing.keuntungan += (detail.jumlah_terjual * detail.harga) * 0.1;

              salesByProduct.set(productId, existing);
            }
          });
        });

        // Convert to array format
        const salesArray: PenjualanItem[] = Array.from(salesByProduct.entries()).map(([id, data], index) => ({
          no: index + 1,
          nama: data.nama,
          kategori: data.kategori,
          terjual: data.totalTerjual,
          satuan: "Pcs",
          totalPenjualan: data.totalPenjualan,
          keuntungan: data.keuntungan,
          id_obat: id
        }));

        setPenjualanData(salesArray);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setError('Failed to fetch sales data');
    }
  };

  const fetchPurchaseData = async () => {
    try {
      const response = await purchaseOrderApi.getAll({
        limit: 1000
      });

      console.log('Purchase API Response:', response);

      if (response.success && response.data?.data) {
        console.log('Purchase data found:', response.data.data.length, 'items');

        // First, collect all unique product IDs
        const productIds = new Set<string>();
        response.data.data.forEach((purchase: any) => {
          purchase.detail_purchase_order?.forEach((detail: any) => {
            if (detail.penyedia_produk?.obat?.id) {
              productIds.add(detail.penyedia_produk.obat.id);
            } else if (detail.penyedia_produk?.id_obat) {
              productIds.add(detail.penyedia_produk.id_obat);
            }
          });
        });

        // Fetch product names for IDs that don't have nested obat data
        const productNames = new Map<string, string>();

        // Process purchase data and aggregate by product
        const purchasesByProduct = new Map<string, {
          nama: string;
          totalJumlah: number;
          totalPembelian: number;
        }>();

        response.data.data.forEach((purchase: any) => {
          console.log('Processing purchase:', purchase.id, 'with details:', purchase.detail_purchase_order?.length || 0);

          purchase.detail_purchase_order?.forEach((detail: any) => {
            console.log('Detail structure:', detail);

            // Check multiple possible data structures
            let productId: string | null = null;
            let productName: string = 'Unknown';

            if (detail.penyedia_produk?.obat?.id) {
              // If obat is nested properly
              productId = detail.penyedia_produk.obat.id;
              productName = detail.penyedia_produk.obat.nama_obat || 'Unknown';
            } else if (detail.penyedia_produk?.id_obat) {
              // If only id_obat is available, we need to fetch or use it directly
              productId = detail.penyedia_produk.id_obat;
              // Use cached name or fallback
              productName = productNames.get(detail.penyedia_produk.id_obat) || `Product-${detail.penyedia_produk.id_obat.slice(-8)}`;
            }

            if (productId) {
              const existing = purchasesByProduct.get(productId) || {
                nama: productName,
                totalJumlah: 0,
                totalPembelian: 0
              };

              existing.totalJumlah += detail.jumlah;
              existing.totalPembelian += detail.jumlah * detail.harga;

              purchasesByProduct.set(productId, existing);
              console.log('Added purchase for product:', productId, existing);
            } else {
              console.log('Missing product info in detail:', detail);
            }
          });
        });

        console.log('Aggregated purchases:', purchasesByProduct.size, 'products');

        // Convert to array format
        const purchaseArray: PembelianItem[] = Array.from(purchasesByProduct.entries()).map(([id, data], index) => ({
          no: index + 1,
          nama: data.nama,
          jumlah: data.totalJumlah,
          satuan: "Pcs",
          totalPembelian: data.totalPembelian,
          id_obat: id
        }));

        console.log('Final purchase array:', purchaseArray);
        setPembelianData(purchaseArray);
      } else {
        console.log('No purchase data or API failed:', response);
        // Set empty array instead of keeping old data
        setPembelianData([]);
      }
    } catch (error) {
      console.error('Error fetching purchase data:', error);
      setError('Failed to fetch purchase data');
      setPembelianData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when date filter changes
  useEffect(() => {
    Promise.all([fetchSalesData(), fetchPurchaseData()]);
  }, [dateFilter]);

  // Calculate totals
  const totalPenjualan = penjualanData.reduce((acc, item) => acc + item.totalPenjualan, 0);
  const totalKeuntungan = penjualanData.reduce((acc, item) => acc + item.keuntungan, 0);
  const totalPembelian = pembelianData.reduce((acc, item) => acc + item.totalPembelian, 0);

  // Export functions
  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPenjualan = () => {
    const headers = ['no', 'nama', 'kategori', 'terjual', 'satuan', 'totalPenjualan', 'keuntungan'];
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `laporan-penjualan-${currentDate}.csv`;
    exportToCSV(penjualanData, filename, headers);
  };

  const exportPembelian = () => {
    const headers = ['no', 'nama', 'jumlah', 'satuan', 'totalPembelian'];
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `laporan-pembelian-${currentDate}.csv`;
    exportToCSV(pembelianData, filename, headers);
  };

  const closeModal = () => {
    setModalState({
      type: null,
      isOpen: false,
      data: [],
      productName: ''
    });
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen mt-14">


      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin text-blue-500" size={32} />
          <span className="ml-2 text-gray-600">Memuat data...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Laporan Penjualan */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="font-semibold text-lg text-gray-800">Laporan Penjualan</h2>
            <p className="text-sm text-gray-500 mt-1">
              Tanggal: {new Date(dateFilter.startDate).toLocaleDateString('id-ID')} sampai {new Date(dateFilter.endDate).toLocaleDateString('id-ID')}
            </p>
          </div>
          <button
            onClick={exportPenjualan}
            disabled={loading}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <Download size={16} />
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terjual</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satuan</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Penjualan</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keuntungan</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {penjualanData.map((item) => (
                <tr key={item.no} className="hover:bg-gray-50">
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{item.no}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.nama}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{item.kategori}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{item.terjual}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{item.satuan}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">Rp {item.totalPenjualan.toLocaleString()}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">Rp {item.keuntungan.toLocaleString()}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-green-600 hover:text-green-800 cursor-pointer font-medium"
                    onClick={() => fetchPenjualanDetails(item.id_obat, item.nama)}>
                    View
                  </td>
                </tr>
              ))}
              {penjualanData.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-gray-500">
                    Tidak ada data penjualan untuk periode ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Rekap Section */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <h3 className="font-semibold text-sm text-gray-800 mb-3">Rekap</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Penjualan</span>
              <span className="font-medium text-gray-900">Rp {totalPenjualan.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Keuntungan</span>
              <span className="font-medium text-gray-900">Rp {totalKeuntungan.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Laporan Pembelian */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="font-semibold text-lg text-gray-800">Laporan Pembelian</h2>
            <p className="text-sm text-gray-500 mt-1">
              Tanggal: {new Date(dateFilter.startDate).toLocaleDateString('id-ID')} sampai {new Date(dateFilter.endDate).toLocaleDateString('id-ID')}
            </p>
          </div>
          <button
            onClick={exportPembelian}
            disabled={loading}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <Download size={16} />
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satuan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pembelian</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pembelianData.map((item) => (
                <tr key={item.no} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.no}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.jumlah}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.satuan}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp {item.totalPembelian.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 hover:text-green-800 cursor-pointer font-medium"
                    onClick={() => fetchPembelianDetails(item.id_obat, item.nama)}>
                    View
                  </td>
                </tr>
              ))}
              {pembelianData.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-gray-500">
                    Tidak ada data pembelian untuk periode ini. Periksa console untuk detail debug.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Rekap Section */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <h3 className="font-semibold text-sm text-gray-800 mb-3">Rekap</h3>
          <div className="grid grid-rows-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Pembelian</span>
              <span className="font-medium text-gray-900">Rp {totalPembelian.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Varian Produk</span>
              <span className="font-medium text-gray-900">{pembelianData.length} Produk</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      {modalState.type === 'penjualan' && (
        <PenjualanModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          data={modalState.data as PenjualanDetail[]}
          productName={modalState.productName}
        />
      )}

      {modalState.type === 'pembelian' && (
        <PembelianModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          data={modalState.data as PembelianDetail[]}
          productName={modalState.productName}
        />
      )}
    </div>
  );
}
