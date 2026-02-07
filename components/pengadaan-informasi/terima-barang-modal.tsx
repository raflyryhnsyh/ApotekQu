"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DetailObat {
    id_pp: string;
    id_obat: string;
    nama_obat: string;
    jumlah: number;
    nomor_batch: string;
    kadaluarsa: string;
    satuan: string;
    harga_jual: number;
}

interface TerimaBarangModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    onSuccess: () => void;
}

export function TerimaBarangModal({ isOpen, onClose, orderId, onSuccess }: TerimaBarangModalProps) {
    const [detailObat, setDetailObat] = useState<DetailObat[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [tanggalTiba, setTanggalTiba] = useState(new Date().toISOString().split('T')[0]);

    // Fetch detail PO dari database
    useEffect(() => {
        if (isOpen && orderId) {
            fetchDetailPO();
        }
    }, [isOpen, orderId]);

    const fetchDetailPO = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/purchase-orders/${orderId}/details`);
            if (!response.ok) throw new Error('Gagal mengambil detail PO');
            
            const data = await response.json();
            
            // Initialize form dengan data dari PO
            const initialDetails: DetailObat[] = data.details.map((item: any) => ({
                id_pp: item.id_pp,
                id_obat: item.id_obat,
                nama_obat: item.nama_obat,
                jumlah: item.jumlah,
                nomor_batch: '',
                kadaluarsa: '',
                satuan: 'strip',
                harga_jual: 0
            }));
            
            setDetailObat(initialDetails);
        } catch (error) {
            console.error('Error fetching PO details:', error);
            alert('Gagal mengambil detail pesanan');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (index: number, field: keyof DetailObat, value: string | number) => {
        setDetailObat(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleSubmit = async () => {
        // Validasi semua field sudah diisi
        const isValid = detailObat.every(item => 
            item.nomor_batch && 
            item.kadaluarsa && 
            item.satuan && 
            item.harga_jual > 0
        );

        if (!isValid) {
            alert('Mohon lengkapi semua data obat');
            return;
        }

        setIsSaving(true);
        try {
            // 1. Insert ke barang_diterima dan detail_barang_diterima
            const barangResponse = await fetch('/api/barang-diterima', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_po: orderId,
                    tiba_pada: tanggalTiba,
                    items: detailObat.map(item => ({
                        id_pp: item.id_pp,
                        jumlah: item.jumlah
                    }))
                })
            });

            if (!barangResponse.ok) {
                const error = await barangResponse.json();
                throw new Error(error.error || 'Gagal menyimpan data penerimaan barang');
            }

            const barangData = await barangResponse.json();

            // 2. Insert/update detail_obat untuk setiap item
            for (const item of detailObat) {
                // Insert/update detail_obat
                const detailResponse = await fetch('/api/detail-obat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nomor_batch: item.nomor_batch,
                        id_obat: item.id_obat,
                        kadaluarsa: item.kadaluarsa,
                        stok_sekarang: item.jumlah,
                        satuan: item.satuan,
                        harga_jual: item.harga_jual
                    })
                });

                if (!detailResponse.ok) {
                    console.error(`Gagal menyimpan detail untuk ${item.nama_obat}`);
                }
            }

            onSuccess();
            onClose();
            
        } catch (error) {
            console.error('Error saving:', error);
            alert(error instanceof Error ? error.message : 'Gagal menyimpan data');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Terima Barang - Input Detail Obat</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Tanggal Tiba */}
                    <div className="flex items-center gap-4">
                        <Label htmlFor="tanggal-tiba" className="w-32">Tanggal Tiba</Label>
                        <Input
                            id="tanggal-tiba"
                            type="date"
                            value={tanggalTiba}
                            onChange={(e) => setTanggalTiba(e.target.value)}
                            className="max-w-xs"
                        />
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8">Memuat data...</div>
                    ) : (
                        <div className="space-y-6">
                            {detailObat.map((item, index) => (
                                <div key={index} className="border rounded-lg p-4 space-y-3">
                                    <h3 className="font-semibold text-lg">{item.nama_obat}</h3>
                                    <p className="text-sm text-gray-600">Jumlah: {item.jumlah}</p>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Nomor Batch */}
                                        <div className="space-y-2">
                                            <Label>Nomor Batch *</Label>
                                            <Input
                                                value={item.nomor_batch}
                                                onChange={(e) => handleInputChange(index, 'nomor_batch', e.target.value)}
                                                placeholder="Contoh: BATCH001"
                                            />
                                        </div>

                                        {/* Tanggal Kadaluarsa */}
                                        <div className="space-y-2">
                                            <Label>Tanggal Kadaluarsa *</Label>
                                            <Input
                                                type="date"
                                                value={item.kadaluarsa}
                                                onChange={(e) => handleInputChange(index, 'kadaluarsa', e.target.value)}
                                            />
                                        </div>

                                        {/* Satuan */}
                                        <div className="space-y-2">
                                            <Label>Satuan *</Label>
                                            <Select
                                                value={item.satuan}
                                                onValueChange={(value) => handleInputChange(index, 'satuan', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="strip">Strip</SelectItem>
                                                    <SelectItem value="botol">Botol</SelectItem>
                                                    <SelectItem value="box">Box</SelectItem>
                                                    <SelectItem value="tube">Tube</SelectItem>
                                                    <SelectItem value="sachet">Sachet</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Harga Jual */}
                                        <div className="space-y-2">
                                            <Label>Harga Jual (per satuan) *</Label>
                                            <Input
                                                type="number"
                                                value={item.harga_jual || ''}
                                                onChange={(e) => handleInputChange(index, 'harga_jual', Number(e.target.value))}
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading || isSaving}>
                        {isSaving ? 'Menyimpan...' : 'Simpan & Terima Barang'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
