"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react"

import type { ColumnAlign, ColumnDef, RowData, SortState } from "@/lib/dynamic-table/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function resolveAlign(column: ColumnDef): ColumnAlign {
  if (column.align) return column.align
  return column.type === "number" ? "right" : "left"
}

const ALIGN_CLASS: Record<ColumnAlign, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
}

// Format a raw cell value based on the column's declared type.
function formatValue(value: unknown, column: ColumnDef): string {
  if (value === null || value === undefined || value === "") return "—"

  switch (column.type) {
    case "number": {
      const num = typeof value === "number" ? value : Number(value)
      if (Number.isNaN(num)) return String(value)
      return new Intl.NumberFormat("en-US", {
        style: column.format?.currency ? "currency" : "decimal",
        currency: column.format?.currency,
        minimumFractionDigits: column.format?.minimumFractionDigits,
        maximumFractionDigits: column.format?.maximumFractionDigits,
      }).format(num)
    }
    case "date": {
      const date = value instanceof Date ? value : new Date(String(value))
      if (Number.isNaN(date.getTime())) return String(value)
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: column.format?.dateStyle ?? "medium",
        timeStyle: column.format?.withTime ? "short" : undefined,
      }).format(date)
    }
    default:
      return String(value)
  }
}

// Type-aware comparator used for sorting.
function compareValues(a: unknown, b: unknown, column: ColumnDef): number {
  const empty = (v: unknown) => v === null || v === undefined || v === ""
  if (empty(a) && empty(b)) return 0
  if (empty(a)) return 1
  if (empty(b)) return -1

  switch (column.type) {
    case "number":
      return Number(a) - Number(b)
    case "date":
      return new Date(String(a)).getTime() - new Date(String(b)).getTime()
    default:
      return String(a).localeCompare(String(b))
  }
}

export function DynamicTable({
  columns,
  data,
  pageSize = 8,
  caption,
}: {
  columns: ColumnDef[]
  data: RowData[]
  pageSize?: number
  caption?: string
}) {
  const [sort, setSort] = React.useState<SortState | null>(null)
  const [page, setPage] = React.useState(0)

  const sortedData = React.useMemo(() => {
    if (!sort) return data
    const column = columns.find((c) => c.key === sort.key)
    if (!column) return data
    const copy = [...data]
    copy.sort((rowA, rowB) => {
      const result = compareValues(rowA[sort.key], rowB[sort.key], column)
      return sort.direction === "asc" ? result : -result
    })
    return copy
  }, [data, sort, columns])

  const pageCount = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const currentPage = Math.min(page, pageCount - 1)
  const pagedData = sortedData.slice(currentPage * pageSize, currentPage * pageSize + pageSize)

  function toggleSort(column: ColumnDef) {
    if (column.sortable === false) return
    setPage(0)
    setSort((prev) => {
      if (prev?.key !== column.key) return { key: column.key, direction: "asc" }
      if (prev.direction === "asc") return { key: column.key, direction: "desc" }
      return null // third click clears sorting
    })
  }

  const rangeStart = sortedData.length === 0 ? 0 : currentPage * pageSize + 1
  const rangeEnd = Math.min(sortedData.length, (currentPage + 1) * pageSize)

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border">
        <Table>
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <TableHeader>
            <TableRow>
              {columns.map((column) => {
                const align = resolveAlign(column)
                const isSorted = sort?.key === column.key
                const sortable = column.sortable !== false
                return (
                  <TableHead key={column.key} className={ALIGN_CLASS[align]}>
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-sm font-medium transition-colors hover:text-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          align === "right" && "flex-row-reverse",
                        )}
                        aria-label={`Sort by ${column.label}`}
                      >
                        {column.label}
                        {isSorted ? (
                          sort?.direction === "asc" ? (
                            <ArrowUp className="size-3.5" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="size-3.5" aria-hidden="true" />
                          )
                        ) : (
                          <ChevronsUpDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No data to display.
                </TableCell>
              </TableRow>
            ) : (
              pagedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => {
                    const align = resolveAlign(column)
                    return (
                      <TableCell
                        key={column.key}
                        className={cn(
                          ALIGN_CLASS[align],
                          column.type === "number" && "tabular-nums",
                          column.type === "date" && "text-muted-foreground tabular-nums",
                        )}
                      >
                        {formatValue(row[column.key], column)}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <p aria-live="polite">
          {rangeStart}&ndash;{rangeEnd} of {sortedData.length}
        </p>
        <div className="flex items-center gap-2">
          <span className="tabular-nums">
            Page {currentPage + 1} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={currentPage >= pageCount - 1}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
