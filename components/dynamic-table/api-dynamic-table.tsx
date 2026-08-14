"use client"

import { AlertCircle, RefreshCw } from "lucide-react"

import type { ColumnDef } from "@/lib/dynamic-table/types"
import { useApiTable } from "@/lib/dynamic-table/use-api-table"
import { DynamicTable } from "@/components/dynamic-table/dynamic-table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Drop-in table that fetches its rows from a REST endpoint.
 * Define `columns` (the Type) once, pass the `endpoint`, and it renders —
 * loading and error states included.
 */
export function ApiDynamicTable({
  columns,
  endpoint,
  pageSize = 8,
  caption,
}: {
  columns: ColumnDef[]
  endpoint: string | null
  pageSize?: number
  caption?: string
}) {
  const { rows, isLoading, error, refresh } = useApiTable(endpoint)

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-8 text-center">
        <AlertCircle className="size-6 text-destructive" aria-hidden="true" />
        <div>
          <p className="font-medium">Could not load data</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        {Array.from({ length: pageSize }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    )
  }

  return <DynamicTable columns={columns} data={rows} pageSize={pageSize} caption={caption} />
}
