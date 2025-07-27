"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export interface Column<T> {
    key: string
    header: string
    render?: (item: T, index: number) => React.ReactNode
    className?: string
    headerClassName?: string
}

interface DataTableProps<T> {
    data: T[]
    columns: Column<T>[]
    emptyMessage?: string
    onRowClick?: (item: T, index: number) => void
    className?: string
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    emptyMessage = "Tidak ada data",
    onRowClick,
    className = ""
}: DataTableProps<T>) {
    return (
        <div className={`rounded-md border bg-white ${className}`}>
            <Table>
                <TableHeader className="bg-gray-50">
                    <TableRow>
                        {columns.map((column) => (
                            <TableHead
                                key={column.key}
                                className={`font-semibold text-gray-700 ${column.headerClassName || ''}`}
                            >
                                {column.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length > 0 ? (
                        data.map((item, index) => (
                            <TableRow
                                key={index}
                                className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                                onClick={() => onRowClick?.(item, index)}
                            >
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.key}
                                        className={`py-3 ${column.className || ''}`}
                                    >
                                        {column.render
                                            ? column.render(item, index)
                                            : item[column.key]
                                        }
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center text-gray-500"
                            >
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}