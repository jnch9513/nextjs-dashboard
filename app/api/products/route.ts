import { NextResponse } from "next/server"

import { demoRows } from "@/lib/dynamic-table/demo-data"

// Mock endpoint that mimics a Spring Boot `Page<T>` response so the
// reference page has a working live example. Replace with your real
// Spring Boot service URL in production.
export async function GET() {
  return NextResponse.json({
    content: demoRows,
    totalElements: demoRows.length,
    totalPages: 1,
    number: 0,
    size: demoRows.length,
  })
}
