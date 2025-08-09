"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2 } from "lucide-react"
import { createKelolaObat } from "@/lib/api/kelola-obat"

interface DataAddProps {
    onAdd: () => void
}

interface Supplier {
    id: string
    nama_supplier: string
    alamat?: string
}

interface Obat {
    id: string
    nama_obat: string
    kategori?: string
    komposisi?: string
}

export function DataAdd({ onAdd }: DataAddProps) {
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        nama_obat: "",
        komposisi: "",
        kategori: "",
        nomor_batch: "",
        kadaluarsa: "",
        stok_sekarang: "",
        satuan: "",
        harga_jual: "",
        supplier_id: ""
    })
    const [isLoading, setIsLoading] = useState(false)
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [obatList, setObatList] = useState<Obat[]>([])
    const [loadingSuppliers, setLoadingSuppliers] = useState(false)
    const [loadingObat, setLoadingObat] = useState(false)

    const fetchSuppliers = useCallback(async () => {
        try {
            setLoadingSuppliers(true)
            const response = await fetch('/api/suppliers')
            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    setSuppliers(result.data)
                }
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error)
        } finally {
            setLoadingSuppliers(false)
        }
    }, [])

    const fetchObatList = useCallback(async () => {
        try {
            setLoadingObat(true)
            const response = await fetch('/api/obat')
            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    setObatList(result.data)
                }
            }
        } catch (error) {
            console.error('Error fetching obat list:', error)
        } finally {
            setLoadingObat(false)
        }
    }, [])

    // Fetch suppliers and obat list when dialog opens
    useEffect(() => {
        if (open && suppliers.length === 0) {
            fetchSuppliers()
        }
        if (open && obatList.length === 0) {
            fetchObatList()
        }
    }, [open, suppliers.length, obatList.length, fetchSuppliers, fetchObatList])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Validasi form
            if (!formData.nama_obat || !formData.nomor_batch || !formData.kadaluarsa ||
                !formData.stok_sekarang || !formData.satuan || !formData.supplier_id) {
                alert("Semua field wajib harus diisi!")
                return
            }

            // Convert stok and harga to number
            const stok = parseInt(formData.stok_sekarang)
            const harga = parseFloat(formData.harga_jual) || 0

            if (isNaN(stok) || stok < 0) {
                alert("Stok harus berupa angka yang valid!")
                return
            }

            const dataToSubmit = {
                nama_obat: formData.nama_obat.trim(),
                komposisi: formData.komposisi.trim() || undefined,
                kategori: formData.kategori || undefined,
                nomor_batch: formData.nomor_batch.trim(),
                kadaluarsa: formData.kadaluarsa,
                stok_sekarang: stok,
                satuan: formData.satuan,
                harga_jual: harga,
                supplier_id: formData.supplier_id
            }

            await createKelolaObat(dataToSubmit)

            // Reset form
            setFormData({
                nama_obat: "",
                komposisi: "",
                kategori: "",
                nomor_batch: "",
                kadaluarsa: "",
                stok_sekarang: "",
                satuan: "",
                harga_jual: "",
                supplier_id: ""
            })

            setOpen(false)
            onAdd() // Refresh parent data
            alert("Obat berhasil ditambahkan!")

        } catch (error: unknown) {
            console.error("Error adding obat:", error)
            const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat menambah obat!"
            alert(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Obat
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-left">
                        Tambah Obat Baru
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 py-6">
                        {/* Nama Obat */}
                        <div className="grid gap-3">
                            <Label htmlFor="nama-obat" className="text-base font-medium">
                                Nama Obat <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.nama_obat}
                                onValueChange={(value) => handleInputChange("nama_obat", value)}
                                required
                                disabled={loadingObat}
                            >
                                <SelectTrigger className="h-12 text-base border-gray-300 rounded-lg">
                                    <SelectValue placeholder={
                                        loadingObat ? "Memuat daftar obat..." : "Pilih nama obat"
                                    } />
                                </SelectTrigger>
                                <SelectContent>
                                    {loadingObat ? (
                                        <SelectItem value="loading" disabled>
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Memuat obat...
                                            </div>
                                        </SelectItem>
                                    ) : obatList.length > 0 ? (
                                        obatList.map((obat) => (
                                            <SelectItem key={obat.id} value={obat.nama_obat}>
                                                {obat.nama_obat}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-data" disabled>
                                            Tidak ada data obat
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Komposisi */}
                        <div className="grid gap-3">
                            <Label htmlFor="komposisi" className="text-base font-medium">
                                Komposisi
                            </Label>
                            <Textarea
                                id="komposisi"
                                value={formData.komposisi}
                                onChange={(e) => handleInputChange("komposisi", e.target.value)}
                                placeholder="Masukkan komposisi obat"
                                className="text-base border-gray-300 rounded-lg"
                                rows={3}
                            />
                        </div>

                        {/* Kategori */}
                        <div className="grid gap-3">
                            <Label htmlFor="kategori" className="text-base font-medium">
                                Kategori
                            </Label>
                            <Select
                                value={formData.kategori}
                                onValueChange={(value) => handleInputChange("kategori", value)}
                            >
                                <SelectTrigger className="h-12 text-base border-gray-300 rounded-lg">
                                    <SelectValue placeholder="Pilih kategori obat" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="obat keras">Obat Keras</SelectItem>
                                    <SelectItem value="obat bebas">Obat Bebas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Nomor Batch */}
                            <div className="grid gap-3">
                                <Label htmlFor="nomor-batch" className="text-base font-medium">
                                    Nomor Batch <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="nomor-batch"
                                    value={formData.nomor_batch}
                                    onChange={(e) => handleInputChange("nomor_batch", e.target.value)}
                                    placeholder="Masukkan nomor batch"
                                    className="h-12 text-base border-gray-300 rounded-lg"
                                    required
                                />
                            </div>

                            {/* Tanggal Expired */}
                            <div className="grid gap-3">
                                <Label htmlFor="tanggal-expired" className="text-base font-medium">
                                    Tanggal Expired <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="tanggal-expired"
                                    type="date"
                                    value={formData.kadaluarsa}
                                    onChange={(e) => handleInputChange("kadaluarsa", e.target.value)}
                                    className="h-12 text-base border-gray-300 rounded-lg"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Stok */}
                            <div className="grid gap-3">
                                <Label htmlFor="stok-sekarang" className="text-base font-medium">
                                    Stok <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="stok-sekarang"
                                    type="number"
                                    value={formData.stok_sekarang}
                                    onChange={(e) => handleInputChange("stok_sekarang", e.target.value)}
                                    placeholder="Masukkan jumlah stok"
                                    className="h-12 text-base border-gray-300 rounded-lg"
                                    min="0"
                                    required
                                />
                            </div>

                            {/* Satuan */}
                            <div className="grid gap-3">
                                <Label htmlFor="satuan" className="text-base font-medium">
                                    Satuan <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.satuan}
                                    onValueChange={(value) => handleInputChange("satuan", value)}
                                    required
                                >
                                    <SelectTrigger className="h-12 text-base border-gray-300 rounded-lg">
                                        <SelectValue placeholder="Pilih satuan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="strip">Strip</SelectItem>
                                        <SelectItem value="botol">Botol</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Harga Jual */}
                            <div className="grid gap-3">
                                <Label htmlFor="harga-jual" className="text-base font-medium">
                                    Harga Jual (Rp)
                                </Label>
                                <Input
                                    id="harga-jual"
                                    type="number"
                                    value={formData.harga_jual}
                                    onChange={(e) => handleInputChange("harga_jual", e.target.value)}
                                    placeholder="Masukkan harga jual"
                                    className="h-12 text-base border-gray-300 rounded-lg"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            {/* Supplier */}
                            <div className="grid gap-3">
                                <Label htmlFor="supplier" className="text-base font-medium">
                                    Supplier <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.supplier_id}
                                    onValueChange={(value) => handleInputChange("supplier_id", value)}
                                    required
                                    disabled={loadingSuppliers}
                                >
                                    <SelectTrigger className="h-12 text-base border-gray-300 rounded-lg">
                                        <SelectValue placeholder={
                                            loadingSuppliers ? "Memuat supplier..." : "Pilih supplier"
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {suppliers.map((supplier) => (
                                            <SelectItem key={supplier.id} value={supplier.id}>
                                                {supplier.nama_supplier}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-3 pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                            className="h-12 px-8 text-base border-gray-300 hover:bg-gray-50 flex-1"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-12 px-8 text-base bg-green-600 hover:bg-green-700 text-white flex-1"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                "Simpan Obat"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
