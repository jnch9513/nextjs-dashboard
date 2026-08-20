"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Info } from "lucide-react"

import type {
  DynamicSearchField,
  DynamicSearchValues,
  SimpleColumn,
  SimpleRow,
} from "@/lib/dynamic-table/types"
import { usePagedData } from "@/lib/dynamic-table/use-paged-data"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DynamicSearch } from "@/components/dynamic-table/dynamic-search"
import { DynamicTable } from "@/components/dynamic-table/dynamic-table"
import { TablePagination } from "@/components/dynamic-table/table-pagination"

export interface DynamicTableApi {
  refresh: () => void
}

function toQueryParams(fields: DynamicSearchField[], values: DynamicSearchValues) {
  const params: Record<string, string> = {}

  for (const field of fields) {
    if (field.type === "dateRange") {
      const from = values[`${field.key}From`]
      const to = values[`${field.key}To`]
      if (from) params[field.fromQueryKey ?? `${field.key}From`] = String(from)
      if (to) params[field.toQueryKey ?? `${field.key}To`] = String(to)
      continue
    }

    const value = values[field.key]
    if (value === "" || value === undefined || value === false) continue
    params[field.queryKey ?? field.key] = String(value)
  }

  return params
}

export function DynamicDataTable<T extends SimpleRow>({
  endpoint,
  columns,
  rowKey,
  searchFields = [],
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 50],
  emptyMessage = "No data to display.",
  renderActions,
}: {
  /** Spring `Page<T>` endpoint. Leave blank until your endpoint is ready. */
  endpoint: string
  columns: SimpleColumn<T>[]
  rowKey?: keyof T & string
  searchFields?: DynamicSearchField[]
  initialPageSize?: number
  pageSizeOptions?: number[]
  emptyMessage?: string
  renderActions?: (row: T, api: DynamicTableApi) => ReactNode
}) {
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(initialPageSize)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const { rows, totalElements, totalPages, isLoading, error, refresh } = usePagedData<T>(
    endpoint,
    page,
    size,
    filters,
  )

  useEffect(() => {
    if (totalPages > 0 && page > totalPages - 1) setPage(totalPages - 1)
  }, [page, totalPages])

  const allColumns = useMemo<SimpleColumn<T>[]>(
    () =>
      renderActions
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
        : columns,
    [columns, refresh, renderActions],
  )

  if (!endpoint) {
    return (
      <div className="flex flex-col gap-4">
        {searchFields.length > 0 && <DynamicSearch fields={searchFields} onSearch={() => {}} />}
        <Alert>
          <Info />
          <AlertTitle>Spring API endpoint required</AlertTitle>
          <AlertDescription>
            Set the endpoint prop to your Spring Boot Page response URL. The table will add page,
            size, and applied search fields as query parameters.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {searchFields.length > 0 && (
        <DynamicSearch
          fields={searchFields}
          onSearch={(values) => {
            setFilters(toQueryParams(searchFields, values))
            setPage(0)
          }}
        />
      )}
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Failed to load data</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : (
        <DynamicTable
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
              onSizeChange={(nextSize) => {
                setSize(nextSize)
                setPage(0)
              }}
            />
          }
        />
      )}
    </div>
  )
}
