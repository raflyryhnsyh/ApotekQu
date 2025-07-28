"use client";
import React, { useState } from "react";
import { X } from "lucide-react";

// TypeScript interfaces
interface PenjualanItem {
  no: number;
  nama: string;
  kategori: string;
  terjual: number;
  satuan: string;
  totalPenjualan: number;
  keuntungan: number;
}

interface PembelianItem {
  no: number;
  nama: string;
  jumlah: number;
  satuan: string;
  totalPembelian: number;
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

const penjualanData: PenjualanItem[] = [
  { no: 1, nama: "Paracetamol", kategori: "Pain Relief", terjual: 150, satuan: "Box", totalPenjualan: 750000, keuntungan: 675000 },
  { no: 2, nama: "Amoxicillin", kategori: "Antibiotics", terjual: 120, satuan: "Bottle", totalPenjualan: 600000, keuntungan: 540000 },
  { no: 3, nama: "Ibuprofen", kategori: "Pain Relief", terjual: 100, satuan: "Box", totalPenjualan: 500000, keuntungan: 450000 },
  { no: 4, nama: "Cetirizine", kategori: "Antihistamine", terjual: 90, satuan: "Box", totalPenjualan: 450000, keuntungan: 405000 },
  { no: 5, nama: "Omeprazole", kategori: "Acid Reducer", terjual: 80, satuan: "Box", totalPenjualan: 400000, keuntungan: 360000 },
];

const pembelianData: PembelianItem[] = [
  { no: 1, nama: "Paracetamol", jumlah: 150, satuan: "Box", totalPembelian: 750000 },
  { no: 2, nama: "Amoxicillin", jumlah: 120, satuan: "Bottle", totalPembelian: 600000 },
  { no: 3, nama: "Ibuprofen", jumlah: 100, satuan: "Box", totalPembelian: 500000 },
  { no: 4, nama: "Cetirizine", jumlah: 90, satuan: "Box", totalPembelian: 450000 },
  { no: 5, nama: "Omeprazole", jumlah: 80, satuan: "Box", totalPembelian: 400000 },
];

// Sample detail data for modals
const penjualanDetails: Record<number, PenjualanDetail[]> = {
  1: [
    { no: 1, tanggal: "01/01/2024", idTransaksi: "SALES-00123", jumlah: 150, total: 150000, petugas: "Ratu" },
    { no: 2, tanggal: "10/01/2024", idTransaksi: "SALES-00124", jumlah: 120, total: 200000, petugas: "Ratu" },
    { no: 3, tanggal: "16/01/2024", idTransaksi: "SALES-00125", jumlah: 100, total: 300000, petugas: "Ratu" },
    { no: 4, tanggal: "23/01/2024", idTransaksi: "SALES-00126", jumlah: 90, total: 100000, petugas: "Sarah" },
    { no: 5, tanggal: "29/01/2024", idTransaksi: "SALES-00127", jumlah: 80, total: 100000, petugas: "Sarah" },
  ],
  2: [
    { no: 1, tanggal: "02/01/2024", idTransaksi: "SALES-00128", jumlah: 120, total: 150000, petugas: "Ratu" },
    { no: 2, tanggal: "12/01/2024", idTransaksi: "SALES-00129", jumlah: 100, total: 250000, petugas: "Sarah" },
  ],
  // Add more details for other items as needed
};

const pembelianDetails: Record<number, PembelianDetail[]> = {
  1: [
    { no: 1, tanggal: "01/01/2024", nomorPO: "PO12345", jumlah: 150, hargaBeli: 14000, total: 100000, supplier: "Supplier A", petugas: "Ratu" },
    { no: 2, tanggal: "10/01/2024", nomorPO: "PO12346", jumlah: 120, hargaBeli: 15000, total: 200000, supplier: "Supplier B", petugas: "Ratu" },
    { no: 3, tanggal: "16/01/2024", nomorPO: "PO12347", jumlah: 100, hargaBeli: 16000, total: 300000, supplier: "Supplier C", petugas: "Ratu" },
    { no: 4, tanggal: "23/01/2024", nomorPO: "PO12348", jumlah: 90, hargaBeli: 58000, total: 100000, supplier: "Supplier D", petugas: "Sarah" },
    { no: 5, tanggal: "29/01/2024", nomorPO: "PO12349", jumlah: 80, hargaBeli: 14000, total: 100000, supplier: "Supplier E", petugas: "Sarah" },
  ],
  2: [
    { no: 1, tanggal: "03/01/2024", nomorPO: "PO12350", jumlah: 120, hargaBeli: 12000, total: 180000, supplier: "Supplier F", petugas: "Ratu" },
  ],
  // Add more details for other items as needed
};

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
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200" >
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Laporan Penjualan</h2>
            <p className="text-sm text-gray-500 mt-1">Tanggal: 2024-01-01 sampai 2024-02-01</p>
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
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.total}</td>
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
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Laporan Pembelian</h2>
            <p className="text-sm text-gray-500 mt-1">Tanggal: 2024-01-01 sampai 2024-02-01</p>
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
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.hargaBeli}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.total}</td>
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
  const [modalState, setModalState] = useState<ModalState>({
    type: null, // 'penjualan' or 'pembelian'
    isOpen: false,
    data: [],
    productName: ''
  });

  const totalPenjualan = penjualanData.reduce((acc, item) => acc + item.totalPenjualan, 0);
  const totalKeuntungan = penjualanData.reduce((acc, item) => acc + item.keuntungan, 0);
  const totalPembelian = pembelianData.reduce((acc, item) => acc + item.totalPembelian, 0);

  // Function to export data to CSV
  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Handle values that might contain commas by wrapping in quotes
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        }).join(',')
      )
    ].join('\n');

    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Create a link element to download the CSV
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    // Append the link to the body and trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Penjualan function
  const exportPenjualan = () => {
    const headers = ['no', 'nama', 'kategori', 'terjual', 'satuan', 'totalPenjualan', 'keuntungan'];
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `laporan-penjualan-${currentDate}.csv`;

    exportToCSV(penjualanData, filename, headers);
  };

  // Export Pembelian function
  const exportPembelian = () => {
    const headers = ['no', 'nama', 'jumlah', 'satuan', 'totalPembelian'];
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `laporan-pembelian-${currentDate}.csv`;

    exportToCSV(pembelianData, filename, headers);
  };

  const openPenjualanModal = (productId: number, productName: string) => {
    const details = penjualanDetails[productId] || [];
    setModalState({
      type: 'penjualan',
      isOpen: true,
      data: details,
      productName: productName
    });
  };

  const openPembelianModal = (productId: number, productName: string) => {
    const details = pembelianDetails[productId] || [];
    setModalState({
      type: 'pembelian',
      isOpen: true,
      data: details,
      productName: productName
    });
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
      {/* Laporan Penjualan */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="font-semibold text-lg text-gray-800">Laporan Penjualan</h2>
            <p className="text-sm text-gray-500 mt-1">Tanggal: 2024-01-01 sampai 2024-02-01</p>
          </div>
          <button
            onClick={exportPenjualan}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">No</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Nama</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Kategori</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Terjual</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Satuan</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Total Penjualan</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Keuntungan</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Detail</th>
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
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{item.totalPenjualan.toLocaleString()}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{item.keuntungan.toLocaleString()}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-green-600 hover:text-green-800 cursor-pointer font-medium"
                    onClick={() => openPenjualanModal(item.no, item.nama)}>
                    View
                  </td>
                </tr>
              ))}
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
            <p className="text-sm text-gray-500 mt-1">Tanggal: 2024-01-01 sampai 2024-02-01</p>
          </div>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Penjualan</th>
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
                    onClick={() => openPembelianModal(item.no, item.nama)}>
                    View
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rekap Section */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <h3 className="font-semibold text-sm text-gray-800 mb-3">Rekap</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
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