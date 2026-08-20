"use client"

import { useEffect, useState } from "react"
import {
  CircleCheck,
  Loader2,
  Lock,
  LockKeyhole,
  MoreHorizontal,
  PauseCircle,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { ROLE_LABELS, STATUS_LABELS, type ManagedUser, type StatusCode } from "@/lib/user-management/types"
import { useUsers } from "@/lib/simple-table/use-users"
import { usersApi } from "@/lib/simple-table/users-api"
import type { SimpleColumn } from "@/lib/simple-table/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/user-management/status-badge"
import { SimpleTable } from "@/components/simple-table/simple-table"
import { TablePagination } from "@/components/simple-table/table-pagination"

// Pin the time zone so the server (UTC) and client render the same text.
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

// Status transitions offered in the row menu. Kept label-only (no secondary
// description) so the narrow Actions column has enough room.
const STATUS_ACTIONS: { status: StatusCode; label: string; icon: typeof Lock }[] = [
  { status: "A", label: "Set active", icon: CircleCheck },
  { status: "TL", label: "Temp lock", icon: Lock },
  { status: "PL", label: "Perm lock", icon: LockKeyhole },
  { status: "S", label: "Suspend", icon: PauseCircle },
]

function RowActions({
  user,
  busy,
  onAction,
}: {
  user: ManagedUser
  busy: boolean
  onAction: (user: ManagedUser, next: StatusCode) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={busy}
            aria-label={`Actions for ${user.fullName}`}
          />
        }
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <MoreHorizontal className="size-4" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {STATUS_ACTIONS.filter((action) => action.status !== user.status).map((action) => (
          <DropdownMenuItem key={action.status} onClick={() => onAction(user, action.status)}>
            <action.icon className="size-4" aria-hidden="true" />
            {action.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onAction(user, "D")}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function SimpleUserTable() {
  // Pagination state. `page` is 0-based to match Spring Data's Pageable.
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const { users, totalElements, totalPages, isLoading, error, refresh } = useUsers(page, size)
  // Track which row has an in-flight request so we can disable it and spin.
  const [busyId, setBusyId] = useState<string | null>(null)

  // If a delete empties the last page, step back so we're never on a blank page.
  useEffect(() => {
    if (totalPages > 0 && page > totalPages - 1) {
      setPage(totalPages - 1)
    }
  }, [page, totalPages])

  function handleSizeChange(nextSize: number) {
    setSize(nextSize)
    setPage(0) // reset to first page when page size changes
  }

  async function handleAction(user: ManagedUser, next: StatusCode) {
    setBusyId(user.id)
    try {
      // Route each action to the matching service call. Every branch hits the
      // Spring API through `usersApi`; add cases here as you add actions.
      switch (next) {
        case "D":
          await usersApi.remove(user.id)
          toast.success(`Deleted ${user.fullName}`)
          break
        default:
          await usersApi.setStatus(user.id, next)
          toast.success(`${user.fullName} → ${STATUS_LABELS[next]}`)
      }
      // Re-fetch so the table reflects the backend's new state.
      await refresh()
    } catch (err) {
      toast.error(`Action failed: ${(err as Error).message}`)
    } finally {
      setBusyId(null)
    }
  }

  const columns: SimpleColumn<ManagedUser>[] = [
    {
      key: "user",
      header: "User",
      cell: (user) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{user.fullName}</p>
          <p className="truncate text-sm text-muted-foreground">@{user.username}</p>
        </div>
      ),
    },
    {
      key: "participantCode",
      header: "Participant",
      cell: (user) =>
        user.participantCode ? (
          <span className="font-mono text-sm">{user.participantCode}</span>
        ) : (
          <span className="text-muted-foreground">&mdash;</span>
        ),
    },
    {
      key: "roleCode",
      header: "Role",
      className: "hidden md:table-cell",
      cell: (user) => ROLE_LABELS[user.roleCode],
    },
    {
      key: "status",
      header: "Status",
      cell: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: "createdAt",
      header: "Created",
      className: "hidden lg:table-cell text-muted-foreground",
      cell: (user) => formatDate(user.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      className: "w-[60px]",
      cell: (user) => (
        <RowActions user={user} busy={busyId === user.id} onAction={handleAction} />
      ),
    },
  ]

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        Failed to load users: {error.message}
      </div>
    )
  }

  return (
    <SimpleTable
      columns={columns}
      data={users}
      isLoading={isLoading}
      getRowKey={(user) => user.id}
      emptyMessage="No users found."
      footer={
        <TablePagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          size={size}
          onPageChange={setPage}
          onSizeChange={handleSizeChange}
        />
      }
    />
  )
}
