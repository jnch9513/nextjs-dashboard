// Column definition schema for the dynamic table.
// Columns are described declaratively so the table renders itself from a config.
// Presentational types (string/number/date/avatar/badge) stay pure data;
// `actions`/`custom` let you inject your own component via `render`.

import type { ReactNode } from "react"

export type ColumnType =
  | "string"
  | "number"
  | "date"
  | "avatar"
  | "badge"
  | "actions"
  | "custom"

export type ColumnAlign = "left" | "right" | "center"

/** Semantic colors for badges + highlighted notes. */
export type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "muted"

/** How a raw value maps to a badge's label + color. */
export interface BadgeOption {
  label: string
  tone: Tone
}

export interface ColumnDef {
  /** Property key on each row object. */
  key: string
  /** Header text shown to the user. */
  label: string
  /** Drives rendering, formatting, alignment, and sort comparison. */
  type: ColumnType
  /** Allow this column to be sorted. Defaults to true (false for actions/custom). */
  sortable?: boolean
  /** Override the automatic alignment (numbers/actions default to right). */
  align?: ColumnAlign
  /** Optional header width, e.g. "w-[60px]". */
  headerClassName?: string

  /** Formatting hints for number/date. */
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
    /**
     * date: IANA time zone used for formatting. Defaults to "UTC" so the
     * server and client render identical text (avoids hydration mismatch).
     * Set e.g. "Asia/Hong_Kong" to display in a specific zone.
     */
    timeZone?: string
  }

  /** Config for `avatar` columns — a name circle + primary/secondary lines. */
  avatar?: {
    /** Key holding the display name (initials + primary line). Defaults to `key`. */
    nameKey?: string
    /** Optional muted secondary line, e.g. a username or email. */
    secondaryKey?: string
    /** Optional prefix for the secondary line, e.g. "@". */
    secondaryPrefix?: string
  }

  /** Config for `badge` columns — colored status pills with an optional note. */
  badge?: {
    /** Map a raw value to a label + tone. Unmapped values render as-is (neutral). */
    options?: Record<string, BadgeOption>
    /** Optional key holding a small highlighted note under the badge. */
    noteKey?: string
    /** Tone of the note text. Defaults to "warning". */
    noteTone?: Tone
  }

  /**
   * Custom cell renderer for `actions` / `custom` columns.
   * Return any component you want to inject per row (buttons, menus, links…).
   */
  render?: (row: RowData) => ReactNode
}

/** A single row is a plain record keyed by ColumnDef.key. */
export type RowData = Record<string, unknown>

export type SortDirection = "asc" | "desc"

export interface SortState {
  key: string
  direction: SortDirection
}
