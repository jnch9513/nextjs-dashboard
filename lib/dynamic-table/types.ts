// Column definition schema for the dynamic table.
// Columns are described declaratively so the table renders itself from JSON.

export type ColumnType = "string" | "number" | "date"

export type ColumnAlign = "left" | "right" | "center"

export interface ColumnDef {
  /** Property key on each row object. */
  key: string
  /** Header text shown to the user. */
  label: string
  /** Drives formatting, alignment, and sort comparison. */
  type: ColumnType
  /** Allow this column to be sorted. Defaults to true. */
  sortable?: boolean
  /** Override the automatic alignment (numbers default to right). */
  align?: ColumnAlign
  /** Optional formatting hints per type. */
  format?: {
    /** number: minimum fraction digits. */
    minimumFractionDigits?: number
    /** number: maximum fraction digits. */
    maximumFractionDigits?: number
    /** number: render as currency, e.g. "USD", "HKD". */
    currency?: string
    /** date: Intl.DateTimeFormat options preset. */
    dateStyle?: "short" | "medium" | "long"
    /** date: also show the time. */
    withTime?: boolean
  }
}

/** A single row is a plain record keyed by ColumnDef.key. */
export type RowData = Record<string, unknown>

export type SortDirection = "asc" | "desc"

export interface SortState {
  key: string
  direction: SortDirection
}
