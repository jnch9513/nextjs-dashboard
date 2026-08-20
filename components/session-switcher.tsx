"use client"

import { UserCog } from "lucide-react"

import { useSession } from "@/lib/user-management/session-context"
import { ROLE_LABELS } from "@/lib/user-management/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SessionSwitcher() {
  const { session, availableSessions, setSessionId } = useSession()

  const items = availableSessions.map((s) => ({
    label: `${s.fullName} · ${ROLE_LABELS[s.roleCode]}`,
    value: s.id,
  }))

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm text-muted-foreground sm:inline">Acting as</span>
      <Select
        value={session.id}
        onValueChange={(id) => {
          if (id !== null) setSessionId(id)
        }}
        items={items}
      >
        <SelectTrigger className="w-[230px]" aria-label="Acting as user">
          <UserCog className="size-4 text-muted-foreground" aria-hidden="true" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {availableSessions.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              <div className="flex flex-col">
                <span>{s.fullName}</span>
                <span className="text-xs text-muted-foreground">{ROLE_LABELS[s.roleCode]}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
