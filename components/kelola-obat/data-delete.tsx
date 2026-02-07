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
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { PengelolaanObat } from "./data-table"

interface DataDeleteProps {
    data?: {
        nomor_batch: string
        nama_obat: string
    }
    obat?: PengelolaanObat
    onDelete?: (noBatch: string) => void
    onSuccess?: () => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function DataDelete({ data, obat, onDelete, onSuccess, open: externalOpen, onOpenChange: externalOnOpenChange }: DataDeleteProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    
    // Support both data formats
    const noBatch = data?.nomor_batch || obat?.noBatch || ""
    const namaObat = data?.nama_obat || obat?.nama || ""

    const handleDelete = async () => {
        setIsLoading(true)

        try {
            if (onDelete) {
                await onDelete(noBatch)
            } else if (onSuccess) {
                // Call API directly
                const response = await fetch(`/api/kelola-obat/${noBatch}`, {
                    method: 'DELETE'
                })
                if (!response.ok) throw new Error('Failed to delete')
                await onSuccess()
            }
            setOpen(false)
            if (externalOnOpenChange) {
                externalOnOpenChange(false)
            }
        } catch (error) {
            console.error("Error deleting obat:", error)
            alert("Terjadi kesalahan saat menghapus obat!")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={externalOpen !== undefined ? externalOpen : open} onOpenChange={externalOnOpenChange || setOpen}>
            {externalOpen === undefined && (
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                            <AlertTriangle className="h-8 w-8 text-yellow-600" />
                        </div>
                    </div>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        Hapus Data Obat?
                    </DialogTitle>
                </DialogHeader>

                <div className="text-center py-4">
                    <p className="text-base text-gray-600 mb-2">
                        Anda akan menghapus obat:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="font-semibold text-lg">{namaObat}</p>
                        <p className="text-sm text-gray-600">No. Batch: {noBatch}</p>
                    </div>
                    <p className="text-sm text-red-600 font-medium">
                        Data yang dihapus tidak dapat dikembalikan.
                    </p>
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
                        type="button"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="h-12 px-8 text-base bg-red-600 hover:bg-red-700 text-white flex-1"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menghapus...
                            </>
                        ) : (
                            "Hapus"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
