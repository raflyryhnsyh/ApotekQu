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
import { Edit } from "lucide-react"
import { PengelolaanObat } from "./data-table"

interface DataEditProps {
    obat: PengelolaanObat
    onEdit: (noBatch: string, obat: Omit<PengelolaanObat, 'noBatch'>) => void
}

export function DataEdit({ obat, onEdit }: DataEditProps) {
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        nama: "",
        noBatch: "",
        tanggalExpired: "",
        totalStok: "",
        satuan: "",
        supplier: ""
    })
    const [isLoading, setIsLoading] = useState(false)

    // Set initial form data when dialog opens
    useEffect(() => {
        if (open && obat) {
            setFormData({
                nama: obat.nama,
                noBatch: obat.noBatch,
                tanggalExpired: obat.tanggalExpired,
                totalStok: obat.totalStok.toString(),
                satuan: obat.satuan,
                supplier: obat.supplier
            })
        }
    }, [open, obat])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Validasi form
            if (!formData.nama || !formData.tanggalExpired || !formData.totalStok || !formData.satuan || !formData.supplier) {
                alert("Semua field harus diisi!")
                return
            }

            // Convert stok to number
            const totalStok = parseInt(formData.totalStok)
            if (isNaN(totalStok) || totalStok <= 0) {
                alert("Total stok harus berupa angka yang valid!")
                return
            }

            const updatedObat: Omit<PengelolaanObat, 'noBatch'> = {
                nama: formData.nama,
                totalStok: totalStok,
                satuan: formData.satuan,
                tanggalExpired: formData.tanggalExpired,
                supplier: formData.supplier
            }

            onEdit(obat.noBatch, updatedObat)
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
                            <Label htmlFor="edit-nomor-batch" className="text-base font-semibold text-gray-900">
                                Nomor Batch
                            </Label>
                            <Input
                                id="edit-nomor-batch"
                                value={formData.noBatch}
                                className="h-12 text-base border-gray-300 rounded-lg bg-gray-100"
                                disabled
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="edit-tanggal-expired" className="text-base font-semibold text-gray-900">
                                Tanggal Expired
                            </Label>
                            <Input
                                id="edit-tanggal-expired"
                                type="date"
                                value={formData.tanggalExpired}
                                onChange={(e) => handleInputChange("tanggalExpired", e.target.value)}
                                className="h-12 text-base border-gray-300 rounded-lg"
                                required
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="edit-total-stok" className="text-base font-semibold text-gray-900">
                                Total Stok
                            </Label>
                            <Input
                                id="edit-total-stok"
                                type="number"
                                value={formData.totalStok}
                                onChange={(e) => handleInputChange("totalStok", e.target.value)}
                                placeholder="Masukan total stok"
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