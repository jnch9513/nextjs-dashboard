"use client"

import { Eye, MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react"

import type { ColumnDef, RowData } from "@/lib/dynamic-table/types"
import { demoRows } from "@/lib/dynamic-table/demo-data"
import { DynamicTable } from "@/components/dynamic-table/dynamic-table"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// A `custom` column: render a 5-star rating from a numeric value.
function StarRating({ row }: { row: RowData }) {
  const value = Number(row.rating ?? 0)
  const rounded = Math.round(value)
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < rounded ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30",
          )}
          aria-hidden="true"
        />
      ))}
      <span className="ml-1 text-xs tabular-nums text-muted-foreground">{value.toFixed(1)}</span>
    </div>
  )
}

// An `actions` column: inject any per-row component (menu, buttons, links…).
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

// One schema that exercises every column type the table supports.
const showcaseColumns: ColumnDef[] = [
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
  { key: "stock", label: "Stock", type: "number" },
  {
    key: "rating",
    label: "Rating",
    type: "custom",
    sortable: true,
    render: (row) => <StarRating row={row} />,
  },
  {
    key: "updatedAt",
    label: "Updated (HKT)",
    type: "date",
    format: { dateStyle: "medium", withTime: true, timeZone: "Asia/Hong_Kong" },
  },
  {
    key: "actions",
    label: "",
    type: "actions",
    headerClassName: "w-[60px]",
    render: (row) => <RowActions row={row} />,
  },
]

export function ShowcaseTable() {
  return (
    <DynamicTable
      columns={showcaseColumns}
      data={demoRows}
      pageSize={6}
      caption="Showcase table using every supported column type"
    />
  )
}
