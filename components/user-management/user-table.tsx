"use client"

import { useState } from "react"
import { MoreHorizontal, Search, UserCheck, UserMinus, UserX } from "lucide-react"
import { toast } from "sonner"

import { useUsers, type ManagedUser } from "@/lib/users-store"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/user-management/status-badge"

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function UserTable() {
  const { users, requestInactivate, requestDelete, reactivateUser } = useUsers()
  const [query, setQuery] = useState("")

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or role"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
          aria-label="Search users"
        />
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden md:table-cell">Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Created</TableHead>
              <TableHead className="w-[60px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onInactivate={() => {
                    requestInactivate(user.id)
                    toast("Inactivation requested", {
                      description: `${user.name} is pending approval.`,
                    })
                  }}
                  onDelete={() => {
                    requestDelete(user.id)
                    toast("Deletion requested", {
                      description: `${user.name} is pending approval.`,
                    })
                  }}
                  onReactivate={() => {
                    reactivateUser(user.id)
                    toast.success("User reactivated", { description: `${user.name} is active.` })
                  }}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function UserRow({
  user,
  onInactivate,
  onDelete,
  onReactivate,
}: {
  user: ManagedUser
  onInactivate: () => void
  onDelete: () => void
  onReactivate: () => void
}) {
  const hasPending = Boolean(user.pendingRequest)

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">{user.role}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <StatusBadge status={user.status} />
          {hasPending ? (
            <span className="text-xs text-amber-700">Change pending approval</span>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell text-muted-foreground">
        {formatDate(user.createdAt)}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`Actions for ${user.name}`}
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user.status === "inactive" ? (
              <DropdownMenuItem onClick={onReactivate} disabled={hasPending}>
                <UserCheck className="size-4" aria-hidden="true" />
                Reactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={onInactivate} disabled={hasPending || user.status !== "active"}>
                <UserMinus className="size-4" aria-hidden="true" />
                Inactivate
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              disabled={hasPending}
              className="text-destructive focus:text-destructive"
            >
              <UserX className="size-4" aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
