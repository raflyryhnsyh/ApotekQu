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
import { Trash2, AlertTriangle } from "lucide-react"
import { ObatResponse, deleteObat } from "@/lib/api/obat-management"
import { SuccessToast } from "@/components/ui/successalert"

interface DataDeleteProps {
    obat: ObatResponse
    onDelete: () => void
}

export default function DataDelete({ obat, onDelete }: DataDeleteProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [showSuccessToast, setShowSuccessToast] = useState(false)
    const [showErrorToast, setShowErrorToast] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const handleDelete = async () => {
        setIsLoading(true)

        try {
            // Call API to delete obat
            await deleteObat(obat.id)

            // Close dialog and trigger parent refresh
            setOpen(false)
            onDelete()
            setShowSuccessToast(true)

        } catch (error) {
            console.error("Error deleting obat:", error)
            setErrorMessage("Terjadi kesalahan saat menghapus obat!")
            setShowErrorToast(true)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                        <DialogTitle className="text-xl font-bold text-left">
                            Konfirmasi Hapus
                        </DialogTitle>
                    </div>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-gray-700">
                        Apakah Anda yakin ingin menghapus obat <span className="font-semibold">"{obat.nama_obat}"</span>?
                    </p>
                    <p className="text-sm text-red-600 mt-2">
                        Data yang dihapus tidak dapat dikembalikan.
                    </p>
                </div>
                <DialogFooter className="gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isLoading}
                        className="h-10 px-6"
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="h-10 px-6"
                    >
                        {isLoading ? "Menghapus..." : "Hapus"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
