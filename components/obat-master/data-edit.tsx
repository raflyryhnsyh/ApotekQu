'use client'

import React, { useState } from 'react'
import { Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ObatResponse, updateObat } from '@/lib/api/obat-management'
import { SuccessToast } from '@/components/ui/successalert'

interface DataEditProps {
    obat: ObatResponse
    onClose: () => void
}

export default function DataEdit({ obat, onClose }: DataEditProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [showSuccessToast, setShowSuccessToast] = useState(false)
    const [showErrorToast, setShowErrorToast] = useState(false)
    const [validationError, setValidationError] = useState("")
    const [formData, setFormData] = useState({
        nama_obat: obat.nama_obat,
        kategori: obat.kategori,
        komposisi: obat.komposisi || '',
        satuan: obat.satuan || '',
        harga_jual: obat.harga_jual || 0,
    })

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

            // Update obat using API
            await updateObat(obat.id, formData)

            // Close dialog first, then show success toast
            setOpen(false)
            onClose()
            setShowSuccessToast(true)

        } catch (error) {
            console.error('Error updating obat:', error)
            setValidationError('Gagal mengupdate obat. Silakan coba lagi.')
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
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-left">
                            Edit Obat
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6 py-6">
                            <div className="grid gap-3">
                                <Label htmlFor="edit-nama" className="text-base font-semibold text-gray-900">
                                    Nama Obat
                                </Label>
                                <Input
                                    id="edit-nama"
                                    value={formData.nama_obat}
                                    onChange={(e) => handleInputChange("nama_obat", e.target.value)}
                                    placeholder="Masukkan nama obat"
                                    className="h-12 text-base border-gray-300 rounded-lg"
                                    required
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="edit-kategori" className="text-base font-semibold text-gray-900">
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
                                <Label htmlFor="edit-satuan" className="text-base font-semibold text-gray-900">
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
                                <Label htmlFor="edit-harga_jual" className="text-base font-semibold text-gray-900">
                                    Harga Jual
                                </Label>
                                <Input
                                    id="edit-harga_jual"
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
                                <Label htmlFor="edit-komposisi" className="text-base font-semibold text-gray-900">
                                    Komposisi
                                </Label>
                                <Textarea
                                    id="edit-komposisi"
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
                                {isLoading ? "Menyimpan..." : "Edit"}
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
                Obat berhasil diupdate!
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
