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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { PengelolaanObat } from "./data-table"

interface DataAddProps {
    onAdd: (obat: Omit<PengelolaanObat, 'noBatch'>) => void
}

export function DataAdd({ onAdd }: DataAddProps) {
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        nama: "",
        noBatch: "",
        tanggalExpired: "",
        totalStok: "",
        supplier: ""
    })
    const [isLoading, setIsLoading] = useState(false)

    // Sample obat options
    const obatOptions = [
        "Aspirin",
        "Ibuprofen",
        "Paracetamol",
        "Amoxicillin",
        "Loratadine",
        "Omeprazole",
        "Simvastatin",
        "Metformin",
        "Ciprofloxacin",
        "Albuterol"
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Validasi form
            if (!formData.nama || !formData.noBatch || !formData.tanggalExpired || !formData.totalStok || !formData.supplier) {
                alert("Semua field harus diisi!")
                return
            }

            // Convert stok to number
            const totalStok = parseInt(formData.totalStok)
            if (isNaN(totalStok) || totalStok <= 0) {
                alert("Total stok harus berupa angka yang valid!")
                return
            }

            // Set satuan based on obat name (simplified logic)
            let satuan = "Tablets"
            if (formData.nama.includes("Capsule") || formData.nama === "Ibuprofen" || formData.nama === "Amoxicillin" || formData.nama === "Omeprazole") {
                satuan = "Capsules"
            } else if (formData.nama === "Albuterol") {
                satuan = "Inhaler"
            }

            const newObat: Omit<PengelolaanObat, 'noBatch'> = {
                nama: formData.nama,
                totalStok: totalStok,
                satuan: satuan,
                tanggalExpired: formData.tanggalExpired,
                supplier: formData.supplier
            }

            onAdd(newObat)

            // Reset form
            setFormData({
                nama: "",
                noBatch: "",
                tanggalExpired: "",
                totalStok: "",
                supplier: ""
            })

            setOpen(false)
        } catch (error) {
            console.error("Error adding obat:", error)
            alert("Terjadi kesalahan saat menambah obat!")
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
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-left">
                        Tambah Obat
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 py-6">
                        <div className="grid gap-3">
                            <Label htmlFor="pilih-obat" className="text-base font-semibold text-gray-900">
                                Pilih Obat
                            </Label>
                            <Select
                                value={formData.nama}
                                onValueChange={(value) => handleInputChange("nama", value)}
                                required
                            >
                                <SelectTrigger className="h-12 text-base border-gray-300 rounded-lg">
                                    <SelectValue placeholder="Pilih Obat" />
                                </SelectTrigger>
                                <SelectContent>
                                    {obatOptions.map((obat) => (
                                        <SelectItem key={obat} value={obat}>
                                            {obat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="nomor-batch" className="text-base font-semibold text-gray-900">
                                Nomor Batch
                            </Label>
                            <Input
                                id="nomor-batch"
                                value={formData.noBatch}
                                onChange={(e) => handleInputChange("noBatch", e.target.value)}
                                placeholder="Masukan nomor batch obat"
                                className="h-12 text-base border-gray-300 rounded-lg"
                                required
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="tanggal-expired" className="text-base font-semibold text-gray-900">
                                Tanggal Expired
                            </Label>
                            <Input
                                id="tanggal-expired"
                                type="date"
                                value={formData.tanggalExpired}
                                onChange={(e) => handleInputChange("tanggalExpired", e.target.value)}
                                placeholder="Masukan tanggal expired"
                                className="h-12 text-base border-gray-300 rounded-lg"
                                required
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="total-stok" className="text-base font-semibold text-gray-900">
                                Total Stok
                            </Label>
                            <Input
                                id="total-stok"
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
                            <Label htmlFor="supplier" className="text-base font-semibold text-gray-900">
                                Supplier
                            </Label>
                            <Input
                                id="supplier"
                                value={formData.supplier}
                                onChange={(e) => handleInputChange("supplier", e.target.value)}
                                placeholder="Masukan supplier obat"
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
                            {isLoading ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}