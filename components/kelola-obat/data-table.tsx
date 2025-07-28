"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DataAdd } from "./data-add"
import { DataEdit } from "./data-edit"
import { DataDelete } from "./data-delete"
import { ExpiredMedicine, ExpiredNotification } from "./pengingat-expired"
import { Badge } from "../ui/badge"

export type PengelolaanObat = {
    noBatch: string
    nama: string
    totalStok: number
    satuan: string
    tanggalExpired: string
    supplier: string
}

// Data dengan beberapa obat yang akan expired untuk testing
const initialData: PengelolaanObat[] = [
    {
        noBatch: "12345",
        nama: "Aspirin",
        totalStok: 100,
        satuan: "Tablets",
        tanggalExpired: "2025-08-15", // Akan expired dalam 18 hari
        supplier: "ABC Pharma"
    },
    {
        noBatch: "67890",
        nama: "Ibuprofen",
        totalStok: 12,
        satuan: "Capsules",
        tanggalExpired: "2025-07-30", // Akan expired dalam 2 hari
        supplier: "ABC Pharma"
    },
    {
        noBatch: "24680",
        nama: "Paracetamol",
        totalStok: 7,
        satuan: "Tablets",
        tanggalExpired: "2025-08-25", // Sudah expired
        supplier: "ABC Pharma"
    },
    {
        noBatch: "13579",
        nama: "Amoxicillin",
        totalStok: 12,
        satuan: "Capsules",
        tanggalExpired: "2025-12-31",
        supplier: "ABC Pharma"
    },
    {
        noBatch: "97531",
        nama: "Loratadine",
        totalStok: 34,
        satuan: "Tablets",
        tanggalExpired: "2025-12-31",
        supplier: "ABC Pharma"
    },
    {
        noBatch: "86420",
        nama: "Omeprazole",
        totalStok: 56,
        satuan: "Capsules",
        tanggalExpired: "2025-12-31",
        supplier: "ABC Pharma"
    },
    {
        noBatch: "36925",
        nama: "Simvastatin",
        totalStok: 76,
        satuan: "Tablets",
        tanggalExpired: "2025-12-31",
        supplier: "ABC Pharma"
    },
    {
        noBatch: "74185",
        nama: "Metformin",
        totalStok: 3,
        satuan: "Tablets",
        tanggalExpired: "2025-12-31",
        supplier: "ABC Pharma"
    },
    {
        noBatch: "52896",
        nama: "Ciprofloxacin",
        totalStok: 123,
        satuan: "Tablets",
        tanggalExpired: "2025-12-31",
        supplier: "ABC Pharma"
    },
    {
        noBatch: "15935",
        nama: "Albuterol",
        totalStok: 7,
        satuan: "Inhaler",
        tanggalExpired: "2025-12-31",
        supplier: "ABC Pharma"
    }
]

export function DataTableDemo() {
    const [data, setData] = React.useState<PengelolaanObat[]>(initialData)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [showExpiredModal, setShowExpiredModal] = React.useState(false)

    // Function to calculate days until expiry
    const getDaysUntilExpiry = (expiryDate: string) => {
        const today = new Date()
        const expiry = new Date(expiryDate)
        const diffTime = expiry.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    // Function to check if medicine expires within 30 days
    const isExpiringWithin30Days = (expiryDate: string) => {
        const daysUntilExpiry = getDaysUntilExpiry(expiryDate)
        return daysUntilExpiry <= 30 && daysUntilExpiry >= 0
    }

    // Function to check if medicine is expired
    const isExpired = (expiryDate: string) => {
        const daysUntilExpiry = getDaysUntilExpiry(expiryDate)
        return daysUntilExpiry < 0
    }

    // Get expired and expiring medicines
    const expiredMedicines: ExpiredMedicine[] = data
        .filter(obat => isExpired(obat.tanggalExpired))
        .map(obat => ({
            ...obat,
            daysUntilExpiry: getDaysUntilExpiry(obat.tanggalExpired)
        }))

    const expiringMedicines: ExpiredMedicine[] = data
        .filter(obat => isExpiringWithin30Days(obat.tanggalExpired))
        .map(obat => ({
            ...obat,
            daysUntilExpiry: getDaysUntilExpiry(obat.tanggalExpired)
        }))

    // Show modal automatically when there are expired or expiring medicines
    React.useEffect(() => {
        if (expiredMedicines.length > 0 || expiringMedicines.length > 0) {
            setShowExpiredModal(true)
        }
    }, [expiredMedicines.length, expiringMedicines.length])

    // Function to generate new batch number
    const generateBatchNumber = () => {
        return Math.floor(10000 + Math.random() * 90000).toString()
    }

    // Handle add new obat
    const handleAdd = (newObat: Omit<PengelolaanObat, 'noBatch'>) => {
        const obatWithBatch: PengelolaanObat = {
            ...newObat,
            noBatch: generateBatchNumber()
        }
        setData(prev => [...prev, obatWithBatch])
    }

    // Handle edit obat
    const handleEdit = (noBatch: string, updatedObat: Omit<PengelolaanObat, 'noBatch'>) => {
        setData(prev => prev.map(obat =>
            obat.noBatch === noBatch ? { ...updatedObat, noBatch } : obat
        ))
    }

    // Handle delete obat
    const handleDelete = (noBatch: string) => {
        setData(prev => prev.filter(obat => obat.noBatch !== noBatch))
    }

    const columns: ColumnDef<PengelolaanObat>[] = [
        {
            accessorKey: "noBatch",
            header: "No. Batch",
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("noBatch")}</div>
            ),
        },
        {
            accessorKey: "nama",
            header: () => <div>Nama</div>,
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("nama")}</div>
            )
        },
        {
            accessorKey: "totalStok",
            header: () => <div className="text-center">Total Stok</div>,
            cell: ({ row }) => {
                const stok = parseFloat(row.getValue("totalStok"))
                return <div className="text-center font-medium">{stok}</div>
            },
        },
        {
            accessorKey: "satuan",
            header: "Satuan",
            cell: ({ row }) => (
                <div>{row.getValue("satuan")}</div>
            ),
        },
        {
            accessorKey: "tanggalExpired",
            header: "Tanggal Expired",
            cell: ({ row }) => (
                <div>
                    {row.getValue("tanggalExpired")}
                </div>
            ),
        },
        {
            accessorKey: "supplier",
            header: "Supplier",
            cell: ({ row }) => (
                <div>{row.getValue("supplier")}</div>
            ),
        },
        {
            id: "actions",
            header: "Action",
            enableHiding: false,
            cell: ({ row }) => {
                const obat = row.original

                return (
                    <div className="flex space-x-2">
                        <DataEdit obat={obat} onEdit={handleEdit} />
                        <DataDelete obat={obat} onDelete={handleDelete} />
                    </div>
                )
            },
        },
    ]

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="w-full space-y-4">
            {/* Header dengan tombol Tambah Obat */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold mb-4">Pengelolaan Obat</h1>
                <DataAdd onAdd={handleAdd} />
            </div>

            {/* Expired Notification Modal */}
            <ExpiredNotification
                isOpen={showExpiredModal}
                onClose={() => setShowExpiredModal(false)}
                expiredMedicines={expiredMedicines}
                expiringMedicines={expiringMedicines}
            />

            {/* Table */}
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader className="bg-gray-50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="font-semibold text-gray-700">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover:bg-gray-50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}