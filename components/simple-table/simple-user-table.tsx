"use client"

import { useState } from "react"
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
import { USERS_ENDPOINT, usersApi } from "@/lib/simple-table/users-api"
import type { BadgeOption, SimpleColumn, Tone } from "@/lib/simple-table/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/simple-table/data-table"

// Map each status code to a badge color. Any table can render statuses just by
// passing this options map — no bespoke component needed.
const STATUS_TONES: Record<StatusCode, Tone> = {
  IS: "info",
  A: "success",
  TL: "warning",
  PL: "warning",
  S: "danger",
  D: "muted",
}

const STATUS_OPTIONS: Record<string, BadgeOption> = Object.fromEntries(
  (Object.keys(STATUS_LABELS) as StatusCode[]).map((code) => [
    code,
    { label: STATUS_LABELS[code], tone: STATUS_TONES[code] },
  ]),
)

// Status transitions offered in the row menu.
const STATUS_ACTIONS: { status: StatusCode; label: string; icon: typeof Lock }[] = [
  { status: "A", label: "Set active", icon: CircleCheck },
  { status: "TL", label: "Temp lock", icon: Lock },
  { status: "PL", label: "Perm lock", icon: LockKeyhole },
  { status: "S", label: "Suspend", icon: PauseCircle },
]

// Row action menu. Owns its own busy state; calls `onDone` to refresh the table.
function UserRowActions({ user, onDone }: { user: ManagedUser; onDone: () => void }) {
  const [busy, setBusy] = useState(false)

  async function run(next: StatusCode) {
    setBusy(true)
    try {
      // One place to branch per action. Every branch hits the Spring API via
      // `usersApi`; add cases here as you add actions.
      if (next === "D") {
        await usersApi.remove(user.id)
        toast.success(`Deleted ${user.fullName}`)
      } else {
        await usersApi.setStatus(user.id, next)
        toast.success(`${user.fullName} → ${STATUS_LABELS[next]}`)
      }
      onDone() // re-fetch so the table reflects the backend's new state
    } catch (err) {
      toast.error(`Action failed: ${(err as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

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
        {busy ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {STATUS_ACTIONS.filter((action) => action.status !== user.status).map((action) => (
          <DropdownMenuItem key={action.status} onClick={() => run(action.status)}>
            <action.icon className="size-4" aria-hidden="true" />
            {action.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => run("D")}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Columns are pure data — the `type` drives rendering, formatting, alignment.
const columns: SimpleColumn<ManagedUser>[] = [
  // Two-line cell: full name on top, @username muted underneath.
  { key: "fullName", header: "User", type: "twoLine", secondaryKey: "username", secondaryPrefix: "@" },
  // Participant code displayed as regular text.
  { key: "participantCode", header: "Participant", type: "text" },
  // Role code → readable label via a lookup map.
  { key: "roleCode", header: "Role", labels: ROLE_LABELS, hideBelow: "md" },
  // Colored status pill via a value → { label, tone } map.
  { key: "status", header: "Status", type: "badge", options: STATUS_OPTIONS },
  { key: "createdAt", header: "Created", type: "date", hideBelow: "lg" },
]

export function SimpleUserTable() {
  return (
    <DataTable
      endpoint={USERS_ENDPOINT}
      columns={columns}
      rowKey="id"
      emptyMessage="No users found."
      renderActions={(user, { refresh }) => <UserRowActions user={user} onDone={refresh} />}
    />
  )
}
