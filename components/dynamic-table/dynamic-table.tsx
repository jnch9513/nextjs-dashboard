"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react"

import type { ColumnAlign, ColumnDef, RowData, SortState, Tone } from "@/lib/dynamic-table/types"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Columns that never sort (they hold components, not comparable values).
const NON_SORTABLE_TYPES = new Set<ColumnDef["type"]>(["actions", "custom"])

function isSortable(column: ColumnDef): boolean {
  if (NON_SORTABLE_TYPES.has(column.type)) return column.sortable === true
  return column.sortable !== false
}

function resolveAlign(column: ColumnDef): ColumnAlign {
  if (column.align) return column.align
  if (column.type === "number") return "right"
  if (column.type === "actions") return "right"
  return "left"
}

const ALIGN_CLASS: Record<ColumnAlign, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
}

// Background + text colors per tone (badges). Works in light + dark.
const TONE_BADGE_CLASS: Record<Tone, string> = {
  success: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  warning: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  danger: "border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  info: "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  neutral: "border-transparent bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  muted: "border-transparent bg-muted text-muted-foreground",
}

// Text color per tone (highlighted note under a badge).
const TONE_NOTE_CLASS: Record<Tone, string> = {
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
  info: "text-sky-600 dark:text-sky-400",
  neutral: "text-foreground",
  muted: "text-muted-foreground",
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

// Format a scalar value based on the column's declared type.
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

// The value used when sorting a column.
function sortValue(row: RowData, column: ColumnDef): unknown {
  if (column.type === "avatar") return row[column.avatar?.nameKey ?? column.key]
  return row[column.key]
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

// Render a single cell's contents based on the column type.
function CellContent({ row, column }: { row: RowData; column: ColumnDef }) {
  switch (column.type) {
    case "avatar": {
      const name = String(row[column.avatar?.nameKey ?? column.key] ?? "")
      const secondaryRaw = column.avatar?.secondaryKey ? row[column.avatar.secondaryKey] : undefined
      const secondary =
        secondaryRaw === null || secondaryRaw === undefined || secondaryRaw === ""
          ? null
          : `${column.avatar?.secondaryPrefix ?? ""}${secondaryRaw}`
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">{initials(name) || "?"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{name || "—"}</p>
            {secondary ? <p className="truncate text-sm text-muted-foreground">{secondary}</p> : null}
          </div>
        </div>
      )
    }
    case "badge": {
      const raw = row[column.key]
      if (raw === null || raw === undefined || raw === "") return <span className="text-muted-foreground">—</span>
      const option = column.badge?.options?.[String(raw)]
      const tone: Tone = option?.tone ?? "neutral"
      const label = option?.label ?? String(raw)
      const noteRaw = column.badge?.noteKey ? row[column.badge.noteKey] : undefined
      const note = noteRaw === null || noteRaw === undefined || noteRaw === "" ? null : String(noteRaw)
      return (
        <div className="flex flex-col items-start gap-1">
          <Badge variant="outline" className={cn("font-medium", TONE_BADGE_CLASS[tone])}>
            {label}
          </Badge>
          {note ? (
            <span className={cn("text-xs", TONE_NOTE_CLASS[column.badge?.noteTone ?? "warning"])}>{note}</span>
          ) : null}
        </div>
      )
    }
    case "actions":
    case "custom":
      return <>{column.render?.(row)}</>
    default:
      return <>{formatValue(row[column.key], column)}</>
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
      const result = compareValues(sortValue(rowA, column), sortValue(rowB, column), column)
      return sort.direction === "asc" ? result : -result
    })
    return copy
  }, [data, sort, columns])

  const pageCount = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const currentPage = Math.min(page, pageCount - 1)
  const pagedData = sortedData.slice(currentPage * pageSize, currentPage * pageSize + pageSize)

  function toggleSort(column: ColumnDef) {
    if (!isSortable(column)) return
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
                const sortable = isSortable(column)
                return (
                  <TableHead key={column.key} className={cn(ALIGN_CLASS[align], column.headerClassName)}>
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
                      <span className="font-medium">{column.label}</span>
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
                        <CellContent row={row} column={column} />
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
