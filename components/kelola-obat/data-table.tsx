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
import { ArrowUpDown, Loader2, AlertTriangle, Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DataAdd } from "./data-add"
import { DataEdit } from "./data-edit"
import { DataDelete } from "./data-delete"
import { ExpiredMedicine, ExpiredNotification } from "./pengingat-expired"
import { getKelolaObatData, deleteKelolaObat } from "@/lib/api/kelola-obat"

export type PengelolaanObat = {
    noBatch: string
    nama: string
    totalStok: number
    satuan: string
    tanggalExpired: string
    supplier: string
    harga_jual?: number
    kategori?: string
    komposisi?: string
    id_obat?: string
}

export function DataTableDemo() {
    const [data, setData] = React.useState<PengelolaanObat[]>([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [showExpiredModal, setShowExpiredModal] = React.useState(false)
    const [searchValue, setSearchValue] = React.useState("")
    const [editingObat, setEditingObat] = React.useState<PengelolaanObat | null>(null)
    const [deletingObat, setDeletingObat] = React.useState<PengelolaanObat | null>(null)

    // Function to fetch data from API
    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await getKelolaObatData({
                search: searchValue || undefined,
                limit: 100 // Get more data for better UX
            })

            if (response.success) {
                setData(response.data)
            } else {
                setError('Gagal memuat data')
            }
        } catch (err) {
            console.error('Error fetching data:', err)
            setError('Gagal memuat data obat')
        } finally {
            setLoading(false)
        }
    }

    // Initial data fetch
    React.useEffect(() => {
        fetchData()
    }, [])

    // Search with debounce
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (!loading) {
                fetchData()
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [searchValue])

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
        if (!loading && data.length > 0 && (expiredMedicines.length > 0 || expiringMedicines.length > 0)) {
            setShowExpiredModal(true)
        }
    }, [expiredMedicines.length, expiringMedicines.length, loading, data.length])

    // Handle add new obat
    const handleAdd = async () => {
        // Refresh data after add
        await fetchData()
    }

    // Handle edit obat
    const handleEdit = async () => {
        // Refresh data after edit
        await fetchData()
    }

    // Handle delete obat
    const handleDelete = async (noBatch: string) => {
        try {
            await deleteKelolaObat(noBatch)
            // Refresh data after delete
            await fetchData()
        } catch (error) {
            console.error('Error deleting obat:', error)
            alert('Gagal menghapus obat')
        }
    }

    // Format tanggal untuk display
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('id-ID')
        } catch {
            return dateString
        }
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
            header: "Nama Obat",
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("nama")}</div>
            )
        },
        {
            accessorKey: "totalStok",
            header: "Total Stok",
            cell: ({ row }) => {
                const stock = row.getValue("totalStok") as number
                return (
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{stock}</span>
                    </div>
                )
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
            cell: ({ row }) => {
                const expiryDate = row.getValue("tanggalExpired") as string
                return (
                    <div className="flex items-center gap-2">
                        <span>{formatDate(expiryDate)}</span>
                    </div>
                )
            },
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
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault()
                                setEditingObat(obat)
                            }}
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                        >
                            <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault()
                                setDeletingObat(obat)
                            }}
                            className="h-8 w-8 p-0 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Memuat data obat...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-6 w-6" />
                    <span>{error}</span>
                    <Button onClick={fetchData} size="sm" variant="outline">
                        Coba Lagi
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Kelola Obat</h1>
                    <p className="text-muted-foreground">
                        Kelola data obat dan pantau stok serta tanggal kedaluwarsa
                    </p>
                </div>
            </div>

            {/* Search and Add */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="Cari nama obat, batch, atau supplier..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                <DataAdd onAdd={handleAdd} />
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
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
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
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
                                    Tidak ada data obat.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} dari{" "}
                    {table.getFilteredRowModel().rows.length} baris dipilih.
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

            {/* Expired Medicine Notification */}
            <ExpiredNotification
                expiredMedicines={expiredMedicines}
                expiringMedicines={expiringMedicines}
                isOpen={showExpiredModal}
                onClose={() => setShowExpiredModal(false)}
            />

            {/* Edit Dialog */}
            {editingObat && (
                <DataEdit
                    obat={editingObat}
                    onEdit={() => {
                        handleEdit()
                        setEditingObat(null)
                    }}
                    open={!!editingObat}
                    onOpenChange={(open: boolean) => !open && setEditingObat(null)}
                />
            )}

            {/* Delete Dialog */}
            {deletingObat && (
                <DataDelete
                    obat={deletingObat}
                    onDelete={(noBatch: string) => {
                        handleDelete(noBatch)
                        setDeletingObat(null)
                    }}
                    open={!!deletingObat}
                    onOpenChange={(open: boolean) => !open && setDeletingObat(null)}
                />
            )}
        </div>
    )
}
