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
import { Textarea } from "@/components/ui/textarea"
import { Edit } from "lucide-react"
import { ObatMaster } from "./data-table"

interface DataEditProps {
    obat: ObatMaster
    onEdit: (id: string, obat: Omit<ObatMaster, 'id'>) => void
}

export function DataEdit({ obat, onEdit }: DataEditProps) {
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        nama: "",
        kategori: "",
        satuan: "",
        hargaJual: "",
        komposisi: ""
    })
    const [isLoading, setIsLoading] = useState(false)

    // Set initial form data when dialog opens
    useEffect(() => {
        if (open && obat) {
            setFormData({
                nama: obat.nama,
                kategori: obat.kategori,
                satuan: obat.satuan,
                hargaJual: obat.hargaJual.toString(),
                komposisi: obat.komposisi
            })
        }
    }, [open, obat])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Validasi form
            if (!formData.nama || !formData.kategori || !formData.satuan || !formData.hargaJual || !formData.komposisi) {
                alert("Semua field harus diisi!")
                return
            }

            // Convert harga to number
            const hargaJual = parseInt(formData.hargaJual)
            if (isNaN(hargaJual) || hargaJual <= 0) {
                alert("Harga jual harus berupa angka yang valid!")
                return
            }

            const updatedObat: Omit<ObatMaster, 'id'> = {
                nama: formData.nama,
                kategori: formData.kategori,
                satuan: formData.satuan,
                hargaJual: hargaJual,
                komposisi: formData.komposisi
            }

            onEdit(obat.id, updatedObat)
            setOpen(false)
        } catch (error) {
            console.error("Error editing obat:", error)
            alert("Terjadi kesalahan saat mengupdate obat!")
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
                                value={formData.nama}
                                onChange={(e) => handleInputChange("nama", e.target.value)}
                                placeholder="Masukkan nama obat"
                                className="h-12 text-base border-gray-300 rounded-lg"
                                required
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="edit-kategori" className="text-base font-semibold text-gray-900">
                                Kategori
                            </Label>
                            <Input
                                id="edit-kategori"
                                value={formData.kategori}
                                onChange={(e) => handleInputChange("kategori", e.target.value)}
                                placeholder="Masukkan kategori obat"
                                className="h-12 text-base border-gray-300 rounded-lg"
                                required
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="edit-hargaJual" className="text-base font-semibold text-gray-900">
                                Harga Jual
                            </Label>
                            <Input
                                id="edit-hargaJual"
                                type="number"
                                value={formData.hargaJual}
                                onChange={(e) => handleInputChange("hargaJual", e.target.value)}
                                placeholder="Masukkan harga jual"
                                className="h-12 text-base border-gray-300 rounded-lg"
                                min="1"
                                required
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="edit-satuan" className="text-base font-semibold text-gray-900">
                                Satuan
                            </Label>
                            <Input
                                id="edit-satuan"
                                value={formData.satuan}
                                onChange={(e) => handleInputChange("satuan", e.target.value)}
                                placeholder="Masukan satuan"
                                className="h-12 text-base border-gray-300 rounded-lg"
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
    )
}