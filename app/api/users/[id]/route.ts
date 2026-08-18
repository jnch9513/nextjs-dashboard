import { NextResponse } from "next/server"

import { deleteUser } from "@/lib/user-management/user-store"

// Mock: DELETE /api/users/{id}  ->  matches a Spring @DeleteMapping.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = deleteUser(id)
  if (!ok) {
    return NextResponse.json({ message: "User not found" }, { status: 404 })
  }
  return new NextResponse(null, { status: 204 })
}
