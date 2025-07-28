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

export type ObatMaster = {
    id: string
    nama: string
    kategori: string
    satuan: string
    hargaJual: number
    komposisi: string
}

const initialData: ObatMaster[] = [
    {
        id: "12345",
        nama: "Aspirin",
        kategori: "Pain Relief",
        satuan: "Tablets",
        hargaJual: 10000,
        komposisi: "aajaskjasksjkajskajska"
    },
    {
        id: "67890",
        nama: "Ibuprofen",
        kategori: "Anti-inflammatory",
        satuan: "Capsules",
        hargaJual: 10000,
        komposisi: "aajaskjasksjkajskajska"
    },
    {
        id: "24680",
        nama: "Paracetamol",
        kategori: "Fever Reducer",
        satuan: "Tablets",
        hargaJual: 10000,
        komposisi: "aajaskjasksjkajskajska"
    },
    {
        id: "13579",
        nama: "Amoxicillin",
        kategori: "Antibiotic",
        satuan: "Capsules",
        hargaJual: 10000,
        komposisi: "aajaskjasksjkajskajska"
    },
    {
        id: "97531",
        nama: "Loratadine",
        kategori: "Antihistamine",
        satuan: "Tablets",
        hargaJual: 10000,
        komposisi: "aajaskjasksjkajskajska"
    },
    {
        id: "86420",
        nama: "Omeprazole",
        kategori: "Acid Reducer",
        satuan: "Capsules",
        hargaJual: 10000,
        komposisi: "aajaskjasksjkajskajska"
    },
    {
        id: "36925",
        nama: "Simvastatin",
        kategori: "Cholesterol Lowering",
        satuan: "Tablets",
        hargaJual: 10000,
        komposisi: "aajaskjasksjkajskajska"
    },
    {
        id: "74185",
        nama: "Metformin",
        kategori: "Diabetes Medication",
        satuan: "Tablets",
        hargaJual: 10000,
        komposisi: "aajaskjasksjkajskajska"
    },
    {
        id: "52896",
        nama: "Ciprofloxacin",
        kategori: "Antibiotic",
        satuan: "Tablets",
        hargaJual: 10000,
        komposisi: "aajaskjasksjkajskajska"
    }
]

export function DataTableDemo() {
    const [data, setData] = React.useState<ObatMaster[]>(initialData)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    // Function to generate new ID
    const generateId = () => {
        return Math.floor(10000 + Math.random() * 90000).toString()
    }

    // Handle add new obat
    const handleAdd = (newObat: Omit<ObatMaster, 'id'>) => {
        const obatWithId: ObatMaster = {
            ...newObat,
            id: generateId()
        }
        setData(prev => [...prev, obatWithId])
    }

    // Handle edit obat
    const handleEdit = (id: string, updatedObat: Omit<ObatMaster, 'id'>) => {
        setData(prev => prev.map(obat =>
            obat.id === id ? { ...updatedObat, id } : obat
        ))
    }

    // Handle delete obat
    const handleDelete = (id: string) => {
        setData(prev => prev.filter(obat => obat.id !== id))
    }

    const columns: ColumnDef<ObatMaster>[] = [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("id")}</div>
            ),
        },
        {
            accessorKey: "nama",
            header: "Nama Obat",
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("nama")}</div>
            ),
        },
        {
            accessorKey: "kategori",
            header: "Kategori",
            cell: ({ row }) => (
                <div>{row.getValue("kategori")}</div>
            ),
        },
        {
            accessorKey: "satuan",
            header: "Satuan",
            cell: ({ row }) => (
                <div>{row.getValue("satuan")}</div>
            ),
        },
        {
            accessorKey: "hargaJual",
            header: () => <div className="text-center">Harga Jual</div>,
            cell: ({ row }) => {
                const harga = parseFloat(row.getValue("hargaJual"))
                const formatted = new Intl.NumberFormat("id-ID").format(harga)
                return <div className="text-center font-medium">{formatted}</div>
            },
        },
        {
            accessorKey: "komposisi",
            header: "Komposisi",
            cell: ({ row }) => (
                <div className="max-w-[200px] truncate">{row.getValue("komposisi")}</div>
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
                <h1 className="text-3xl font-bold mb-4">Obat Master</h1>
                <DataAdd onAdd={handleAdd} />
            </div>

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