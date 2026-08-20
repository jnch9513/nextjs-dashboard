"use client"

import type { ManagedUser, StatusCode } from "@/lib/user-management/types"
import { ROLE_LABELS, STATUS_LABELS } from "@/lib/user-management/types"
import { USERS_ENDPOINT } from "@/lib/dynamic-table/users-api"
import type {
  BadgeOption,
  DynamicSearchField,
  SimpleColumn,
  Tone,
} from "@/lib/dynamic-table/types"
import { DynamicDataTable } from "@/components/dynamic-table/dynamic-data-table"

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

const columns: SimpleColumn<ManagedUser>[] = [
  { key: "fullName", header: "User", type: "twoLine", secondaryKey: "username", secondaryPrefix: "@" },
  { key: "participantCode", header: "Participant", type: "text" },
  { key: "roleCode", header: "Role", labels: ROLE_LABELS, hideBelow: "md" },
  { key: "status", header: "Status", type: "badge", options: STATUS_OPTIONS },
  { key: "createdAt", header: "Created", type: "date", hideBelow: "lg" },
]

const searchFields: DynamicSearchField[] = [
  { key: "fullName", label: "Name", type: "text", placeholder: "Search name" },
  { key: "participantCode", label: "Participant", type: "text", placeholder: "Enter code" },
  {
    key: "roleCode",
    label: "Role",
    type: "select",
    options: Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })),
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
  },
  { key: "created", label: "Created date", type: "dateRange", fromQueryKey: "createdFrom", toQueryKey: "createdTo" },
  { key: "includeDeleted", label: "Include deleted", type: "boolean" },
]

export function DynamicUserTable() {
  return (
    <DynamicDataTable
      endpoint={USERS_ENDPOINT}
      columns={columns}
      searchFields={searchFields}
      rowKey="id"
      emptyMessage="No users found."
    />
  )
}
