"use client"

import * as React from "react"
import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { ObatResponse, createObat } from "@/lib/api/obat-management"
import { SuccessToast } from "@/components/ui/successalert"

interface DataAddProps {
    onAdd: (obat: ObatResponse) => void
}

export function DataAdd({ onAdd }: DataAddProps) {
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        nama_obat: "",
        kategori: "",
        komposisi: "",
        satuan: "",
        harga_jual: 0
    })
    const [isLoading, setIsLoading] = useState(false)
    const [showSuccessToast, setShowSuccessToast] = useState(false)
    const [showErrorToast, setShowErrorToast] = useState(false)
    const [validationError, setValidationError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Validasi form
            if (!formData.nama_obat || !formData.kategori || !formData.komposisi || !formData.satuan || !formData.harga_jual) {
                setValidationError("Semua field harus diisi!")
                setShowErrorToast(true)
                return
            }

            // Call API to create obat
            const newObat = await createObat(formData)

            // Add to table
            onAdd(newObat)

            // Reset form and close dialog
            setFormData({
                nama_obat: "",
                kategori: "",
                komposisi: "",
                satuan: "",
                harga_jual: 0
            })
            setOpen(false)
            setShowSuccessToast(true)

        } catch (error) {
            console.error('Error creating obat:', error)
            setValidationError('Gagal menambah obat. Silakan coba lagi.')
            setShowErrorToast(true)
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        className="mb-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 h-12 text-base"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Tambah Obat
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-left">
                            Tambah Obat Baru
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6 py-6">
                            <div className="grid gap-3">
                                <Label htmlFor="nama" className="text-base font-semibold text-gray-900">
                                    Nama Obat
                                </Label>
                                <Input
                                    id="nama"
                                    value={formData.nama_obat}
                                    onChange={(e) => handleInputChange("nama_obat", e.target.value)}
                                    placeholder="Masukkan nama obat"
                                    className="h-12 text-base border-gray-300 rounded-lg"
                                    required
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="kategori" className="text-base font-semibold text-gray-900">
                                    Kategori
                                </Label>
                                <Select
                                    value={formData.kategori}
                                    onValueChange={(value) => handleInputChange("kategori", value)}
                                    required
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

                            <div className="grid gap-3">
                                <Label htmlFor="satuan" className="text-base font-semibold text-gray-900">
                                    Satuan
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

                            <div className="grid gap-3">
                                <Label htmlFor="harga_jual" className="text-base font-semibold text-gray-900">
                                    Harga Jual
                                </Label>
                                <Input
                                    id="harga_jual"
                                    type="number"
                                    value={formData.harga_jual}
                                    onChange={(e) => handleInputChange("harga_jual", parseFloat(e.target.value) || 0)}
                                    placeholder="Masukkan harga jual"
                                    className="h-12 text-base border-gray-300 rounded-lg"
                                    min="0"
                                    step="500"
                                    required
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="komposisi" className="text-base font-semibold text-gray-900">
                                    Komposisi
                                </Label>
                                <Textarea
                                    id="komposisi"
                                    value={formData.komposisi}
                                    onChange={(e) => handleInputChange("komposisi", e.target.value)}
                                    placeholder="Masukan komposisi obat"
                                    className="min-h-[100px] text-base border-gray-300 rounded-lg resize-none"
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-3 pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isLoading}
                                className="h-12 px-8 text-base border-gray-300 hover:bg-gray-50"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="h-12 px-8 text-base bg-green-600 hover:bg-green-700"
                                disabled={isLoading}
                            >
                                {isLoading ? "Menyimpan..." : "Tambah"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Success Toast */}
            <SuccessToast
                isOpen={showSuccessToast}
                onClose={() => setShowSuccessToast(false)}
            >
                Obat berhasil ditambahkan!
            </SuccessToast>

            {/* Error Toast */}
            {showErrorToast && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm">
                    <div className="flex items-center gap-4 rounded-lg bg-red-100 p-4 text-red-800 shadow-lg">
                        <div className="flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                        </div>
                        <div className="flex-1 text-sm font-medium">
                            {validationError}
                        </div>
                        <button onClick={() => setShowErrorToast(false)} className="flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
