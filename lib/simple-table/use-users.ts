"use client"

import useSWR from "swr"

import type { ManagedUser } from "@/lib/user-management/types"

// ───────────────────────────────────────────────────────────────────────────
// 換 endpoint 就喺呢一行改。而家指住本地 mock route (app/api/users)，
// 接通 Spring Boot 時改成你嘅 URL，例如：
//   export const USERS_ENDPOINT = "https://api.your-domain.com/api/users"
// 其餘 code 完全唔使改。
export const USERS_ENDPOINT = "/api/users"
// ───────────────────────────────────────────────────────────────────────────

// Spring Data 嘅 Page<T> envelope。真 pagination 需要埋 total 資訊。
interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number // 現時頁 (0-based)
  size: number
}

async function fetcher(url: string): Promise<Page<ManagedUser>> {
  const res = await fetch(url, { headers: { Accept: "application/json" } })
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

/**
 * Server-side pagination.
 * @param page 0-based page index (Spring Data 預設)
 * @param size 每頁行數
 */
export function useUsers(page: number, size: number) {
  // 帶住 page / size query，Spring 嘅 Pageable 會自動接收。
  const key = `${USERS_ENDPOINT}?page=${page}&size=${size}`
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true, // 揭頁時保留舊資料，避免閃爍
  })

  return {
    users: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error: (error as Error) ?? null,
    refresh: () => mutate(),
  }
}
