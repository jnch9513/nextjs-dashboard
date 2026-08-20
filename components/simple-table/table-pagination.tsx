"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Build the list of page tokens with ellipsis, e.g. [0, "…", 3, 4, 5, "…", 9].
// All indices are 0-based; labels are rendered as +1 for humans.
function pageTokens(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)

  const tokens: (number | "ellipsis")[] = [0]
  const start = Math.max(1, current - 1)
  const end = Math.min(total - 2, current + 1)

  if (start > 1) tokens.push("ellipsis")
  for (let i = start; i <= end; i++) tokens.push(i)
  if (end < total - 2) tokens.push("ellipsis")

  tokens.push(total - 1)
  return tokens
}

export function TablePagination({
  page,
  totalPages,
  totalElements,
  size,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onSizeChange,
}: {
  /** 0-based current page. */
  page: number
  totalPages: number
  totalElements: number
  size: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
}) {
  const tokens = pageTokens(page, totalPages)

  // Human-readable range: "1–10 of 42".
  const from = totalElements === 0 ? 0 : page * size + 1
  const to = Math.min(totalElements, (page + 1) * size)

  return (
    <div className="flex flex-col gap-4 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Rows per page</span>
        <Select value={String(size)} onValueChange={(v) => onSizeChange(Number(v))}>
          <SelectTrigger size="sm" className="w-[72px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground" aria-live="polite">
          {from}&ndash;{to} of {totalElements}
        </span>

        <nav className="flex items-center gap-1" aria-label="Pagination">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 0}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>

          {tokens.map((token, i) =>
            token === "ellipsis" ? (
              <span
                key={`ellipsis-${i}`}
                className="px-1 text-sm text-muted-foreground"
                aria-hidden="true"
              >
                &hellip;
              </span>
            ) : (
              <Button
                key={token}
                variant={token === page ? "default" : "outline"}
                size="icon"
                className={cn("size-8 text-sm")}
                onClick={() => onPageChange(token)}
                aria-label={`Page ${token + 1}`}
                aria-current={token === page ? "page" : undefined}
              >
                {token + 1}
              </Button>
            ),
          )}

          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </nav>
      </div>
    </div>
  )
}
