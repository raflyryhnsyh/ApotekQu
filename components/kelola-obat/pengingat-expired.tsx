"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export type ExpiredMedicine = {
    noBatch: string
    nama: string
    totalStok: number
    tanggalExpired: string
    daysUntilExpiry: number
}

interface ExpiredNotificationProps {
    isOpen: boolean
    onClose: () => void
    expiredMedicines: ExpiredMedicine[]
    expiringMedicines: ExpiredMedicine[]
}

export function ExpiredNotification({
    isOpen,
    onClose,
    expiredMedicines,
    expiringMedicines
}: ExpiredNotificationProps) {
    const allMedicines = [...expiredMedicines, ...expiringMedicines]

    if (allMedicines.length === 0) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-800">
                        Pengingat Expired
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-gray-600">
                        Obat-obatan berikut ini akan segera <strong>kadaluwarsa</strong>. Mohon ambil tindakan yang diperlukan.
                    </p>

                    <div className="space-y-4">
                        {allMedicines.map((medicine, index) => {
                            const isExpired = medicine.daysUntilExpiry < 0
                            const isExpiringSoon = medicine.daysUntilExpiry <= 30 && medicine.daysUntilExpiry >= 0

                            return (
                                <div
                                    key={medicine.noBatch}
                                    className={`p-4 rounded-lg border-l-4 ${isExpired
                                            ? 'bg-red-50 border-l-red-500'
                                            : 'bg-yellow-50 border-l-yellow-500'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-lg text-gray-800">
                                                {medicine.nama}
                                            </h3>
                                            <p className="text-gray-600">
                                                Stok Sekarang: {medicine.totalStok}
                                            </p>
                                            <p className="text-gray-600">
                                                No. Batch: {medicine.noBatch}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            {isExpired ? (
                                                <Badge variant="destructive" className="mb-2">
                                                    EXPIRED
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="mb-2 bg-yellow-100 text-yellow-800">
                                                    AKAN EXPIRED
                                                </Badge>
                                            )}
                                            <p className="text-sm font-medium text-gray-700">
                                                {isExpired
                                                    ? `Expired ${Math.abs(medicine.daysUntilExpiry)} hari yang lalu`
                                                    : `Expired dalam ${medicine.daysUntilExpiry} hari`
                                                }
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Tanggal: {medicine.tanggalExpired}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <Button
                            onClick={onClose}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-8"
                        >
                            Tutup
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}