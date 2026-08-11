import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { STATUS_LABELS, type StatusCode } from "@/lib/user-management/types"

const STATUS_STYLES: Record<StatusCode, string> = {
  IS: "border-transparent bg-sky-100 text-sky-800",
  A: "border-transparent bg-emerald-100 text-emerald-800",
  TL: "border-transparent bg-amber-100 text-amber-800",
  PL: "border-transparent bg-orange-100 text-orange-900",
  S: "border-transparent bg-red-100 text-red-800",
  D: "border-transparent bg-muted text-muted-foreground",
}

export function StatusBadge({ status }: { status: StatusCode }) {
  return (
    <Badge variant="outline" className={cn("font-medium", STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
