"use client"

import useSWR from "swr"

import type { RowData } from "@/lib/dynamic-table/types"

// Your Spring Boot backend returns one of two shapes:
//   - Pageable endpoints: a `Page<T>` envelope
//     { content: [...], totalElements, totalPages, number, size, ... }
//   - Plain endpoints: a bare array [...]
// This hook normalizes both into a flat rows array + total count.
interface PageEnvelope<T> {
  content: T[]
  totalElements?: number
  totalPages?: number
  number?: number
  size?: number
}

type ApiResponse<T> = T[] | PageEnvelope<T>

export interface UseApiTableResult {
  rows: RowData[]
  /** Total record count reported by the API (falls back to rows.length). */
  total: number
  isLoading: boolean
  error: Error | null
  /** Re-fetch the endpoint. */
  refresh: () => void
}

async function fetcher<T extends RowData>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  })
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

function normalize<T extends RowData>(data: ApiResponse<T> | undefined): {
  rows: RowData[]
  total: number
} {
  if (!data) return { rows: [], total: 0 }
  if (Array.isArray(data)) return { rows: data, total: data.length }
  return { rows: data.content ?? [], total: data.totalElements ?? data.content?.length ?? 0 }
}

/**
 * Fetch rows from a REST endpoint for the DynamicTable.
 * Handles both bare-array and Page<T> responses.
 *
 * @param url The endpoint, or null to skip fetching.
 */
export function useApiTable(url: string | null): UseApiTableResult {
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
  })

  const { rows, total } = normalize(data)

  return {
    rows,
    total,
    isLoading,
    error: error ?? null,
    refresh: () => mutate(),
  }
}
