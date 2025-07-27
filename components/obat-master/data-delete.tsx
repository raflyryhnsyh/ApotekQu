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
import { ObatMaster } from "./data-table"

interface DataDeleteProps {
    obat: ObatMaster
    onDelete: (id: string) => void
}

export function DataDelete({ obat, onDelete }: DataDeleteProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleDelete = async () => {
        setIsLoading(true)

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))

            onDelete(obat.id)
            setOpen(false)
        } catch (error) {
            console.error("Error deleting obat:", error)
            alert("Terjadi kesalahan saat menghapus obat!")
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
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                            <AlertTriangle className="h-8 w-8 text-yellow-600" />
                        </div>
                    </div>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        Hapus Data Obat {obat.nama}?
                    </DialogTitle>
                </DialogHeader>

                <div className="text-center py-4">
                    <p className="text-base text-gray-600">
                        Data Obat yang anda hapus tidak dapat dikembalikan.
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
                        {isLoading ? "Menghapus..." : "Hapus"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}