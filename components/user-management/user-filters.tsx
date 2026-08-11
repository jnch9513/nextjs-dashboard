"use client"

import { Search, X } from "lucide-react"

import {
  EMPTY_FILTERS,
  ROLE_CODES,
  ROLE_LABELS,
  STATUS_CODES,
  STATUS_LABELS,
  type UserFilters,
} from "@/lib/user-management/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const STATUS_ITEMS = [
  { label: "All statuses", value: "all" },
  ...STATUS_CODES.map((c) => ({ label: STATUS_LABELS[c], value: c })),
]

const ROLE_ITEMS = [
  { label: "All roles", value: "all" },
  ...ROLE_CODES.map((c) => ({ label: ROLE_LABELS[c], value: c })),
]

export function UserFiltersBar({
  filters,
  onChange,
  showParticipant,
}: {
  filters: UserFilters
  onChange: (next: UserFilters) => void
  showParticipant: boolean
}) {
  function update<K extends keyof UserFilters>(key: K, value: UserFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  const isDirty =
    filters.participantCode !== "" ||
    filters.username !== "" ||
    filters.status !== "all" ||
    filters.roleCode !== "all"

  return (
    <div className="flex flex-wrap items-end gap-3">
      {showParticipant ? (
        <div className="grid w-full gap-1.5 sm:w-40">
          <Label htmlFor="filter-participant" className="text-xs text-muted-foreground">
            Participant code
          </Label>
          <Input
            id="filter-participant"
            placeholder="e.g. FF278"
            value={filters.participantCode}
            onChange={(e) => update("participantCode", e.target.value.toUpperCase())}
            className="uppercase"
            autoComplete="off"
          />
        </div>
      ) : null}

      <div className="grid w-full gap-1.5 sm:w-56">
        <Label htmlFor="filter-username" className="text-xs text-muted-foreground">
          Username
        </Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="filter-username"
            placeholder="Search username or name"
            value={filters.username}
            onChange={(e) => update("username", e.target.value)}
            className="pl-9"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="grid w-full gap-1.5 sm:w-44">
        <Label htmlFor="filter-status" className="text-xs text-muted-foreground">
          Status
        </Label>
        <Select
          value={filters.status}
          onValueChange={(v) => update("status", v as UserFilters["status"])}
          items={STATUS_ITEMS}
        >
          <SelectTrigger id="filter-status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid w-full gap-1.5 sm:w-44">
        <Label htmlFor="filter-role" className="text-xs text-muted-foreground">
          Role
        </Label>
        <Select
          value={filters.roleCode}
          onValueChange={(v) => update("roleCode", v as UserFilters["roleCode"])}
          items={ROLE_ITEMS}
        >
          <SelectTrigger id="filter-role" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isDirty ? (
        <Button
          variant="ghost"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="text-muted-foreground"
        >
          <X className="size-4" aria-hidden="true" />
          Clear
        </Button>
      ) : null}
    </div>
  )
}
