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
import { Edit, Loader2 } from "lucide-react"
import { updateKelolaObat, getKelolaObatByBatch } from "@/lib/api/kelola-obat"
import { PengelolaanObat } from "./data-table"
import { Toast, ToastType } from "@/components/ui/toast"

interface DataEditProps {
    data?: {
        nomor_batch: string
        nama_obat: string
        stok_sekarang: number
        satuan: string
        harga_jual: number
        kadaluarsa: string
        nama_supplier: string
        supplier_id?: string
        kategori?: string
        komposisi?: string
        id_barang_diterima?: string
        id_pp?: string
        id_obat?: string  // Added for batch generation
    }
    obat?: PengelolaanObat
    onEdit?: () => void
    onSuccess?: () => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

interface Supplier {
    id: string
    nama_supplier: string
    alamat?: string
}

export function DataEdit({ data, obat, onEdit, onSuccess, open: externalOpen, onOpenChange: externalOnOpenChange }: DataEditProps) {
    const [open, setOpen] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastType, setToastType] = useState<ToastType>("success")
    const [toastMessage, setToastMessage] = useState("")

    // Use external open state if provided, otherwise use internal
    const isOpen = externalOpen !== undefined ? externalOpen : open
    const handleOpenChange = externalOnOpenChange || setOpen
    
    // Support both data formats
    const noBatch = data?.nomor_batch || obat?.noBatch || ""
    const namaObat = data?.nama_obat || obat?.nama || ""
    const idObat = data?.id_obat || ""
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
    const [loadingSuppliers, setLoadingSuppliers] = useState(false)
    const [loadingData, setLoadingData] = useState(false)
    const [generatingBatch, setGeneratingBatch] = useState(false)

