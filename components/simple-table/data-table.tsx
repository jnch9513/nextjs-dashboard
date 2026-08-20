"use client"

import { useEffect, useState, type ReactNode } from "react"

import type { SimpleColumn, SimpleRow } from "@/lib/simple-table/types"
import { usePagedData } from "@/lib/simple-table/use-paged-data"
import { SimpleTable } from "@/components/simple-table/simple-table"
import { TablePagination } from "@/components/simple-table/table-pagination"

/** Handle passed to row actions so they can re-fetch after a mutation. */
export interface DataTableApi {
  refresh: () => void
}

/**
 * Connected, paginated table. Give it an `endpoint` (Spring `Page<T>`) and
 * `columns` — it owns data fetching, pagination, loading, empty, and error
 * state internally. A new table is just columns + endpoint; no boilerplate.
 *
 * For a pure, data-in / markup-out table (no fetching) use <SimpleTable/>.
 */
export function DataTable<T extends SimpleRow>({
  endpoint,
  columns,
  rowKey,
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 50],
  emptyMessage = "No data to display.",
  renderActions,
}: {
  /** Spring `Page<T>` endpoint. Accepts `page` (0-based) & `size` query params. */
  endpoint: string
  columns: SimpleColumn<T>[]
  /** Row property containing a stable unique key. Falls back to the row index. */
  rowKey?: keyof T & string
  initialPageSize?: number
  pageSizeOptions?: number[]
  emptyMessage?: string
  /**
   * Optional right-aligned actions column. Auto-appended when provided and
   * handed a `refresh` helper so menus can re-fetch after a mutation.
   */
  renderActions?: (row: T, api: DataTableApi) => ReactNode
}) {
  // Pagination state. `page` is 0-based to match Spring Data's Pageable.
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(initialPageSize)
  const { rows, totalElements, totalPages, isLoading, error, refresh } = usePagedData<T>(
    endpoint,
    page,
    size,
  )

  // If a delete empties the last page, step back so we're never on a blank page.
  useEffect(() => {
    if (totalPages > 0 && page > totalPages - 1) {
      setPage(totalPages - 1)
    }
  }, [page, totalPages])

  function handleSizeChange(next: number) {
    setSize(next)
    setPage(0) // reset to first page when page size changes
  }

  // Sugar for the common case: append a right-aligned actions column.
  const allColumns: SimpleColumn<T>[] = renderActions
    ? [
        ...columns,
        {
          key: "__actions",
          header: "",
          type: "custom",
          align: "right",
          width: 60,
          render: (row: T) => renderActions(row, { refresh }),
        },
      ]
    : columns

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        Failed to load data: {error.message}
      </div>
    )
  }

  return (
    <SimpleTable
      columns={allColumns}
      data={rows}
      isLoading={isLoading}
      rowKey={rowKey}
      emptyMessage={emptyMessage}
      footer={
        <TablePagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          size={size}
          pageSizeOptions={pageSizeOptions}
          onPageChange={setPage}
          onSizeChange={handleSizeChange}
        />
      }
    />
  )
}
