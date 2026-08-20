import { NextResponse } from "next/server"

import { listUsers } from "@/lib/user-management/user-store"

// Mock Spring Boot endpoint. Reads `page` (0-based) and `size` query params —
// exactly like Spring Data's Pageable — slices the data, and returns a
// `Page<User>` envelope. Replace this route with your real Spring Boot API and
// point USERS_ENDPOINT at it; the front end already sends the right params.
export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(0, Number(searchParams.get("page") ?? 0))
  const size = Math.max(1, Number(searchParams.get("size") ?? 10))

  const all = listUsers()
  const totalElements = all.length
  const totalPages = Math.max(1, Math.ceil(totalElements / size))
  const start = page * size
  const content = all.slice(start, start + size)

  return NextResponse.json({
    content,
    totalElements,
    totalPages,
    number: page,
    size,
  })
}
