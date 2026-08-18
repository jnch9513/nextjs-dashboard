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

// Spring Boot 可能回傳 bare array 或者 Page<T> envelope，呢度兩種都收得。
interface Page<T> {
  content: T[]
}
type UsersResponse = ManagedUser[] | Page<ManagedUser>

async function fetcher(url: string): Promise<UsersResponse> {
  const res = await fetch(url, { headers: { Accept: "application/json" } })
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR(USERS_ENDPOINT, fetcher, {
    revalidateOnFocus: false,
  })

  const users = Array.isArray(data) ? data : (data?.content ?? [])

  return {
    users,
    isLoading,
    error: (error as Error) ?? null,
    refresh: () => mutate(),
  }
}
