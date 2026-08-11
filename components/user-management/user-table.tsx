"use client"

import { CircleCheck, Lock, LockKeyhole, MoreHorizontal, PauseCircle, Trash2 } from "lucide-react"

import {
  ROLE_LABELS,
  STATUS_LABELS,
  canManageUsers,
  isParticipantScoped,
  type ManagedUser,
  type SessionUser,
  type StatusCode,
} from "@/lib/user-management/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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

// Status transitions offered as row actions (each routes through approval).
const STATUS_ACTIONS: { status: StatusCode; label: string; icon: typeof Lock }[] = [
  { status: "A", label: "Set active", icon: CircleCheck },
  { status: "TL", label: "Temp lock", icon: Lock },
  { status: "PL", label: "Perm lock", icon: LockKeyhole },
  { status: "S", label: "Suspend", icon: PauseCircle },
]

export function UserTable({
  users,
  isLoading,
  session,
  onRequestStatusChange,
  onRequestDelete,
}: {
  users: ManagedUser[]
  isLoading: boolean
  session: SessionUser
  onRequestStatusChange: (user: ManagedUser, status: StatusCode) => void
  onRequestDelete: (user: ManagedUser) => void
}) {
  const showParticipant = !isParticipantScoped(session.roleCode)
  const canManage = canManageUsers(session.roleCode)
  const columnCount = 4 + (showParticipant ? 1 : 0) + (canManage ? 1 : 0)

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            {showParticipant ? <TableHead>Participant</TableHead> : null}
            <TableHead className="hidden md:table-cell">Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Created</TableHead>
            {canManage ? <TableHead className="w-[60px] text-right">Actions</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={columnCount}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnCount} className="h-24 text-center text-muted-foreground">
                No users match your filters.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                showParticipant={showParticipant}
                canManage={canManage}
                onRequestStatusChange={onRequestStatusChange}
                onRequestDelete={onRequestDelete}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function UserRow({
  user,
  showParticipant,
  canManage,
  onRequestStatusChange,
  onRequestDelete,
}: {
  user: ManagedUser
  showParticipant: boolean
  canManage: boolean
  onRequestStatusChange: (user: ManagedUser, status: StatusCode) => void
  onRequestDelete: (user: ManagedUser) => void
}) {
  const hasPending = Boolean(user.pendingRequest)
  const isDeleted = user.status === "D"
  const actionsDisabled = hasPending || isDeleted

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">{initials(user.fullName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{user.fullName}</p>
            <p className="truncate text-sm text-muted-foreground">@{user.username}</p>
          </div>
        </div>
      </TableCell>
      {showParticipant ? (
        <TableCell>
          {user.participantCode ? (
            <span className="font-mono text-sm">{user.participantCode}</span>
          ) : (
            <span className="text-muted-foreground">&mdash;</span>
          )}
        </TableCell>
      ) : null}
      <TableCell className="hidden md:table-cell">{ROLE_LABELS[user.roleCode]}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <StatusBadge status={user.status} />
          {hasPending ? (
            <span className="text-xs text-amber-600">Change pending approval</span>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell text-muted-foreground">
        {formatDate(user.createdAt)}
      </TableCell>
      {canManage ? (
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={actionsDisabled}
                  aria-label={`Actions for ${user.fullName}`}
                />
              }
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {STATUS_ACTIONS.filter((a) => a.status !== user.status).map((action) => (
                <DropdownMenuItem
                  key={action.status}
                  onClick={() => onRequestStatusChange(user, action.status)}
                >
                  <action.icon className="size-4" aria-hidden="true" />
                  {action.label}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {STATUS_LABELS[action.status]}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onRequestDelete(user)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      ) : null}
    </TableRow>
  )
}
