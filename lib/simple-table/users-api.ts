import type { StatusCode } from "@/lib/user-management/types"

// ───────────────────────────────────────────────────────────────────────────
// 換 endpoint 就喺呢一行改。而家指住本地 mock route (app/api/users)，
// 接通 Spring Boot 時改成你嘅 URL，例如：
//   export const USERS_ENDPOINT = "https://api.your-domain.com/api/users"
// 其餘 code 完全唔使改。
export const USERS_ENDPOINT = "/api/users"

// ───────────────────────────────────────────────────────────────────────────
// All user mutations live here. This is the ONLY place that knows the request
// shape (URL, method, headers, body), so switching to your real Spring Boot
// API means editing this file alone — the table component never changes.
//
// The paths below follow common Spring REST conventions:
//   PATCH  /api/users/{id}/status   body: { status }
//   DELETE /api/users/{id}
// Adjust them to match your controller mappings.
// ───────────────────────────────────────────────────────────────────────────

async function request(url: string, init: RequestInit) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...init,
  })
  if (!res.ok) {
    // Surface Spring's error body when present, otherwise the status text.
    let message = `${res.status} ${res.statusText}`
    try {
      const body = await res.json()
      if (body?.message) message = body.message
    } catch {
      // no JSON body
    }
    throw new Error(message)
  }
  return res
}

export const usersApi = {
  setStatus(id: string, status: StatusCode) {
    return request(`${USERS_ENDPOINT}/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  },
  remove(id: string) {
    return request(`${USERS_ENDPOINT}/${id}`, { method: "DELETE" })
  },
}
