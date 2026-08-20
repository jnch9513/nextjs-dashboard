// Declarative column schema for the simple table.
// Columns are described by a `type` that drives rendering, alignment, and
// formatting — so most tables need zero custom JSX. `custom` is the escape
// hatch for injecting your own component (menus, buttons, links…).

import type { ReactNode } from "react"

export type SimpleRow = Record<string, unknown>

export type ColumnType = "text" | "code" | "number" | "date" | "twoLine" | "badge" | "custom"

export type ColumnAlign = "left" | "right" | "center"

/** Semantic colors shared by every badge. Add a tone here to reuse it anywhere. */
export type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "muted"

/** How one raw value maps to a badge's label + color. */
export interface BadgeOption {
  label: string
  tone: Tone
}

export interface SimpleColumn<T extends SimpleRow = SimpleRow> {
  /** Property key on the row (also the React key for the column). */
  key: string
  /** Header text. */
  header: string
  /** Drives rendering, alignment, and formatting. Defaults to "text". */
  type?: ColumnType
  /** Override the automatic alignment (number/custom-actions default to right). */
  align?: ColumnAlign
  /**
   * Hide this column below a breakpoint (shown at that breakpoint and up).
   * Declarative alternative to writing `hidden md:table-cell` yourself.
   */
  hideBelow?: "sm" | "md" | "lg" | "xl"
  /** Fixed column width. A number is treated as pixels; a string is used as-is (e.g. "20%"). */
  width?: number | string
  /** Escape hatch for extra classes on BOTH header and cells. Rarely needed. */
  className?: string

  /** Formatting hints for `number` / `date`. */
  format?: {
    /** number: minimum fraction digits. */
    minimumFractionDigits?: number
    /** number: maximum fraction digits. */
    maximumFractionDigits?: number
    /** number: render as currency, e.g. "USD", "HKD". */
    currency?: string
    /** date: Intl.DateTimeFormat preset. */
    dateStyle?: "short" | "medium" | "long"
    /** date: also show the time. */
    withTime?: boolean
    /**
     * date: IANA time zone used for formatting. Defaults to "UTC" so the
     * server (UTC) and client render identical text (avoids hydration mismatch).
     */
    timeZone?: string
  }

  /** `twoLine`: key holding a muted secondary line under the primary value. */
  secondaryKey?: string
  /** `twoLine`: optional prefix for the secondary line, e.g. "@". */
  secondaryPrefix?: string

  /**
   * `text` / `code`: map a raw value to a display label (e.g. a role code → its
   * name). Unmapped values render as-is. Use this instead of a custom `render`
   * for simple enum-to-label lookups.
   */
  labels?: Record<string, string>

  /** `badge`: map a raw value to a label + tone. Unmapped values render as-is (neutral). */
  options?: Record<string, BadgeOption>

  /** `custom`: inject your own component per row (menus, buttons, links…). */
  render?: (row: T) => ReactNode
}
