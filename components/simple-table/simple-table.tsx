"use client"

import type { CSSProperties, ReactNode } from "react"

import type {
  BadgeOption,
  ColumnAlign,
  SimpleColumn,
  SimpleRow,
  Tone,
} from "@/lib/simple-table/types"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const ALIGN_CLASS: Record<ColumnAlign, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
}

// Static classes so Tailwind can see them (no dynamic string building).
const HIDE_BELOW_CLASS = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
} as const

// Turn the declarative `width` prop into an inline style.
function widthStyle<T extends SimpleRow>(column: SimpleColumn<T>): CSSProperties | undefined {
  if (column.width === undefined) return undefined
  return { width: typeof column.width === "number" ? `${column.width}px` : column.width }
}

// Background + text colors per tone. Works in light + dark.
const TONE_BADGE_CLASS: Record<Tone, string> = {
  success: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  warning: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  danger: "border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  info: "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  neutral: "border-transparent bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  muted: "border-transparent bg-muted text-muted-foreground",
}

// Alignment defaults per type when a column doesn't set `align`.
function resolveAlign<T extends SimpleRow>(column: SimpleColumn<T>): ColumnAlign {
  if (column.align) return column.align
  if (column.type === "number") return "right"
  return "left"
}

// Extra cell classes driven by the column type.
function typeCellClass<T extends SimpleRow>(column: SimpleColumn<T>): string | undefined {
  if (column.type === "number") return "tabular-nums"
  if (column.type === "date") return "text-muted-foreground tabular-nums"
  if (column.type === "code") return "font-mono text-sm"
  return undefined
}

// Resolve a text value, applying the column's label map when present.
function displayText<T extends SimpleRow>(value: unknown, column: SimpleColumn<T>): string {
  if (isEmpty(value)) return EMPTY
  const key = String(value)
  return column.labels?.[key] ?? key
}

function formatNumber<T extends SimpleRow>(value: unknown, column: SimpleColumn<T>): string {
  const num = typeof value === "number" ? value : Number(value)
  if (Number.isNaN(num)) return String(value)
  return new Intl.NumberFormat("en-US", {
    style: column.format?.currency ? "currency" : "decimal",
    currency: column.format?.currency,
    minimumFractionDigits: column.format?.minimumFractionDigits,
    maximumFractionDigits: column.format?.maximumFractionDigits,
  }).format(num)
}

function formatDate<T extends SimpleRow>(value: unknown, column: SimpleColumn<T>): string {
  const date = value instanceof Date ? value : new Date(String(value))
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: column.format?.dateStyle ?? "medium",
    timeStyle: column.format?.withTime ? "short" : undefined,
    // Pin the time zone so server (UTC) and client render the same text.
    timeZone: column.format?.timeZone ?? "UTC",
  }).format(date)
}

const EMPTY = "\u2014" // em dash

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === ""
}

// Render one cell based on the column's declared type.
function CellContent<T extends SimpleRow>({
  row,
  column,
}: {
  row: T
  column: SimpleColumn<T>
}): ReactNode {
  const raw = row[column.key]

  switch (column.type) {
    case "custom":
      return column.render ? column.render(row) : null

    case "code":
      return displayText(raw, column)

    case "number":
      return isEmpty(raw) ? EMPTY : formatNumber(raw, column)

    case "date":
      return isEmpty(raw) ? EMPTY : formatDate(raw, column)

    case "twoLine": {
      const secondaryRaw = column.secondaryKey ? row[column.secondaryKey] : undefined
      const secondary = isEmpty(secondaryRaw)
        ? null
        : `${column.secondaryPrefix ?? ""}${secondaryRaw}`
      return (
        <div className="min-w-0">
          <p className="truncate font-medium">{isEmpty(raw) ? EMPTY : String(raw)}</p>
          {secondary ? <p className="truncate text-sm text-muted-foreground">{secondary}</p> : null}
        </div>
      )
    }

    case "badge": {
      if (isEmpty(raw)) return <span className="text-muted-foreground">{EMPTY}</span>
      const option: BadgeOption | undefined = column.options?.[String(raw)]
      const tone: Tone = option?.tone ?? "neutral"
      const label = option?.label ?? String(raw)
      return (
        <Badge variant="outline" className={cn("font-medium", TONE_BADGE_CLASS[tone])}>
          {label}
        </Badge>
      )
    }

    default: // "text"
      return displayText(raw, column)
  }
}

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
                style={widthStyle(column)}
                className={cn(
                  ALIGN_CLASS[resolveAlign(column)],
                  column.hideBelow && HIDE_BELOW_CLASS[column.hideBelow],
                  column.className,
                )}
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
                    style={widthStyle(column)}
                    className={cn(
                      ALIGN_CLASS[resolveAlign(column)],
                      typeCellClass(column),
                      column.hideBelow && HIDE_BELOW_CLASS[column.hideBelow],
                      column.className,
                    )}
                  >
                    <CellContent row={row} column={column} />
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
