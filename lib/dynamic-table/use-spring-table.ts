"use client"

import useSWR from "swr"

import type { RowData } from "@/lib/dynamic-table/types"

// Spring Boot's Pageable endpoints return a `Page<T>` envelope like:
// { content: [...], totalElements, totalPages, number, size, ... }
// Plain endpoints return a bare array: [...]
// This type covers both shapes.
interface SpringPage<T> {
  content: T[]
  totalElements?: number
  totalPages?: number
  number?: number
  size?: number
}

type SpringResponse<T> = T[] | SpringPage<T>

export interface UseSpringTableResult {
  rows: RowData[]
  /** Total record count reported by the API (falls back to rows.length). */
  total: number
  isLoading: boolean
  error: Error | null
  /** Re-fetch the endpoint. */
  refresh: () => void
}

async function springFetcher<T extends RowData>(url: string): Promise<SpringResponse<T>> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  })
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

// Normalize either response shape into a flat rows array + total count.
function normalize<T extends RowData>(data: SpringResponse<T> | undefined): {
  rows: RowData[]
  total: number
} {
  if (!data) return { rows: [], total: 0 }
  if (Array.isArray(data)) return { rows: data, total: data.length }
  return { rows: data.content ?? [], total: data.totalElements ?? data.content?.length ?? 0 }
}

/**
 * Fetch rows from a Spring Boot REST endpoint for the DynamicTable.
 * Handles both bare-array and Page<T> responses.
 *
 * @param url The Spring endpoint, or null to skip fetching.
 */
export function useSpringTable(url: string | null): UseSpringTableResult {
  const { data, error, isLoading, mutate } = useSWR(url, springFetcher, {
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
