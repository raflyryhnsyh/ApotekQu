"use client"

import * as React from "react"
import { useState, useEffect } from "react"
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
import { Edit, Loader2 } from "lucide-react"
import { updateKelolaObat, getKelolaObatByBatch } from "@/lib/api/kelola-obat"
import { PengelolaanObat } from "./data-table"

interface DataEditProps {
    obat: PengelolaanObat
    onEdit: () => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
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

export function DataEdit({ obat, onEdit, open: externalOpen, onOpenChange: externalOnOpenChange }: DataEditProps) {
    const [open, setOpen] = useState(false)

    // Use external open state if provided, otherwise use internal
    const isOpen = externalOpen !== undefined ? externalOpen : open
    const handleOpenChange = externalOnOpenChange || setOpen
    const [formData, setFormData] = useState({
        nama_obat: "",
        komposisi: "",
        kategori: "",
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
    const [loadingData, setLoadingData] = useState(false)

    // Fetch data when dialog opens
    useEffect(() => {
        if (isOpen && obat) {
            fetchObatData()
            if (suppliers.length === 0) {
                fetchSuppliers()
            }
            if (obatList.length === 0) {
                fetchObatList()
            }
        }
    }, [isOpen, obat])

    // Fetch actual obat data from API
    const fetchObatData = async () => {
        try {
            setLoadingData(true)
            console.log('Fetching data for batch:', obat.noBatch) // Debug log
            const response = await getKelolaObatByBatch(obat.noBatch)

            console.log('API Response:', response) // Debug log

            if (response.success && response.data) {
                // Add a type for the data object
                type ObatApiResponse = {
                    nama_obat?: string
                    komposisi?: string
                    kategori?: string
                    kadaluarsa?: string
                    stok_sekarang?: number
                    satuan?: string
                    harga_jual?: number
                    supplier_id?: string
                }
                const data = response.data as ObatApiResponse
                console.log('Setting form data:', data) // Debug log

                // Format date for input[type="date"] (YYYY-MM-DD)
                const formattedDate = data.kadaluarsa ? new Date(data.kadaluarsa).toISOString().split('T')[0] : ""

                setFormData({
                    nama_obat: data.nama_obat || "",
                    komposisi: data.komposisi || "",
                    kategori: data.kategori || "",
                    kadaluarsa: formattedDate,
                    stok_sekarang: data.stok_sekarang?.toString() || "",
                    satuan: data.satuan || "",
                    harga_jual: data.harga_jual?.toString() || "",
                    supplier_id: data.supplier_id || ""
                })
            }
        } catch (error) {
            console.error('Error fetching obat data:', error)
        } finally {
            setLoadingData(false)
        }
    }

    const fetchSuppliers = async () => {
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
    }

    const fetchObatList = async () => {
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
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Validasi form
            if (!formData.nama_obat || !formData.kadaluarsa || !formData.stok_sekarang || !formData.satuan) {
                alert("Field yang wajib harus diisi!")
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
                kadaluarsa: formData.kadaluarsa,
                stok_sekarang: stok,
                satuan: formData.satuan,
                harga_jual: harga,
                supplier_id: formData.supplier_id || undefined
            }

            await updateKelolaObat(obat.noBatch, dataToSubmit)

            handleOpenChange(false)
            onEdit() // Refresh parent data
            alert("Obat berhasil diupdate!")

        } catch (error: unknown) {
            console.error("Error updating obat:", error)
            const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat mengupdate obat!"
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
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {externalOpen === undefined && (
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-left">
                        Edit Obat - {obat.nama}
                    </DialogTitle>
                </DialogHeader>

                {loadingData ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center gap-3">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="text-lg">Memuat data obat...</span>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6 py-6">
                            {/* Nama Obat */}
                            <div className="grid gap-3">
                                <Label htmlFor="edit-nama-obat" className="text-base font-medium">
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
                                <Label htmlFor="edit-komposisi" className="text-base font-medium">
                                    Komposisi
                                </Label>
                                <Textarea
                                    id="edit-komposisi"
                                    value={formData.komposisi}
                                    onChange={(e) => handleInputChange("komposisi", e.target.value)}
                                    placeholder="Masukkan komposisi obat"
                                    className="text-base border-gray-300 rounded-lg"
                                    rows={3}
                                />
                            </div>

                            {/* Kategori */}
                            <div className="grid gap-3">
                                <Label htmlFor="edit-kategori" className="text-base font-medium">
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
                                {/* Nomor Batch - Read Only */}
                                <div className="grid gap-3">
                                    <Label htmlFor="edit-nomor-batch" className="text-base font-medium">
                                        Nomor Batch
                                    </Label>
                                    <Input
                                        id="edit-nomor-batch"
                                        value={obat.noBatch}
                                        className="h-12 text-base border-gray-300 rounded-lg bg-gray-100"
                                        disabled
                                    />
                                </div>

                                {/* Tanggal Expired */}
                                <div className="grid gap-3">
                                    <Label htmlFor="edit-tanggal-expired" className="text-base font-medium">
                                        Tanggal Expired <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="edit-tanggal-expired"
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
                                    <Label htmlFor="edit-stok-sekarang" className="text-base font-medium">
                                        Stok <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="edit-stok-sekarang"
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
                                    <Label htmlFor="edit-satuan" className="text-base font-medium">
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
                                    <Label htmlFor="edit-harga-jual" className="text-base font-medium">
                                        Harga Jual (Rp)
                                    </Label>
                                    <Input
                                        id="edit-harga-jual"
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
                                    <Label htmlFor="edit-supplier" className="text-base font-medium">
                                        Supplier
                                    </Label>
                                    <Select
                                        value={formData.supplier_id}
                                        onValueChange={(value) => handleInputChange("supplier_id", value)}
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
                                onClick={() => handleOpenChange(false)}
                                disabled={isLoading}
                                className="h-12 px-8 text-base border-gray-300 hover:bg-gray-50 flex-1"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white flex-1"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    "Update Obat"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
