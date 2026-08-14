"use client"

import * as React from "react"
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import type { ColumnDef, RowData } from "@/lib/dynamic-table/types"
import { ApiDynamicTable } from "@/components/dynamic-table/api-dynamic-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// A custom action component you inject per row. It receives the row, so you
// can wire real handlers (navigate, mutate, open a dialog, call Spring…).
function RowActions({ row }: { row: RowData }) {
  const name = String(row.name ?? "row")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${name}`} />}
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => console.log("[v0] view", row.sku)}>
          <Eye className="size-4" aria-hidden="true" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log("[v0] edit", row.sku)}>
          <Pencil className="size-4" aria-hidden="true" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => console.log("[v0] delete", row.sku)}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Everything about how a column looks lives here — fully declarative.
const columns: ColumnDef[] = [
  {
    key: "ownerName",
    label: "Owner",
    type: "avatar",
    avatar: { secondaryKey: "ownerUsername", secondaryPrefix: "@" },
  },
  { key: "name", label: "Product", type: "string" },
  {
    key: "status",
    label: "Status",
    type: "badge",
    // Map each raw value to a label + color, plus a highlighted note below.
    badge: {
      noteKey: "statusNote",
      noteTone: "warning",
      options: {
        active: { label: "Active", tone: "success" },
        low: { label: "Low stock", tone: "warning" },
        out: { label: "Out of stock", tone: "danger" },
      },
    },
  },
  {
    key: "price",
    label: "Price",
    type: "number",
    format: { currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 },
  },
  { key: "updatedAt", label: "Updated", type: "date", format: { dateStyle: "medium" } },
  {
    key: "actions",
    label: "",
    type: "actions",
    headerClassName: "w-[60px]",
    // Inject any component you want. It gets the row.
    render: (row) => <RowActions row={row} />,
  },
]

export function ReferenceLiveExample() {
  return (
    <ApiDynamicTable
      columns={columns}
      endpoint="/api/products"
      pageSize={6}
      caption="Live example with avatar, status badge, and injected row actions"
    />
  )
}
