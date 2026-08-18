// Minimal column definition for the simple table.
// No sorting, no avatar/badge presets — just a header and how to render a cell.

import type { ReactNode } from "react"

export type SimpleRow = Record<string, unknown>

export interface SimpleColumn<T extends SimpleRow = SimpleRow> {
  /** Property key on the row (also the React key for the column). */
  key: string
  /** Header text. */
  header: string
  /** Text alignment. Defaults to left. */
  align?: "left" | "right" | "center"
  /** Extra classes applied to BOTH the header and cells (e.g. widths, responsive hiding). */
  className?: string
  /** Custom cell renderer. Defaults to showing the raw value at `key`. */
  cell?: (row: T) => ReactNode
}
