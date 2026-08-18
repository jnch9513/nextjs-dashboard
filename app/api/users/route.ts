import { NextResponse } from "next/server"

import { listUsers } from "@/lib/user-management/user-store"

// Mock Spring Boot endpoint. Returns a `Page<User>` envelope like Spring Data
// so the front end already handles the real response shape. Replace this route
// with your actual Spring Boot API and point USERS_ENDPOINT at it.
export function GET() {
  const users = listUsers()
  return NextResponse.json({
    content: users,
    totalElements: users.length,
    totalPages: 1,
    number: 0,
    size: users.length,
  })
}
