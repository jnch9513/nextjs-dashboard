import { NextResponse } from "next/server"

import type { StatusCode } from "@/lib/user-management/types"
import { setUserStatus } from "@/lib/user-management/user-store"

// Mock: PATCH /api/users/{id}/status  ->  matches a Spring @PatchMapping.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = (await req.json()) as { status?: StatusCode }

  if (!body.status) {
    return NextResponse.json({ message: "Missing status" }, { status: 400 })
  }

  const updated = setUserStatus(id, body.status)
  if (!updated) {
    return NextResponse.json({ message: "User not found" }, { status: 404 })
  }
  return NextResponse.json(updated)
}
