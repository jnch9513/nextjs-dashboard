import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { UserStatus } from "@/lib/users-store"

const STATUS_STYLES: Record<UserStatus, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "border-transparent bg-emerald-100 text-emerald-800",
  },
  inactive: {
    label: "Inactive",
    className: "border-transparent bg-muted text-muted-foreground",
  },
  pending: {
    label: "Pending approval",
    className: "border-transparent bg-amber-100 text-amber-800",
  },
  rejected: {
    label: "Rejected",
    className: "border-transparent bg-red-100 text-red-800",
  },
}

export function StatusBadge({ status }: { status: UserStatus }) {
  const { label, className } = STATUS_STYLES[status]
  return (
    <Badge variant="outline" className={cn("font-medium", className)}>
      {label}
    </Badge>
  )
}
