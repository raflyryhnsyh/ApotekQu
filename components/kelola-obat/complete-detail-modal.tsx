"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataEdit } from './data-edit';
import { Toast, ToastType } from '@/components/ui/toast';

interface IncompleteItem {
    id_barang_diterima: string;
    id_detail_barang_diterima: string | null;
    id_pp: string;
    id_obat: string;
    nama_obat: string;
    jumlah_diterima: number;
    nomor_batch: string | null;
    tiba_pada: string;
    nama_supplier: string;
}

interface CompleteDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CompleteDetailModal({ isOpen, onClose, onSuccess }: CompleteDetailModalProps) {
    const [incompleteItems, setIncompleteItems] = useState<IncompleteItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingItem, setEditingItem] = useState<IncompleteItem | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<ToastType>("success");
    const [toastMessage, setToastMessage] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchIncompleteItems();
        }
    }, [isOpen]);

    const fetchIncompleteItems = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/incomplete-medicines');
            if (!response.ok) throw new Error('Gagal mengambil data');
            
            const result = await response.json();
            setIncompleteItems(result.data || []);
        } catch (error) {
            console.error('Error fetching incomplete items:', error);
            setToastType("error");
            setToastMessage("Gagal mengambil data obat yang belum lengkap");
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditSuccess = async () => {
        setEditingItem(null);
        await fetchIncompleteItems();
        // If no more incomplete items, close modal and refresh parent
        if (incompleteItems.length <= 1) {
            onSuccess();
            onClose();
        }
    };

    return (
        <>
            <Dialog open={isOpen && !editingItem} onOpenChange={onClose}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Obat yang Perlu Dilengkapi</DialogTitle>
                        {!isLoading && incompleteItems.length > 0 && (
                            <p className="text-sm text-gray-600">
                                {incompleteItems.length} obat memerlukan detail lengkap (batch, expired, harga)
                            </p>
                        )}
                    </DialogHeader>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-sm text-gray-600">Memuat data...</p>
                        </div>
                    ) : incompleteItems.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Tidak ada obat yang perlu dilengkapi.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Obat</TableHead>
                                        <TableHead className="text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {incompleteItems.map((item, index) => {
                                        return (
                                            <TableRow key={`incomplete-${item.id_barang_diterima}-${item.id_pp}-${index}`}>
                                                <TableCell className="font-medium">{item.nama_obat}</TableCell>
                                                <TableCell className="text-center">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setEditingItem(item)}
                                                    >
                                                        Lengkapi Data
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit modal for individual item */}
            {editingItem && (
                <DataEdit
                    data={{
                        nomor_batch: editingItem.nomor_batch || '',
                        nama_obat: editingItem.nama_obat,
                        stok_sekarang: editingItem.jumlah_diterima,
                        satuan: '',
                        harga_jual: (editingItem as any).harga_satuan || 0,
                        kadaluarsa: '',
                        nama_supplier: editingItem.nama_supplier,
                        supplier_id: (editingItem as any).id_supplier,
                        kategori: (editingItem as any).kategori || '',
                        komposisi: (editingItem as any).komposisi || '',
                        id_barang_diterima: editingItem.id_barang_diterima,
                        id_pp: editingItem.id_pp,
                        id_obat: editingItem.id_obat  // Added for batch generation
                    }}
                    open={true}
                    onOpenChange={(open) => {
                        if (!open) setEditingItem(null);
                    }}
                    onSuccess={handleEditSuccess}
                />
            )}
            
            <Toast
                isOpen={showToast}
                onClose={() => setShowToast(false)}
                type={toastType}
                title={toastType === "success" ? "Berhasil!" : "Gagal!"}
            >
                <p>{toastMessage}</p>
            </Toast>
        </>
    );
}
