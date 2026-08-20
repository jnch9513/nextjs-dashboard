"use client"

import useSWR from "swr"

// Spring Data 的 Page<T> envelope。Server-side pagination 需要埋 total 資訊。
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number // 現時頁 (0-based)
  size: number
}

async function fetchPage<T>(url: string): Promise<Page<T>> {
  const res = await fetch(url, { headers: { Accept: "application/json" } })
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

/**
 * 通用 server-side pagination hook。
 *
 * Domain-agnostic：畀任何一個「收 `page` / `size`、回傳 Spring `Page<T>`」
 * 嘅 endpoint 就用得，唔綁死任何型別。接通真 Spring Boot 只需要換 endpoint。
 *
 * @param endpoint 資料來源 URL（e.g. "/api/users" 或你嘅 Spring API）
 * @param page     0-based 頁碼（Spring Data Pageable 預設）
 * @param size     每頁行數
 */
export function usePagedData<T>(endpoint: string, page: number, size: number) {
  // page / size 砌落 query，同時做 SWR 嘅 cache key（揭頁自動 re-fetch）。
  const key = `${endpoint}?page=${page}&size=${size}`
  const { data, error, isLoading, mutate } = useSWR(key, fetchPage<T>, {
    revalidateOnFocus: false,
    keepPreviousData: true, // 揭頁時保留舊資料，避免閃爍
  })

  return {
    rows: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error: (error as Error) ?? null,
    refresh: () => mutate(),
  }
}