    // Fetch actual obat data from API
    const fetchObatData = useCallback(async () => {
        if (!noBatch) {
            return
        }
        
        try {
            setLoadingData(true)
            const response = await getKelolaObatByBatch(noBatch)

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

                // Format date for input[type="date"] (YYYY-MM-DD)
                const formattedDate = data.kadaluarsa ? new Date(data.kadaluarsa).toISOString().split('T')[0] : ""

                const newFormData = {
                    nama_obat: data.nama_obat || "",
                    komposisi: data.komposisi || "",
                    kategori: data.kategori || "",
                    nomor_batch: noBatch,
                    kadaluarsa: formattedDate,
                    stok_sekarang: data.stok_sekarang?.toString() || "",
                    satuan: data.satuan || "",
                    harga_jual: data.harga_jual?.toString() || "",
                    supplier_id: data.supplier_id || ""
                }
                
                setFormData(newFormData)
            }
        } catch (error) {
            console.error('Error fetching obat data:', error)
        } finally {
            setLoadingData(false)
        }
    }, [noBatch])

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

    const generateBatchNumber = useCallback(async () => {
        if (!idObat) return
        
        try {
            setGeneratingBatch(true)
            const response = await fetch('/api/generate-batch-number', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_obat: idObat })
            })
            
            if (response.ok) {
                const result = await response.json()
                setFormData(prev => ({
                    ...prev,
                    nomor_batch: result.batch_number
                }))
            }
        } catch (error) {
            console.error('Error generating batch number:', error)
        } finally {
            setGeneratingBatch(false)
        }
    }, [idObat])

    // Fetch data when dialog opens
    useEffect(() => {
        if (isOpen) {
            // If noBatch exists, fetch from API
            if (noBatch) {
                fetchObatData()
            } else if (data) {
                // If no batch but has data prop, pre-populate form from prop (incomplete medicine)
                setFormData({
                    nama_obat: data.nama_obat || "",
                    komposisi: data.komposisi || "",
                    kategori: data.kategori || "",
                    nomor_batch: data.nomor_batch || "",
                    kadaluarsa: data.kadaluarsa || "",
                    stok_sekarang: data.stok_sekarang?.toString() || "",
                    satuan: data.satuan || "",
                    harga_jual: data.harga_jual?.toString() || "",
                    supplier_id: ""
                })
                
                // Auto-generate batch number if empty and id_obat exists
                if (!data.nomor_batch && idObat) {
                    generateBatchNumber()
                }
            }
            
            if (suppliers.length === 0) {
                fetchSuppliers()
            }
        }
    }, [isOpen, noBatch, data, fetchObatData, suppliers.length, fetchSuppliers, idObat, generateBatchNumber])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        
        try {
            // Validasi form
            if (!formData.nama_obat || !formData.nomor_batch || !formData.kadaluarsa || !formData.stok_sekarang || !formData.satuan) {
                setToastType("warning")
                setToastMessage("Field yang wajib harus diisi!")
                setShowToast(true)
                setIsLoading(false)
                return
            }

            // Convert stok and harga to number
            const stok = parseInt(formData.stok_sekarang)
            const harga = parseFloat(formData.harga_jual) || 0

            if (isNaN(stok) || stok < 0) {
                setToastType("warning")
                setToastMessage("Stok harus berupa angka yang valid!")
                setShowToast(true)
                setIsLoading(false)
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
                supplier_id: data?.supplier_id,
                id_barang_diterima: data?.id_barang_diterima,
                id_pp: data?.id_pp
            }

            // If noBatch is empty (incomplete medicine), use POST to create new
            // Otherwise use PUT to update existing
            if (!noBatch || noBatch.trim() === '') {
                // Create new detail_obat (incomplete medicine completion)
                const response = await fetch('/api/kelola-obat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataToSubmit)
                })
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Gagal menyimpan data obat' }))
                    throw new Error(errorData.error || 'Gagal menyimpan data obat')
                }
            } else {
                // Update existing detail_obat
                await updateKelolaObat(noBatch, dataToSubmit)
            }

            // Show success toast first
            setToastType("success")
            setToastMessage(noBatch ? "Obat berhasil diupdate!" : "Obat berhasil dilengkapi!")
            setShowToast(true)

            // Delay close dialog so toast can be seen
            setTimeout(() => {
                handleOpenChange(false)
                if (onEdit) {
                    onEdit() // Refresh parent data
                } else if (onSuccess) {
                    onSuccess()
                }
            }, 500) // 500ms delay so user sees the toast

        } catch (error: unknown) {
            console.error("Error updating obat:", error)
            const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat mengupdate obat!"
            setToastType("error")
            setToastMessage(errorMessage)
            setShowToast(true)
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
                        Edit Obat - {namaObat}
                    </DialogTitle>
                </DialogHeader>

                {loadingData ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-sm text-gray-600">Memuat data...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6 py-6">
                            {/* Nama Obat */}
                            <div className="grid gap-3">
                                <Label htmlFor="edit-nama-obat" className="text-base font-medium">
                                    Nama Obat <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="edit-nama-obat"
                                    value={formData.nama_obat}
                                    onChange={(e) => handleInputChange("nama_obat", e.target.value)}
                                    placeholder="Nama obat"
                                    className="h-12 text-base border-gray-300 rounded-lg"
                                    required
                                />
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
                                {/* Nomor Batch */}
                                <div className="grid gap-3">
                                    <Label htmlFor="edit-nomor-batch" className="text-base font-medium">
                                        Nomor Batch {!noBatch && "(Auto-Generated)"} <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="edit-nomor-batch"
                                            value={formData.nomor_batch || noBatch}
                                            onChange={(e) => handleInputChange("nomor_batch", e.target.value)}
                                            placeholder="Nomor batch"
                                            className="h-12 text-base border-gray-300 rounded-lg"
                                            readOnly={!noBatch && !!idObat}
                                            style={!noBatch && idObat ? { backgroundColor: '#f9fafb' } : {}}
                                            required
                                        />
                                        {!noBatch && idObat && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={generateBatchNumber}
                                                disabled={generatingBatch}
                                                className="flex-shrink-0 h-12"
                                            >
                                                {generatingBatch ? <Loader2 className="h-4 w-4 animate-spin" /> : "🔄"}
                                            </Button>
                                        )}
                                    </div>
                                    {!noBatch && idObat && (
                                        <p className="text-xs text-gray-500">Format: KODE-YYYY-XXX (contoh: AMOX-2026-001)</p>
                                    )}
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

                                {/* Supplier - Read Only */}
                                <div className="grid gap-3">
                                    <Label htmlFor="edit-supplier" className="text-base font-medium text-gray-500">
                                        Supplier (Tidak dapat diubah)
                                    </Label>
                                    <Input
                                        id="edit-supplier"
                                        type="text"
                                        value={data?.nama_supplier || 'N/A'}
                                        disabled
                                        className="h-12 text-base border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500 -mt-1">
                                        Supplier terikat dengan Purchase Order dan tidak dapat diubah
                                    </p>
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
