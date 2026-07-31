"use client"

import { UserCog } from "lucide-react"

import { ADMINS, useUsers } from "@/lib/users-store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AdminSwitcher() {
  const { currentAdmin, setCurrentAdminId } = useUsers()

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm text-muted-foreground sm:inline">Acting as</span>
      <Select
        value={currentAdmin.id}
        onValueChange={setCurrentAdminId}
        items={ADMINS.map((a) => ({ label: a.name, value: a.id }))}
      >
        <SelectTrigger className="w-[180px]" aria-label="Acting as admin">
          <UserCog className="size-4 text-muted-foreground" aria-hidden="true" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {ADMINS.map((admin) => (
            <SelectItem key={admin.id} value={admin.id}>
              {admin.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
