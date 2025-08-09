"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import DataEdit from "./data-edit"
import DataDelete from "./data-delete"
import { ObatResponse, ObatFilters } from "@/lib/api/obat-management"
import { Edit, Trash2, Search, RefreshCw, Package, AlertTriangle } from "lucide-react"

export interface DataTableProps {
    data: ObatResponse[]
    total: number
    currentPage: number
    loading: boolean
    onPageChange: (page: number) => void
    onSearch: (search: string) => void
    onFilterChange: (filters: Partial<ObatFilters>) => void
    onRefresh: () => void
}

const columns: ColumnDef<ObatResponse>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
            <div className="font-mono text-xs">{row.getValue("id")?.toString().substring(0, 8)}</div>
        ),
    },
    {
        accessorKey: "nama_obat",
        header: "Nama Obat",
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("nama_obat")}</div>
        ),
    },
    {
        accessorKey: "kategori",
        header: "Kategori",
        cell: ({ row }) => (
            <Badge variant="outline">{row.getValue("kategori")}</Badge>
        ),
    },
    {
        accessorKey: "satuan",
        header: "Satuan",
        cell: ({ row }) => (
            <div>{row.getValue("satuan") || "-"}</div>
        ),
    },
    {
        accessorKey: "harga_jual",
        header: () => <div className="text-center">Harga Jual</div>,
        cell: ({ row }) => {
            const harga = parseFloat(row.getValue("harga_jual") || "0")
            const formatted = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR"
            }).format(harga)
            return <div className="text-center font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "komposisi",
        header: "Komposisi",
        cell: ({ row }) => (
            <div className="max-w-[200px] truncate">{row.getValue("komposisi") || "-"}</div>
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
                    <DataEdit
                        obat={obat}
                        onClose={() => {
                            // Refresh data after edit
                            window.location.reload()
                        }}
                    />
                    <DataDelete
                        obat={obat}
                        onDelete={() => {
                            // Refresh data after delete
                            window.location.reload()
                        }}
                    />
                </div>
            )
        },
    },
]

export function DataTableDemo({
    data,
    total,
    currentPage,
    loading,
    onPageChange
}: DataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
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
        manualPagination: true,
    })

    return (
        <div className="w-full space-y-4">

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
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        <span>Loading data obat...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
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
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <Package className="h-8 w-8 text-gray-400" />
                                        <span className="text-gray-500">Tidak ada data obat</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between py-4">
                <div className="text-muted-foreground text-sm">
                    Menampilkan {data.length} dari {total} obat
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1 || loading}
                    >
                        Previous
                    </Button>
                    <span className="text-sm">
                        Halaman {currentPage}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={data.length === 0 || loading}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}