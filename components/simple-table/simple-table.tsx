"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { SimpleColumn, SimpleRow } from "@/lib/simple-table/types"

const ALIGN_CLASS = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const

export function SimpleTable<T extends SimpleRow>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No data to display.",
  getRowKey,
  footer,
}: {
  columns: SimpleColumn<T>[]
  data: T[]
  isLoading?: boolean
  emptyMessage?: string
  /** Stable key per row. Falls back to the row index. */
  getRowKey?: (row: T, index: number) => string | number
  /** Optional content rendered below the table, inside the same border (e.g. a pager). */
  footer?: ReactNode
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(column.align && ALIGN_CLASS[column.align], column.className)}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={columns.length}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={getRowKey?.(row, index) ?? index}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(column.align && ALIGN_CLASS[column.align], column.className)}
                  >
                    {column.cell ? column.cell(row) : String(row[column.key] ?? "—")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {footer}
    </div>
  )
}
