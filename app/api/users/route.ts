import { NextResponse } from "next/server"

import { SEED_USERS } from "@/lib/user-management/mock-data"

// Mock Spring Boot endpoint. Returns a `Page<User>` envelope like Spring Data
// so the front end already handles the real response shape. Replace this route
// with your actual Spring Boot API and point USERS_ENDPOINT at it.
export function GET() {
  return NextResponse.json({
    content: SEED_USERS,
    totalElements: SEED_USERS.length,
    totalPages: 1,
    number: 0,
    size: SEED_USERS.length,
  })
}
